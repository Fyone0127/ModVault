<template>
  <header class="navbar">
    <div class="nav-inner">
      <RouterLink class="logo nav-logo-icon" to="/" aria-label="Go to ModVault home" @click="closeMenu">
        <span class="logo-mark" aria-hidden="true">
          <img src="/pochacco-pochacco-dance-transparent.gif" alt="" />
        </span>
      </RouterLink>

      <button
        class="menu-btn nav-menu-trigger"
        :class="{ active: open }"
        type="button"
        :aria-expanded="open"
        aria-controls="site-menu-overlay"
        aria-label="Toggle site menu"
        @click="toggleMenu"
      >
        <span class="menu-glyph" aria-hidden="true">
          <span></span>
          <span></span>
          <span></span>
        </span>
      </button>
    </div>
  </header>

  <Transition name="menu-overlay">
    <section
      v-if="open"
      id="site-menu-overlay"
      class="site-menu-overlay"
      aria-label="Site menu"
      @click="handleOverlayClick"
    >
      <div class="site-menu-backdrop" aria-hidden="true">
        <span>ModVault</span>
      </div>

      <div class="site-menu-inner">
        <nav class="site-menu-links" aria-label="Expanded navigation">
          <div class="site-menu-heading">
            <p class="eyebrow">Navigation</p>
            <small>{{ menuSubtitle }}</small>
          </div>

          <a
            v-for="(link, index) in menuLinks"
            :key="`${link.group}-${link.to}`"
            :href="link.to"
            @click.prevent="navigateMenu(link.to)"
          >
            <span>{{ String(index + 1).padStart(2, '0') }}</span>
            <strong>{{ link.label }}</strong>
            <small>{{ link.group }}</small>
          </a>
        </nav>

      </div>

      <div class="site-menu-bottom">
        <span>{{ user ? `${user.username || 'User'} / ${user.role}` : 'Guest access' }}</span>

        <div class="site-menu-account">
          <a
            v-if="!user"
            href="/login"
            @click.prevent="navigateMenu('/login')"
          >
            Login
          </a>
          <a
            v-if="!user"
            href="/register"
            @click.prevent="navigateMenu('/register')"
          >
            Register
          </a>
          <button
            v-else
            type="button"
            @click="logout"
          >
            Logout
          </button>
        </div>
      </div>
    </section>
  </Transition>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { clearSession, getCurrentUser } from '../services/api'

const open = ref(false)
const user = ref(getCurrentUser())
const router = useRouter()

const menuLinks = computed(() => {
  const base = [
    { label: 'Home', to: '/', group: 'Start' },
    { label: 'Games', to: '/games', group: 'Main' },
    { label: 'Mods', to: '/mods', group: 'Main' }
  ]

  if (!user.value) return base

  if (user.value.role === 'admin') {
    return [
      ...base,
      { label: 'Dashboard', to: '/dashboard', group: 'Admin' }
    ]
  }

  if (user.value.role === 'creator') {
    return [
      ...base,
      { label: 'Dashboard', to: '/dashboard', group: 'Account' }
    ]
  }

  return [
    ...base,
    { label: 'Dashboard', to: '/dashboard', group: 'Account' }
  ]
})

const menuSubtitle = computed(() => {
  if (!user.value) return 'Browse as a guest'
  if (user.value.role === 'creator') return 'Creator navigation'
  if (user.value.role === 'admin') return 'Admin dashboard'
  return 'Player account tools'
})

function syncUser() {
  user.value = getCurrentUser()
}

function applyMenuState(isOpen) {
  document.body.style.overflow = isOpen ? 'hidden' : ''
  document.body.classList.toggle('menu-open', isOpen)
}

function toggleMenu() {
  open.value = !open.value
  applyMenuState(open.value)
}

function closeMenu() {
  open.value = false
  applyMenuState(false)
}

async function navigateMenu(target) {
  try {
    await router.push(target)
  } catch (error) {
    if (!error?.type) throw error
  } finally {
    closeMenu()
  }
}

function logout() {
  clearSession()
  open.value = false
  router.push('/')
}

onMounted(() => {
  window.addEventListener('session-changed', syncUser)
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('session-changed', syncUser)
  window.removeEventListener('keydown', handleKeydown)
  applyMenuState(false)
})

function handleKeydown(event) {
  if (event.key === 'Escape') closeMenu()
}

function handleOverlayClick(event) {
  const interactiveMenu = event.target.closest('.site-menu-links, .site-menu-bottom')

  if (!interactiveMenu) closeMenu()
}

watch(open, (isOpen) => {
  applyMenuState(isOpen)
})
</script>
