<template>
  <div class="grid mods-grid" aria-label="Loading content">
    <div v-for="item in count" :key="item" class="loading-skeleton"></div>
  </div>
</template>

<script setup>
defineProps({ count: { type: Number, default: 4 } })
</script>
