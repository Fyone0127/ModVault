<template>
  <WorkspaceNav mode="admin" />

  <section class="page-banner admin-banner creator-requests-hero">
    <div>
      <p class="eyebrow">Admin moderation</p>
      <h1>Creator applications</h1>
      <p>
        Review user requests to become creators. Use this queue to check whether each applicant has
        a clear reason, a trustworthy portfolio trail, and enough detail to handle uploads responsibly.
      </p>

      <div class="cta-row">
        <RouterLink class="btn-secondary" to="/dashboard">
          <LayoutDashboard :size="18" />
          Back to Dashboard
        </RouterLink>

        <RouterLink class="btn-secondary" to="/admin/approvals">
          <ShieldCheck :size="18" />
          Pending Mods
        </RouterLink>
      </div>
    </div>

    <aside class="creator-requests-hero-panel">
      <span class="creator-requests-hero-icon">
        <Users :size="30" />
      </span>
      <p>Applicant queue</p>
      <h2>{{ applications.length }}</h2>
      <small>{{ heroQueueText }}</small>
    </aside>
  </section>

  <LoadingSkeleton v-if="loading" :count="4" />

  <template v-else>
    <section class="grid admin-queue-summary-grid">
      <article class="admin-queue-summary">
        <p class="eyebrow">Applications</p>
        <h2>{{ applications.length }}</h2>
        <span>Awaiting decision</span>
      </article>

      <article class="admin-queue-summary">
        <p class="eyebrow">Portfolio links</p>
        <h2>{{ applicationStats.withPortfolio }}</h2>
        <span>Provided by users</span>
      </article>

      <article class="admin-queue-summary">
        <p class="eyebrow">Detailed reasons</p>
        <h2>{{ applicationStats.detailed }}</h2>
        <span>100+ characters</span>
      </article>

      <article class="admin-queue-summary">
        <p class="eyebrow">Oldest request</p>
        <h2>{{ applicationStats.oldest }}</h2>
        <span>Queue age</span>
      </article>
    </section>

    <section class="card creator-requests-toolbar-card">
      <div class="card-body">
        <div class="creator-requests-toolbar-head">
          <div>
            <p class="eyebrow">Decision queue</p>
            <h2>{{ applications.length }} creator request{{ applications.length === 1 ? '' : 's' }}</h2>
          </div>
          <small>{{ applicationStats.withPortfolio }} with portfolio links, {{ applicationStats.detailed }} with detailed reasons</small>
        </div>

        <div class="cta-row creator-requests-toolbar-actions">
          <button class="btn-secondary" @click="loadApplications">
            <RefreshCw :size="16" />
            Refresh
          </button>
        </div>
      </div>
    </section>

    <div v-if="applications.length" class="grid creator-request-grid">
      <article
        v-for="application in applications"
        :key="application.id"
        class="card creator-request-card"
      >
        <div class="card-body">
          <div class="mod-meta">
            <span class="badge cyan">Pending</span>
            <span class="badge">{{ application.email }}</span>
          </div>

          <h3>{{ application.username }}</h3>

          <p>{{ application.reason }}</p>

          <div class="creator-request-checks">
            <span :class="{ passed: application.reason?.length >= 100 }">
              Reason depth
            </span>
            <span :class="{ passed: application.portfolio_url }">
              Portfolio link
            </span>
            <span class="passed">
              Account verified
            </span>
          </div>

          <div class="creator-request-meta">
            <small>
              <FileText :size="14" />
              {{ application.reason?.length || 0 }} chars
            </small>

            <small>
              <CalendarDays :size="14" />
              Submitted {{ formatDate(application.created_at) }}
            </small>
          </div>

          <p v-if="application.portfolio_url" class="muted small creator-request-link">
            <a
              :href="application.portfolio_url"
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink :size="15" />
              Open portfolio link
            </a>
          </p>

          <div class="cta-row">
            <button class="btn" @click="approve(application.id)">
              <BadgeCheck :size="16" />
              Approve Creator
            </button>

            <button class="btn-danger" @click="reject(application.id)">
              <XCircle :size="16" />
              Reject
            </button>
          </div>
        </div>
      </article>
    </div>

    <div v-else class="empty">
      No pending creator applications.
    </div>
  </template>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import {
  BadgeCheck,
  CalendarDays,
  ExternalLink,
  FileText,
  LayoutDashboard,
  RefreshCw,
  ShieldCheck,
  Users,
  XCircle
} from 'lucide-vue-next'
import api from '../services/api'
import LoadingSkeleton from '../components/LoadingSkeleton.vue'
import WorkspaceNav from '../components/WorkspaceNav.vue'

const applications = ref([])
const loading = ref(true)

const applicationStats = computed(() => {
  const oldestDate = applications.value
    .map((application) => new Date(application.created_at))
    .filter((date) => !Number.isNaN(date.getTime()))
    .sort((a, b) => a - b)[0]

  return {
    withPortfolio: applications.value.filter((application) => application.portfolio_url).length,
    detailed: applications.value.filter((application) => (application.reason || '').length >= 100).length,
    oldest: oldestDate ? queueAge(oldestDate) : '0d'
  }
})

const heroQueueText = computed(() => {
  if (!applications.value.length) return 'No creator requests waiting right now'
  if (applicationStats.value.withPortfolio === applications.value.length) return 'Every applicant included a portfolio link'
  return `${applications.value.length - applicationStats.value.withPortfolio} request${applications.value.length - applicationStats.value.withPortfolio === 1 ? '' : 's'} still need stronger proof`
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

async function loadApplications() {
  loading.value = true

  try {
    const response = await api.get('/creator/applications/pending')
    applications.value = response.data
  } catch (error) {
    alert(error.response?.data?.message || 'Failed to load applications')
  } finally {
    loading.value = false
  }
}

async function approve(id) {
  if (!confirm('Approve this user as creator?')) return

  try {
    await api.patch(`/creator/applications/${id}/approve`)
    alert('User approved as creator')
    await loadApplications()
  } catch (error) {
    alert(error.response?.data?.message || 'Failed to approve application')
  }
}

async function reject(id) {
  if (!confirm('Reject this creator application?')) return

  try {
    await api.patch(`/creator/applications/${id}/reject`)
    alert('Application rejected')
    await loadApplications()
  } catch (error) {
    alert(error.response?.data?.message || 'Failed to reject application')
  }
}

onMounted(loadApplications)
</script>
