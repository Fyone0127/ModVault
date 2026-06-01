<template>
  <WorkspaceNav mode="admin" />

  <section class="page-banner admin-banner approvals-hero">
    <div>
      <p class="eyebrow">Admin moderation</p>
      <h1>Pending mod approvals</h1>
      <p>
        Review creator submissions before they go live. Use this queue to verify source links,
        spot weak descriptions, and keep the public ModVault catalogue clean and trustworthy.
      </p>

      <div class="cta-row">
        <RouterLink class="btn-secondary" to="/dashboard">
          <LayoutDashboard :size="18" />
          Back to Dashboard
        </RouterLink>

        <RouterLink class="btn-secondary" to="/mods">
          <ExternalLink :size="18" />
          View Published Mods
        </RouterLink>
      </div>
    </div>

    <aside class="approvals-hero-panel">
      <span class="approvals-hero-icon">
        <ShieldCheck :size="30" />
      </span>
      <p>Moderation queue</p>
      <h2>{{ queueStats.total }}</h2>
      <small>{{ heroQueueText }}</small>
    </aside>
  </section>

  <section v-if="!isAdmin" class="empty">
    Admin access required. Please login using an admin account.
  </section>

  <template v-else>
    <section class="grid admin-queue-summary-grid">
      <article class="admin-queue-summary">
        <p class="eyebrow">Queue size</p>
        <h2>{{ queueStats.total }}</h2>
        <span>Pending mods</span>
      </article>

      <article class="admin-queue-summary">
        <p class="eyebrow">Creators</p>
        <h2>{{ queueStats.creators }}</h2>
        <span>Waiting for review</span>
      </article>

      <article class="admin-queue-summary">
        <p class="eyebrow">Source links</p>
        <h2>{{ queueStats.sourceLinks }}</h2>
        <span>Ready to verify</span>
      </article>

      <article class="admin-queue-summary">
        <p class="eyebrow">Oldest item</p>
        <h2>{{ queueStats.oldest }}</h2>
        <span>Queue age</span>
      </article>
    </section>

    <section class="card approvals-toolbar-card">
      <div class="card-body">
        <div class="approvals-toolbar-head">
          <div>
            <p class="eyebrow">Review queue</p>
            <h2>{{ mods.length }} pending mod{{ mods.length === 1 ? '' : 's' }}</h2>
          </div>

          <small>{{ queueStats.sourceLinks }} with download sources, {{ queueStats.creators }} creator{{ queueStats.creators === 1 ? '' : 's' }} involved</small>
        </div>

        <div class="cta-row approvals-toolbar-actions">
          <button class="btn-secondary" @click="loadPendingMods">
            <RefreshCw :size="16" />
            Refresh
          </button>
        </div>
      </div>
    </section>

    <LoadingSkeleton v-if="loading" :count="4" />

    <div v-else-if="mods.length" class="grid mods-grid">
      <article
        v-for="mod in mods"
        :key="mod.id"
        class="card mod-card approval-card"
      >
        <div class="mod-image-wrap">
          <img
            class="mod-cover"
            :src="resolveModImage(mod)"
            :alt="`${mod.title} cover image`"
            @error="handleImageError($event, mod)"
          />

          <span class="mod-gradient"></span>
          <span class="badge mod-category-pill status-pending">Pending</span>
        </div>

        <div class="card-body">
          <div class="mod-meta">
            <span class="badge cyan">{{ mod.game_name }}</span>
            <span class="badge">{{ mod.category }}</span>
          </div>

          <h3>{{ mod.title }}</h3>

          <p class="small">
            {{ mod.description }}
          </p>

          <div class="approval-meta-list">
            <small>
              <UserRound :size="14" />
              {{ mod.creator_name || 'Unknown creator' }}
            </small>

            <small>
              <CalendarDays :size="14" />
              Submitted {{ formatDate(mod.created_at) }}
            </small>

            <small v-if="mod.download_url">
              <Link2 :size="14" />
              Source ready
            </small>
          </div>

          <div class="approval-review-note">
            <strong>{{ reviewHeadline(mod) }}</strong>
            <span>{{ reviewDescription(mod) }}</span>
          </div>

          <div v-if="mod.download_url" class="approval-source-link">
            <a
              :href="mod.download_url"
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink :size="15" />
              View download page
            </a>
          </div>

          <div class="cta-row">
            <button class="btn" @click="approve(mod.id)">
              <BadgeCheck :size="16" />
              Approve & Publish
            </button>

            <button class="btn-danger" @click="reject(mod.id)">
              <XCircle :size="16" />
              Reject
            </button>
          </div>
        </div>
      </article>
    </div>

    <div v-else class="empty">
      No pending mods waiting for approval.
    </div>
  </template>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import {
  BadgeCheck,
  CalendarDays,
  ExternalLink,
  LayoutDashboard,
  Link2,
  RefreshCw,
  ShieldCheck,
  UserRound,
  XCircle
} from 'lucide-vue-next'
import api, { getCurrentUser } from '../services/api'
import LoadingSkeleton from '../components/LoadingSkeleton.vue'
import WorkspaceNav from '../components/WorkspaceNav.vue'
import { resolveModImage, getGameFallback } from '../utils/imageResolver'

const user = getCurrentUser()
const mods = ref([])
const loading = ref(true)

const isAdmin = computed(() => {
  return user?.role === 'admin'
})

const queueStats = computed(() => {
  const creators = new Set(mods.value.map((mod) => mod.creator_name).filter(Boolean))
  const sourceLinks = mods.value.filter((mod) => mod.download_url).length
  const oldestDate = mods.value
    .map((mod) => new Date(mod.created_at))
    .filter((date) => !Number.isNaN(date.getTime()))
    .sort((a, b) => a - b)[0]

  return {
    total: mods.value.length,
    creators: creators.size,
    sourceLinks,
    oldest: oldestDate ? queueAge(oldestDate) : '0d'
  }
})

const heroQueueText = computed(() => {
  if (!mods.value.length) return 'No items waiting right now'
  if (queueStats.value.sourceLinks === mods.value.length) return 'Every item has a source link ready to verify'
  return `${queueStats.value.total - queueStats.value.sourceLinks} item${queueStats.value.total - queueStats.value.sourceLinks === 1 ? '' : 's'} still need closer checking`
})

function queueAge(date) {
  const diff = Date.now() - date.getTime()
  const days = Math.max(0, Math.floor(diff / 86400000))
  return `${days}d`
}

function formatDate(value) {
  if (!value) return 'recently'

  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

function reviewHeadline(mod) {
  if (mod.download_url) return 'Ready for source verification'
  return 'Needs a closer content check'
}

function reviewDescription(mod) {
  if (mod.download_url) {
    return 'Open the download page, confirm the listing looks trustworthy, then decide whether it belongs in the public catalogue.'
  }

  return 'This submission has no source link attached, so check the description and structure carefully before publishing.'
}

async function loadPendingMods() {
  if (!isAdmin.value) {
    loading.value = false
    return
  }

  loading.value = true

  try {
    const response = await api.get('/admin/mods/pending')
    mods.value = response.data
  } catch (error) {
    alert(error.response?.data?.message || 'Failed to load pending mods')
  } finally {
    loading.value = false
  }
}

async function approve(id) {
  const confirmApprove = confirm('Approve and publish this mod?')

  if (!confirmApprove) return

  try {
    await api.patch(`/admin/mods/${id}/approve`)
    alert('Mod approved and published.')
    await loadPendingMods()
  } catch (error) {
    alert(error.response?.data?.message || 'Failed to approve mod')
  }
}

async function reject(id) {
  const reason = prompt('Reason for rejection?')

  if (reason === null) return

  try {
    await api.patch(`/admin/mods/${id}/reject`, {
      reason: reason || 'No reason provided'
    })

    alert('Mod rejected.')
    await loadPendingMods()
  } catch (error) {
    alert(error.response?.data?.message || 'Failed to reject mod')
  }
}

function handleImageError(event, mod) {
  event.target.src = getGameFallback(mod.game_name)
}

onMounted(loadPendingMods)
</script>
