import express from 'express'
import { pool } from '../config/db.js'
import { requireAuth } from '../middleware/auth.js'

const router = express.Router()

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' })
  }

  next()
}

router.get('/', async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT g.*, COUNT(m.id) AS mod_count
      FROM games g
      LEFT JOIN mods m ON m.game_id = g.id
      GROUP BY g.id
      ORDER BY g.name ASC
    `)
    res.json(rows)
  } catch (error) { next(error) }
})

router.post('/', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { name, description, cover_url } = req.body

    if (!name || !description) {
      return res.status(400).json({ message: 'Game name and description are required' })
    }

    const trimmedName = String(name).trim()
    const trimmedDescription = String(description).trim()
    const trimmedCover = cover_url ? String(cover_url).trim() : null

    if (trimmedName.length < 2) {
      return res.status(400).json({ message: 'Game name must be at least 2 characters' })
    }

    const [existing] = await pool.query(
      'SELECT id FROM games WHERE LOWER(name) = LOWER(?) LIMIT 1',
      [trimmedName]
    )

    if (existing.length) {
      return res.status(409).json({ message: 'A game with that name already exists' })
    }

    const [result] = await pool.query(
      'INSERT INTO games (name, description, cover_url) VALUES (?, ?, ?)',
      [trimmedName, trimmedDescription, trimmedCover]
    )

    const [rows] = await pool.query('SELECT * FROM games WHERE id = ?', [result.insertId])
    res.status(201).json({ message: 'Game added successfully', game: rows[0] })
  } catch (error) { next(error) }
})

export default router
