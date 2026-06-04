<template>
  <LoadingSkeleton v-if="loading" :count="2" />

  <div v-else-if="mod" class="mod-dossier-page">
    <section class="mod-detail-hero mod-dossier-hero">
      <span class="mod-dossier-backdrop" aria-hidden="true">
        <img :src="imageUrl" alt="" @error="handleImageError" />
      </span>

      <article class="mod-detail-panel mod-dossier-intro">
        <p class="eyebrow">Mod dossier</p>
        <h1>{{ mod.title }}</h1>
        <p>{{ mod.description }}</p>

        <div class="mod-detail-tags">
          <span v-for="tag in tagList" :key="tag">
            <Tag :size="14" />
            {{ tag }}
          </span>
          <span v-if="!tagList.length">
            <Tag :size="14" />
            {{ mod.category || 'General' }}
          </span>
        </div>

        <div class="mod-detail-actions">
          <a
            v-if="mod.download_url"
            class="btn"
            :href="mod.download_url"
            target="_blank"
            rel="noopener noreferrer"
            @click="recordDownload"
          >
            <Download :size="18" />
            Download
          </a>

          <button
            v-else
            class="btn-secondary"
            disabled
          >
            <Download :size="18" />
            Link unavailable
          </button>

          <button
            class="btn-secondary"
            @click="saveFavourite()"
          >
            <Heart :size="18" />
            Save Favourite
          </button>
        </div>

        <div class="mod-dossier-command-row" aria-label="Mod dossier quick facts">
          <span>
            <Gamepad2 :size="16" />
            {{ mod.game_name }}
          </span>
          <span>
            <Layers3 :size="16" />
            {{ mod.category || 'Mod' }}
          </span>
          <span>
            <CalendarDays :size="16" />
            {{ formattedDate }}
          </span>
        </div>
      </article>

      <div class="mod-detail-cover mod-dossier-cover">
        <img
          :src="imageUrl"
          :alt="`${mod.title} cover image`"
          @error="handleImageError"
        />
        <span class="mod-detail-cover-shade"></span>

        <div class="mod-detail-cover-meta">
          <span class="badge cyan">
            <Gamepad2 :size="14" />
            {{ mod.game_name }}
          </span>
          <span class="badge pink">
            <Star :size="14" />
            {{ displayRating }}
          </span>
        </div>

        <div class="mod-dossier-cover-footer">
          <small>Creator</small>
          <strong>{{ mod.creator_name || 'Unknown' }}</strong>
          <em>{{ sourceHost || 'ModVault source' }}</em>
        </div>
      </div>
    </section>

    <section class="grid mod-detail-signal-grid">
      <article
        v-for="signal in signalCards"
        :key="signal.label"
        class="mod-detail-signal-card"
        :style="{ '--signal-level': `${signal.level}%` }"
      >
        <span><component :is="signal.icon" :size="20" /></span>
        <p>{{ signal.label }}</p>
        <h2>{{ signal.value }}</h2>
        <small>{{ signal.caption }}</small>
        <i aria-hidden="true"></i>
      </article>
    </section>

    <section class="mod-detail-info-grid">
      <article class="card mod-detail-about-card">
        <div class="card-body">
          <p class="eyebrow">Field notes</p>
          <h2>What this changes in your playthrough</h2>
          <p>{{ mod.description }}</p>

          <div class="mod-detail-info-list">
            <div>
              <span><Gamepad2 :size="18" /></span>
              <strong>{{ mod.game_name }}</strong>
              <small>Game collection</small>
            </div>

            <div>
              <span><Layers3 :size="18" /></span>
              <strong>{{ mod.category || 'Mod' }}</strong>
              <small>Catalogue category</small>
            </div>

            <div>
              <span><CalendarDays :size="18" /></span>
              <strong>{{ formattedDate }}</strong>
              <small>Submitted to ModVault</small>
            </div>
          </div>
        </div>
      </article>

      <article class="card mod-detail-source-card">
        <div class="card-body">
          <p class="eyebrow">Source console</p>
          <h2>{{ sourceHost ? 'External source ready' : 'Download source missing' }}</h2>
          <p>{{ sourceNote }}</p>

          <div class="mod-detail-source-box">
            <span>
              <ExternalLink :size="18" />
            </span>
            <div>
              <strong>{{ sourceHost || 'No source host' }}</strong>
              <small>{{ mod.download_url || 'Creator did not attach a download URL.' }}</small>
            </div>
          </div>
        </div>
      </article>
    </section>

    <section v-if="loadingRelated || relatedMods.length" class="section-title">
      <div>
        <p class="eyebrow">Smart matches</p>
        <h2>Similar mods</h2>
      </div>
    </section>

    <LoadingSkeleton v-if="loadingRelated" :count="4" />

    <div v-else-if="relatedMods.length" class="grid mods-grid">
      <article
        v-for="item in relatedMods"
        :key="item.id"
        class="recommendation-shell"
      >
        <ModCard :mod="item" @favourite="saveFavourite" />

        <div class="recommendation-footer">
          <span class="badge pink">Match score {{ item.recommendation_score }}</span>
          <p>{{ item.recommendation_reason }}</p>
        </div>
      </article>
    </div>

    <section class="section-title">
      <div>
        <p class="eyebrow">Community</p>
        <h2>Reviews</h2>
      </div>
    </section>

    <section class="mod-detail-review-grid">
      <article class="card mod-detail-review-form">
        <div class="card-body">
          <p class="eyebrow">Write feedback</p>
          <h2>Share your take</h2>

          <form class="form-grid" @submit.prevent="submitReview">
            <label class="label">
              Rating
              <select v-model="review.rating" class="select" required>
                <option value="5">5 - Excellent</option>
                <option value="4">4 - Good</option>
                <option value="3">3 - Average</option>
                <option value="2">2 - Poor</option>
                <option value="1">1 - Bad</option>
              </select>
            </label>

            <label class="label">
              Comment
              <textarea
                v-model="review.comment"
                class="textarea mod-detail-review-textarea"
                required
                placeholder="Write what worked, what surprised you, or who this mod is best for..."
              ></textarea>
            </label>

            <button class="btn" type="submit">
              <MessageSquareText :size="18" />
              Submit Review
            </button>
          </form>
        </div>
      </article>

      <article class="card mod-detail-review-list">
        <div class="card-body">
          <div class="mod-detail-review-head">
            <div>
              <p class="eyebrow">Player notes</p>
              <h2>{{ reviews.length }} review{{ reviews.length === 1 ? '' : 's' }}</h2>
            </div>
            <span class="badge pink">
              <Star :size="14" />
              {{ displayRating }}
            </span>
          </div>

          <ReviewCard
            v-for="item in reviews"
            :key="item.id"
            :review="item"
          />

          <p v-if="!reviews.length" class="muted">
            No reviews yet. Be the first to leave a useful note.
          </p>
        </div>
      </article>
    </section>
  </div>

  <section v-else class="empty">
    Mod not found.
  </section>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import {
  CalendarDays,
  Download,
  ExternalLink,
  Gauge,
  Gamepad2,
  Heart,
  Layers3,
  MessageSquareText,
  ShieldCheck,
  Star,
  Tag,
  UserRound
} from 'lucide-vue-next'
import api from '../services/api'
import { resolveModImage, getGameFallback } from '../utils/imageResolver'
import LoadingSkeleton from '../components/LoadingSkeleton.vue'
import ReviewCard from '../components/ReviewCard.vue'
import ModCard from '../components/ModCard.vue'

const route = useRoute()

const mod = ref(null)
const reviews = ref([])
const relatedMods = ref([])
const loading = ref(true)
const loadingRelated = ref(false)

const review = reactive({
  rating: '5',
  comment: ''
})

const imageUrl = computed(() => {
  return mod.value ? resolveModImage(mod.value) : ''
})

const tagList = computed(() => {
  return String(mod.value?.tags || '')
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 6)
})

const displayRating = computed(() => {
  const rating = Number(mod.value?.average_rating || 0)
  return rating > 0 ? rating.toFixed(1) : '0.0'
})

const ratingLevel = computed(() => {
  return Math.min(100, Math.max(8, Number(displayRating.value) * 20))
})

const compactDownloadSignal = computed(() => {
  const hasSourceDownloads = mod.value?.source_download_count !== null && mod.value?.source_download_count !== undefined
  const sourceDownloads = Number(mod.value?.source_download_count || 0)

  if (hasSourceDownloads) return formatCount(sourceDownloads)
  return formatCount(mod.value?.download_count || 0)
})

const downloadSignalCaption = computed(() => {
  const hasSourceDownloads = mod.value?.source_download_count !== null && mod.value?.source_download_count !== undefined
  return hasSourceDownloads ? 'source downloads' : 'ModVault clicks'
})

const downloadLevel = computed(() => {
  const rawCount = Number(mod.value?.source_download_count ?? mod.value?.download_count ?? 0)

  if (rawCount >= 1000000) return 100
  if (rawCount >= 100000) return 84
  if (rawCount >= 10000) return 68
  if (rawCount >= 1000) return 52
  if (rawCount > 0) return 30
  return 10
})

const sourceLevel = computed(() => {
  if (!mod.value?.download_url) return 12
  if (mod.value?.source_download_count !== null && mod.value?.source_download_count !== undefined) return 88
  return 58
})

const signalCards = computed(() => [
  {
    label: 'Community rating',
    value: displayRating.value,
    caption: `${reviews.value.length} review${reviews.value.length === 1 ? '' : 's'}`,
    icon: Star,
    level: ratingLevel.value
  },
  {
    label: 'Download signal',
    value: compactDownloadSignal.value,
    caption: downloadSignalCaption.value,
    icon: Download,
    level: downloadLevel.value
  },
  {
    label: 'Creator',
    value: mod.value?.creator_name || 'Unknown',
    caption: 'Published creator profile',
    icon: UserRound,
    level: mod.value?.creator_name ? 76 : 28
  },
  {
    label: 'Source trust',
    value: sourceHost.value || 'Unavailable',
    caption: sourceHost.value ? sourceNoteShort.value : 'No external link attached',
    icon: sourceHost.value ? ShieldCheck : Gauge,
    level: sourceLevel.value
  }
])

const sourceNote = computed(() => {
  if (mod.value?.source_download_count !== null && mod.value?.source_download_count !== undefined) {
    return 'Showing external source downloads from saved source data, plus ModVault tracks local clicks when users open the download page.'
  }

  return 'External source totals are unavailable, so ModVault tracks local download-link clicks for this listing.'
})

const sourceNoteShort = computed(() => {
  return mod.value?.source_download_count !== null && mod.value?.source_download_count !== undefined
    ? 'External source data available'
    : 'Local click tracking only'
})

const sourceHost = computed(() => {
  if (!mod.value?.download_url) return ''

  try {
    return new URL(mod.value.download_url).hostname.replace(/^www\./, '')
  } catch (error) {
    return ''
  }
})

const formattedDate = computed(() => {
  if (!mod.value?.created_at) return 'Recently'

  return new Date(mod.value.created_at).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
})

function formatCount(value) {
  const count = Number(value || 0)

  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`
  return count
}

async function loadData() {
  loading.value = true

  try {
    const id = route.params.id

    const [modResponse, reviewResponse] = await Promise.all([
      api.get(`/mods/${id}`),
      api.get(`/reviews/mod/${id}`)
    ])

    mod.value = modResponse.data
    reviews.value = reviewResponse.data
    loadRelatedMods(id)
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

async function loadRelatedMods(id) {
  loadingRelated.value = true

  try {
    const response = await api.get(`/recommendations/related/${id}`)
    relatedMods.value = response.data
  } catch (error) {
    console.warn('Related mods could not be loaded:', error)
    relatedMods.value = []
  } finally {
    loadingRelated.value = false
  }
}

async function saveFavourite(modId = route.params.id) {
  try {
    await api.post('/favourites', {
      mod_id: modId
    })

    alert('Saved to favourites')
  } catch (error) {
    alert(error.response?.data?.message || 'Please login first')
  }
}

async function recordDownload() {
  try {
    await api.post(`/downloads/${route.params.id}`)

    setTimeout(() => {
      loadData()
    }, 500)
  } catch (error) {
    console.warn('Download count was not recorded:', error)
  }
}

async function submitReview() {
  try {
    await api.post('/reviews', {
      mod_id: route.params.id,
      rating: Number(review.rating),
      comment: review.comment
    })

    alert('Review submitted successfully.')

    review.comment = ''
    review.rating = '5'

    await loadData()
  } catch (error) {
    alert(error.response?.data?.message || 'Please login first')
  }
}

function handleImageError(event) {
  event.target.src = getGameFallback(mod.value?.game_name)
}

onMounted(loadData)
</script>
