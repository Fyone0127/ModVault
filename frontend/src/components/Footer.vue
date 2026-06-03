<template>
  <footer
    ref="footerRef"
    class="footer"
    :class="{ 'is-visible': isVisible }"
    :style="footerVars"
    @pointermove="handlePointerMove"
    @pointerleave="resetPointer"
  >
    <section class="footer-frame">
      <div class="footer-topbar">
        <RouterLink class="footer-brand-mark" to="/" aria-label="Go to ModVault home">
          <img src="/pochacco-pochacco-dance-transparent.gif" alt="" />
        </RouterLink>

        <div class="footer-newsletter">
          <span aria-hidden="true"></span>
          <p>The player newsletter</p>
          <RouterLink to="/register">Join Vault</RouterLink>
        </div>
      </div>

      <div class="footer-main">
        <nav class="footer-column-grid" aria-label="Footer navigation">
          <section
            v-for="group in linkGroups"
            :key="group.title"
            class="footer-column"
          >
            <h3>{{ group.title }}</h3>
            <RouterLink
              v-for="link in group.links"
              :key="link.to + link.label"
              :to="link.to"
            >
              {{ link.label }}
            </RouterLink>
          </section>

          <section class="footer-about-strip" aria-label="About ModVault">
            <h3>ModVault</h3>
            <p>Browse mods, save favourites, write reviews, and manage creator uploads from one dark little vault.</p>
            <RouterLink to="/dashboard">Open dashboard</RouterLink>
          </section>
        </nav>

        <aside class="footer-mascot-panel" aria-label="ModVault mascot panel">
          <img
            v-if="!mascotGifFailed"
            class="footer-mascot-gif"
            :src="mascotGifSrc"
            alt="Animated ModVault mascot"
            @error="mascotGifFailed = true"
          />

          <div v-else class="footer-mascot-fallback" aria-hidden="true">
            <span class="mascot-head">
              <span class="mascot-eye eye-a"></span>
              <span class="mascot-eye eye-b"></span>
              <span class="mascot-mouth"></span>
            </span>
            <span class="mascot-glow"></span>
          </div>
        </aside>
      </div>

      <div class="footer-bottom">
        <div class="footer-legal">
          <span>ModVault Inc. &copy; 2026</span>
          <RouterLink to="/mods">Browse mods</RouterLink>
          <RouterLink to="/games">Game worlds</RouterLink>
          <span>Fiona TEO 102789110</span>
        </div>

        <div class="footer-socials" aria-label="Social links">
          <a
            v-for="item in socialLinks"
            :key="item.label"
            :href="item.href"
            :aria-label="item.label"
          >
            <component :is="item.icon" :size="16" />
          </a>
        </div>
      </div>
    </section>
  </footer>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { Github, Instagram, Music2, Twitch, Youtube } from 'lucide-vue-next'

const footerRef = ref(null)
const isVisible = ref(false)
const mascotGifFailed = ref(false)
const mascotGifSrc = '/images/footer-scuba-cat.webp'
const pointer = reactive({
  x: 50,
  y: 50
})

let observer = null

const linkGroups = [
  {
    title: 'Product',
    links: [
      { label: 'Games', to: '/games' },
      { label: 'Mods', to: '/mods' },
      { label: 'Favourites', to: '/favourites' },
      { label: 'Reviews', to: '/reviews' }
    ]
  },
  {
    title: 'Support',
    links: [
      { label: 'Login', to: '/login' },
      { label: 'Register', to: '/register' },
    ]
  }
]

const socialLinks = [
  { label: 'GitHub', href: 'https://github.com/', icon: Github },
  { label: 'YouTube', href: 'https://youtube.com/', icon: Youtube },
  { label: 'Instagram', href: 'https://instagram.com/', icon: Instagram },
  { label: 'Twitch', href: 'https://twitch.tv/', icon: Twitch },
  { label: 'TikTok', href: 'https://www.tiktok.com/', icon: Music2 }
]

const footerVars = computed(() => ({
  '--footer-x': `${pointer.x}%`,
  '--footer-y': `${pointer.y}%`
}))

function handlePointerMove(event) {
  const bounds = event.currentTarget.getBoundingClientRect()
  pointer.x = Math.min(100, Math.max(0, ((event.clientX - bounds.left) / bounds.width) * 100))
  pointer.y = Math.min(100, Math.max(0, ((event.clientY - bounds.top) / bounds.height) * 100))
}

function resetPointer() {
  pointer.x = 50
  pointer.y = 50
}

onMounted(() => {
  if (!footerRef.value || !('IntersectionObserver' in window)) {
    isVisible.value = true
    return
  }

  observer = new IntersectionObserver(([entry]) => {
    isVisible.value = entry.isIntersecting
  }, {
    threshold: 0.18
  })

  observer.observe(footerRef.value)
})

onBeforeUnmount(() => {
  observer?.disconnect()
})
</script>
