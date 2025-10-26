import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in environment variables')
}

/**
 * Middleware to verify JWT token
 */
export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1] // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ 
      error: 'Access denied. No token provided.' 
    })
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    req.user = decoded // { email, iat, exp }
    next()
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expired. Please login again.' 
      })
    }
    return res.status(403).json({ 
      error: 'Invalid token.' 
    })
  }
}

/**
 * Generate JWT token
 * @param {string} email - User email
 * @returns {string} JWT token
 */
export function generateToken(email) {
  return jwt.sign(
    { email }, 
    JWT_SECRET, 
    { expiresIn: '7d' } // Token valid for 7 days
  )
}
