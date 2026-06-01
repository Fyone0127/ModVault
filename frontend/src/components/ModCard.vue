<template>
  <article class="card mod-card">
    <RouterLink class="mod-image-wrap" :to="`/mods/${mod.id}`">
      <img
        class="mod-cover"
        :src="imageUrl"
        :alt="`${mod.title} cover image`"
        loading="lazy"
        @error="handleImageError"
      />

      <span class="mod-gradient"></span>
      <span class="badge mod-category-pill">{{ mod.category || 'Mod' }}</span>
    </RouterLink>

    <div class="card-body">
      <div class="mod-meta">
        <span class="badge cyan">{{ mod.game_name || 'Game' }}</span>
        <span class="badge pink">
          <Star :size="13" />
          {{ displayRating }}
        </span>
        <span class="badge">
          <Download :size="13" />
          {{ displayDownloadSignal }}
        </span>
      </div>

      <h3>{{ mod.title }}</h3>

      <p class="small">
        {{ shortDescription }}
      </p>

      <div class="cta-row">
        <RouterLink class="btn-secondary" :to="`/mods/${mod.id}`">
          <ExternalLink :size="16" />
          View Details
        </RouterLink>

        <button
          v-if="showFavourite"
          class="btn"
          @click="$emit('favourite', mod.id)"
        >
          <Heart :size="16" />
          Save
        </button>

        <button
          v-if="showCompare"
          class="btn-secondary"
          type="button"
          @click="$emit('compare', mod)"
        >
          {{ compareSelected ? 'Selected' : 'Compare' }}
        </button>
      </div>
    </div>
  </article>
</template>

<script setup>
import { computed } from 'vue'
import { Download, ExternalLink, Heart, Star } from 'lucide-vue-next'
import { resolveModImage, getGameFallback } from '../utils/imageResolver'

const props = defineProps({
  mod: {
    type: Object,
    required: true
  },
  showFavourite: {
    type: Boolean,
    default: true
  },
  showCompare: {
    type: Boolean,
    default: false
  },
  compareSelected: {
    type: Boolean,
    default: false
  }
})

defineEmits(['favourite', 'compare'])

const imageUrl = computed(() => {
  return resolveModImage(props.mod)
})

const shortDescription = computed(() => {
  const text = props.mod.description || 'No description available.'
  return text.length > 110 ? `${text.slice(0, 110)}...` : text
})

const displayRating = computed(() => {
  const realRating = Number(props.mod.average_rating || 0)

  if (realRating > 0) {
    return realRating.toFixed(1)
  }

  return 'No ratings'
})

function formatCount(value) {
  const count = Number(value || 0)

  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`
  }

  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`
  }

  return count
}

const displayDownloadSignal = computed(() => {
  const hasSourceDownloads = props.mod.source_download_count !== null && props.mod.source_download_count !== undefined
  const sourceDownloads = Number(props.mod.source_download_count || 0)

  if (hasSourceDownloads) {
    return `${formatCount(sourceDownloads)} source downloads`
  }

  const realDownloads = Number(props.mod.download_count || 0)

  if (realDownloads === 1) {
    return '1 ModVault click'
  }

  if (realDownloads >= 1000) {
    return `${(realDownloads / 1000).toFixed(1)}K ModVault clicks`
  }

  return `${realDownloads} ModVault clicks`
})

function handleImageError(event) {
  event.target.src = getGameFallback(props.mod.game_name)
}
</script>
