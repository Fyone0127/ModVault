<template>
  <WorkspaceNav mode="creator" />

  <section class="page-banner creator-banner mymods-hero">
    <div>
      <p class="eyebrow">Creator workspace</p>
      <h1>My uploaded mods</h1>
      <p>
        Track every submission from first upload to final approval. Use this workspace to see what is live,
        what is waiting on review, and what needs revision before your next release push.
      </p>

      <div class="cta-row">
        <RouterLink class="btn" to="/upload">
          <UploadCloud :size="18" />
          Upload New Mod
        </RouterLink>

        <RouterLink class="btn-secondary" to="/dashboard">
          <LayoutDashboard :size="18" />
          Back to Dashboard
        </RouterLink>
      </div>
    </div>

    <aside class="mymods-hero-panel">
      <span class="mymods-hero-icon">
        <FolderKanban :size="30" />
      </span>
      <p>Release tracker</p>
      <h2>{{ statusCounts.all }}</h2>
      <small>{{ heroPanelText }}</small>
    </aside>
  </section>

  <LoadingSkeleton v-if="loading" :count="4" />

  <template v-else>
    <section class="grid creator-mod-summary-grid">
      <article class="creator-mod-summary">
        <p class="eyebrow">All uploads</p>
        <h2>{{ statusCounts.all }}</h2>
        <span>Total submissions</span>
      </article>

      <article class="creator-mod-summary status-approved">
        <p class="eyebrow">Approved</p>
        <h2>{{ statusCounts.approved }}</h2>
        <span>Visible to users</span>
      </article>

      <article class="creator-mod-summary status-pending">
        <p class="eyebrow">Pending</p>
        <h2>{{ statusCounts.pending }}</h2>
        <span>Waiting review</span>
      </article>

      <article class="creator-mod-summary status-rejected">
        <p class="eyebrow">Rejected</p>
        <h2>{{ statusCounts.rejected }}</h2>
        <span>Needs revision</span>
      </article>
    </section>

    <section v-if="mods.length" class="creator-release-insights" aria-label="Release insights">
      <article class="card creator-release-health-card">
        <div class="card-body">
          <p class="eyebrow">Release health</p>
          <h2>{{ releaseHealthLabel }}</h2>
          <p class="muted">{{ releaseHealthText }}</p>

          <div class="creator-release-meter">
            <span :style="{ width: `${releaseHealthPercent}%` }"></span>
          </div>
          <small>{{ releaseHealthPercent }}% approval momentum</small>
        </div>
      </article>

      <article class="card creator-release-pipeline-card">
        <div class="card-body">
          <p class="eyebrow">Pipeline</p>
          <h2>Release stages</h2>

          <div class="creator-release-pipeline">
            <span
              v-for="step in releasePipeline"
              :key="step.label"
              :class="step.className"
            >
              <strong>{{ step.value }}</strong>
              {{ step.label }}
            </span>
          </div>
        </div>
      </article>
    </section>

    <section v-if="mods.length" class="card mymods-toolbar-card">
      <div class="card-body">
        <div class="mymods-toolbar-head">
          <div>
            <p class="eyebrow">Release snapshot</p>
            <h2>{{ filteredMods.length }} mod{{ filteredMods.length === 1 ? '' : 's' }}</h2>
          </div>
          <small>{{ toolbarText }}</small>
        </div>

        <section class="creator-status-toolbar mymods-toolbar">
          <button
            v-for="option in statusFilters"
            :key="option.value"
            type="button"
            class="chip"
            :class="{ active: activeStatus === option.value }"
            @click="activeStatus = option.value"
          >
            {{ option.label }}
          </button>

          <label class="mymods-search" aria-label="Search your uploaded mods">
            <Search :size="16" />
            <input
              v-model.trim="searchTerm"
              type="search"
              placeholder="Search releases..."
            />
          </label>
        </section>
      </div>
    </section>

    <div v-if="filteredMods.length" class="grid mods-grid">
      <article
        v-for="mod in filteredMods"
        :key="mod.id"
        class="card mod-card creator-release-card"
      >
        <RouterLink class="mod-image-wrap" :to="`/mods/${mod.id}`">
          <img
            class="mod-cover"
            :src="image(mod)"
            :alt="`${mod.title} cover`"
            loading="lazy"
            @error="handleImageError($event, mod)"
          />

          <span class="mod-gradient"></span>
          <span
            class="badge mod-category-pill"
            :class="statusClass(mod.status)"
          >
            {{ readableStatus(mod.status) }}
          </span>
        </RouterLink>

        <div class="card-body">
          <div class="mod-meta">
            <span class="badge cyan">{{ mod.game_name }}</span>
            <span class="badge">{{ mod.category }}</span>
          </div>

          <h3>{{ mod.title }}</h3>

          <p>{{ mod.description }}</p>

          <div class="creator-release-note" :class="statusClass(mod.status)">
            <strong>{{ statusHeadline(mod.status) }}</strong>
            <span>{{ statusDescription(mod) }}</span>
          </div>

          <div class="creator-release-footer">
            <small>
              <CalendarDays :size="14" />
              Uploaded {{ formatDate(mod.created_at) }}
            </small>

            <small v-if="mod.reviewed_at">
              <ShieldCheck :size="14" />
              Reviewed {{ formatDate(mod.reviewed_at) }}
            </small>
          </div>

          <div class="cta-row">
            <RouterLink
              v-if="mod.status === 'approved'"
              class="btn-secondary"
              :to="`/mods/${mod.id}`"
            >
              <ExternalLink :size="16" />
              View Public Page
            </RouterLink>

            <button class="btn-danger" @click="remove(mod.id)">
              <Trash2 :size="16" />
              Delete
            </button>
          </div>
        </div>
      </article>
    </div>

    <div v-else class="empty">
      {{ emptyMessage }}
    </div>
  </template>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import {
  CalendarDays,
  ExternalLink,
  FolderKanban,
  LayoutDashboard,
  Search,
  ShieldCheck,
  Star,
  Trash2,
  UploadCloud
} from 'lucide-vue-next'
import WorkspaceNav from '../components/WorkspaceNav.vue'
import api from '../services/api'
import LoadingSkeleton from '../components/LoadingSkeleton.vue'
import { resolveModImage, getGameFallback } from '../utils/imageResolver'

const mods = ref([])
const loading = ref(true)
const activeStatus = ref('all')
const searchTerm = ref('')

const statusFilters = [
  { value: 'all', label: 'All' },
  { value: 'approved', label: 'Approved' },
  { value: 'pending', label: 'Pending' },
  { value: 'rejected', label: 'Rejected' }
]

const statusCounts = computed(() => {
  return mods.value.reduce(
    (counts, mod) => {
      const status = mod.status || 'pending'
      counts.all += 1
      counts[status] = (counts[status] || 0) + 1
      return counts
    },
    {
      all: 0,
      approved: 0,
      pending: 0,
      rejected: 0
    }
  )
})

const filteredMods = computed(() => {
  const query = searchTerm.value.toLowerCase()

  return mods.value.filter((mod) => {
    const matchesStatus = activeStatus.value === 'all' || mod.status === activeStatus.value
    const haystack = [mod.title, mod.game_name, mod.category, mod.description, mod.tags]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    return matchesStatus && (!query || haystack.includes(query))
  })
})

const emptyMessage = computed(() => {
  if (!mods.value.length) return 'You have not uploaded any mods yet.'
  if (searchTerm.value) return `No releases match "${searchTerm.value}".`
  return `No ${activeStatus.value} mods found.`
})

const heroPanelText = computed(() => {
  if (!mods.value.length) return 'Ready for your first release'
  if (statusCounts.value.pending) return `${statusCounts.value.pending} waiting on admin review`
  if (statusCounts.value.rejected) return `${statusCounts.value.rejected} need another pass`
  return 'Everything currently looks published'
})

const toolbarText = computed(() => {
  if (searchTerm.value) return `Searching "${searchTerm.value}"`
  if (activeStatus.value === 'all') return 'Showing your full release list'
  return `Showing ${activeStatus.value} submissions only`
})

const releaseHealthPercent = computed(() => {
  if (!statusCounts.value.all) return 0
  return Math.round((statusCounts.value.approved / statusCounts.value.all) * 100)
})

const releaseHealthLabel = computed(() => {
  if (!statusCounts.value.all) return 'No releases yet'
  if (releaseHealthPercent.value >= 80) return 'Strong catalogue'
  if (releaseHealthPercent.value >= 45) return 'Building momentum'
  if (statusCounts.value.pending) return 'Review in progress'
  return 'Needs a tune-up'
})

const releaseHealthText = computed(() => {
  if (!statusCounts.value.all) return 'Upload your first mod to start building release history.'
  if (statusCounts.value.rejected) return `${statusCounts.value.rejected} upload${statusCounts.value.rejected === 1 ? '' : 's'} need revision before they can go public.`
  if (statusCounts.value.pending) return `${statusCounts.value.pending} upload${statusCounts.value.pending === 1 ? '' : 's'} are waiting for admin review.`
  return 'Everything in your current release tracker is approved.'
})

const releasePipeline = computed(() => [
  { label: 'Uploaded', value: statusCounts.value.all, className: 'pipeline-all' },
  { label: 'Pending', value: statusCounts.value.pending, className: 'pipeline-pending' },
  { label: 'Approved', value: statusCounts.value.approved, className: 'pipeline-approved' },
  { label: 'Rejected', value: statusCounts.value.rejected, className: 'pipeline-rejected' }
])

function image(mod) {
  return resolveModImage(mod)
}

function handleImageError(event, mod) {
  event.target.src = getGameFallback(mod.game_name)
}

function readableStatus(status) {
  if (status === 'approved') return 'Approved'
  if (status === 'rejected') return 'Rejected'
  return 'Pending'
}

function statusClass(status) {
  if (status === 'approved') return 'status-approved'
  if (status === 'rejected') return 'status-rejected'
  return 'status-pending'
}

function statusHeadline(status) {
  if (status === 'approved') return 'Published to catalogue'
  if (status === 'rejected') return 'Needs revision before publish'
  return 'Waiting for admin approval'
}

function statusDescription(mod) {
  if (mod.status === 'approved') return 'This mod is visible to users and can be opened from the public page.'
  if (mod.status === 'rejected') return mod.rejection_reason || 'No rejection reason was provided yet.'
  return 'This upload is still private until the admin team reviews it.'
}

function formatDate(value) {
  if (!value) return 'recently'

  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

async function load() {
  loading.value = true

  try {
    mods.value = (await api.get('/mods/me')).data
  } catch (error) {
    alert(error.response?.data?.message || 'Failed to load your mods')
  } finally {
    loading.value = false
  }
}

async function remove(id) {
  if (!confirm('Delete this mod?')) return

  try {
    await api.delete(`/mods/${id}`)
    await load()
  } catch (error) {
    alert(error.response?.data?.message || 'Failed to delete mod')
  }
}

onMounted(load)
</script>
