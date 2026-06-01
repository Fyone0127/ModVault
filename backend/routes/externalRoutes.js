import express from 'express'

const router = express.Router()

const fallbackGames = [
  {
    id: 'fallback-minecraft',
    title: 'Minecraft',
    genre: 'Sandbox',
    platform: 'PC',
    publisher: 'Mojang',
    description: 'A creative sandbox world with a huge modding culture around building, survival, servers, and custom packs.',
    thumbnail: '/images/games/minecraft.jpg',
    url: 'https://www.minecraft.net'
  },
  {
    id: 'fallback-skyrim',
    title: 'Skyrim',
    genre: 'RPG',
    platform: 'PC',
    publisher: 'Bethesda',
    description: 'A fantasy RPG known for visual overhauls, companions, weapons, quests, and gameplay mods.',
    thumbnail: '/images/games/skyrim.jpg',
    url: 'https://elderscrolls.bethesda.net/skyrim'
  },
  {
    id: 'fallback-fallout',
    title: 'Fallout 4',
    genre: 'RPG',
    platform: 'PC',
    publisher: 'Bethesda',
    description: 'A post-apocalyptic modding favourite for settlements, weapons, survival changes, UI upgrades, and visuals.',
    thumbnail: '/images/games/fallout4.jpg',
    url: 'https://fallout.bethesda.net'
  }
]

function cleanString(value, fallback = '') {
  return String(value || fallback).trim()
}

function normalizeGame(game) {
  return {
    id: cleanString(game.id || game.title),
    title: cleanString(game.title, 'Untitled game'),
    genre: cleanString(game.genre, 'Game'),
    platform: cleanString(game.platform, 'PC'),
    publisher: cleanString(game.publisher, 'Publisher'),
    description: cleanString(game.short_description || game.description, 'Explore this game and look for modding inspiration.'),
    thumbnail: cleanString(game.thumbnail, '/images/games/default.jpg'),
    url: cleanString(game.game_url || game.url, 'https://www.freetogame.com')
  }
}

router.get('/game-inspiration', async (req, res) => {
  const category = cleanString(req.query.category).toLowerCase()
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 3500)

  try {
    const url = new URL('https://www.freetogame.com/api/games')
    url.searchParams.set('platform', 'pc')
    if (category && category !== 'all') url.searchParams.set('category', category)

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        accept: 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`External API returned ${response.status}`)
    }

    const games = await response.json()
    const items = Array.isArray(games)
      ? games.slice(0, 12).map(normalizeGame)
      : fallbackGames

    res.set('Cache-Control', 'public, max-age=900')
    res.json({
      source: 'FreeToGame',
      items
    })
  } catch (error) {
    res.json({
      source: 'fallback',
      items: fallbackGames
    })
  } finally {
    clearTimeout(timeout)
  }
})

export default router
