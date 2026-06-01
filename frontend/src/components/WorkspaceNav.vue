<template>
  <section
    class="creator-workbench-switcher"
    :class="{ 'creator-workbench-switcher-standalone': standalone }"
    :data-label="workspaceLabel"
    :aria-label="workspaceLabel"
  >
    <RouterLink
      v-for="link in workspaceLinks"
      :key="link.to"
      :to="link.to"
    >
      <component :is="link.icon" :size="17" />
      <span>{{ link.label }}</span>
    </RouterLink>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { ClipboardCheck, FolderKanban, Heart, Package, PlusCircle, Rocket, Star, UploadCloud, Users } from 'lucide-vue-next'
import { getCurrentUser } from '../services/api'

const props = defineProps({
  mode: {
    type: String,
    default: 'auto'
  },
  standalone: {
    type: Boolean,
    default: true
  }
})

const user = getCurrentUser()

const resolvedMode = computed(() => {
  if (props.mode !== 'auto') return props.mode
  if (user?.role === 'admin') return 'admin'
  return user?.role === 'creator' ? 'creator' : 'player'
})

const workspaceLabel = computed(() => {
  if (resolvedMode.value === 'admin') return 'Admin Workspace'
  if (resolvedMode.value === 'creator') return 'Creator Workspace'
  return 'Player Workspace'
})

const workspaceLinks = computed(() => {
  if (resolvedMode.value === 'admin') {
    return [
      { label: 'Studio', to: '/dashboard', icon: FolderKanban },
      { label: 'Approvals', to: '/admin/approvals', icon: ClipboardCheck },
      { label: 'Requests', to: '/admin/creator-requests', icon: Users },
      { label: 'Add Game', to: '/admin/games/new', icon: PlusCircle }
    ]
  }

  if (resolvedMode.value === 'creator') {
    return [
      { label: 'Studio', to: '/dashboard', icon: FolderKanban },
      { label: 'Favourites', to: '/favourites', icon: Heart },
      { label: 'Upload', to: '/upload', icon: UploadCloud },
      { label: 'My Mods', to: '/my-mods', icon: Package },
      { label: 'Reviews', to: '/reviews', icon: Star }
    ]
  }

  return [
    { label: 'Studio', to: '/dashboard', icon: FolderKanban },
    { label: 'Apply Creator', to: '/apply-creator', icon: Rocket },
    { label: 'Favourites', to: '/favourites', icon: Heart },
    { label: 'Reviews', to: '/reviews', icon: Star }
  ]
})
</script>
