<template>
  <WorkspaceNav />

  <section class="page-banner review-banner">
    <div>
      <p class="eyebrow">Your activity</p>
      <h1>Review history</h1>
      <p>
        View the ratings and comments you have submitted for different mods.
        Reopen a mod page, track the tone of your feedback, and clear old reviews you no longer want to keep.
      </p>

      <div v-if="isCreator" class="cta-row">
        <RouterLink class="btn" to="/my-mods">
          <FolderKanban :size="18" />
          My Mods
        </RouterLink>

        <RouterLink class="btn-secondary" to="/upload">
          <UploadCloud :size="18" />
          Upload Mod
        </RouterLink>
      </div>
    </div>

    <aside class="review-hero-panel">
      <span class="review-hero-icon">
        <MessageSquareQuote :size="30" />
      </span>
      <p>Feedback log</p>
      <h2>{{ reviews.length }}</h2>
      <small>{{ strongestTone }}</small>
    </aside>
  </section>

  <LoadingSkeleton v-if="loading" :count="4" />

  <template v-else>
    <section class="grid review-summary-grid review-summary-grid-wide">
      <article class="card review-summary-card">
        <div class="card-body">
          <p class="eyebrow">Total reviews</p>
          <h2>{{ reviews.length }}</h2>
          <p class="muted small">Reviews submitted by you</p>
        </div>
      </article>

      <article class="card review-summary-card">
        <div class="card-body">
          <p class="eyebrow">Average rating</p>
          <h2>{{ averageRating }}</h2>
          <p class="muted small">Across all reviewed mods</p>
        </div>
      </article>

      <article class="card review-summary-card">
        <div class="card-body">
          <p class="eyebrow">Highest rating</p>
          <h2>{{ highestRating }}</h2>
          <p class="muted small">Best score given</p>
        </div>
      </article>

      <article class="card review-summary-card">
        <div class="card-body">
          <p class="eyebrow">Main tone</p>
          <h2>{{ strongestTone }}</h2>
          <p class="muted small">How your feedback trends overall</p>
        </div>
      </article>
    </section>

    <section class="review-insight-grid" aria-label="Review insights">
      <article class="card review-momentum-card">
        <div class="card-body">
          <p class="eyebrow">Feedback momentum</p>
          <h2>{{ reviewMomentumLabel }}</h2>
          <p class="muted">{{ isCreator ? 'Creator feedback habits help you judge your own release notes and player comments better.' : 'Your review history helps shape better mod discovery for everyone.' }}</p>

          <div class="review-momentum-meter">
            <span :style="{ width: `${reviewMomentumPercent}%` }"></span>
          </div>
          <small>{{ reviewMomentumPercent }}% feedback rhythm</small>
        </div>
      </article>

      <article class="card review-distribution-card">
        <div class="card-body">
          <p class="eyebrow">Rating spread</p>
          <h2>Feedback mix</h2>

          <div class="review-distribution-list">
            <span
              v-for="item in ratingDistribution"
              :key="item.label"
            >
              <strong>{{ item.value }}</strong>
              {{ item.label }}
            </span>
          </div>
        </div>
      </article>
    </section>

    <section v-if="reviews.length" class="card review-history-toolbar">
      <div class="card-body">
        <div class="review-history-toolbar-head">
          <div>
            <p class="eyebrow">Review snapshot</p>
            <h2>{{ reviews.length }} submitted review{{ reviews.length === 1 ? "" : "s" }}</h2>
          </div>
          <small>{{ averageRating }}/5 average across your feedback</small>
        </div>

        <div class="review-tone-chips">
          <button
            v-for="filter in toneFilters"
            :key="filter.value"
            type="button"
            class="chip"
            :class="{ active: activeTone === filter.value }"
            @click="activeTone = filter.value"
          >
            <Sparkles :size="15" />
            {{ filter.label }}
          </button>
        </div>
      </div>
    </section>

    <section class="section-title">
      <div>
        <p class="eyebrow">Reviews</p>
        <h2>{{ filteredReviews.length }} matching review{{ filteredReviews.length === 1 ? '' : 's' }}</h2>
      </div>

      <RouterLink class="btn-secondary" to="/mods">
        Browse More Mods
      </RouterLink>
    </section>

    <section v-if="filteredReviews.length" class="review-list">
      <article
        v-for="item in filteredReviews"
        :key="item.id"
        class="card review-history-card"
      >
        <div class="card-body">
          <div class="review-history-top">
            <div>
              <div class="mod-meta">
                <span class="badge cyan">{{ item.mod_title }}</span>
                <span class="badge pink">
                  <Star :size="14" />
                  {{ item.rating }}/5
                </span>
                <span class="badge">{{ item.game_name || "Game" }}</span>
              </div>

              <h3>{{ ratingLabel(item.rating) }}</h3>

              <p class="muted small">
                Submitted {{ formatDate(item.created_at) }}
              </p>
            </div>

            <div class="review-score-circle">
              {{ item.rating }}
            </div>
          </div>

          <p class="review-comment-box">
            "{{ item.comment }}"
          </p>

          <div class="review-history-meta">
            <span>
              <MessageSquareQuote :size="15" />
              {{ commentLength(item.comment) }} chars
            </span>
            <span>
              <Sparkles :size="15" />
              {{ ratingTone(item.rating) }}
            </span>
          </div>

          <div class="cta-row">
            <RouterLink
              class="btn-secondary"
              :to="`/mods/${item.mod_id}`"
            >
              <ExternalLink :size="16" />
              Open Mod
            </RouterLink>

            <button
              class="btn-danger"
              @click="deleteReview(item.id)"
            >
              <Trash2 :size="16" />
              Delete Review
            </button>
          </div>
        </div>
      </article>
    </section>

    <section v-else class="empty">
      {{ reviews.length ? 'No reviews match that tone filter.' : 'You have not submitted any reviews yet.' }}
      <div class="cta-row" style="justify-content: center;">
        <RouterLink class="btn" to="/mods">
          Browse Mods
        </RouterLink>
      </div>
    </section>
  </template>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { ExternalLink, FolderKanban, MessageSquareQuote, Sparkles, Star, Trash2, UploadCloud } from 'lucide-vue-next'
import WorkspaceNav from '../components/WorkspaceNav.vue'
import api, { getCurrentUser } from '../services/api'
import LoadingSkeleton from '../components/LoadingSkeleton.vue'

const reviews = ref([])
const loading = ref(true)
const activeTone = ref('all')
const user = getCurrentUser()
const isCreator = user?.role === 'creator'

const toneFilters = [
  { value: 'all', label: 'All tones' },
  { value: 'positive', label: 'Positive' },
  { value: 'balanced', label: 'Balanced' },
  { value: 'critical', label: 'Critical' }
]

const averageRating = computed(() => {
  if (!reviews.value.length) return '0.0'

  const total = reviews.value.reduce((sum, review) => {
    return sum + Number(review.rating || 0)
  }, 0)

  return (total / reviews.value.length).toFixed(1)
})

const highestRating = computed(() => {
  if (!reviews.value.length) return '0/5'

  const highest = Math.max(...reviews.value.map((review) => Number(review.rating || 0)))
  return `${highest}/5`
})

const strongestTone = computed(() => {
  if (!reviews.value.length) return 'No reviews yet'

  const totals = reviews.value.reduce((result, review) => {
    const tone = ratingTone(review.rating)
    result[tone] = (result[tone] || 0) + 1
    return result
  }, {})

  return Object.entries(totals).sort((a, b) => b[1] - a[1])[0][0]
})

const filteredReviews = computed(() => {
  if (activeTone.value === 'all') return reviews.value

  return reviews.value.filter((review) => {
    const value = Number(review.rating || 0)
    if (activeTone.value === 'positive') return value >= 4
    if (activeTone.value === 'balanced') return value === 3
    return value <= 2
  })
})

const reviewMomentumPercent = computed(() => {
  return Math.min(100, reviews.value.length * 18 + Number(averageRating.value) * 8)
})

const reviewMomentumLabel = computed(() => {
  if (!reviews.value.length) return 'No feedback yet'
  if (reviewMomentumPercent.value >= 80) return 'Strong feedback habit'
  if (reviewMomentumPercent.value >= 45) return 'Feedback growing'
  return 'Early feedback trail'
})

const ratingDistribution = computed(() => {
  const positive = reviews.value.filter((review) => Number(review.rating || 0) >= 4).length
  const balanced = reviews.value.filter((review) => Number(review.rating || 0) === 3).length
  const critical = reviews.value.filter((review) => Number(review.rating || 0) <= 2).length

  return [
    { label: 'Positive', value: positive },
    { label: 'Balanced', value: balanced },
    { label: 'Critical', value: critical }
  ]
})

function ratingLabel(rating) {
  const value = Number(rating)

  if (value === 5) return 'Excellent review'
  if (value === 4) return 'Positive review'
  if (value === 3) return 'Average review'
  if (value === 2) return 'Low rating review'
  return 'Critical review'
}

function ratingTone(rating) {
  const value = Number(rating)

  if (value >= 4) return 'Positive leaning'
  if (value === 3) return 'Balanced take'
  return 'Critical leaning'
}

function commentLength(comment) {
  return String(comment || '').trim().length
}

function formatDate(value) {
  if (!value) return 'recently'

  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

async function loadReviews() {
  loading.value = true

  try {
    const response = await api.get('/reviews/me')
    reviews.value = response.data
  } catch (error) {
    alert(error.response?.data?.message || 'Failed to load review history')
  } finally {
    loading.value = false
  }
}

async function deleteReview(id) {
  if (!confirm('Delete this review?')) return

  try {
    await api.delete(`/reviews/${id}`)
    await loadReviews()
  } catch (error) {
    alert(error.response?.data?.message || 'Failed to delete review')
  }
}

onMounted(loadReviews)
</script>
