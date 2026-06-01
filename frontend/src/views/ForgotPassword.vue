<template>
  <section class="auth-layout">
    <article class="card form-card auth-panel">
      <div class="card-body">
        <p class="eyebrow">Account recovery</p>
        <h2>Forgot your password?</h2>
        <p class="muted">Enter your account email and we will prepare a reset page for you right here.</p>

        <form class="form-grid" @submit.prevent="submitRequest">
          <label class="label">
            Email
            <span class="input-wrap">
              <Mail :size="18" />
              <input
                v-model.trim="email"
                class="input input-with-icon"
                type="email"
                required
                placeholder="demo@modvault.dev"
                autocomplete="email"
              />
            </span>
          </label>

          <div class="auth-inline-note">
            <ShieldCheck :size="16" />
            <span>This reset flow stays inside the app for this project.</span>
          </div>

          <p v-if="error" class="error">{{ error }}</p>
          <p v-if="message" class="success">{{ message }}</p>

          <div v-if="resetUrl" class="auth-info-box">
            <p class="eyebrow">Reset link</p>
            <p class="muted">Use the prepared link below to set a new password for your account.</p>
            <RouterLink class="btn" :to="resetRoute">
              <KeyRound :size="18" />
              Open Reset Page
            </RouterLink>
          </div>

          <button class="btn auth-submit" type="submit" :disabled="submitting">
            <Mail :size="18" />
            {{ submitting ? 'Preparing link...' : 'Prepare Reset Link' }}
          </button>

          <p class="auth-switch">
            Back to
            <RouterLink to="/login">Login</RouterLink>
          </p>
        </form>
      </div>
    </article>

    <aside class="auth-visual" aria-label="Password reset visual preview">
      <img src="https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80" alt="Gaming keyboard and mouse for password recovery page" />
      <div class="auth-copy">
        <span class="badge cyan">Recovery Flow</span>
        <h2>Get back into your vault quickly.</h2>
        <p>Reset your password, return to your dashboard, and keep your favourites, reviews, and creator tools within reach.</p>
        <div class="auth-feature-row">
          <span><KeyRound :size="15" /> New password</span>
          <span><ShieldCheck :size="15" /> Short-lived link</span>
          <span><LogIn :size="15" /> Back to login</span>
        </div>
      </div>
    </aside>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue'
import { KeyRound, LogIn, Mail, ShieldCheck } from 'lucide-vue-next'
import api from '../services/api'

const email = ref('')
const message = ref('')
const error = ref('')
const submitting = ref(false)
const resetUrl = ref('')

const resetRoute = computed(() => {
  if (!resetUrl.value) return '/reset-password'

  try {
    const parsed = new URL(resetUrl.value)
    return `/reset-password${parsed.search}`
  } catch (parseError) {
    return '/reset-password'
  }
})

async function submitRequest() {
  message.value = ''
  error.value = ''
  resetUrl.value = ''
  submitting.value = true

  try {
    const response = await api.post('/auth/forgot-password', { email: email.value })
    message.value = response.data.message || 'If that email exists, a reset link has been prepared.'
    resetUrl.value = response.data.resetUrl || ''
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to prepare reset link'
  } finally {
    submitting.value = false
  }
}
</script>
