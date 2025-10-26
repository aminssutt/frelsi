import { supabase } from '../config/supabase.js'

/**
 * Log authentication events for audit trail
 * @param {string} email 
 * @param {string} action - 'request_code', 'verify_success', 'verify_fail', 'code_blocked'
 * @param {Object} req - Express request object
 * @param {Object} details - Additional context
 */
export async function logAuthEvent(email, action, req, details = {}) {
  try {
    await supabase
      .from('auth_logs')
      .insert({
        email,
        action,
        ip_address: req.ip || req.connection?.remoteAddress,
        user_agent: req.headers['user-agent'],
        details
      })
    
    console.log(`📝 Auth log: ${action} for ${email} from ${req.ip}`)
  } catch (error) {
    console.error('❌ Failed to log auth event:', error)
    // Don't throw - logging failure shouldn't break auth flow
  }
}