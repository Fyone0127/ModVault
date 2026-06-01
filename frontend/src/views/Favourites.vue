<template>
  <WorkspaceNav />

  <section class="page-banner favourites-hero">
    <div>
      <p class="eyebrow">Saved collection</p>
      <h1>My favourites</h1>
      <p>Your saved mods stay in one visual vault so you can revisit standout finds, compare game collections, and jump back into good downloads fast.</p>

      <div class="cta-row">
        <RouterLink class="btn" to="/mods">
          <Search :size="18" />
          Browse More
        </RouterLink>
      </div>
    </div>

    <aside class="favourites-hero-panel">
      <span class="favourites-hero-icon">
        <Heart :size="30" />
      </span>
      <p>Collection</p>
      <h2>{{ mods.length }}</h2>
      <small>{{ activeGame ? activeGame : 'All saved mods' }}</small>
    </aside>
  </section>

  <LoadingSkeleton v-if="loading" :count="4" />

  <template v-else>
    <section v-if="mods.length" class="grid saved-summary-grid">
      <article class="saved-summary-card">
        <p class="eyebrow">Saved mods</p>
        <h2>{{ mods.length }}</h2>
        <span>In your vault</span>
      </article>

      <article class="saved-summary-card">
        <p class="eyebrow">Games covered</p>
        <h2>{{ savedGames.length }}</h2>
        <span>Across favourites</span>
      </article>

      <article class="saved-summary-card">
        <p class="eyebrow">Top category</p>
        <h2>{{ topCategory }}</h2>
        <span>Most saved type</span>
      </article>
    </section>

    <section v-if="mods.length" class="card favourites-toolbar-card">
      <div class="card-body">
        <div class="favourites-toolbar-head">
          <div>
            <p class="eyebrow">Filter collection</p>
            <h2>{{ filteredMods.length }} saved mod{{ filteredMods.length === 1 ? '' : 's' }}</h2>
          </div>
          <small>{{ activeGame ? `Showing ${activeGame}` : 'Showing every saved world' }}</small>
        </div>

        <section v-if="savedGames.length" class="creator-status-toolbar favourites-toolbar">
          <button
            type="button"
            class="chip"
            :class="{ active: activeGame === '' }"
            @click="activeGame = ''"
          >
            All games
          </button>

          <button
            v-for="game in savedGames"
            :key="game"
            type="button"
            class="chip"
            :class="{ active: activeGame === game }"
            @click="activeGame = game"
          >
            {{ game }}
          </button>
        </section>
      </div>
    </section>

    <section v-if="mods.length" class="favourites-collection-shell">
      <div class="favourites-results-area">
        <div v-if="filteredMods.length" class="grid mods-grid favourites-grid">
          <article v-for="mod in filteredMods" :key="mod.id" class="card mod-card favourite-mod-card">
            <RouterLink class="mod-image-wrap" :to="`/mods/${mod.id}`">
              <img class="mod-cover" :src="image(mod)" :alt="`${mod.title} cover`" loading="lazy" />
              <span class="mod-gradient"></span>
              <span class="badge mod-category-pill">{{ mod.category || 'Saved' }}</span>
            </RouterLink>
            <div class="card-body">
              <div class="mod-meta">
                <span class="badge cyan">{{ mod.game_name }}</span>
                <span class="badge">
                  <Star :size="14" />
                  Saved pick
                </span>
              </div>
              <h3>{{ mod.title }}</h3>
              <p>{{ mod.description }}</p>
              <div class="favourite-card-footer">
                <small>
                  <Tag :size="14" />
                  {{ mod.category || 'General mod' }}
                </small>
              </div>
              <div class="cta-row">
                <RouterLink class="btn-secondary" :to="`/mods/${mod.id}`">
                  <ExternalLink :size="16" />
                  Open
                </RouterLink>
                <button class="btn-danger" @click="remove(mod.id)">
                  <Trash2 :size="16" />
                  Remove
                </button>
              </div>
            </div>
          </article>
        </div>

        <div v-else class="empty favourites-empty">
          No saved mods match this game.
        </div>
      </div>

      <aside class="card favourites-vault-card">
        <div class="card-body">
          <p class="eyebrow">Vault pulse</p>
          <h2>{{ activeGame || 'All saved worlds' }}</h2>
          <p>{{ collectionNote }}</p>

          <div class="favourites-vault-stats">
            <span>
              <strong>{{ filteredMods.length }}</strong>
              Visible
            </span>
            <span>
              <strong>{{ savedGames.length }}</strong>
              Games
            </span>
          </div>

          <div v-if="categoryBreakdown.length" class="favourites-category-stack">
            <small v-for="item in categoryBreakdown" :key="item.label">
              <span>{{ item.label }}</span>
              <b>{{ item.count }}</b>
            </small>
          </div>
        </div>
      </aside>
    </section>

    <div v-else class="empty favourites-empty">
      You have not saved any mods yet.
    </div>
  </template>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { ExternalLink, Heart, Search, Star, Tag, Trash2 } from 'lucide-vue-next'
import WorkspaceNav from '../components/WorkspaceNav.vue'
import api from '../services/api'
import { resolveModImage } from '../utils/imageResolver'
import LoadingSkeleton from '../components/LoadingSkeleton.vue'

const mods = ref([])
const loading = ref(true)
const activeGame = ref('')
const image = (mod) => resolveModImage(mod)

const savedGames = computed(() => {
  return [...new Set(mods.value.map((mod) => mod.game_name).filter(Boolean))]
})

const filteredMods = computed(() => {
  if (!activeGame.value) return mods.value
  return mods.value.filter((mod) => mod.game_name === activeGame.value)
})

const topCategory = computed(() => {
  if (!mods.value.length) return 'None'

  const counts = mods.value.reduce((items, mod) => {
    const category = mod.category || 'Mod'
    items[category] = (items[category] || 0) + 1
    return items
  }, {})

  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0]
})

const categoryBreakdown = computed(() => {
  const counts = filteredMods.value.reduce((items, mod) => {
    const category = mod.category || 'General'
    items[category] = (items[category] || 0) + 1
    return items
  }, {})

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([label, count]) => ({ label, count }))
})

const collectionNote = computed(() => {
  if (activeGame.value) {
    return `${filteredMods.value.length} saved pick${filteredMods.value.length === 1 ? '' : 's'} from this game collection.`
  }

  return `${mods.value.length} saved mod${mods.value.length === 1 ? '' : 's'} across ${savedGames.value.length} game collection${savedGames.value.length === 1 ? '' : 's'}.`
})

async function load() {
  loading.value = true

  try {
    mods.value = (await api.get('/favourites')).data
  } finally {
    loading.value = false
  }
}

async function remove(modId) {
  await api.delete(`/favourites/${modId}`)
  await load()
}

onMounted(() => {
  load()
})
</script>
