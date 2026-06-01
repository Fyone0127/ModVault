<template>
  <section class="auth-layout register">
    <aside class="auth-visual" aria-label="Register visual preview">
      <img src="https://images.unsplash.com/photo-1556438064-2d7646166914?auto=format&fit=crop&w=1200&q=80" alt="Gaming controller and neon lights representing a new creator account" />
      <div class="auth-copy">
        <span class="badge pink">New vault</span>
        <h2>Build your mod library from day one.</h2>
        <p>Save favourites, review community mods, and apply for creator access when you are ready to publish.</p>
        <div class="auth-feature-row">
          <span><Heart :size="15" /> Save</span>
          <span><Star :size="15" /> Review</span>
          <span><UploadCloud :size="15" /> Create</span>
        </div>
        <div class="auth-visual-stats">
          <article>
            <strong>Start simple</strong>
            <small>Browse and save mods immediately</small>
          </article>
          <article>
            <strong>Grow later</strong>
            <small>Apply for creator access from your dashboard</small>
          </article>
        </div>
        <div class="auth-floating-panel auth-creator-card">
          <span><UploadCloud :size="16" /> Creator path</span>
          <strong>Apply later</strong>
          <small>New accounts start as players and can request upload access from the dashboard.</small>
        </div>
      </div>
    </aside>

    <article class="card form-card auth-panel">
      <div class="card-body">
        <p class="eyebrow">Create account</p>
        <h2>Join ModVault</h2>
        <p class="muted">Start as a player, then request creator access from your dashboard when you want to upload mods.</p>

        <section class="auth-entry-status" aria-label="Account benefits">
          <article>
            <span><UserRound :size="18" /></span>
            <div>
              <strong>Player first</strong>
              <small>Save favourites and reviews immediately</small>
            </div>
          </article>

          <article>
            <span><UploadCloud :size="18" /></span>
            <div>
              <strong>Creator-ready</strong>
              <small>Request upload access after joining</small>
            </div>
          </article>
        </section>

        <section class="auth-mini-grid">
          <article class="auth-mini-card">
            <strong>Player vault</strong>
            <small>Save mods and review discoveries</small>
          </article>

          <article class="auth-mini-card">
            <strong>Creator ready</strong>
            <small>Request upload access later</small>
          </article>
        </section>

        <section class="auth-path-steps" aria-label="Account setup path">
          <article>
            <span>01</span>
            <div>
              <strong>Create vault</strong>
              <small>Register with a player account</small>
            </div>
          </article>

          <article>
            <span>02</span>
            <div>
              <strong>Save discoveries</strong>
              <small>Favourite and review approved mods</small>
            </div>
          </article>

          <article>
            <span>03</span>
            <div>
              <strong>Grow access</strong>
              <small>Apply for creator tools when ready</small>
            </div>
          </article>
        </section>

        <form class="form-grid" @submit.prevent="register">
          <label class="label">
            Username
            <span class="input-wrap">
              <UserRound :size="18" />
              <input v-model.trim="form.username" class="input input-with-icon" required minlength="3" placeholder="Your username" autocomplete="username" />
            </span>
          </label>

          <label class="label">
            Email
            <span class="input-wrap">
              <Mail :size="18" />
              <input v-model.trim="form.email" class="input input-with-icon" type="email" required placeholder="you@example.com" autocomplete="email" />
            </span>
          </label>

          <label class="label">
            Password
            <span class="input-wrap">
              <LockKeyhole :size="18" />
              <input v-model="form.password" class="input input-with-icon input-with-toggle" :type="showPassword ? 'text' : 'password'" required minlength="6" placeholder="Minimum 6 characters" autocomplete="new-password" />
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

          <div class="password-meter" aria-label="Password strength">
            <span :style="{ width: `${passwordStrength.percent}%` }"></span>
          </div>
          <p class="auth-hint">{{ passwordStrength.label }}</p>

          <label class="label">
            Confirm password
            <span class="input-wrap">
              <ShieldCheck :size="18" />
              <input v-model="confirmPassword" class="input input-with-icon input-with-toggle" :type="showConfirmPassword ? 'text' : 'password'" required minlength="6" placeholder="Repeat your password" autocomplete="new-password" />
              <button
                type="button"
                class="input-toggle"
                @click="showConfirmPassword = !showConfirmPassword"
                :aria-label="showConfirmPassword ? 'Hide password confirmation' : 'Show password confirmation'"
              >
                <component :is="showConfirmPassword ? EyeOff : Eye" :size="17" />
              </button>
            </span>
          </label>

          <div class="auth-checklist auth-register-checklist" aria-label="Registration readiness">
            <span
              v-for="check in registerChecks"
              :key="check.label"
              :class="{ ready: check.ready }"
            >
              <CheckCircle2 :size="15" />
              {{ check.label }}
            </span>
          </div>

          <div class="auth-inline-note">
            <ShieldCheck :size="16" />
            <span>Your role can grow from player to creator after approval.</span>
          </div>

          <p v-if="error" class="error">{{ error }}</p>

          <button class="btn auth-submit" type="submit" :disabled="submitting || !canSubmit">
            <UserPlus :size="18" />
            {{ submitting ? 'Creating account...' : 'Create Account' }}
          </button>

          <p class="auth-switch">
            Already have an account?
            <RouterLink to="/login">Login</RouterLink>
          </p>
        </form>
      </div>
    </article>
  </section>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { CheckCircle2, Eye, EyeOff, Heart, LockKeyhole, Mail, ShieldCheck, Star, UploadCloud, UserPlus, UserRound } from 'lucide-vue-next'
import api, { saveSession } from '../services/api'

const router = useRouter()
const error = ref('')
const submitting = ref(false)
const confirmPassword = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const form = reactive({ username: '', email: '', password: '' })

const usernameValid = computed(() => form.username.trim().length >= 3)
const emailLooksValid = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
const passwordsMatch = computed(() => Boolean(form.password) && form.password === confirmPassword.value)

const passwordStrength = computed(() => {
  const password = form.password
  let score = 0

  if (password.length >= 6) score += 1
  if (password.length >= 10) score += 1
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1
  if (/\d/.test(password)) score += 1
  if (/[^A-Za-z0-9]/.test(password)) score += 1

  if (!password) return { percent: 0, label: 'Use at least 6 characters.' }
  if (score <= 1) return { percent: 30, label: 'Password strength: basic' }
  if (score <= 3) return { percent: 65, label: 'Password strength: solid' }
  return { percent: 100, label: 'Password strength: strong' }
})

const registerChecks = computed(() => [
  {
    label: 'Username has 3+ characters',
    ready: usernameValid.value
  },
  {
    label: 'Email format looks good',
    ready: emailLooksValid.value
  },
  {
    label: 'Password has 6+ characters',
    ready: form.password.length >= 6
  },
  {
    label: 'Passwords match',
    ready: passwordsMatch.value
  }
])

const canSubmit = computed(() => {
  return usernameValid.value && emailLooksValid.value && form.password.length >= 6 && passwordsMatch.value
})

async function register() {
  error.value = ''

  if (form.password !== confirmPassword.value) {
    error.value = 'Passwords do not match'
    return
  }

  if (!canSubmit.value) {
    error.value = 'Complete the required account checks before creating your account'
    return
  }

  submitting.value = true

  try {
    const response = await api.post('/auth/register', form)
    saveSession(response.data)
    router.push('/dashboard')
  } catch (err) {
    error.value = err.response?.data?.message || 'Registration failed'
  } finally {
    submitting.value = false
  }
}
</script>
