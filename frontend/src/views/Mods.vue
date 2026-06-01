<template>
  <div class="mods-news-page">
    <section class="mods-news-hero">
      <div class="mods-news-hero-copy">
        <p class="eyebrow mods-news-kicker">ModVault Dispatch</p>
        <h1>Latest stories from the mod world</h1>
        <p>
          Browse approved uploads like game news: quick reads, world updates, creator picks,
          and the mods worth jumping into next.
        </p>

        <div class="mods-news-actions">
          <RouterLink class="btn" to="/upload">
            <UploadCloud :size="18" />
            Upload Mod
          </RouterLink>
          <RouterLink class="btn-secondary" to="/games">
            <Gamepad2 :size="18" />
            View Games
          </RouterLink>
        </div>

        <div class="mods-news-points">
          <span><Search :size="15" /> Search stories</span>
          <span><Tags :size="15" /> Browse categories</span>
          <span><Star :size="15" /> Surface favourites</span>
        </div>

        <div class="mods-news-hero-stats" aria-label="Catalogue summary">
          <strong>{{ mods.length }}</strong>
          <span>approved mods</span>
          <strong>{{ categories.length }}</strong>
          <span>categories</span>
          <strong>{{ totalSourceDownloads }}</strong>
          <span>source downloads tracked</span>
        </div>
      </div>

      <RouterLink
        v-if="spotlightMod"
        class="mods-news-feature"
        :to="`/mods/${spotlightMod.id}`"
      >
        <img
          :src="modImage(spotlightMod)"
          :alt="`${spotlightMod.title} feature image`"
          @error="handleModImageError($event, spotlightMod)"
        />
        <span class="mods-news-feature-tag">{{ spotlightMod.category || 'Featured Mod' }}</span>
        <div class="mods-news-feature-copy">
          <p>{{ spotlightMod.game_name || 'ModVault' }}</p>
          <h2>{{ spotlightMod.title }}</h2>
          <small>{{ featuredReason }}</small>
          <span>
            Read featured mod
            <ArrowRight :size="17" />
          </span>
        </div>
      </RouterLink>

      <aside v-else class="mods-news-feature mods-news-feature-empty">
        <span class="mods-news-feature-tag">Loading</span>
        <div class="mods-news-feature-copy">
          <p>ModVault</p>
          <h2>Curating the latest approved mods</h2>
        </div>
      </aside>
    </section>

    <section class="mods-news-toolbar">
      <div class="mods-news-toolbar-copy">
        <p class="eyebrow">News filters</p>
        <h2>Choose what enters the feed</h2>
        <p>Filter by keyword, game, category, and the signal you care about most.</p>
      </div>

      <SearchBar
        v-model="filters.search"
        v-model:game-id="filters.game"
        v-model:category="filters.category"
        v-model:sort="filters.sort"
        :games="games"
        :categories="categories"
      />
    </section>

    <section class="mods-news-discovery" aria-label="Quick discovery filters">
      <div class="mods-news-discovery-block">
        <div class="mods-news-discovery-head">
          <span><Tags :size="18" /></span>
          <div>
            <p class="eyebrow">Category lanes</p>
            <h2>Jump into a mod type</h2>
          </div>
        </div>

        <div class="mods-news-chip-row">
          <button
            v-for="item in topCategoryList"
            :key="item.name"
            class="mods-news-chip"
            :class="{ active: filters.category === item.name }"
            type="button"
            @click="toggleCategory(item.name)"
          >
            <span>{{ item.name }}</span>
            <small>{{ item.count }}</small>
          </button>
        </div>
      </div>

      <div class="mods-news-discovery-block">
        <div class="mods-news-discovery-head">
          <span><Gamepad2 :size="18" /></span>
          <div>
            <p class="eyebrow">World lanes</p>
            <h2>Browse by game</h2>
          </div>
        </div>

        <div class="mods-news-chip-row">
          <button
            v-for="game in popularGames"
            :key="game.id"
            class="mods-news-chip"
            :class="{ active: String(filters.game) === String(game.id) }"
            type="button"
            @click="toggleGame(game.id)"
          >
            <span>{{ game.name }}</span>
            <small>{{ game.count }}</small>
          </button>
        </div>
      </div>
    </section>

    <section class="mods-filter-strip mods-news-strip">
      <div class="mods-filter-chips">
        <span v-if="activeGameName" class="badge cyan">Game: {{ activeGameName }}</span>
        <span v-if="filters.category" class="badge pink">Category: {{ filters.category }}</span>
        <span v-if="filters.search" class="badge">Keyword: {{ filters.search }}</span>
        <span class="badge">Sort: {{ sortLabel }}</span>
      </div>

      <button class="btn-secondary mods-reset" type="button" :disabled="!hasActiveFilters" @click="resetFilters">
        <RotateCcw :size="17" />
        Reset filters
      </button>
    </section>

    <section class="mods-news-digest">
      <article>
        <span><Newspaper :size="20" /></span>
        <p>Stories</p>
        <h2>{{ visibleMods.length }}</h2>
        <small>Approved mods shown</small>
      </article>

      <article>
        <span><Gamepad2 :size="20" /></span>
        <p>Worlds</p>
        <h2>{{ visibleGameCount }}</h2>
        <small>Games in this feed</small>
      </article>

      <article>
        <span><Tags :size="20" /></span>
        <p>Trending type</p>
        <h2>{{ topCategory }}</h2>
        <small>Most common category</small>
      </article>
    </section>

    <section class="mods-news-heading">
      <div>
        <p class="eyebrow">Latest Articles</p>
        <h2>{{ resultTitle }}</h2>
      </div>

      <span class="badge cyan">{{ resultCountLabel }}</span>
    </section>

    <LoadingSkeleton v-if="loading" :count="8" />
    <template v-else-if="visibleMods.length">
      <TransitionGroup
        name="mod-list"
        tag="div"
        class="mods-news-grid"
        :class="{ 'with-pagination': totalPages > 1 }"
      >
        <article
          v-for="mod in paginatedMods"
          :key="mod.id"
          class="mods-news-card"
        >
          <RouterLink class="mods-news-card-image" :to="`/mods/${mod.id}`">
            <img
              :src="modImage(mod)"
              :alt="`${mod.title} cover image`"
              loading="lazy"
              @error="handleModImageError($event, mod)"
            />
            <span>{{ mod.category || 'Mod' }}</span>
          </RouterLink>

          <div class="mods-news-card-body">
            <div class="mods-news-card-meta">
              <span>{{ mod.game_name || 'Game' }}</span>
              <span><Star :size="13" /> {{ displayRating(mod) }}</span>
              <span><Download :size="13" /> {{ displayDownloadSignal(mod) }}</span>
            </div>

            <RouterLink class="mods-news-card-title" :to="`/mods/${mod.id}`">
              <h3>{{ mod.title }}</h3>
            </RouterLink>

            <p>{{ shortModDescription(mod) }}</p>

            <div class="mods-news-card-byline">
              <span>{{ mod.creator_name || 'Community creator' }}</span>
              <span>{{ formatDate(mod.created_at) }}</span>
            </div>

            <div class="mods-news-card-footer">
              <RouterLink class="mods-news-read" :to="`/mods/${mod.id}`">
                Read more
                <ArrowRight :size="16" />
              </RouterLink>

              <button
                class="mods-news-save"
                type="button"
                aria-label="Save mod to favourites"
                @click="saveFavourite(mod.id)"
              >
                <Heart :size="17" />
              </button>
            </div>
          </div>
        </article>
      </TransitionGroup>

      <nav v-if="totalPages > 1" class="mods-news-pagination" aria-label="Mods result pages">
        <button
          class="mods-news-page-button"
          type="button"
          :disabled="currentPage === 1"
          aria-label="Previous page"
          @click="setPage(currentPage - 1)"
        >
          <ChevronLeft :size="17" />
        </button>

        <button
          v-for="page in pageNumbers"
          :key="page"
          class="mods-news-page-button"
          :class="{ active: page === currentPage }"
          type="button"
          :aria-current="page === currentPage ? 'page' : undefined"
          @click="setPage(page)"
        >
          {{ page }}
        </button>

        <button
          class="mods-news-page-button"
          type="button"
          :disabled="currentPage === totalPages"
          aria-label="Next page"
          @click="setPage(currentPage + 1)"
        >
          <ChevronRight :size="17" />
        </button>

        <span class="mods-news-page-status">Page {{ currentPage }} / {{ totalPages }}</span>
      </nav>
    </template>
    <section v-if="hiddenGuestCount" class="mods-news-guest">
      <div>
        <p class="eyebrow">Preview mode</p>
        <h2>{{ hiddenGuestCount }} more mods unlock after login</h2>
        <p>Create or use an account to save favourites and browse the full approved catalogue.</p>
      </div>

      <RouterLink class="btn" to="/login">
        <Heart :size="17" />
        Login to unlock
      </RouterLink>
    </section>
    <div v-if="!loading && !visibleMods.length && loadError" class="empty">
      {{ loadError }}
    </div>
    <div v-else-if="!loading && !visibleMods.length" class="empty">
      No mods found. Try changing the filters or reset the catalogue view.
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ArrowRight, ChevronLeft, ChevronRight, Download, Gamepad2, Heart, Newspaper, RotateCcw, Search, Star, Tags, UploadCloud } from 'lucide-vue-next'
import api, { getCurrentUser } from '../services/api'
import SearchBar from '../components/SearchBar.vue'
import LoadingSkeleton from '../components/LoadingSkeleton.vue'
import { getGameFallback, resolveModImage } from '../utils/imageResolver'

const route = useRoute()
const user = ref(getCurrentUser())
const games = ref([])
const categories = ref([])
const mods = ref([])
const loading = ref(false)
const loadError = ref('')
const currentPage = ref(1)
const pageSize = 8
const filters = reactive({
  search: '',
  game: route.query.game || '',
  category: '',
  sort: 'latest'
})

const activeGameName = computed(() => {
  return games.value.find((game) => String(game.id) === String(filters.game))?.name || ''
})

const guestPreviewLimit = computed(() => Math.ceil(mods.value.length / 2))

const visibleMods = computed(() => {
  if (user.value) return mods.value
  return mods.value.slice(0, guestPreviewLimit.value)
})

const spotlightMod = computed(() => visibleMods.value[0] || null)

const articleFeedMods = computed(() => {
  if (visibleMods.value.length <= 1) return visibleMods.value
  return visibleMods.value.slice(1)
})

const totalPages = computed(() => {
  return Math.max(1, Math.ceil(articleFeedMods.value.length / pageSize))
})

const pageNumbers = computed(() => {
  return Array.from({ length: totalPages.value }, (_, index) => index + 1)
})

const paginatedMods = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return articleFeedMods.value.slice(start, start + pageSize)
})

const hiddenGuestCount = computed(() => Math.max(mods.value.length - visibleMods.value.length, 0))

const hasActiveFilters = computed(() => {
  return Boolean(filters.search || filters.game || filters.category || filters.sort !== 'latest')
})

const resultTitle = computed(() => {
  if (filters.search) {
    return `Searching "${filters.search}"`
  }

  if (activeGameName.value) {
    return activeGameName.value
  }

  return 'All mods'
})

const visibleGameCount = computed(() => {
  return new Set(visibleMods.value.map((mod) => mod.game_name).filter(Boolean)).size
})

const topCategory = computed(() => {
  if (!visibleMods.value.length) return 'None'

  const counts = visibleMods.value.reduce((items, mod) => {
    const category = mod.category || 'Mod'
    items[category] = (items[category] || 0) + 1
    return items
  }, {})

  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0]
})

const sortLabel = computed(() => {
  const labels = {
    latest: 'Latest',
    popular: 'Most source downloads',
    rating: 'Highest rated',
    title: 'Title A-Z'
  }

  return labels[filters.sort] || 'Latest'
})

const resultCountLabel = computed(() => {
  const shown = visibleMods.value.length
  const plural = shown === 1 ? 'result' : 'results'

  if (!hiddenGuestCount.value) return `${shown} ${plural}`

  return `${shown} of ${mods.value.length} results`
})

const totalSourceDownloads = computed(() => {
  const total = mods.value.reduce((sum, mod) => sum + Number(mod.source_download_count || 0), 0)
  return formatCount(total)
})

const featuredReason = computed(() => {
  if (!spotlightMod.value) return ''

  if (filters.sort === 'popular') {
    return `${displayDownloadSignal(spotlightMod.value)} across its source community`
  }

  if (filters.sort === 'rating') {
    return `${displayRating(spotlightMod.value)} average rating from ModVault reviewers`
  }

  return `Fresh from ${spotlightMod.value.creator_name || 'a ModVault creator'}`
})

const topCategoryList = computed(() => {
  const counts = mods.value.reduce((items, mod) => {
    const category = mod.category || 'Mod'
    items[category] = (items[category] || 0) + 1
    return items
  }, {})

  return Object.entries(counts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
    .slice(0, 8)
})

const popularGames = computed(() => {
  const counts = mods.value.reduce((items, mod) => {
    if (!mod.game_name) return items
    items[mod.game_name] = (items[mod.game_name] || 0) + 1
    return items
  }, {})

  return games.value
    .map((game) => ({
      ...game,
      count: counts[game.name] || 0
    }))
    .filter((game) => game.count > 0)
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
    .slice(0, 8)
})

async function loadGames() {
  games.value = (await api.get('/games')).data
}

async function loadCategories() {
  categories.value = (await api.get('/mods/categories')).data
}

async function loadMods() {
  loading.value = true
  loadError.value = ''

  try {
    const response = await api.get('/mods', { params: filters })
    mods.value = response.data
  } catch (error) {
    console.error(error)
    mods.value = []
    loadError.value = error.response?.data?.message || 'Mods could not be loaded. Please refresh or try another sort.'
  } finally {
    loading.value = false
  }
}

async function saveFavourite(modId) {
  try {
    await api.post('/favourites', { mod_id: modId })
    alert('Saved to favourites')
  } catch (error) {
    alert(error.response?.data?.message || 'Please login first')
  }
}

function modImage(mod) {
  return resolveModImage(mod)
}

function handleModImageError(event, mod) {
  event.target.src = getGameFallback(mod?.game_name)
}

function shortModDescription(mod, limit = 130) {
  const text = mod.description || 'No description available yet. Open the mod page for creator notes and download details.'
  return text.length > limit ? `${text.slice(0, limit).trim()}...` : text
}

function displayRating(mod) {
  const realRating = Number(mod.average_rating || 0)

  if (realRating > 0) {
    return realRating.toFixed(1)
  }

  return 'No ratings'
}

function formatCount(value) {
  const count = Number(value || 0)

  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`
  }

  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`
  }

  return count
}

function displayDownloadSignal(mod) {
  const hasSourceDownloads = mod.source_download_count !== null && mod.source_download_count !== undefined
  const sourceDownloads = Number(mod.source_download_count || 0)

  if (hasSourceDownloads) {
    return `${formatCount(sourceDownloads)} source`
  }

  const realDownloads = Number(mod.download_count || 0)

  if (realDownloads >= 1000) {
    return `${(realDownloads / 1000).toFixed(1)}K clicks`
  }

  return `${realDownloads} clicks`
}

function setPage(page) {
  const nextPage = Math.min(Math.max(page, 1), totalPages.value)

  if (nextPage === currentPage.value) return

  currentPage.value = nextPage

  requestAnimationFrame(() => {
    document.querySelector('.mods-news-heading')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    })
  })
}

function toggleCategory(category) {
  filters.category = filters.category === category ? '' : category
}

function toggleGame(gameId) {
  filters.game = String(filters.game) === String(gameId) ? '' : String(gameId)
}

function resetFilters() {
  filters.search = ''
  filters.game = ''
  filters.category = ''
  filters.sort = 'latest'
}

function formatDate(value) {
  if (!value) return 'Recently published'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return 'Recently published'

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date)
}

function syncUser() {
  user.value = getCurrentUser()
}

watch(filters, () => {
  currentPage.value = 1
  loadMods()
}, { deep: true })

watch(totalPages, (pages) => {
  if (currentPage.value > pages) {
    currentPage.value = pages
  }
})
onMounted(async () => {
  window.addEventListener('session-changed', syncUser)
  await Promise.all([loadGames(), loadCategories()])
  await loadMods()
})
onUnmounted(() => window.removeEventListener('session-changed', syncUser))
</script>
