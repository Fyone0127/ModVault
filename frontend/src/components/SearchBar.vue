<template>
  <div class="toolbar" role="search">
    <input class="input" :value="modelValue" @input="$emit('update:modelValue', $event.target.value)" placeholder="Search mods by title, game, or tag..." aria-label="Search mods" />
    <select class="select" :value="gameId" @change="$emit('update:gameId', $event.target.value)" aria-label="Filter by game">
      <option value="">All games</option>
      <option v-for="game in games" :key="game.id" :value="game.id">{{ game.name }}</option>
    </select>
    <select class="select" :value="category" @change="$emit('update:category', $event.target.value)" aria-label="Filter by category">
      <option value="">All categories</option>
      <option v-for="item in categories" :key="item" :value="item">{{ item }}</option>
    </select>
    <select class="select" :value="sort" @change="$emit('update:sort', $event.target.value)" aria-label="Sort mods">
      <option value="latest">Latest</option>
      <option value="popular">Most source downloads</option>
      <option value="rating">Highest rated</option>
      <option value="title">Title A-Z</option>
    </select>
  </div>
</template>

<script setup>
defineProps({
  modelValue: { type: String, default: '' },
  gameId: { type: String, default: '' },
  category: { type: String, default: '' },
  sort: { type: String, default: 'latest' },
  games: { type: Array, default: () => [] },
  categories: { type: Array, default: () => [] }
})
defineEmits(['update:modelValue', 'update:gameId', 'update:category', 'update:sort'])
</script>
