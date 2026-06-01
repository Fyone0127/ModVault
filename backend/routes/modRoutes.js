import express from 'express'
import multer from 'multer'
import path from 'path'
import { pool } from '../config/db.js'
import { requireAuth } from '../middleware/auth.js'

const router = express.Router()

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
    cb(null, `${unique}${path.extname(file.originalname)}`)
  }
})

const upload = multer({ storage })

const sourceDownloadCounts = {
  'https://www.curseforge.com/wow/addons/details': 341300000,
  'https://www.curseforge.com/wow/addons/deadly-boss-mods': 606800000,
  'https://www.curseforge.com/wow/addons/auctionator': 182400000,
  'https://www.curseforge.com/wow/addons/questie': 182400000,
  'https://www.curseforge.com/wow/addons/deadly-boss-mods-dbm-dungeons': 86100000,
  'https://www.curseforge.com/sims4/mods/mc-command-center': 13000000,
  'https://www.curseforge.com/sims4/mods/lot-51-core-library': 8600000,
  'https://www.curseforge.com/sims4/mods/smart-core-script': 3700000,
  'https://www.curseforge.com/sims4/mods/xml-injector': 9700000,
  'https://www.curseforge.com/sims4/mods/cookbook-s-s': 6200000,
  'https://www.curseforge.com/inzoi/mods/realistic-food-eb4775d8': 54200,
  'https://www.curseforge.com/inzoi/mods/mh-freecatshop-59e1d109': 80600,
  'https://www.curseforge.com/inzoi/mods/easiermoodbabies-7770f9d4': 40800,
  'https://www.curseforge.com/inzoi/mods/more-vehicle-colors-pastel-50584a03': 35100,
  'https://www.curseforge.com/inzoi/mods/weatherrealismoverhaul': 35600,
  'https://www.curseforge.com/hytale/mods/bettermap': 779800,
  'https://www.curseforge.com/hytale/mods/eyespy': 604100,
  'https://www.curseforge.com/hytale/mods/wans-wonder-weapons': 528100,
  'https://www.curseforge.com/hytale/mods/rpg-leveling-and-stats': 432600,
  'https://www.curseforge.com/hytale/mods/perfect-parries': 430100,
  'https://www.curseforge.com/stardewvalley/mods/content-patcher': 1500000,
  'https://www.curseforge.com/stardewvalley/mods/lookup-anything': 651700,
  'https://www.curseforge.com/stardewvalley/mods/tractor-mod': 665200,
  'https://www.curseforge.com/stardewvalley/mods/fashion-sense': 670000,
  'https://www.curseforge.com/stardewvalley/mods/generic-mod-config-menu': 757400,
  'https://www.curseforge.com/hogwarts-legacy/mods/character-editor': 875900,
  'https://www.curseforge.com/hogwarts-legacy/mods/mhgearcapacity': 714100,
  'https://www.curseforge.com/hogwarts-legacy/mods/alohomora-autosolve-mod': 673100,
  'https://www.curseforge.com/hogwarts-legacy/mods/spellsandtalents': 632300,
  'https://www.curseforge.com/hogwarts-legacy/mods/spells-enhanced-new-spells': 596300,
  'https://www.curseforge.com/baldurs-gate-3/mods/tavs-hairmixer': 3300,
  'https://www.curseforge.com/baldurs-gate-3/mods/better-hotbar-2': 794,
  'https://www.curseforge.com/baldurs-gate-3/mods/better-maps-all-in-one': 590,
  'https://www.curseforge.com/baldurs-gate-3/mods/dynamic-sidebar': 428,
  'https://www.curseforge.com/baldurs-gate-3/mods/mod-manager-fixes-tweaks': 417,
  'https://www.curseforge.com/f4/mods/tactical-restrain-holstered-weapon': 448,
  'https://www.curseforge.com/f4/mods/modern-minimal-hud-fallui-preset': 465,
  'https://www.curseforge.com/f4/mods/h-u-e-handmade-unique-eyes-fo4': 109,
  'https://www.curseforge.com/f4/mods/beast351xs-bundles-mod': 466,
  'https://www.curseforge.com/f4/mods/essential-drinking-buddy': 374,
  'https://www.curseforge.com/skyrim/mods/lockpick-pro': 262700,
  'https://www.curseforge.com/skyrim/mods/dbs': 240300,
  'https://www.curseforge.com/skyrim/mods/skyrim-better-performance': 223200,
  'https://www.curseforge.com/skyrim/mods/weightless-items': 218300,
  'https://www.curseforge.com/skyrim/mods/df2': 189700,
  'https://www.curseforge.com/terraria/mods/op-weapons-and-tools': 36400,
  'https://www.curseforge.com/terraria/mods/ark-of-light': 11300,
  'https://www.curseforge.com/terraria/mods/jojos-bizarre-adventure-terraria-1-4-music-modpack': 10700,
  'https://www.curseforge.com/terraria/mods/op-player-save-file': 8400,
  'https://www.curseforge.com/terraria/mods/calamity-melee-endgame': 6200,
  'https://www.curseforge.com/rimworld/mods/my-little-rimpony': 250,
  'https://www.curseforge.com/rimworld/mods/sheeld-tech': 42,
  'https://www.curseforge.com/rimworld/mods/d12-wired-hairs-hd': 0,
  'https://www.curseforge.com/minecraft-bedrock/addons/better-on-bedrock': 5300000,
  'https://www.curseforge.com/minecraft-bedrock/addons/raiyons-java-combat-addon': 4800000,
  'https://www.curseforge.com/minecraft-bedrock/addons/serp-pokemon-addon': 4700000,
  'https://www.curseforge.com/minecraft-bedrock/addons/system-dynamic-lights': 4300000,
  'https://www.curseforge.com/minecraft-bedrock/addons/raiyons-dynamic-light-addon': 3700000
}

function sourceDownloadsCase() {
  const cases = Object.entries(sourceDownloadCounts)
    .map(([url, count]) => `WHEN '${url}' THEN ${count}`)
    .join(' ')

  return `CASE m.download_url ${cases} ELSE NULL END`
}

function orderBy(sort) {
  if (sort === 'popular') return `COALESCE(${sourceDownloadsCase()}, COUNT(DISTINCT d.id)) DESC, m.created_at DESC`
  if (sort === 'rating') return 'average_rating DESC, m.created_at DESC'
  if (sort === 'title') return 'm.title ASC'
  return 'm.created_at DESC'
}

/*
  PUBLIC MOD LIST
  Only approved mods are shown to public users.
*/
router.get('/', async (req, res, next) => {
  try {
    const { search = '', game = '', category = '', sort = 'latest', limit } = req.query

    const params = []
    let where = "WHERE m.status = 'approved'"

    if (search) {
      where += ' AND (m.title LIKE ? OR m.description LIKE ? OR m.tags LIKE ? OR g.name LIKE ?)'
      const q = `%${search}%`
      params.push(q, q, q, q)
    }

    if (game) {
      where += ' AND m.game_id = ?'
      params.push(game)
    }

    if (category) {
      where += ' AND m.category = ?'
      params.push(category)
    }

    const limitClause = limit ? 'LIMIT ?' : ''

    if (limit) {
      params.push(Number(limit))
    }

    const [rows] = await pool.query(
      `
      SELECT 
        m.*,
        g.name AS game_name,
        u.username AS creator_name,
        ${sourceDownloadsCase()} AS source_download_count,
        COALESCE(AVG(r.rating), 0) AS average_rating,
        COUNT(DISTINCT d.id) AS download_count
      FROM mods m
      JOIN games g ON g.id = m.game_id
      JOIN users u ON u.id = m.creator_id
      LEFT JOIN reviews r ON r.mod_id = m.id
      LEFT JOIN downloads d ON d.mod_id = m.id
      ${where}
      GROUP BY m.id
      ORDER BY ${orderBy(sort)}
      ${limitClause}
      `,
      params
    )

    res.json(rows)
  } catch (error) {
    next(error)
  }
})

/*
  PUBLIC MOD CATEGORIES
  Used by search controls so category filtering is consistent.
*/
router.get('/categories', async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `
      SELECT DISTINCT category
      FROM mods
      WHERE status = 'approved' AND category IS NOT NULL AND category <> ''
      ORDER BY category ASC
      `
    )

    res.json(rows.map((row) => row.category))
  } catch (error) {
    next(error)
  }
})

/*
  CREATOR'S OWN MODS
  Shows pending, approved, and rejected mods for the logged-in creator.
*/
router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `
      SELECT 
        m.*,
        g.name AS game_name,
        u.username AS creator_name,
        ${sourceDownloadsCase()} AS source_download_count,
        COALESCE(AVG(r.rating), 0) AS average_rating,
        COUNT(DISTINCT d.id) AS download_count
      FROM mods m
      JOIN games g ON g.id = m.game_id
      JOIN users u ON u.id = m.creator_id
      LEFT JOIN reviews r ON r.mod_id = m.id
      LEFT JOIN downloads d ON d.mod_id = m.id
      WHERE m.creator_id = ?
      GROUP BY m.id
      ORDER BY m.created_at DESC
      `,
      [req.user.id]
    )

    res.json(rows)
  } catch (error) {
    next(error)
  }
})

/*
  PUBLIC MOD DETAIL
  Only approved mods can be viewed publicly.
*/
router.get('/:id', async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `
      SELECT 
        m.*,
        g.name AS game_name,
        u.username AS creator_name,
        ${sourceDownloadsCase()} AS source_download_count,
        COALESCE(AVG(r.rating), 0) AS average_rating,
        COUNT(DISTINCT d.id) AS download_count
      FROM mods m
      JOIN games g ON g.id = m.game_id
      JOIN users u ON u.id = m.creator_id
      LEFT JOIN reviews r ON r.mod_id = m.id
      LEFT JOIN downloads d ON d.mod_id = m.id
      WHERE m.id = ? AND m.status = 'approved'
      GROUP BY m.id
      `,
      [req.params.id]
    )

    if (!rows.length) {
      return res.status(404).json({ message: 'Mod not found or not published yet' })
    }

    res.json(rows[0])
  } catch (error) {
    next(error)
  }
})

/*
  UPLOAD MOD
  Only creator/admin can upload.
  Creator upload = pending approval.
  Admin upload = approved immediately.
*/
router.post('/', requireAuth, upload.single('image'), async (req, res, next) => {
  try {
    if (req.user.role !== 'creator' && req.user.role !== 'admin') {
      return res.status(403).json({
        message: 'Creator access required to upload mods'
      })
    }

    const {
      title,
      game_id,
      category,
      tags,
      description,
      download_url
    } = req.body

    if (!title || !game_id || !category || !description) {
      return res.status(400).json({
        message: 'Missing required fields'
      })
    }

    const imageUrl = req.file ? req.file.filename : null
    const status = req.user.role === 'admin' ? 'approved' : 'pending'

    const [result] = await pool.query(
      `
      INSERT INTO mods 
      (
        creator_id,
        game_id,
        title,
        category,
        tags,
        description,
        image_url,
        file_url,
        download_url,
        status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        req.user.id,
        game_id,
        title,
        category,
        tags || '',
        description,
        imageUrl,
        null,
        download_url || null,
        status
      ]
    )

    res.status(201).json({
      id: result.insertId,
      status,
      message:
        status === 'approved'
          ? 'Mod created and published'
          : 'Mod uploaded successfully and is pending admin approval'
    })
  } catch (error) {
    next(error)
  }
})

/*
  UPDATE MOD
  Owner can update own mod.
  Admin can update any mod.
  If creator updates an approved/rejected mod, it goes back to pending.
*/
router.put('/:id', requireAuth, async (req, res, next) => {
  try {
    const {
      title,
      category,
      tags,
      description,
      download_url
    } = req.body

    const [existingRows] = await pool.query(
      'SELECT * FROM mods WHERE id = ?',
      [req.params.id]
    )

    if (!existingRows.length) {
      return res.status(404).json({ message: 'Mod not found' })
    }

    const existing = existingRows[0]

    const isOwner = existing.creator_id === req.user.id
    const isAdmin = req.user.role === 'admin'

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        message: 'You are not allowed to update this mod'
      })
    }

    const newStatus = isAdmin ? existing.status : 'pending'

    await pool.query(
      `
      UPDATE mods
      SET 
        title = COALESCE(?, title),
        category = COALESCE(?, category),
        tags = COALESCE(?, tags),
        description = COALESCE(?, description),
        download_url = COALESCE(?, download_url),
        status = ?,
        reviewed_by = NULL,
        reviewed_at = NULL,
        rejection_reason = NULL
      WHERE id = ?
      `,
      [
        title || null,
        category || null,
        tags || null,
        description || null,
        download_url || null,
        newStatus,
        req.params.id
      ]
    )

    res.json({
      message: isAdmin
        ? 'Mod updated'
        : 'Mod updated and sent back for admin approval'
    })
  } catch (error) {
    next(error)
  }
})

/*
  DELETE MOD
  Owner can delete own mod.
  Admin can delete any mod.
*/
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    let sql = 'DELETE FROM mods WHERE id = ?'
    const params = [req.params.id]

    if (req.user.role !== 'admin') {
      sql += ' AND creator_id = ?'
      params.push(req.user.id)
    }

    const [result] = await pool.query(sql, params)

    if (!result.affectedRows) {
      return res.status(404).json({
        message: 'Mod not found or not owned by you'
      })
    }

    res.json({ message: 'Mod deleted' })
  } catch (error) {
    next(error)
  }
})

export default router
