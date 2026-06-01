<template>
  <section class="auth-layout">
    <article class="card form-card auth-panel">
      <div class="card-body">
        <p class="eyebrow">Password reset</p>
        <h2>Set a new password</h2>
        <p class="muted">Choose a new password for your ModVault account, then head back to login.</p>

        <form class="form-grid" @submit.prevent="resetPassword">
          <label class="label">
            New password
            <span class="input-wrap">
              <LockKeyhole :size="18" />
              <input
                v-model="form.password"
                class="input input-with-icon input-with-toggle"
                :type="showPassword ? 'text' : 'password'"
                required
                minlength="6"
                placeholder="Create a new password"
                autocomplete="new-password"
              />
              <button
                type="button"
                class="input-toggle"
                @click="showPassword = !showPassword"
                :aria-label="showPassword ? 'Hide password' : 'Show password'"
              >
                <component :is="showPassword ? EyeOff : Eye" :size="17" />
              </button>
            </span>
          </label>

          <label class="label">
            Confirm new password
            <span class="input-wrap">
              <ShieldCheck :size="18" />
              <input
                v-model="form.confirmPassword"
                class="input input-with-icon"
                :type="showPassword ? 'text' : 'password'"
                required
                minlength="6"
                placeholder="Repeat the new password"
                autocomplete="new-password"
              />
            </span>
          </label>

          <div class="password-meter">
            <span :style="{ width: `${passwordStrength}%` }"></span>
          </div>
          <p class="auth-hint">{{ passwordHint }}</p>

          <p v-if="error" class="error">{{ error }}</p>
          <p v-if="message" class="success">{{ message }}</p>

          <button class="btn auth-submit" type="submit" :disabled="submitting || !canSubmit">
            <KeyRound :size="18" />
            {{ submitting ? 'Updating password...' : 'Update Password' }}
          </button>

          <p class="auth-switch">
            Back to
            <RouterLink to="/login">Login</RouterLink>
          </p>
        </form>
      </div>
    </article>

    <aside class="auth-visual" aria-label="Reset password visual preview">
      <img src="https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?auto=format&fit=crop&w=1200&q=80" alt="Desktop gaming setup for password reset page" />
      <div class="auth-copy">
        <span class="badge cyan">Secure Reset</span>
        <h2>Protect your ModVault access.</h2>
        <p>Choose a fresh password and return to your player, creator, or admin workspace with a clean session.</p>
        <div class="auth-feature-row">
          <span><ShieldCheck :size="15" /> Secure account</span>
          <span><KeyRound :size="15" /> Fresh password</span>
          <span><LogIn :size="15" /> Quick return</span>
        </div>
      </div>
    </aside>
  </section>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import { Eye, EyeOff, KeyRound, LockKeyhole, LogIn, ShieldCheck } from 'lucide-vue-next'
import api from '../services/api'

const route = useRoute()
const showPassword = ref(false)
const submitting = ref(false)
const message = ref('')
const error = ref('')
const form = reactive({
  password: '',
  confirmPassword: ''
})

const token = computed(() => String(route.query.token || ''))

const passwordStrength = computed(() => {
  const value = form.password.trim()
  if (!value) return 0

  let score = 20
  if (value.length >= 8) score += 30
  if (/[A-Z]/.test(value)) score += 20
  if (/\d/.test(value)) score += 15
  if (/[^A-Za-z0-9]/.test(value)) score += 15
  return Math.min(score, 100)
})

const passwordHint = computed(() => {
  if (!form.password) return 'Use at least 6 characters.'
  if (passwordStrength.value < 50) return 'Add more length or mix uppercase, numbers, and symbols.'
  if (passwordStrength.value < 80) return 'Good start. A little more variety makes it stronger.'
  return 'Strong password.'
})

const canSubmit = computed(() => {
  return token.value && form.password.length >= 6 && form.password === form.confirmPassword
})

async function resetPassword() {
  message.value = ''
  error.value = ''

  if (!token.value) {
    error.value = 'Reset link is missing or invalid'
    return
  }

  if (form.password !== form.confirmPassword) {
    error.value = 'Passwords do not match'
    return
  }

  submitting.value = true

  try {
    const response = await api.post('/auth/reset-password', {
      token: token.value,
      password: form.password
    })

    message.value = response.data.message || 'Password updated successfully.'
    form.password = ''
    form.confirmPassword = ''
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to reset password'
  } finally {
    submitting.value = false
  }
}
</script>
