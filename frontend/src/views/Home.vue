<template>
  <section
    ref="giftRevealEl"
    class="home-gift-reveal"
    :style="giftRevealStyle"
    aria-label="Scroll to unlock ModVault"
  >
    <div class="home-gift-sticky" :style="giftStageStyle">
      <div class="gift-reveal-curtain" :style="giftCurtainStyle" aria-hidden="true"></div>
      <div class="gift-reveal-light" :style="giftLightStyle" aria-hidden="true"></div>

      <div class="gift-box-container" aria-hidden="true">
        <div class="gift-box-3d vault-core-3d" :style="giftBoxStyle">
          <div class="gift-box-base">
            <div class="gift-face front"></div>
            <div class="gift-face back"></div>
            <div class="gift-face left"></div>
            <div class="gift-face right"></div>
            <div class="gift-face bottom"></div>
            <div class="gift-inner-floor"></div>
            <div class="gift-base-rim front"></div>
            <div class="gift-base-rim back"></div>
            <div class="gift-base-rim left"></div>
            <div class="gift-base-rim right"></div>
            <div class="gift-gold-trim"></div>
          </div>

          <div class="gift-box-lid" :style="giftLidStyle">
            <div class="gift-face top"></div>
            <div class="gift-face front-lid"></div>
            <div class="gift-face back-lid"></div>
            <div class="gift-face left-lid"></div>
            <div class="gift-face right-lid"></div>
            <div class="gift-lid-trim"></div>
          </div>

          <div class="vault-core-rails" :style="giftRibbonStyle">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <div class="vault-core-lock" :style="giftRibbonStyle">
            <span></span>
          </div>
          <div class="vault-core-glass" :style="giftRibbonStyle"></div>
        </div>
      </div>

      <div class="gift-site-preview" :style="giftSitePreviewStyle" aria-hidden="true">
        <div class="gift-site-preview-top">
          <span></span>
          <span></span>
          <span></span>
        </div>

        <div class="gift-site-preview-body">
          <strong>ModVault</strong>
          <span></span>
          <span></span>
          <em></em>
        </div>
      </div>

      <div class="home-gift-copy" :style="giftCopyStyle">
        <p>Scroll to unlock</p>
        <span aria-hidden="true"></span>
      </div>
    </div>
  </section>

  <section id="about" class="home-showcase home-showcase-after-gift" :style="siteRevealStyle">
    <span class="home-showcase-shade"></span>
    <span class="home-showcase-titlemark" aria-hidden="true">ModVault</span>

    <div class="home-showcase-main">
      <p class="home-intro-pill">Introducing MV</p>
      <h1>Mods for players who want more.</h1>
      <p>
        Explore curated game worlds, discover popular mods, save favourites, write reviews,
        and step into creator tools when you are ready to share your own builds.
      </p>

      <div class="cta-row home-hero-actions">
        <RouterLink class="btn" to="/mods">
          <Search :size="18" />
          Browse Mods
        </RouterLink>
        <RouterLink class="btn-secondary" to="/games">
          <Gamepad2 :size="18" />
          Game Worlds
        </RouterLink>
      </div>
    </div>

    <div class="home-premium-orbit" tabindex="0" aria-label="Interactive ModVault robot showcase">
      <div class="home-orbit-words" aria-hidden="true">
        <span>Browse Mods</span>
        <span>Game Worlds</span>
        <span>Save Favourites</span>
        <span>Write Reviews</span>
        <span>Creator Uploads</span>
        <span>Admin Review</span>
        <span>Trusted Links</span>
        <span>Community Picks</span>
      </div>

      <spline-viewer
        class="home-spline-embed"
        url="https://prod.spline.design/aCDe1NTfkIPn1CXV/scene.splinecode"
        loading-anim-type="spinner-small-dark"
      ></spline-viewer>

      <div class="home-orbit-panel">
        <strong>ModVault</strong>
        <small>interactive Spline scene</small>
      </div>
    </div>
  </section>

  <div class="home-realm-flow">
  <section class="section-title home-game-section-title">
    <div>
      <p class="eyebrow">Choose your realm</p>
      <h2>What's live in game worlds</h2>
    </div>

    <RouterLink class="btn-secondary" to="/games">
      View all games
      <ArrowRight :size="16" />
    </RouterLink>
  </section>

  <LoadingSkeleton v-if="loadingGames" :count="4" />

  <template v-else>
    <section class="home-game-social" aria-label="Featured game worlds">
      <div class="home-game-social-stats" aria-label="Game world highlights">
        <article>
          <span><Gamepad2 :size="18" /></span>
          <p>Featured worlds</p>
          <strong>{{ featuredGames.length }}</strong>
        </article>

        <article>
          <span><Package :size="18" /></span>
          <p>Largest collection</p>
          <strong>{{ topGameLabel }}</strong>
        </article>

        <article>
          <span><Layers3 :size="18" /></span>
          <p>Top category</p>
          <strong>{{ topCategoryLabel }}</strong>
        </article>
      </div>

      <div
        class="home-game-fan"
        :class="{ 'is-spread': gameFanSpread }"
        aria-label="Game cover fan"
        @pointerenter="gameFanSpread = true"
        @pointerleave="resetGameFan"
        @focusin="gameFanSpread = true"
        @focusout="resetGameFan"
      >
      <RouterLink
        v-for="(game, index) in featuredGames"
        :key="game.id"
          class="home-game-fan-card"
          :class="{
            'is-center': index === gameFanCenterIndex,
            'is-hovered': activeGameFanIndex === index,
            'is-dimmed': activeGameFanIndex !== null && activeGameFanIndex !== index
          }"
          :style="gameFanStyle(index, featuredGames.length)"
        :to="`/mods?game=${game.id}`"
          @pointerenter="activeGameFanIndex = index"
          @focus="activeGameFanIndex = index"
      >
        <img
          :src="gameImage(game)"
          :alt="`${game.name} game cover`"
          @error="handleGameImageError($event, game)"
        />

          <span class="home-game-fan-shade"></span>
          <span class="home-game-fan-label">
            <small>{{ game.mod_count || 0 }} mods</small>
            <strong>{{ game.name }}</strong>
            <em>{{ game.description || 'Open this world and browse its approved mods.' }}</em>
          </span>
      </RouterLink>
      </div>
    </section>
  </template>

  <section class="section-title home-mods-section-title">
    <div>
      <p class="eyebrow">Across the realms</p>
      <h2>Popular mods this week</h2>
    </div>

    <RouterLink class="btn-secondary" to="/mods">
      Browse all mods
      <ArrowRight :size="16" />
    </RouterLink>
  </section>

  <LoadingSkeleton v-if="loadingMods" :count="6" />

  <section v-else-if="featuredMods.length" class="home-mods-stream" aria-label="Popular mods stream">
    <div class="home-mods-stream-header">
      <span><Sparkles :size="16" /> community picks</span>
      <span>{{ featuredMods.length }} featured drops</span>
    </div>

    <div class="home-mods-track">
      <RouterLink
        v-for="(mod, index) in modStreamPrimary"
        :key="`primary-${mod.id}-${index}`"
        class="home-mods-stream-card"
        :to="`/mods/${mod.id}`"
      >
        <img
          :src="modImage(mod)"
          :alt="`${mod.title} mod preview`"
          loading="lazy"
          @error="handleModImageError($event, mod)"
        />
        <span class="home-mods-stream-meta">
          <small>{{ mod.game_name || 'Game world' }}</small>
          <strong>{{ mod.title }}</strong>
        </span>
      </RouterLink>
    </div>

    <div class="home-mods-track reverse">
      <RouterLink
        v-for="(mod, index) in modStreamSecondary"
        :key="`secondary-${mod.id}-${index}`"
        class="home-mods-stream-card compact"
        :to="`/mods/${mod.id}`"
      >
        <img
          :src="modImage(mod)"
          :alt="`${mod.title} mod preview`"
          loading="lazy"
          @error="handleModImageError($event, mod)"
        />
        <span class="home-mods-stream-meta">
          <small>{{ mod.category || 'Mod' }}</small>
          <strong>{{ mod.title }}</strong>
        </span>
      </RouterLink>
    </div>
  </section>

  <div v-else class="empty">
    No mods available yet. Login and upload your first mod.
  </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import {
  ArrowRight,
  Gamepad2,
  Layers3,
  Package,
  Search,
  Sparkles
} from 'lucide-vue-next'
import api from '../services/api'
import LoadingSkeleton from '../components/LoadingSkeleton.vue'
import { resolveGameImage, resolveModImage, getGameFallback } from '../utils/imageResolver'

const games = ref([])
const allMods = ref([])
const featuredMods = ref([])
const loadingGames = ref(true)
const loadingMods = ref(true)
const gameFanSpread = ref(false)
const activeGameFanIndex = ref(null)
const giftRevealEl = ref(null)
const giftScrollProgress = ref(0)
let revealObserver = null
let giftFrame = null

function clamp(value, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value))
}

function smoothStep(value) {
  const x = clamp(value)
  return x * x * (3 - 2 * x)
}

const giftBoxStyle = computed(() => {
  const progress = giftScrollProgress.value
  const turn = smoothStep(progress)
  const reveal = smoothStep((progress - 0.38) / 0.62)
  const fade = smoothStep((progress - 0.68) / 0.32)
  const boxRotation = -44 + turn * 156
  const boxScale = 1 - reveal * 0.36
  const lift = reveal * -118
  const pitch = 17 + smoothStep((progress - 0.12) / 0.72) * 9 - reveal * 4

  return {
    transform: `translateY(${lift}px) rotateX(${pitch}deg) rotateY(${boxRotation}deg) rotateZ(${reveal * 8}deg) scale(${boxScale})`,
    opacity: String(1 - fade)
  }
})

const giftLidStyle = computed(() => {
  const progress = giftScrollProgress.value
  const lidProgress = smoothStep((progress - 0.18) / 0.72)
  const lidTransform = lidProgress * 250

  return {
    transform: `translateX(-50%) translateY(-${lidTransform}px) translateZ(${lidProgress * 210}px) rotateX(${lidProgress * 42}deg) rotateY(${-lidProgress * 18}deg) rotateZ(${-lidProgress * 8}deg)`
  }
})

const giftRibbonStyle = computed(() => ({
  opacity: Math.max(0, 1 - smoothStep(giftScrollProgress.value / 0.42) * 1.08)
}))

const giftCopyStyle = computed(() => ({
  opacity: Math.max(0, 1 - smoothStep(giftScrollProgress.value / 0.32)),
  transform: `translate(-50%, ${smoothStep(giftScrollProgress.value) * 28}px)`
}))

const giftSitePreviewStyle = computed(() => {
  const progress = giftScrollProgress.value
  const portal = smoothStep((progress - 0.34) / 0.34)
  const fade = 1 - smoothStep((progress - 0.86) / 0.14)
  const glow = smoothStep((progress - 0.28) / 0.42)

  return {
    opacity: portal * fade,
    transform: `translate(-50%, calc(-50% + ${110 - portal * 150}px)) scale(${0.76 + portal * 0.24}) rotateX(${18 - portal * 18}deg)`,
    filter: `blur(${(1 - portal) * 8}px) brightness(${0.9 + glow * 0.28})`
  }
})

const siteRevealStyle = computed(() => {
  const progress = smoothStep((giftScrollProgress.value - 0.5) / 0.46)

  return {
    opacity: progress,
    transform: `translateY(${(1 - progress) * 96}px) scale(${0.92 + progress * 0.08})`,
    filter: `blur(${(1 - progress) * 16}px) brightness(${0.5 + progress * 0.5}) saturate(${0.7 + progress * 0.3})`
  }
})

const giftLightStyle = computed(() => {
  const progress = giftScrollProgress.value
  const bloom = smoothStep((progress - 0.22) / 0.5)
  const fade = 1 - smoothStep((progress - 0.8) / 0.2)
  const amount = bloom * fade

  return {
    opacity: amount,
    transform: `translate(-50%, -50%) scale(${0.58 + amount * 1.15})`
  }
})

const giftCurtainStyle = computed(() => {
  const progress = smoothStep((giftScrollProgress.value - 0.5) / 0.48)

  return {
    opacity: 1 - progress * 0.94
  }
})

const giftRevealStyle = computed(() => ({
  pointerEvents: 'none'
}))

const giftStageStyle = computed(() => {
  const progress = giftScrollProgress.value
  const fade = smoothStep((progress - 0.82) / 0.18)

  return {
    opacity: String(1 - fade),
    visibility: progress > 0.985 ? 'hidden' : 'visible'
  }
})

const featuredGames = computed(() => {
  return games.value.slice(0, 7)
})

const gameFanCenterIndex = computed(() => {
  return Math.floor(featuredGames.value.length / 2)
})

const topGame = computed(() => {
  return [...games.value].sort((a, b) => Number(b.mod_count || 0) - Number(a.mod_count || 0))[0] || null
})

const topGameLabel = computed(() => topGame.value?.name || 'None')

const topCategories = computed(() => {
  const counts = allMods.value.reduce((items, mod) => {
    const category = mod.category || 'General'
    items[category] = (items[category] || 0) + 1
    return items
  }, {})

  return Object.entries(counts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
})

const topCategoryLabel = computed(() => topCategories.value[0]?.name || 'None')

const modStreamPrimary = computed(() => {
  return [...featuredMods.value, ...featuredMods.value]
})

const modStreamSecondary = computed(() => {
  return [...featuredMods.value].reverse().concat([...featuredMods.value].reverse())
})

function gameImage(game) {
  return resolveGameImage(game)
}

function modImage(mod) {
  return resolveModImage(mod)
}

function gameFanStyle(index, total) {
  const center = (total - 1) / 2
  const offset = index - center
  const distance = Math.abs(offset)

  return {
    '--fan-x': `${offset * 88}px`,
    '--fan-y': `${distance * 22}px`,
    '--fan-x-wide': `${offset * 136}px`,
    '--fan-y-wide': `${distance * 34}px`,
    '--fan-tilt': `${offset * 7.5}deg`,
    '--fan-tilt-wide': `${offset * 11}deg`,
    '--fan-scale': String(1.04 - Math.min(distance * 0.055, 0.22)),
    '--fan-z': String(20 - Math.round(distance * 2))
  }
}

function resetGameFan() {
  gameFanSpread.value = false
  activeGameFanIndex.value = null
}

function handleGameImageError(event, game) {
  event.target.src = getGameFallback(game.name)
}

function handleModImageError(event, mod) {
  event.target.src = getGameFallback(mod.game_name)
}

async function loadGames() {
  loadingGames.value = true

  try {
    const response = await api.get('/games')
    games.value = response.data
  } catch (error) {
    console.error(error)
  } finally {
    loadingGames.value = false
  }
}

async function loadMods() {
  loadingMods.value = true

  try {
    const response = await api.get('/mods', {
      params: {
        sort: 'popular'
      }
    })

    allMods.value = response.data
    featuredMods.value = response.data.slice(0, 6)
  } catch (error) {
    console.error(error)
  } finally {
    loadingMods.value = false
  }
}

function setupHomeReveals() {
  revealObserver?.disconnect()

  const targets = [
    ...document.querySelectorAll('.home-realm-flow > section, .home-realm-flow > div'),
    ...document.querySelectorAll('.home-game-fan-card, .home-mods-stream-card')
  ]

  targets.forEach((target, index) => {
    target.classList.add('home-scroll-reveal')
    target.style.setProperty('--reveal-delay', `${Math.min(index % 8, 6) * 55}ms`)
  })

  revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible')
      }
    })
  }, {
    rootMargin: '0px 0px -12% 0px',
    threshold: 0.12
  })

  targets.forEach((target) => revealObserver.observe(target))
}

function updateGiftProgress() {
  giftFrame = null

  if (!giftRevealEl.value) return

  const rect = giftRevealEl.value.getBoundingClientRect()
  const scrollable = Math.max(1, rect.height - window.innerHeight)
  const progress = Math.min(1, Math.max(0, -rect.top / scrollable))

  giftScrollProgress.value = progress
}

function requestGiftProgressUpdate() {
  if (giftFrame) return
  giftFrame = requestAnimationFrame(updateGiftProgress)
}

onMounted(async () => {
  updateGiftProgress()
  window.addEventListener('scroll', requestGiftProgressUpdate, { passive: true })
  window.addEventListener('resize', requestGiftProgressUpdate)
  await Promise.all([loadGames(), loadMods()])
  requestAnimationFrame(setupHomeReveals)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(giftFrame)
  window.removeEventListener('scroll', requestGiftProgressUpdate)
  window.removeEventListener('resize', requestGiftProgressUpdate)
  revealObserver?.disconnect()
})
</script>
