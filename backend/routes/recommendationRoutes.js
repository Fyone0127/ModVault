import express from 'express'
import { pool } from '../config/db.js'
import { requireAuth } from '../middleware/auth.js'

const router = express.Router()

function parseTags(tags = '') {
  return String(tags)
    .split(',')
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean)
}

function addWeight(map, key, weight) {
  if (!key) return
  const normalizedKey = String(key).trim().toLowerCase()
  if (!normalizedKey) return
  map.set(normalizedKey, (map.get(normalizedKey) || 0) + Number(weight || 0))
}

function topEntries(map, limit = 3) {
  return [...map.entries()]
    .filter(([, weight]) => weight > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([name, weight]) => ({ name, weight }))
}

function daysSince(dateValue) {
  if (!dateValue) return 999
  const created = new Date(dateValue)
  const diff = Date.now() - created.getTime()
  return Math.max(0, Math.floor(diff / 86400000))
}

function qualityScore(mod) {
  const rating = Number(mod.average_rating || 0)
  const downloads = Number(mod.download_count || 0)
  const favourites = Number(mod.favourite_count || 0)

  return (rating * 4) + Math.min(downloads, 100) / 10 + Math.min(favourites, 50) / 5
}

function freshnessScore(mod) {
  const age = daysSince(mod.created_at)
  if (age <= 7) return 8
  if (age <= 30) return 5
  if (age <= 90) return 2
  return 0
}

function buildProfile(activityRows) {
  const gameWeights = new Map()
  const gameNames = new Map()
  const categoryWeights = new Map()
  const tagWeights = new Map()
  const interactedIds = new Set()

  for (const row of activityRows) {
    const weight = Number(row.weight || 0)
    interactedIds.add(Number(row.mod_id))
    addWeight(gameWeights, row.game_id, weight)
    addWeight(categoryWeights, row.category, weight)

    if (row.game_id && row.game_name) {
      gameNames.set(String(row.game_id), row.game_name)
    }

    for (const tag of parseTags(row.tags)) {
      addWeight(tagWeights, tag, weight)
    }
  }

  return {
    gameWeights,
    gameNames,
    categoryWeights,
    tagWeights,
    interactedIds,
    depth: activityRows.length
  }
}

async function getActivityRows(userId) {
  const [activityRows] = await pool.query(
    `
    SELECT
      m.id AS mod_id,
      m.game_id,
      g.name AS game_name,
      m.category,
      m.tags,
      5 AS weight
    FROM favourites fav
    JOIN mods m ON m.id = fav.mod_id
    JOIN games g ON g.id = m.game_id
    WHERE fav.user_id = ? AND m.status = 'approved'

    UNION ALL

    SELECT
      m.id AS mod_id,
      m.game_id,
      g.name AS game_name,
      m.category,
      m.tags,
      CASE
        WHEN r.rating >= 4 THEN 4
        WHEN r.rating = 3 THEN 2
        ELSE -3
      END AS weight
    FROM reviews r
    JOIN mods m ON m.id = r.mod_id
    JOIN games g ON g.id = m.game_id
    WHERE r.user_id = ? AND m.status = 'approved'

    UNION ALL

    SELECT
      m.id AS mod_id,
      m.game_id,
      g.name AS game_name,
      m.category,
      m.tags,
      2 AS weight
    FROM downloads d
    JOIN mods m ON m.id = d.mod_id
    JOIN games g ON g.id = m.game_id
    WHERE d.user_id = ? AND m.status = 'approved'
    `,
    [userId, userId, userId]
  )

  return activityRows
}

function profileScore(mod, profile) {
  const gameScore = (profile.gameWeights.get(String(mod.game_id).toLowerCase()) || 0) * 8
  const categoryScore = (profile.categoryWeights.get(String(mod.category || '').toLowerCase()) || 0) * 6
  const tagScore = parseTags(mod.tags).reduce((total, tag) => {
    return total + ((profile.tagWeights.get(tag) || 0) * 3)
  }, 0)

  return gameScore + categoryScore + tagScore
}

function recommendationReason(mod, profile) {
  if (!profile.depth) {
    if (Number(mod.average_rating || 0) >= 4) return 'Highly rated by the community'
    if (Number(mod.download_count || 0) > 0) return 'Popular with active players'
    return 'Fresh discovery from the ModVault catalogue'
  }

  const matches = []
  if (profile.gameWeights.get(String(mod.game_id).toLowerCase()) > 0) {
    matches.push(mod.game_name)
  }

  if (profile.categoryWeights.get(String(mod.category || '').toLowerCase()) > 0) {
    matches.push(mod.category)
  }

  const matchingTags = parseTags(mod.tags)
    .filter((tag) => (profile.tagWeights.get(tag) || 0) > 0)
    .slice(0, 2)

  matches.push(...matchingTags)

  if (matches.length) {
    return `Matches your interest in ${matches.slice(0, 3).join(', ')}`
  }

  if (Number(mod.average_rating || 0) >= 4) return 'Strong community signal'
  return 'Balanced pick from similar catalogue activity'
}

function relatedReason(mod, baseMod) {
  const sharedTags = parseTags(mod.tags).filter((tag) => parseTags(baseMod.tags).includes(tag))

  if (mod.game_id === baseMod.game_id && mod.category === baseMod.category) {
    return `Same game and category as ${baseMod.title}`
  }

  if (sharedTags.length) {
    return `Shares ${sharedTags.slice(0, 2).join(', ')} with ${baseMod.title}`
  }

  if (mod.game_id === baseMod.game_id) {
    return `More ${mod.game_name} content`
  }

  return 'Similar community quality signal'
}

async function getApprovedMods() {
  const [rows] = await pool.query(
    `
    SELECT
      m.*,
      g.name AS game_name,
      u.username AS creator_name,
      COALESCE(AVG(r.rating), 0) AS average_rating,
      COUNT(DISTINCT d.id) AS download_count,
      COUNT(DISTINCT f.id) AS favourite_count
    FROM mods m
    JOIN games g ON g.id = m.game_id
    JOIN users u ON u.id = m.creator_id
    LEFT JOIN reviews r ON r.mod_id = m.id
    LEFT JOIN downloads d ON d.mod_id = m.id
    LEFT JOIN favourites f ON f.mod_id = m.id
    WHERE m.status = 'approved'
    GROUP BY m.id
    `
  )

  return rows
}

router.get('/related/:modId', async (req, res, next) => {
  try {
    const [baseRows] = await pool.query(
      `
      SELECT m.*, g.name AS game_name
      FROM mods m
      JOIN games g ON g.id = m.game_id
      WHERE m.id = ? AND m.status = 'approved'
      `,
      [req.params.modId]
    )

    if (!baseRows.length) {
      return res.status(404).json({ message: 'Mod not found' })
    }

    const baseMod = baseRows[0]
    const baseTags = parseTags(baseMod.tags)
    const candidates = (await getApprovedMods()).filter((mod) => Number(mod.id) !== Number(baseMod.id))

    const ranked = candidates
      .map((mod) => {
        const sameGame = mod.game_id === baseMod.game_id ? 28 : 0
        const sameCategory = mod.category === baseMod.category ? 20 : 0
        const sharedTags = parseTags(mod.tags).filter((tag) => baseTags.includes(tag)).length
        const score = sameGame + sameCategory + (sharedTags * 9) + qualityScore(mod) + freshnessScore(mod)

        return {
          ...mod,
          recommendation_score: Math.round(score),
          recommendation_reason: relatedReason(mod, baseMod)
        }
      })
      .sort((a, b) => b.recommendation_score - a.recommendation_score)
      .slice(0, 4)

    res.json(ranked)
  } catch (error) {
    next(error)
  }
})

router.get('/', requireAuth, async (req, res, next) => {
  try {
    const activityRows = await getActivityRows(req.user.id)
    const profile = buildProfile(activityRows)
    const candidates = await getApprovedMods()

    let ranked = candidates
      .map((mod) => {
        const personalized = profileScore(mod, profile)
        const fallbackBoost = profile.depth ? 0 : 25
        const score = personalized + qualityScore(mod) + freshnessScore(mod) + fallbackBoost

        return {
          ...mod,
          recommendation_score: Math.round(score),
          recommendation_reason: recommendationReason(mod, profile)
        }
      })
      .sort((a, b) => b.recommendation_score - a.recommendation_score)

    const freshRanked = ranked.filter((mod) => !profile.interactedIds.has(Number(mod.id)))
    if (freshRanked.length >= 4) {
      ranked = freshRanked
    }

    const topGames = topEntries(profile.gameWeights)
    const topCategories = topEntries(profile.categoryWeights)
    const topTags = topEntries(profile.tagWeights, 5)

    res.json({
      insights: {
        profileDepth: profile.depth,
        favouriteGame: topGames[0]
          ? profile.gameNames.get(topGames[0].name) || topGames[0].name
          : 'Trending now',
        favouriteCategory: topCategories[0]?.name || 'Mixed picks',
        strongestTags: topTags.map((tag) => tag.name),
        totalCandidates: candidates.length
      },
      recommendations: ranked.slice(0, 12)
    })
  } catch (error) {
    next(error)
  }
})

export default router
