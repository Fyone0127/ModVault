<template>
  <div class="vaultbot">
    <button
      class="vaultbot-fab"
      :class="{ active: open }"
      type="button"
      :aria-expanded="open"
      aria-label="Open VaultBot chatbot"
      @click="open = !open"
    >
      <span class="vaultbot-fab-icon">
        <Bot :size="23" />
      </span>
      <span>{{ open ? 'Close' : 'Ask' }}</span>
    </button>

    <section v-if="open" class="vaultbot-panel" aria-label="VaultBot chatbot">
      <header class="vaultbot-header">
        <div class="vaultbot-avatar" aria-hidden="true">
          <Bot :size="24" />
          <span></span>
        </div>

        <div class="vaultbot-header-copy">
          <p class="eyebrow">VaultBot</p>
          <h2>ModVault assistant</h2>
          <div class="vaultbot-status-row">
            <span class="vaultbot-status-dot"></span>
            <small>{{ botStatus }}</small>
          </div>
        </div>

        <button class="btn-icon" type="button" aria-label="Close chatbot" @click="open = false">
          <X :size="18" />
        </button>
      </header>

      <div class="vaultbot-context-strip" aria-label="VaultBot catalogue context">
        <span>{{ catalogSummary }}</span>
        <span>{{ roleSummary }}</span>
      </div>

      <div ref="messagesEl" class="vaultbot-messages">
        <article
          v-for="message in messages"
          :key="message.id"
          class="vaultbot-message"
          :class="message.from"
        >
          <p>{{ message.text }}</p>

          <div v-if="message.links?.length" class="vaultbot-links">
            <RouterLink
              v-for="link in message.links"
              :key="link.to"
              :to="link.to"
              @click="open = false"
            >
              {{ link.label }}
            </RouterLink>
          </div>

          <div v-if="message.prompts?.length" class="vaultbot-followups">
            <button
              v-for="prompt in message.prompts"
              :key="prompt"
              type="button"
              @click="sendQuick(prompt)"
            >
              {{ prompt }}
            </button>
          </div>
        </article>

        <article v-if="typing" class="vaultbot-message bot vaultbot-typing">
          <span></span>
          <span></span>
          <span></span>
        </article>
      </div>

      <div class="vaultbot-prompts">
        <button
          v-for="prompt in quickPrompts"
          :key="prompt"
          type="button"
          @click="sendQuick(prompt)"
        >
          {{ prompt }}
        </button>
      </div>

      <form class="vaultbot-form" @submit.prevent="sendMessage">
        <input
          v-model="draft"
          class="input"
          type="text"
          placeholder="Ask about mods, roles, upload, approvals, or games..."
        />

        <button class="btn-icon" type="submit" aria-label="Send message">
          <Send :size="18" />
        </button>
      </form>
    </section>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { Bot, Send, X } from 'lucide-vue-next'
import api, { getCurrentUser } from '../services/api'

const open = ref(false)
const draft = ref('')
const mods = ref([])
const games = ref([])
const messagesEl = ref(null)
const user = ref(getCurrentUser())
const typing = ref(false)

const messages = ref([
  {
    id: 1,
    from: 'bot',
    text: 'Hi, I am VaultBot. I can help with browsing, uploads, approvals, creator access, and picking mods from the live ModVault catalogue.',
    links: [
      { label: 'Browse Mods', to: '/mods' },
      { label: 'Game Worlds', to: '/games' }
    ],
    prompts: ['Recommend Minecraft mods', 'How to upload?', 'What can admin do?']
  }
])

const botStatus = computed(() => {
  if (!mods.value.length || !games.value.length) return 'Loading catalogue context...'
  return 'Live catalogue context ready'
})

const catalogSummary = computed(() => {
  if (!mods.value.length || !games.value.length) return 'Syncing catalogue'
  return `${mods.value.length} mods / ${games.value.length} games`
})

const roleSummary = computed(() => {
  if (!user.value) return 'Guest mode'
  return `${user.value.role || 'User'} mode`
})

const quickPrompts = computed(() => {
  if (user.value?.role === 'creator') {
    return ['How to upload?', 'Why is my mod pending?', 'Check my mods']
  }

  return ['Recommend Minecraft mods', 'How to save favourites?', 'How to become creator?']
})

function normalize(text) {
  return String(text || '').toLowerCase().trim()
}

function tokens(text) {
  const stopWords = new Set([
    'what',
    'where',
    'which',
    'when',
    'how',
    'can',
    'could',
    'should',
    'please',
    'show',
    'open',
    'find',
    'give',
    'with',
    'from',
    'about',
    'mods',
    'mod',
    'game',
    'games',
    'the',
    'and',
    'for',
    'you',
    'want',
    'need'
  ])

  return normalize(text)
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length > 2 && !stopWords.has(word))
}

function hasAny(text, words) {
  return words.some((word) => text.includes(word))
}

function addMessage(from, text, links = [], prompts = []) {
  messages.value.push({
    id: Date.now() + Math.random(),
    from,
    text,
    links,
    prompts
  })

  nextTick(() => {
    if (messagesEl.value) {
      messagesEl.value.scrollTop = messagesEl.value.scrollHeight
    }
  })
}

function findGame(query) {
  const q = normalize(query)
  return games.value.find((game) => {
    const name = normalize(game.name)
    return q.includes(name) || tokens(game.name).some((word) => q.includes(word))
  })
}

function findCategory(query) {
  const q = normalize(query)
  const categories = [...new Set(mods.value.map((mod) => mod.category).filter(Boolean))]

  return categories.find((category) => {
    const normalizedCategory = normalize(category)
    return q.includes(normalizedCategory) || tokens(category).some((word) => q.includes(word))
  })
}

function scoreMod(mod, words, activeGame, activeCategory) {
  const target = normalize(`${mod.title} ${mod.game_name} ${mod.category} ${mod.tags} ${mod.description}`)
  let score = Number(mod.average_rating || 0) * 4
    + Math.min(Number(mod.source_download_count || mod.download_count || 0), 35)

  for (const word of words) {
    if (target.includes(word)) score += 12
  }

  if (activeGame && String(mod.game_id) === String(activeGame.id)) score += 28
  if (activeCategory && normalize(mod.category) === normalize(activeCategory)) score += 20

  return score
}

function matchingMods(query, limit = 3) {
  const words = tokens(query)
  const activeGame = findGame(query)
  const activeCategory = findCategory(query)

  return mods.value
    .map((mod) => ({
      ...mod,
      vaultbotScore: scoreMod(mod, words, activeGame, activeCategory)
    }))
    .filter((mod) => mod.vaultbotScore > 0)
    .sort((a, b) => b.vaultbotScore - a.vaultbotScore)
    .slice(0, limit)
}

function topMod() {
  return mods.value[0]
}

function describeMatches(matches, fallback = 'Here are a few catalogue picks') {
  if (!matches.length) return fallback

  const names = matches.map((mod) => `"${mod.title}"`).join(', ')
  const gameNames = [...new Set(matches.map((mod) => mod.game_name).filter(Boolean))].join(', ')

  return `${names} ${matches.length === 1 ? 'is' : 'are'} worth checking${gameNames ? ` for ${gameNames}` : ''}.`
}

function browseLink(query) {
  const game = findGame(query)

  return game
    ? { label: `Browse ${game.name}`, to: `/mods?game=${game.id}` }
    : { label: 'Browse Mods', to: '/mods' }
}

function roleHomeLink(role) {
  if (role === 'creator') return { label: 'My Mods', to: '/my-mods' }
  if (role === 'user') return { label: 'Dashboard', to: '/dashboard' }
  return { label: 'Login', to: '/login' }
}

function buildAnswer(text, links = [], prompts = []) {
  return { text, links, prompts }
}

function answerFor(input) {
  const q = normalize(input)
  const role = user.value?.role || 'guest'
  const game = findGame(q)

  if (hasAny(q, ['hello', 'hi ', 'hey', 'help', 'what can you do'])) {
    return buildAnswer(
      'I can help with browsing mods, games, uploads, creator access, favourites, reviews, password reset, and recommendations from the live ModVault catalogue.',
      [{ label: 'Browse Mods', to: '/mods' }, roleHomeLink(role)],
      ['Recommend Minecraft mods', 'How to upload?', 'How to reset password?']
    )
  }

  if (hasAny(q, ['forgot password', 'reset password', 'password', 'cant login', 'cannot login'])) {
    return buildAnswer(
      'Use the forgot-password flow from Login. In this project the reset stays inside the app, so you prepare the reset page directly and set a new password there.',
      [
        { label: 'Login', to: '/login' },
        { label: 'Forgot Password', to: '/forgot-password' }
      ],
      ['How do I login?', 'What if I do not have an account?']
    )
  }

  if (hasAny(q, ['login', 'sign in', 'register', 'account'])) {
    return buildAnswer(
      'Use Login if you already have an account, or Register to create one. After login, ModVault shows dashboard tools based on your role.',
      [
        { label: 'Login', to: '/login' },
        { label: 'Register', to: '/register' }
      ],
      ['Forgot password?', 'What can creators do?']
    )
  }

  if (hasAny(q, ['add game', 'new game', 'create game', 'more games'])) {
    return buildAnswer(
      'Game collections are managed outside the normal user and creator flow. Once a game is added, creators can upload mods under it and players can browse it from the Games page.',
      [
        { label: 'Games', to: '/games' },
        roleHomeLink(role)
      ],
      ['How to become creator?', 'Browse games']
    )
  }

  if (hasAny(q, ['upload', 'submit', 'publish', 'add my mod', 'post mod'])) {
    if (role === 'creator' || role === 'admin') {
      return buildAnswer(
        'Upload from the creator upload page. Add a clear title, correct game, category, tags, cover image, description, and a trustworthy download link. New uploads go into admin approval before becoming public.',
        [
          { label: 'Upload Mod', to: '/upload' },
          { label: 'My Mods', to: '/my-mods' }
        ],
        ['Why is my mod pending?', 'What makes a good upload?']
      )
    }

    return buildAnswer(
      'Only creators and admins can upload mods. Apply for creator access first, then upload after approval.',
      [
        { label: 'Apply Creator', to: '/apply-creator' },
        { label: 'Login', to: '/login' }
      ],
      ['How to become creator?', 'What can creators do?']
    )
  }

  if (hasAny(q, ['pending', 'approved', 'rejected', 'approval', 'review status', 'why is my mod'])) {
    if (role === 'creator') {
      return buildAnswer(
        'Creator uploads can be pending, approved, or rejected. Pending means an admin has not reviewed it yet. If it is rejected, check the rejection reason, tighten the details, and upload a better revision.',
        [
          { label: 'My Mods', to: '/my-mods' },
          { label: 'Upload Mod', to: '/upload' }
        ],
        ['How to upload?', 'Check my mods']
      )
    }

    return buildAnswer(
      'Mod approval is handled by admins. If you want to upload in future, apply for creator access first; creator submissions are reviewed before they appear publicly.',
      [
        { label: 'Apply Creator', to: '/apply-creator' },
        { label: 'Browse Mods', to: '/mods' }
      ],
      ['How to become creator?', 'Browse mods']
    )
  }

  if (hasAny(q, ['admin', 'moderator', 'creator request'])) {
    return buildAnswer(
      'Some catalogue actions are admin-only. As a user or creator, the main flows here are browsing, saving, reviewing, uploading, and tracking creator submissions.',
      [
        { label: 'Dashboard', to: '/dashboard' },
        { label: 'Browse Mods', to: '/mods' }
      ],
      ['Browse games', 'How to become creator?']
    )
  }

  if (hasAny(q, ['creator', 'apply', 'become creator', 'creator access'])) {
    if (role === 'creator' || role === 'admin') {
      return buildAnswer(
        'Your account already has upload access. Use Upload Mod to submit new mods and My Mods to track review status.',
        [
          { label: 'Upload Mod', to: '/upload' },
          { label: 'My Mods', to: '/my-mods' }
        ],
        ['How to upload?', 'Why is my mod pending?']
      )
    }

    return buildAnswer(
      'Creator access lets users upload mods and track submissions. Apply with a clear reason and a portfolio link if you have one.',
      [{ label: 'Apply Creator', to: '/apply-creator' }],
      ['What makes a strong application?', 'How to upload?']
    )
  }

  if (hasAny(q, ['favourite', 'favorite', 'save', 'saved', 'collection'])) {
    return buildAnswer(
      'Use Favourites to keep mods you like. Save from the mod card or detail page, then manage the collection from Favourites.',
      [
        { label: 'Favourites', to: '/favourites' },
        { label: 'Browse Mods', to: '/mods' }
      ],
      ['Recommend mods for me', 'How reviews work?']
    )
  }

  if (hasAny(q, ['review', 'rating', 'comment', 'feedback'])) {
    return buildAnswer(
      'Reviews help other users judge a mod. Open a mod detail page to read or leave feedback, then check your review history from the Reviews page.',
      [
        { label: 'Review History', to: '/reviews' },
        { label: 'Browse Mods', to: '/mods' }
      ],
      ['How to save favourites?', 'Recommend Minecraft mods']
    )
  }

  if (hasAny(q, ['spin', 'random', 'surprise', 'unique', 'discover'])) {
    return buildAnswer(
      'Surprise discovery now lives in the Mods feed and recommendations. Tell me a game, vibe, or category and I can point you to a strong pick.',
      [
        { label: 'Browse Mods', to: '/mods' },
        { label: 'Game Worlds', to: '/games' }
      ],
      ['Recommend Minecraft mods', 'Browse games']
    )
  }

  if (hasAny(q, ['search', 'filter', 'sort', 'category', 'categories', 'browse'])) {
    return buildAnswer(
      'Use the Mods page to search by keyword, filter by game or category, and sort by latest, source downloads, rating, or title.',
      [
        browseLink(q),
        { label: 'Games', to: '/games' }
      ],
      ['Recommend Skyrim mods', 'What categories do you have?']
    )
  }

  if (game || hasAny(q, ['game', 'minecraft', 'skyrim', 'sims', 'fallout', 'terraria', 'stardew', 'rimworld', 'witcher', 'baldur'])) {
    const matches = matchingMods(q, 3)
    return buildAnswer(
      game
        ? `${game.name} is in the ModVault games collection. ${describeMatches(matches, 'Open its mod list to see matching approved mods.')}`
        : `ModVault has ${games.value.length || 'multiple'} game collections. Use Games to browse by game, or Mods for keyword and category search.`,
      [
        game ? { label: `${game.name} Mods`, to: `/mods?game=${game.id}` } : { label: 'Games', to: '/games' },
        { label: 'Browse Mods', to: '/mods' }
      ],
      game ? [`Recommend ${game.name} mods`, 'Browse categories'] : ['Browse games', 'Recommend Minecraft mods']
    )
  }

  if (hasAny(q, ['recommend', 'suggest', 'best', 'popular', 'top', 'find']) || q.includes('mod')) {
    const matches = matchingMods(q, 3)
    const match = matches[0] || topMod()

    if (match) {
      return buildAnswer(
        `${describeMatches(matches.length ? matches : [match])} Use the Mods page if you want to narrow this by game, category, or sort order.`,
        [
          { label: 'Open Top Pick', to: `/mods/${match.id}` },
          browseLink(q)
        ],
        ['Show more like this', 'Browse categories']
      )
    }
  }

  return buildAnswer(
    'I did not catch that exactly, but I can still help with uploads, creator access, password reset, favourites, reviews, games, search filters, and recommendations.',
    [
      { label: 'Browse Mods', to: '/mods' },
      { label: 'Games', to: '/games' },
      roleHomeLink(role)
    ],
    quickPrompts.value
  )
}

function sendQuick(prompt) {
  draft.value = prompt
  sendMessage()
}

function sendMessage() {
  const text = draft.value.trim()
  if (!text) return

  addMessage('user', text)
  draft.value = ''
  typing.value = true

  const answer = answerFor(text)
  window.setTimeout(() => {
    typing.value = false
    addMessage('bot', answer.text, answer.links, answer.prompts)
  }, 220)
}

async function loadContext() {
  try {
    const [modResponse, gameResponse] = await Promise.all([
      api.get('/mods', { params: { sort: 'popular' } }),
      api.get('/games')
    ])

    mods.value = modResponse.data
    games.value = gameResponse.data
  } catch (error) {
    console.warn('VaultBot context could not be loaded:', error)
  }
}

function syncSession() {
  user.value = getCurrentUser()
}

onMounted(() => {
  loadContext()
  window.addEventListener('session-changed', syncSession)
})

onBeforeUnmount(() => {
  window.removeEventListener('session-changed', syncSession)
})
</script>
