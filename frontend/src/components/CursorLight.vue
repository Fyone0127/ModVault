<template>
  <div
    class="cursor-light"
    :class="{ active, 'over-button': overButton }"
    :style="cursorVars"
    aria-hidden="true"
  >
    <span class="cursor-light-core"></span>
    <span class="cursor-light-aura"></span>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'

const active = ref(false)
const overButton = ref(false)
const point = reactive({
  x: -200,
  y: -200
})

let frame = null
let canUseFinePointer = false

const cursorVars = computed(() => ({
  '--cursor-x': `${point.x}px`,
  '--cursor-y': `${point.y}px`
}))

function moveLight(event) {
  if (!canUseFinePointer) return
  active.value = true
  const buttonTarget = event.target.closest?.([
    '.btn',
    '.btn-secondary',
    '.btn-danger',
    '.btn-icon',
    '.nav-menu-trigger',
    '.site-menu-account a',
    '.site-menu-account button',
    '.home-orbit-words span',
    '.mods-news-chip',
    '.mods-news-page-button',
    '.mods-news-save',
    '.vaultbot-fab',
    '.vaultbot-links a',
    '.vaultbot-followups button',
    '.vaultbot-prompts button',
    '.vaultbot-form .btn-icon'
  ].join(', '))
  overButton.value = Boolean(buttonTarget)

  if (buttonTarget) {
    const rect = buttonTarget.getBoundingClientRect()
    buttonTarget.style.setProperty('--button-x', `${event.clientX - rect.left}px`)
    buttonTarget.style.setProperty('--button-y', `${event.clientY - rect.top}px`)
  }

  cancelAnimationFrame(frame)
  frame = requestAnimationFrame(() => {
    point.x = event.clientX
    point.y = event.clientY
  })
}

function hideLight() {
  active.value = false
  overButton.value = false
}

onMounted(() => {
  canUseFinePointer = window.matchMedia('(pointer: fine)').matches
  if (!canUseFinePointer) return

  window.addEventListener('pointermove', moveLight)
  window.addEventListener('pointerleave', hideLight)
  window.addEventListener('blur', hideLight)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(frame)
  window.removeEventListener('pointermove', moveLight)
  window.removeEventListener('pointerleave', hideLight)
  window.removeEventListener('blur', hideLight)
})
</script>
