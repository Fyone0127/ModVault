<template>
  <div class="app-shell">
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
import Navbar from './components/Navbar.vue'
import Footer from './components/Footer.vue'
import VaultBot from './components/VaultBot.vue'
import ParticleEmitter from './components/ParticleEmitter.vue'
import CursorLight from './components/CursorLight.vue'
</script>
