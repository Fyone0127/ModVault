import express from 'express'
import jwt from 'jsonwebtoken'
import { pool } from '../config/db.js'

const router = express.Router()

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ message: 'Login required' })
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret')
    next()
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token' })
  }
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' })
  }

  next()
}

router.post('/apply', authenticateToken, async (req, res, next) => {
  try {
    const { reason, portfolio_url } = req.body

    if (!reason || !reason.trim()) {
      return res.status(400).json({ message: 'Application reason is required' })
    }

    if (req.user.role === 'creator' || req.user.role === 'admin') {
      return res.status(400).json({ message: 'You already have creator access' })
    }

    const [existing] = await pool.query(
      "SELECT id FROM creator_applications WHERE user_id = ? AND status = 'pending'",
      [req.user.id]
    )

    if (existing.length) {
      return res.status(409).json({ message: 'You already have a pending application' })
    }

    await pool.query(
      `INSERT INTO creator_applications 
       (user_id, reason, portfolio_url, status)
       VALUES (?, ?, ?, 'pending')`,
      [req.user.id, reason, portfolio_url || null]
    )

    res.status(201).json({ message: 'Creator application submitted successfully. Please wait for admin approval.' })
  } catch (error) {
    next(error)
  }
})

router.get('/my-application', authenticateToken, async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
        id,
        reason,
        portfolio_url,
        status,
        reviewed_at,
        created_at
      FROM creator_applications
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 1`,
      [req.user.id]
    )

    if (!rows.length) {
      return res.json(null)
    }

    res.json(rows[0])
  } catch (error) {
    next(error)
  }
})

router.get('/applications/pending', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
        creator_applications.id,
        creator_applications.reason,
        creator_applications.portfolio_url,
        creator_applications.status,
        creator_applications.created_at,
        users.id AS user_id,
        users.username,
        users.email
      FROM creator_applications
      JOIN users ON creator_applications.user_id = users.id
      WHERE creator_applications.status = 'pending'
      ORDER BY creator_applications.created_at DESC`
    )

    res.json(rows)
  } catch (error) {
    next(error)
  }
})

router.patch('/applications/:id/approve', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params

    const [rows] = await pool.query(
      'SELECT user_id FROM creator_applications WHERE id = ?',
      [id]
    )

    if (!rows.length) {
      return res.status(404).json({ message: 'Application not found' })
    }

    const userId = rows[0].user_id

    await pool.query(
      `UPDATE creator_applications
       SET status = 'approved',
           reviewed_by = ?,
           reviewed_at = NOW()
       WHERE id = ?`,
      [req.user.id, id]
    )

    await pool.query(
      "UPDATE users SET role = 'creator' WHERE id = ?",
      [userId]
    )

    res.json({ message: 'Application approved. User is now a creator.' })
  } catch (error) {
    next(error)
  }
})

router.patch('/applications/:id/reject', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params

    await pool.query(
      `UPDATE creator_applications
       SET status = 'rejected',
           reviewed_by = ?,
           reviewed_at = NOW()
       WHERE id = ?`,
      [req.user.id, id]
    )

    res.json({ message: 'Application rejected' })
  } catch (error) {
    next(error)
  }
})

export default router