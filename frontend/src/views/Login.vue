<template>
  <section class="auth-layout">
    <article class="card form-card auth-panel">
      <div class="card-body">
        <p class="eyebrow">Welcome back</p>
        <h2>Login to ModVault</h2>
        <p class="muted">Continue managing favourites, reviews, creator uploads, and your role-based dashboard.</p>

        <section class="auth-entry-status" aria-label="Login benefits">
          <article>
            <span><ShieldCheck :size="18" /></span>
            <div>
              <strong>Secure session</strong>
              <small>Signed tokens keep you moving for 7 days</small>
            </div>
          </article>

          <article>
            <span><LayoutDashboard :size="18" /></span>
            <div>
              <strong>Smart routing</strong>
              <small>Players, creators, and admins land in the right dashboard</small>
            </div>
          </article>
        </section>

        <section class="auth-mini-grid">
          <article class="auth-mini-card">
            <strong>Dashboard</strong>
            <small>Pick up where you left off</small>
          </article>

          <article class="auth-mini-card">
            <strong>Saved mods</strong>
            <small>Keep your favourites together</small>
          </article>
        </section>

        <form class="form-grid" @submit.prevent="login">
          <label class="label">
            Email
            <span class="input-wrap">
              <Mail :size="18" />
              <input v-model.trim="form.email" class="input input-with-icon" type="email" required placeholder="demo@modvault.dev" autocomplete="email" />
            </span>
          </label>

          <label class="label">
            Password
            <span class="input-wrap">
              <LockKeyhole :size="18" />
              <input v-model="form.password" class="input input-with-icon input-with-toggle" :type="showPassword ? 'text' : 'password'" required placeholder="Enter your password" autocomplete="current-password" />
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

          <div class="auth-checklist" aria-label="Login readiness">
            <span
              v-for="check in loginChecks"
              :key="check.label"
              :class="{ ready: check.ready }"
            >
              <CheckCircle2 :size="15" />
              {{ check.label }}
            </span>
          </div>

          <div class="auth-inline-note">
            <ShieldCheck :size="16" />
            <span>Your account unlocks personalised tools based on your role.</span>
          </div>

          <div class="auth-helper-row">
            <RouterLink class="auth-text-link" to="/forgot-password">Forgot password?</RouterLink>
          </div>

          <p v-if="error" class="error">{{ error }}</p>

          <button class="btn auth-submit" type="submit" :disabled="submitting || !canSubmit">
            <LogIn :size="18" />
            {{ submitting ? 'Logging in...' : 'Login' }}
          </button>

          <p class="auth-switch">
            No account?
            <RouterLink to="/register">Register here</RouterLink>
          </p>
        </form>
      </div>
    </article>

    <aside class="auth-visual" aria-label="Login visual preview">
      <img src="https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80" alt="Dark gaming desk matching ModVault login page" />
      <div class="auth-copy">
        <span class="badge cyan">Player Vault</span>
        <h2>Save your favourite mods in one place.</h2>
        <p>Login to access your personal dashboard, review history, favourites, and creator management tools.</p>
        <div class="auth-feature-row">
          <span><LayoutDashboard :size="15" /> Dashboard</span>
          <span><Heart :size="15" /> Favourites</span>
          <span><Star :size="15" /> Reviews</span>
        </div>
        <div class="auth-visual-stats">
          <article>
            <strong>Role-based</strong>
            <small>Different tools for players, creators, and admins</small>
          </article>
          <article>
            <strong>One vault</strong>
            <small>Track saved mods, reviews, and uploads from one place</small>
          </article>
        </div>
        <div class="auth-floating-panel auth-session-card">
          <span><KeyRound :size="16" /> Session ready</span>
          <strong>Vault access</strong>
          <small>Login once, then jump between dashboard, favourites, and reviews.</small>
        </div>
      </div>
    </aside>
  </section>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { CheckCircle2, Eye, EyeOff, Heart, KeyRound, LayoutDashboard, LockKeyhole, LogIn, Mail, ShieldCheck, Star } from 'lucide-vue-next'
import api, { saveSession } from '../services/api'

const router = useRouter()
const error = ref('')
const submitting = ref(false)
const showPassword = ref(false)
const form = reactive({ email: '', password: '' })

const emailLooksValid = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
const canSubmit = computed(() => emailLooksValid.value && form.password.length > 0)

const loginChecks = computed(() => [
  {
    label: 'Email format looks good',
    ready: emailLooksValid.value
  },
  {
    label: 'Password entered',
    ready: form.password.length > 0
  }
])

async function login() {
  error.value = ''

  if (!canSubmit.value) {
    error.value = 'Enter a valid email and password'
    return
  }

  submitting.value = true

  try {
    const response = await api.post('/auth/login', form)
    saveSession(response.data)
    router.push('/dashboard')
  } catch (err) {
    error.value = err.response?.data?.message || 'Login failed'
  } finally {
    submitting.value = false
  }
}
</script>
