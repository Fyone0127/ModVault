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
    const user = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret')
    req.user = user
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

router.get('/mods/pending', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
        mods.id,
        mods.title,
        mods.description,
        mods.category,
        mods.tags,
        mods.image_url,
        mods.download_url,
        mods.status,
        mods.created_at,
        games.name AS game_name,
        users.username AS creator_name
      FROM mods
      JOIN games ON mods.game_id = games.id
      JOIN users ON mods.creator_id = users.id
      WHERE mods.status = 'pending'
      ORDER BY mods.created_at DESC`
    )

    res.json(rows)
  } catch (error) {
    next(error)
  }
})

router.patch('/mods/:id/approve', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    await pool.query(
      `UPDATE mods
       SET status = 'approved',
           reviewed_by = ?,
           reviewed_at = NOW(),
           rejection_reason = NULL
       WHERE id = ?`,
      [req.user.id, req.params.id]
    )

    res.json({ message: 'Mod approved and published' })
  } catch (error) {
    next(error)
  }
})

router.patch('/mods/:id/reject', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    const { reason } = req.body

    await pool.query(
      `UPDATE mods
       SET status = 'rejected',
           reviewed_by = ?,
           reviewed_at = NOW(),
           rejection_reason = ?
       WHERE id = ?`,
      [req.user.id, reason || 'No reason provided', req.params.id]
    )

    res.json({ message: 'Mod rejected' })
  } catch (error) {
    next(error)
  }
})

export default router