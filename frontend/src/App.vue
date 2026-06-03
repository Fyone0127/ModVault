<template>
  <div class="app-shell">
    <SplashScreen v-if="showSplash" />
    <Navbar />
    <main class="page-wrap">
      <RouterView v-slot="{ Component, route }">
        <Transition name="page-transition" mode="out-in">
          <div
            :key="route.fullPath"
            class="page-view"
            :class="{ 'enhanced-page-view': route.name !== 'Home' }"
            :data-page="route.name"
          >
            <component :is="Component" />
          </div>
        </Transition>
      </RouterView>
    </main>
    <Footer />
    <VaultBot />
    <ParticleEmitter />
    <CursorLight />
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import Navbar from './components/Navbar.vue'
import Footer from './components/Footer.vue'
import VaultBot from './components/VaultBot.vue'
import ParticleEmitter from './components/ParticleEmitter.vue'
import CursorLight from './components/CursorLight.vue'
import SplashScreen from './components/SplashScreen.vue'

const SPLASH_MIN_DURATION = 4200
const showSplash = ref(true)
let splashTimer

onMounted(() => {
  splashTimer = window.setTimeout(() => {
    showSplash.value = false
  }, SPLASH_MIN_DURATION)
})

onBeforeUnmount(() => {
  window.clearTimeout(splashTimer)
})
</script>
