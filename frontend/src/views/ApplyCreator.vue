<template>
  <WorkspaceNav mode="player" />

  <section class="page-banner apply-hero">
    <div>
      <p class="eyebrow">Creator application</p>
      <h1>Apply to become a creator</h1>
      <p>
        Submit a thoughtful request to unlock upload access. Admin reviews each application for clarity,
        safe sourcing, and whether you are ready to publish useful mods for the ModVault community.
      </p>

      <div class="apply-steps">
        <span><FilePenLine :size="15" /> Submit request</span>
        <span><ShieldCheck :size="15" /> Admin review</span>
        <span><UploadCloud :size="15" /> Upload access</span>
      </div>
    </div>

    <div class="apply-hero-card">
      <span class="apply-hero-icon">
        <Wrench :size="28" />
      </span>
      <h3>Creator Access</h3>
      <p>
        Approved creators can upload mods, attach trusted download links, organise tags and categories,
        and track approval status from their dashboard.
      </p>
    </div>
  </section>

  <section v-if="application" class="card application-status-card">
    <div class="card-body">
      <p class="eyebrow">Application status</p>

      <div class="application-status-row">
        <div>
          <h2>{{ statusTitle }}</h2>
          <p class="muted">
            {{ statusMessage }}
          </p>
        </div>

        <span class="badge" :class="statusClass">
          {{ application.status }}
        </span>
      </div>

      <div class="application-details">
        <p>
          <strong>Submitted:</strong>
          {{ formatDate(application.created_at) }}
        </p>

        <p v-if="application.reviewed_at">
          <strong>Reviewed:</strong>
          {{ formatDate(application.reviewed_at) }}
        </p>

        <p>
          <strong>Reason:</strong>
          {{ application.reason }}
        </p>

        <p v-if="application.portfolio_url">
          <strong>Portfolio:</strong>
          <a
            :href="application.portfolio_url"
            target="_blank"
            rel="noopener noreferrer"
          >
            Open link
          </a>
        </p>
      </div>

      <div
        v-if="application.status === 'approved'"
        class="apply-note"
      >
        <strong>Approved:</strong>
        Please logout and login again so your creator tools appear in the navbar.
      </div>

      <div
        v-if="application.status === 'rejected'"
        class="apply-note rejected-note"
      >
        <strong>Rejected:</strong>
        You may submit a new application after improving your reason or portfolio link.
      </div>
    </div>
  </section>

  <section v-if="!application || application.status === 'rejected'" class="apply-layout">
    <article class="card apply-info-card">
      <div class="card-body">
        <p class="eyebrow">Before applying</p>
        <h2>What admins look for</h2>

        <div class="apply-rule">
          <span><BadgeCheck :size="18" /></span>
          <p>Use clear titles, categories, tags, and descriptions so your uploads are easy to trust and scan.</p>
        </div>

        <div class="apply-rule">
          <span><Link2 :size="18" /></span>
          <p>Use safe official download links such as CurseForge or Nexus Mods instead of vague or risky sources.</p>
        </div>

        <div class="apply-rule">
          <span><Gamepad2 :size="18" /></span>
          <p>Match each mod to the correct game so collections stay clean and relevant for users browsing the catalogue.</p>
        </div>

        <div class="apply-rule">
          <span><Clock3 :size="18" /></span>
          <p>Uploaded mods stay pending until admin approval, so well-organised submissions save review time.</p>
        </div>

        <div class="apply-tip-box">
          <p class="eyebrow">Strong application</p>
          <h3>What helps your request stand out</h3>
          <ul class="apply-tip-list">
            <li>Explain what kinds of mods you want to publish.</li>
            <li>Mention how you keep links trustworthy and descriptions organised.</li>
            <li>Include a portfolio or mod profile if you already have one.</li>
          </ul>
        </div>
      </div>
    </article>

    <section class="card form-card apply-form-card">
      <div class="card-body">
        <p class="eyebrow">Application form</p>
        <h2>Tell us why you want creator access</h2>

        <div class="apply-check-grid">
          <article class="apply-check-card" :class="{ passed: reasonStrong }">
            <span><FileText :size="18" /></span>
            <strong>{{ form.reason.trim().length }} chars</strong>
            <small>{{ reasonStrong ? 'Reason looks detailed enough' : 'Add more detail to strengthen your reason' }}</small>
          </article>

          <article class="apply-check-card" :class="{ passed: hasPortfolio }">
            <span><Globe :size="18" /></span>
            <strong>{{ hasPortfolio ? 'Portfolio linked' : 'Optional link' }}</strong>
            <small>{{ hasPortfolio ? 'Admin can review your external work' : 'You can still apply without a portfolio link' }}</small>
          </article>
        </div>

        <form class="form-grid" @submit.prevent="submitApplication">
          <label class="label">
            Why do you want to become a creator?
            <textarea
              v-model="form.reason"
              class="textarea apply-textarea"
              required
              placeholder="Example: I want to share useful and well-organised mods with the ModVault community, especially UI and performance picks for games I already know well..."
            ></textarea>
          </label>

          <label class="label">
            Portfolio or mod page link
            <input
              v-model="form.portfolio_url"
              class="input"
              type="url"
              placeholder="https://www.curseforge.com/members/yourname/projects"
            />
          </label>

          <div class="apply-note">
            <strong>Note:</strong>
            After approval, logout and login again so your creator role appears in the navbar.
          </div>

          <p v-if="message" class="success">{{ message }}</p>
          <p v-if="error" class="error">{{ error }}</p>

          <button class="btn" type="submit" :disabled="loading || !canSubmit">
            <UploadCloud :size="18" />
            {{ loading ? 'Submitting...' : 'Submit Application' }}
          </button>
        </form>
      </div>
    </section>
  </section>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import {
  BadgeCheck,
  Clock3,
  FilePenLine,
  FileText,
  Gamepad2,
  Globe,
  Link2,
  ShieldCheck,
  UploadCloud,
  Wrench
} from 'lucide-vue-next'
import WorkspaceNav from '../components/WorkspaceNav.vue'
import api from '../services/api'

const message = ref('')
const error = ref('')
const loading = ref(false)
const application = ref(null)

const form = reactive({
  reason: '',
  portfolio_url: ''
})

const reasonStrong = computed(() => form.reason.trim().length >= 80)
const hasPortfolio = computed(() => Boolean(form.portfolio_url.trim()))
const canSubmit = computed(() => form.reason.trim().length >= 20)

const statusTitle = computed(() => {
  if (!application.value) return ''

  if (application.value.status === 'approved') {
    return 'Your creator application was approved'
  }

  if (application.value.status === 'rejected') {
    return 'Your creator application was rejected'
  }

  return 'Your creator application is pending'
})

const statusMessage = computed(() => {
  if (!application.value) return ''

  if (application.value.status === 'approved') {
    return 'You now have creator access. Logout and login again to refresh your account role.'
  }

  if (application.value.status === 'rejected') {
    return 'Admin has rejected your application. You can submit a new request with better details.'
  }

  return 'Admin has not reviewed your application yet. Please wait for approval.'
})

const statusClass = computed(() => {
  if (!application.value) return ''

  if (application.value.status === 'approved') return 'status-approved'
  if (application.value.status === 'rejected') return 'status-rejected'
  return 'status-pending'
})

function formatDate(value) {
  if (!value) return 'N/A'
  return new Date(value).toLocaleString()
}

async function loadApplicationStatus() {
  try {
    const response = await api.get('/creator/my-application')
    application.value = response.data
  } catch (err) {
    console.error(err)
  }
}

async function submitApplication() {
  message.value = ''
  error.value = ''
  loading.value = true

  try {
    const response = await api.post('/creator/apply', {
      reason: form.reason,
      portfolio_url: form.portfolio_url
    })

    message.value = response.data.message || 'Creator application submitted successfully.'
    form.reason = ''
    form.portfolio_url = ''

    await loadApplicationStatus()
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to submit application'
  } finally {
    loading.value = false
  }
}

onMounted(loadApplicationStatus)
</script>
