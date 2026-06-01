<template>
  <div
    class="vault-3d-showcase"
    aria-label="Animated ModVault showcase"
    @pointermove="handlePointerMove"
    @pointerleave="resetTilt"
  >
    <div
      class="vault-3d-scene"
      :style="{
        '--tilt-x': `${tilt.x}deg`,
        '--tilt-y': `${tilt.y}deg`
      }"
    >
      <div class="vault-3d-orbit orbit-a">
        <span>
          <PackageOpen :size="15" />
          Mods
        </span>
      </div>

      <div class="vault-3d-orbit orbit-b">
        <span>
          <Heart :size="15" />
          Saves
        </span>
      </div>

      <div class="vault-3d-orbit orbit-c">
        <span>
          <Sparkles :size="15" />
          Spin
        </span>
      </div>

      <div class="vault-3d-core">
        <div class="vault-3d-cube" aria-hidden="true">
          <span class="face front">MV</span>
          <span class="face back">MV</span>
          <span class="face right"></span>
          <span class="face left"></span>
          <span class="face top"></span>
          <span class="face bottom"></span>
        </div>
      </div>
    </div>

    <div class="vault-3d-copy">
      <strong>Interactive vault core</strong>
      <span>Browse, save, review, and spin through the catalogue.</span>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { Heart, PackageOpen, Sparkles } from 'lucide-vue-next'

const tilt = reactive({
  x: -10,
  y: 14
})

function handlePointerMove(event) {
  const bounds = event.currentTarget.getBoundingClientRect()
  const x = (event.clientX - bounds.left) / bounds.width - 0.5
  const y = (event.clientY - bounds.top) / bounds.height - 0.5

  tilt.x = -10 + y * -12
  tilt.y = 14 + x * 16
}

function resetTilt() {
  tilt.x = -10
  tilt.y = 14
}
</script>
