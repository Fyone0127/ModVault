<template>
  <article class="review-card">
    <div class="review-header">
      <div>
        <strong>{{ review.username || review.user_name || 'User' }}</strong>
        <p class="muted small">{{ formattedDate }}</p>
      </div>

      <span class="badge pink">
        <Star :size="14" />
        {{ review.rating }}
      </span>
    </div>

    <p class="review-comment">
      {{ review.comment }}
    </p>
  </article>
</template>

<script setup>
import { computed } from 'vue'
import { Star } from 'lucide-vue-next'

const props = defineProps({
  review: {
    type: Object,
    required: true
  }
})

const formattedDate = computed(() => {
  if (!props.review.created_at) return ''
  return new Date(props.review.created_at).toLocaleString()
})
</script>
