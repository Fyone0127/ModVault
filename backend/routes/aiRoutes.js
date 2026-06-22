import express from 'express'

const router = express.Router()

const OPENAI_RESPONSES_URL = 'https://api.openai.com/v1/responses'

function trimText(value, maxLength = 900) {
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, maxLength)
}

function compactMod(mod) {
  return {
    id: mod.id,
    title: trimText(mod.title, 90),
    game: trimText(mod.game_name, 60),
    category: trimText(mod.category, 40),
    tags: trimText(mod.tags, 120),
    description: trimText(mod.description, 220),
    rating: mod.average_rating,
    downloads: mod.source_download_count ?? mod.download_count
  }
}

function compactGame(game) {
  return {
    id: game.id,
    name: trimText(game.name, 70),
    description: trimText(game.description, 180),
    mods: game.mod_count
  }
}

function getResponseText(payload) {
  if (typeof payload.output_text === 'string') return payload.output_text.trim()

  const textParts = []
  for (const item of payload.output || []) {
    for (const content of item.content || []) {
      if (content.type === 'output_text' && content.text) {
        textParts.push(content.text)
      }
    }
  }

  return textParts.join('\n').trim()
}

router.post('/chat', async (req, res, next) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return res.status(503).json({
        message: 'AI chat is not configured',
        fallback: true
      })
    }

    const message = trimText(req.body?.message, 600)
    if (!message) {
      return res.status(400).json({ message: 'Message is required' })
    }

    const context = req.body?.context || {}
    const mods = Array.isArray(context.mods) ? context.mods.slice(0, 14).map(compactMod) : []
    const games = Array.isArray(context.games) ? context.games.slice(0, 10).map(compactGame) : []
    const user = context.user
      ? {
          role: trimText(context.user.role, 30),
          username: trimText(context.user.username, 60)
        }
      : { role: 'guest' }

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 15000)

    const response = await fetch(OPENAI_RESPONSES_URL, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-4.1-mini',
        input: [
          {
            role: 'system',
            content:
              'You are VaultBot, a concise assistant inside ModVault, a game mod discovery website. Answer using the provided catalogue context when relevant. Keep replies under 90 words. Be helpful, direct, and do not invent pages, prices, accounts, or database facts. If the user needs an app action, name the page they should open.'
          },
          {
            role: 'user',
            content: JSON.stringify({
              user,
              catalogue: {
                games,
                mods
              },
              question: message
            })
          }
        ],
        temperature: 0.5,
        max_output_tokens: 220
      })
    })

    clearTimeout(timeout)

    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      return res.status(response.status).json({
        message: data.error?.message || 'AI chat request failed',
        fallback: true
      })
    }

    const text = getResponseText(data)
    if (!text) {
      return res.status(502).json({
        message: 'AI returned an empty response',
        fallback: true
      })
    }

    res.json({ text })
  } catch (error) {
    if (error.name === 'AbortError') {
      return res.status(504).json({
        message: 'AI chat timed out',
        fallback: true
      })
    }

    next(error)
  }
})

export default router
