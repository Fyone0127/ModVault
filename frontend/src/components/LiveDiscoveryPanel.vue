<template>
  <section
    class="live-discovery"
    aria-labelledby="live-discovery-title"
    tabindex="0"
    @keydown.left.prevent="previous"
    @keydown.right.prevent="next"
  >
    <div class="live-discovery-copy">
      <p class="eyebrow">Live discovery</p>
      <h2 id="live-discovery-title">Fresh game inspiration from the ModVault library.</h2>
      <p>
        Browse real ModVault game collections with a live trend pulse behind the scenes,
        then jump straight into matching mods, favourites, and reviews.
      </p>

      <div class="live-discovery-tabs" role="tablist" aria-label="Discovery categories">
        <button
          v-for="category in categories"
          :key="category.value"
          type="button"
          role="tab"
          :aria-selected="activeCategory === category.value"
          :class="{ active: activeCategory === category.value }"
          @click="changeCategory(category.value)"
        >
          {{ category.label }}
        </button>
      </div>

      <div class="cta-row">
        <RouterLink class="btn" to="/mods">
          Search Mods
        </RouterLink>
        <RouterLink class="btn-secondary" to="/games">
          Browse Games
        </RouterLink>
      </div>
    </div>

    <div class="live-discovery-stage">
      <div v-if="loading" class="live-discovery-loading">
        Loading live picks...
      </div>

      <template v-else-if="activeGame">
        <article class="live-discovery-card" aria-live="polite">
          <img
            :src="image(activeGame)"
            :alt="`${activeGame.name} cover`"
            loading="lazy"
            @error="handleImageError"
          />

          <div class="live-discovery-card-body">
            <span class="badge cyan">{{ activeGame.genreLabel }}</span>
            <h3>{{ activeGame.name }}</h3>
            <p>{{ activeGame.description }}</p>

            <div class="live-discovery-meta">
              <span>{{ activeGame.mod_count || 0 }} mods</span>
              <span>{{ activeGame.signal }}</span>
              <span>{{ trendLabel }}</span>
            </div>

            <div class="cta-row">
              <RouterLink
                class="btn-secondary"
                to="/games"
              >
                View Game
              </RouterLink>
              <RouterLink
                class="btn-secondary"
                :to="{ path: '/mods', query: { game: activeGame.id } }"
              >
                Find Mods
              </RouterLink>
            </div>
          </div>
        </article>

        <div class="live-discovery-controls" aria-label="Discovery carousel controls">
          <button type="button" class="btn-icon" aria-label="Previous discovery item" @click="previous">
            <ChevronLeft :size="18" />
          </button>

          <span>{{ activeIndex + 1 }} / {{ visibleItems.length }}</span>

          <button type="button" class="btn-icon" aria-label="Next discovery item" @click="next">
            <ChevronRight :size="18" />
          </button>
        </div>
      </template>

      <div v-else class="empty">
        ModVault game inspiration is not available right now.
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import api from '../services/api'
import { getGameFallback, resolveGameImage } from '../utils/imageResolver'

const categories = [
  { label: 'All', value: 'all' },
  { label: 'RPG', value: 'rpg' },
  { label: 'Sandbox', value: 'sandbox' },
  { label: 'Sim', value: 'simulation' },
  { label: 'Strategy', value: 'strategy' }
]

const activeCategory = ref('all')
const activeIndex = ref(0)
const games = ref([])
const trendItems = ref([])
const trendSource = ref('')
const loading = ref(true)
let controller = null

const visibleItems = computed(() => {
  const enriched = games.value.map((game) => ({
    ...game,
    ...gameProfile(game)
  }))

  if (activeCategory.value === 'all') return enriched
  return enriched.filter((game) => game.categories.includes(activeCategory.value))
})

const activeGame = computed(() => visibleItems.value[activeIndex.value] || visibleItems.value[0] || null)

const trendLabel = computed(() => {
  if (trendItems.value.length) return `${trendItems.value.length} live references`
  return trendSource.value === 'fallback' ? 'Curated backup' : 'Local collection'
})

const categoryMap = {
  all: 'all',
  rpg: 'mmorpg',
  sandbox: 'all',
  simulation: 'strategy',
  strategy: 'strategy'
}

function cacheKey(category) {
  return `modvault_discovery_${category}`
}

function readCache(category) {
  try {
    const cached = JSON.parse(sessionStorage.getItem(cacheKey(category)) || 'null')
    if (!cached) return null

    const isFresh = Date.now() - cached.savedAt < 1000 * 60 * 15
    return isFresh ? cached.items : null
  } catch (error) {
    return null
  }
}

function writeCache(category, data) {
  try {
    sessionStorage.setItem(cacheKey(category), JSON.stringify({
      savedAt: Date.now(),
      items: data
    }))
  } catch (error) {
    // Storage can fail in private windows; the API fallback still keeps the panel usable.
  }
}

function gameProfile(game) {
  const name = String(game?.name || '').toLowerCase()

  if (name.includes('world of warcraft')) {
    return {
      genreLabel: 'MMO',
      signal: 'Addons and raid tools',
      categories: ['rpg', 'strategy']
    }
  }

  if (name.includes('minecraft') || name.includes('hytale') || name.includes('terraria')) {
    return {
      genreLabel: 'Sandbox',
      signal: 'Creative mod playground',
      categories: ['sandbox']
    }
  }

  if (name.includes('stardew') || name.includes('sims') || name.includes('inzoi')) {
    return {
      genreLabel: 'Simulation',
      signal: 'Lifestyle and systems mods',
      categories: ['simulation']
    }
  }

  if (name.includes('rimworld')) {
    return {
      genreLabel: 'Strategy',
      signal: 'Colony expansion picks',
      categories: ['strategy', 'simulation']
    }
  }

  return {
    genreLabel: 'RPG',
    signal: 'Quest and immersion mods',
    categories: ['rpg']
  }
}

async function loadGames() {
  try {
    const response = await api.get('/games')
    games.value = response.data || []
  } catch (error) {
    games.value = []
  } finally {
    loading.value = false
  }
}

async function loadTrendPulse(category = activeCategory.value) {
  const externalCategory = categoryMap[category] || 'all'
  const cached = readCache(externalCategory)

  if (cached?.length) {
    trendItems.value = cached
    trendSource.value = 'cached'
    return
  }

  controller?.abort()
  controller = new AbortController()

  try {
    const response = await api.get('/external/game-inspiration', {
      params: { category: externalCategory },
      signal: controller.signal
    })

    trendItems.value = response.data.items || []
    trendSource.value = response.data.source || ''
    writeCache(externalCategory, trendItems.value)
  } catch (error) {
    if (error.name !== 'CanceledError') {
      trendItems.value = []
      trendSource.value = ''
    }
  }
}

async function loadDiscovery(category = activeCategory.value) {
  const cached = readCache(category)

  if (cached?.length) {
    trendItems.value = cached
    activeIndex.value = 0
    return
  }

  activeIndex.value = 0
  await loadTrendPulse(category)
}

function changeCategory(category) {
  if (activeCategory.value === category) return
  activeCategory.value = category
  activeIndex.value = 0
  loadDiscovery(category)
}

function previous() {
  if (!visibleItems.value.length) return
  activeIndex.value = activeIndex.value === 0 ? visibleItems.value.length - 1 : activeIndex.value - 1
}

function next() {
  if (!visibleItems.value.length) return
  activeIndex.value = activeIndex.value === visibleItems.value.length - 1 ? 0 : activeIndex.value + 1
}

function image(game) {
  return resolveGameImage(game)
}

function handleImageError(event) {
  event.target.src = getGameFallback(activeGame.value?.name)
}

onMounted(() => {
  loadGames()
  loadDiscovery()
})

onBeforeUnmount(() => {
  controller?.abort()
})
</script>
