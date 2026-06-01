import express from 'express'
import { pool } from '../config/db.js'
import { optionalAuth } from '../middleware/auth.js'

const router = express.Router()

router.post('/:modId', optionalAuth, async (req, res) => {
  try {
    const { modId } = req.params

    const [mods] = await pool.query(
      'SELECT id, title, download_url FROM mods WHERE id = ?',
      [modId]
    )

    if (!mods.length) {
      return res.status(404).json({ message: 'Mod not found' })
    }

    const mod = mods[0]

    await pool.query(
      'INSERT INTO downloads (user_id, mod_id) VALUES (?, ?)',
      [req.user?.id || null, modId]
    )

    res.json({
      message: 'Download recorded',
      download_url: mod.download_url
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Download failed' })
  }
})

export default router
