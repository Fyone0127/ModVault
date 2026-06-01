<template>
  <section class="games-design-page">
    <section class="games-cinematic-hero">
      <div class="games-hero-chrome games-hero-chrome-left">
        <span>ModVault</span>
        <strong>Game Select</strong>
      </div>

      <div class="games-hero-chrome games-hero-chrome-right">
        <span>LVLL</span>
        <strong>002</strong>
      </div>

      <div class="games-cinematic-bg" aria-hidden="true">
        <article
          v-for="(game, index) in heroGameStack"
          :key="`${game.name}-${index}`"
          class="games-cinematic-cover"
          :style="{ '--cover-index': index }"
        >
          <img
            :src="game.image || gameImage(game)"
            :alt="`${game.name} cover`"
            loading="lazy"
            @error="handleImageError($event, game)"
          />
        </article>
      </div>

      <div class="games-cinematic-title">
        <span>Choose your</span>
        <h1>Games</h1>
      </div>

      <div class="games-hero-footer">
        <span>{{ games.length || heroGameStack.length }} worlds</span>
        <span>{{ totalMods }} approved mods</span>
        <RouterLink v-if="isAdmin" to="/admin/games/new">
          <PlusCircle :size="16" />
          Add Game
        </RouterLink>
      </div>
    </section>

    <section class="games-editorial-panel">
      <aside class="games-editorial-level">
        <span>LVLL</span>
        <strong>002</strong>
      </aside>

      <div class="games-editorial-copy">
        <p class="eyebrow">Browse by game</p>
        <h2>Select a modding universe.</h2>
        <p>
          Explore game worlds across RPGs, sandbox builders, life sims, and colony management,
          then jump straight into each approved mod catalogue.
        </p>
      </div>

      <section class="games-editorial-stats">
        <article>
          <span><Gamepad2 :size="20" /></span>
          <p>Game collections</p>
          <strong>{{ games.length }}</strong>
          <small>Public worlds to browse</small>
        </article>

        <article>
          <span><Package :size="20" /></span>
          <p>Total approved mods</p>
          <strong>{{ totalMods }}</strong>
          <small>Visible across all games</small>
        </article>

        <article>
          <span><TrendingUp :size="20" /></span>
          <p>Largest collection</p>
          <strong>{{ topGameLabel }}</strong>
          <small>{{ topGameCount }} mods available</small>
        </article>
      </section>
    </section>

    <LoadingSkeleton v-if="loading" :count="8" />

    <template v-else>
      <section class="games-level-index">
        <aside class="games-level-side">
          <p>Game archive</p>
          <strong>{{ games.length }} level{{ games.length === 1 ? '' : 's' }}</strong>
          <span>{{ totalMods }} mods indexed</span>
        </aside>

        <div v-if="games.length" class="games-level-list">
          <RouterLink
            v-for="(game, index) in games"
            :key="game.id"
            class="games-level-row"
            :to="`/mods?game=${game.id}`"
          >
            <span class="games-level-number">
              {{ String(index + 1).padStart(2, '0') }}
            </span>

            <span class="games-level-thumb">
              <img
                :src="gameImage(game)"
                :alt="`${game.name} category cover`"
                loading="lazy"
                @error="handleImageError($event, game)"
              />
            </span>

            <span class="games-level-copy">
              <small>LVLL {{ String(index + 1).padStart(3, '0') }}</small>
              <strong>{{ game.name }}</strong>
              <em>{{ game.description || 'A ModVault collection ready for approved mods.' }}</em>
            </span>

            <span class="games-level-signal">
              <strong>{{ game.mod_count }}</strong>
              <small>mods</small>
            </span>

            <span class="games-level-arrow">
              <ArrowUpRight :size="22" />
            </span>
          </RouterLink>
        </div>

        <div v-else class="empty">
          No games are available yet.
        </div>
      </section>
    </template>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { ArrowUpRight, Gamepad2, Package, PlusCircle, TrendingUp } from 'lucide-vue-next'
import api, { getCurrentUser } from '../services/api'
import LoadingSkeleton from '../components/LoadingSkeleton.vue'
import { resolveGameImage, getGameFallback } from '../utils/imageResolver'

const games = ref([])
const loading = ref(true)
const user = getCurrentUser()
const isAdmin = computed(() => user?.role === 'admin')

const totalMods = computed(() => {
  return games.value.reduce((sum, game) => sum + Number(game.mod_count || 0), 0)
})

const topGame = computed(() => {
  return [...games.value].sort((a, b) => Number(b.mod_count || 0) - Number(a.mod_count || 0))[0] || null
})

const topGameLabel = computed(() => topGame.value?.name || 'Awaiting data')
const topGameCount = computed(() => Number(topGame.value?.mod_count || 0))

const fallbackHeroGames = [
  { name: 'Baldur\'s Gate 3', image: '/images/games/baldurgate3.jpg' },
  { name: 'Minecraft', image: '/images/games/minecraft.jpg' },
  { name: 'Skyrim', image: '/images/games/skyrim.jpg' },
  { name: 'Fallout 4', image: '/images/games/fallout4.jpg' },
  { name: 'Stardew Valley', image: '/images/games/stardew-valley.png' }
]

const heroGameStack = computed(() => {
  const sortedGames = [...games.value]
    .sort((a, b) => Number(b.mod_count || 0) - Number(a.mod_count || 0))
    .slice(0, 5)

  return sortedGames.length ? sortedGames : fallbackHeroGames
})

function gameImage(game) {
  return resolveGameImage(game)
}

function handleImageError(event, game) {
  event.target.src = getGameFallback(game.name)
}

onMounted(async () => {
  try {
    const response = await api.get('/games')
    games.value = response.data
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
})
</script>
