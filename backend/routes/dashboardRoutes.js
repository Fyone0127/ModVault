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

router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const user = req.user

    if (user.role === 'admin') {
      const [[games]] = await pool.query('SELECT COUNT(*) AS total FROM games')
      const [[publishedMods]] = await pool.query(
        "SELECT COUNT(*) AS total FROM mods WHERE status = 'approved'"
      )
      const [[pendingMods]] = await pool.query(
        "SELECT COUNT(*) AS total FROM mods WHERE status = 'pending'"
      )
      const [[users]] = await pool.query('SELECT COUNT(*) AS total FROM users')

      return res.json({
        games: games.total,
        publishedMods: publishedMods.total,
        pendingMods: pendingMods.total,
        users: users.total
      })
    }

    if (user.role === 'creator') {
      const [[myMods]] = await pool.query(
        'SELECT COUNT(*) AS total FROM mods WHERE creator_id = ?',
        [user.id]
      )

      const [[pending]] = await pool.query(
        "SELECT COUNT(*) AS total FROM mods WHERE creator_id = ? AND status = 'pending'",
        [user.id]
      )

      const [[approved]] = await pool.query(
        "SELECT COUNT(*) AS total FROM mods WHERE creator_id = ? AND status = 'approved'",
        [user.id]
      )

      const [[rejected]] = await pool.query(
        "SELECT COUNT(*) AS total FROM mods WHERE creator_id = ? AND status = 'rejected'",
        [user.id]
      )

      const [[favourites]] = await pool.query(
        'SELECT COUNT(*) AS total FROM favourites WHERE user_id = ?',
        [user.id]
      )

      const [[reviews]] = await pool.query(
        'SELECT COUNT(*) AS total FROM reviews WHERE user_id = ?',
        [user.id]
      )

      const [[downloads]] = await pool.query(
        `SELECT COUNT(downloads.id) AS total
         FROM downloads
         JOIN mods ON downloads.mod_id = mods.id
         WHERE mods.creator_id = ?`,
        [user.id]
      )

      return res.json({
        myMods: myMods.total,
        pending: pending.total,
        approved: approved.total,
        rejected: rejected.total,
        favourites: favourites.total,
        reviews: reviews.total,
        downloads: downloads.total
      })
    }

    const [[favourites]] = await pool.query(
      'SELECT COUNT(*) AS total FROM favourites WHERE user_id = ?',
      [user.id]
    )

    const [[reviews]] = await pool.query(
      'SELECT COUNT(*) AS total FROM reviews WHERE user_id = ?',
      [user.id]
    )

    const [[games]] = await pool.query('SELECT COUNT(*) AS total FROM games')

    const [[mods]] = await pool.query(
      "SELECT COUNT(*) AS total FROM mods WHERE status = 'approved'"
    )

    res.json({
      favourites: favourites.total,
      reviews: reviews.total,
      games: games.total,
      mods: mods.total
    })
  } catch (error) {
    next(error)
  }
})

export default router