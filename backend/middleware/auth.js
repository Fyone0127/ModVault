import jwt from 'jsonwebtoken'

export function requireAuth(req, res, next) {
  const header = req.headers.authorization
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null

  if (!token) return res.status(401).json({ message: 'Authentication required' })

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret')
    next()
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' })
  }
}

export function optionalAuth(req, res, next) {
  const header = req.headers.authorization
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null

  if (!token) {
    return next()
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret')
  } catch (error) {
    req.user = null
  }

  next()
}
