import express from 'express'
import { pool } from '../config/db.js'
import { requireAuth } from '../middleware/auth.js'

const router = express.Router()
router.use(requireAuth)

router.get('/', async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT m.*, g.name AS game_name
      FROM favourites f
      JOIN mods m ON m.id = f.mod_id
      JOIN games g ON g.id = m.game_id
      WHERE f.user_id = ?
      ORDER BY f.created_at DESC
    `, [req.user.id])
    res.json(rows)
  } catch (error) { next(error) }
})

router.post('/', async (req, res, next) => {
  try {
    const { mod_id } = req.body
    const numericModId = Number(mod_id)

    if (!Number.isInteger(numericModId) || numericModId < 1) {
      return res.status(400).json({ message: 'Valid mod id is required' })
    }

    const [mods] = await pool.query(
      "SELECT id FROM mods WHERE id = ? AND status = 'approved'",
      [numericModId]
    )

    if (!mods.length) {
      return res.status(404).json({ message: 'Mod not found or not published' })
    }

    await pool.query(
      'INSERT INTO favourites (user_id, mod_id) VALUES (?, ?) ON CONFLICT (user_id, mod_id) DO NOTHING',
      [req.user.id, numericModId]
    )
    res.status(201).json({ message: 'Saved to favourites' })
  } catch (error) { next(error) }
})

router.delete('/:modId', async (req, res, next) => {
  try {
    await pool.query('DELETE FROM favourites WHERE user_id = ? AND mod_id = ?', [req.user.id, req.params.modId])
    res.json({ message: 'Removed from favourites' })
  } catch (error) { next(error) }
})

export default router
