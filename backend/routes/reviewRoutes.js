import express from 'express'
import { pool } from '../config/db.js'
import { requireAuth } from '../middleware/auth.js'

const router = express.Router()

router.get('/mod/:modId', async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `
      SELECT 
        reviews.id,
        reviews.rating,
        reviews.comment,
        reviews.created_at,
        users.username
      FROM reviews
      JOIN users ON users.id = reviews.user_id
      WHERE reviews.mod_id = ?
      ORDER BY reviews.created_at DESC
      `,
      [req.params.modId]
    )

    res.json(rows)
  } catch (error) {
    next(error)
  }
})

router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `
      SELECT 
        reviews.id,
        reviews.rating,
        reviews.comment,
        reviews.created_at,
        mods.id AS mod_id,
        mods.title AS mod_title,
        games.name AS game_name
      FROM reviews
      JOIN mods ON mods.id = reviews.mod_id
      JOIN games ON games.id = mods.game_id
      WHERE reviews.user_id = ?
      ORDER BY reviews.created_at DESC
      `,
      [req.user.id]
    )

    res.json(rows)
  } catch (error) {
    next(error)
  }
})

router.post('/', requireAuth, async (req, res, next) => {
  try {
    const { mod_id, rating, comment } = req.body

    if (!mod_id || !rating || !comment) {
      return res.status(400).json({
        message: 'Rating and comment are required'
      })
    }

    const numericRating = Number(rating)

    if (numericRating < 1 || numericRating > 5) {
      return res.status(400).json({
        message: 'Rating must be between 1 and 5'
      })
    }

    const [mods] = await pool.query(
      "SELECT id FROM mods WHERE id = ? AND status = 'approved'",
      [mod_id]
    )

    if (!mods.length) {
      return res.status(404).json({
        message: 'Mod not found or not published'
      })
    }

    await pool.query(
      `
      INSERT INTO reviews (user_id, mod_id, rating, comment)
      VALUES (?, ?, ?, ?)
      `,
      [req.user.id, mod_id, numericRating, comment]
    )

    res.status(201).json({
      message: 'Review submitted successfully'
    })
  } catch (error) {
    next(error)
  }
})

export default router