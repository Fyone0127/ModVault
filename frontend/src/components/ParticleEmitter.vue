<template>
  <canvas ref="canvas" class="particle-emitter" aria-hidden="true"></canvas>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'

const canvas = ref(null)

let context
let animationFrame
let width = 0
let height = 0
let lastMove = 0
let canUseFinePointer = false
const particles = []
const pointer = {
  x: -999,
  y: -999
}

function resizeCanvas() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  width = window.innerWidth
  height = window.innerHeight
  canvas.value.width = width * dpr
  canvas.value.height = height * dpr
  canvas.value.style.width = `${width}px`
  canvas.value.style.height = `${height}px`
  context.setTransform(dpr, 0, 0, dpr, 0, 0)
}

function addParticle(x, y, boosted = false) {
  particles.push({
    x,
    y,
    vx: (Math.random() - 0.5) * (boosted ? 2.2 : 0.9),
    vy: (Math.random() - 0.5) * (boosted ? 2.2 : 0.9),
    life: boosted ? 1 : 0.7,
    size: boosted ? 1.8 + Math.random() * 2.8 : 0.9 + Math.random() * 1.6,
    hue: Math.random() > 0.42 ? 190 : 266
  })
}

function movePointer(event) {
  if (!canUseFinePointer) return
  pointer.x = event.clientX
  pointer.y = event.clientY

  const now = performance.now()
  if (now - lastMove < 20) return
  lastMove = now

  for (let index = 0; index < 2; index += 1) {
    addParticle(pointer.x, pointer.y, true)
  }
}

function draw() {
  context.clearRect(0, 0, width, height)

  if (particles.length < 18 && Math.random() > 0.86) {
    addParticle(Math.random() * width, Math.random() * height)
  }

  for (let index = particles.length - 1; index >= 0; index -= 1) {
    const particle = particles[index]
    particle.x += particle.vx
    particle.y += particle.vy
    particle.vy -= 0.006
    particle.life -= 0.012

    if (particle.life <= 0) {
      particles.splice(index, 1)
      continue
    }

    const alpha = Math.max(particle.life, 0)
    const gradient = context.createRadialGradient(
      particle.x,
      particle.y,
      0,
      particle.x,
      particle.y,
      particle.size * 8
    )
    gradient.addColorStop(0, `hsla(${particle.hue}, 100%, 72%, ${alpha * 0.72})`)
    gradient.addColorStop(0.35, `hsla(${particle.hue}, 100%, 58%, ${alpha * 0.18})`)
    gradient.addColorStop(1, `hsla(${particle.hue}, 100%, 58%, 0)`)

    context.fillStyle = gradient
    context.beginPath()
    context.arc(particle.x, particle.y, particle.size * 8, 0, Math.PI * 2)
    context.fill()
  }

  animationFrame = requestAnimationFrame(draw)
}

onMounted(() => {
  canUseFinePointer = window.matchMedia('(pointer: fine)').matches
  if (!canUseFinePointer || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  context = canvas.value.getContext('2d')
  resizeCanvas()
  window.addEventListener('resize', resizeCanvas)
  window.addEventListener('pointermove', movePointer)
  draw()
})

onBeforeUnmount(() => {
  cancelAnimationFrame(animationFrame)
  window.removeEventListener('resize', resizeCanvas)
  window.removeEventListener('pointermove', movePointer)
})
</script>
