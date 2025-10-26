import express from 'express'
import rateLimit from 'express-rate-limit'
import crypto from 'crypto'
import { supabase } from '../config/supabase.js'
import { sendAuthCode } from '../services/email.js'
import { generateToken } from '../middleware/auth.js'
import { logAuthEvent } from '../services/logger.js'

const router = express.Router()

// Rate limiting for request-code endpoint
const requestCodeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // 3 requests per window per IP+email
  message: {
    error: 'Trop de tentatives de demande de code. Réessayez dans 15 minutes.',
    retryAfter: 15 * 60 // seconds
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Use email as key to avoid IPv6 issues
  keyGenerator: (req) => {
    const email = req.body?.email || 'unknown'
    return `request-code:${email}`
  }
})

// Rate limiting for verify-code endpoint
const verifyCodeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 verification attempts per window per email
  message: {
    error: 'Trop de tentatives de vérification. Réessayez dans 15 minutes.',
    retryAfter: 15 * 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Use email as key to avoid IPv6 issues
  keyGenerator: (req) => {
    const email = req.body?.email || 'unknown'
    return `verify-code:${email}`
  }
})

/**
 * POST /api/auth/request-code
 * Send 6-digit code to admin email
 */
router.post('/request-code', requestCodeLimiter, async (req, res) => {
  try {
    const { email } = req.body

    // Validate email
    if (!email || !email.trim()) {
      return res.status(400).json({ error: 'Email is required' })
    }

    // Check if email is the admin email
    if (email.toLowerCase() !== process.env.ADMIN_EMAIL.toLowerCase()) {
      return res.status(403).json({ error: 'Unauthorized email address' })
    }

    // Generate crypto-secure 6-digit code
    const code = crypto.randomInt(100000, 999999).toString()

    // Set expiration time (configurable, default 10 minutes)
    const expiryMinutes = parseInt(process.env.AUTH_CODE_EXPIRY_MINUTES) || 10
    const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000).toISOString()

    // Delete old codes for this email
    await supabase
      .from('auth_codes')
      .delete()
      .eq('email', email)

    // Store code in database
    const { error: dbError } = await supabase
      .from('auth_codes')
      .insert({
        email,
        code,
        expiresAt
      })

    if (dbError) {
      console.error('Database error:', dbError)
      return res.status(500).json({ error: 'Failed to store authentication code' })
    }

    // Send email with code
    await sendAuthCode(email, code)

    // Log successful code request
    await logAuthEvent(email, 'request_code', req, { 
      expiresAt, 
      expiryMinutes 
    })

    console.log(`✅ Code sent to ${email}: ${code}`)

    res.json({ 
      success: true, 
      message: 'Code sent to your email',
      expiresIn: expiryMinutes * 60 // seconds
    })
  } catch (error) {
    console.error('Request code error:', error)
    
    // Log failed code request
    await logAuthEvent(req.body.email || 'unknown', 'request_code_fail', req, { 
      error: error.message 
    })

    res.status(500).json({ 
      error: 'Failed to send authentication code',
      details: error.message 
    })
  }
})

/**
 * POST /api/auth/verify-code
 * Verify 6-digit code and return JWT token
 */
router.post('/verify-code', verifyCodeLimiter, async (req, res) => {
  try {
    const { email, code } = req.body

    // Validate input
    if (!email || !code) {
      return res.status(400).json({ error: 'Email and code are required' })
    }

    // Find code in database (including attempts count)
    const { data: authCodes, error: fetchError } = await supabase
      .from('auth_codes')
      .select('*')
      .eq('email', email)
      .eq('code', code)
      .gt('expiresAt', new Date().toISOString())
      .order('createdAt', { ascending: false })
      .limit(1)

    if (fetchError) {
      console.error('Database fetch error:', fetchError)
      return res.status(500).json({ error: 'Database error' })
    }

    // Check if code exists
    if (!authCodes || authCodes.length === 0) {
      // Increment attempts for any code from this email (even if wrong code)
      await supabase
        .from('auth_codes')
        .update({ attempts: supabase.raw('attempts + 1') })
        .eq('email', email)
        .gt('expiresAt', new Date().toISOString())

      // Log failed verification
      await logAuthEvent(email, 'verify_fail', req, { 
        reason: 'invalid_or_expired_code' 
      })

      return res.status(401).json({ error: 'Invalid or expired code' })
    }

    const authCode = authCodes[0]

    // Check brute force protection
    if (authCode.attempts >= 5) {
      console.log(`🚫 Code blocked for ${email} - too many attempts`)
      
      // Log blocked attempt
      await logAuthEvent(email, 'code_blocked', req, { 
        attempts: authCode.attempts,
        codeId: authCode.id
      })

      return res.status(429).json({ 
        error: 'Code bloqué après 5 tentatives échouées. Demandez un nouveau code.',
        blocked: true
      })
    }

    // Code is valid - delete it to prevent reuse
    await supabase
      .from('auth_codes')
      .delete()
      .eq('id', authCode.id)

    // Generate JWT token
    const token = generateToken(email)

    // Log successful verification
    await logAuthEvent(email, 'verify_success', req, {
      codeId: authCode.id,
      attempts: authCode.attempts
    })

    console.log(`✅ User authenticated: ${email}`)

    res.json({
      success: true,
      token,
      user: { email }
    })
  } catch (error) {
    console.error('Verify code error:', error)
    res.status(500).json({ 
      error: 'Authentication failed',
      details: error.message 
    })
  }
})

/**
 * GET /api/auth/status
 * Check authentication status
 */
router.get('/status', (req, res) => {
  res.json({ 
    authenticated: false,
    message: 'Use /request-code to authenticate'
  })
})

export default router
