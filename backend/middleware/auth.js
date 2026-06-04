import jwt from 'jsonwebtoken'
import { pool } from '../config/db.js'

async function findTokenUser(token) {
  const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret')
  const [rows] = await pool.query(
    'SELECT id, username, email, role FROM users WHERE id = ?',
    [decoded.id]
  )

  return rows[0] || null
}

export async function requireAuth(req, res, next) {
  const header = req.headers.authorization
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null

  if (!token) return res.status(401).json({ message: 'Authentication required' })

  try {
    const user = await findTokenUser(token)

    if (!user) {
      return res.status(401).json({ message: 'Session expired. Please log in again.' })
    }

    req.user = user
    next()
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' })
  }
}

export async function optionalAuth(req, res, next) {
  const header = req.headers.authorization
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null

  if (!token) {
    return next()
  }

  try {
    req.user = await findTokenUser(token)
  } catch (error) {
    req.user = null
  }

  next()
}
