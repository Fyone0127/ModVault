<template>
  <WorkspaceNav mode="admin" />

  <section class="page-banner admin-banner add-game-hero">
    <div>
      <p class="eyebrow">Admin catalogue</p>
      <h1>Add a new game</h1>
      <p>
        Create a new public game collection so creators can upload against it and players can browse it across the catalogue.
      </p>

      <div class="cta-row">
        <RouterLink class="btn-secondary" to="/dashboard">
          <LayoutDashboard :size="18" />
          Back to Dashboard
        </RouterLink>

        <RouterLink class="btn-secondary" to="/games">
          <Gamepad2 :size="18" />
          View Games
        </RouterLink>
      </div>
    </div>

    <aside class="add-game-hero-panel">
      <span class="add-game-hero-icon">
        <Gamepad2 :size="30" />
      </span>
      <p>Collection setup</p>
      <h2>{{ nameLength }}</h2>
      <small>{{ heroPanelText }}</small>
    </aside>
  </section>

  <section class="add-game-layout">
    <article class="card add-game-guide-card">
      <div class="card-body">
        <p class="eyebrow">Before publishing</p>
        <h2>What makes a good game entry</h2>

        <div class="add-game-guide-item">
          <span><Type :size="18" /></span>
          <p>Use the official game name so creators and players see a clean, familiar collection title.</p>
        </div>

        <div class="add-game-guide-item">
          <span><FileText :size="18" /></span>
          <p>Write a short description that explains the kind of mods and gameplay style this collection supports.</p>
        </div>

        <div class="add-game-guide-item">
          <span><ImageIcon :size="18" /></span>
          <p>Add a cover image URL when you have one, or use an existing public `/images/games/...` path.</p>
        </div>

        <div class="add-game-note">
          <strong>Tip:</strong>
          New games appear in the Games page, Mods filters, homepage collections, and creator upload form as soon as they are added.
        </div>
      </div>
    </article>

    <section class="card form-card add-game-form-card">
      <div class="card-body">
        <p class="eyebrow">Game details</p>
        <h2>Create collection</h2>

        <section class="add-game-check-grid">
          <article class="add-game-check-card" :class="{ passed: form.name.trim().length >= 2 }">
            <span><Type :size="18" /></span>
            <strong>{{ nameLength }} chars</strong>
            <small>{{ form.name.trim().length >= 2 ? 'Name looks valid' : 'Add a clear game name' }}</small>
          </article>

          <article class="add-game-check-card" :class="{ passed: form.description.trim().length >= 80 }">
            <span><FileText :size="18" /></span>
            <strong>{{ descriptionLength }} chars</strong>
            <small>{{ form.description.trim().length >= 80 ? 'Description has good detail' : 'Add more context for this collection' }}</small>
          </article>
        </section>

        <form class="form-grid" @submit.prevent="submit">
          <label class="label">
            Game name
            <input
              v-model="form.name"
              class="input"
              required
              placeholder="e.g. Cyberpunk 2077"
            />
          </label>

          <label class="label">
            Cover image URL
            <input
              v-model="form.cover_url"
              class="input"
              placeholder="https://... or /images/games/your-cover.jpg"
            />
          </label>

          <label class="label">
            Description
            <textarea
              v-model="form.description"
              class="textarea add-game-textarea"
              required
              placeholder="Describe the game and the kinds of mods this collection is likely to feature..."
            ></textarea>
          </label>

          <div class="add-game-preview">
            <div class="add-game-preview-image">
              <img
                v-if="showPreviewImage"
                :src="previewImage"
                :alt="`${previewName} cover preview`"
                @error="handlePreviewError"
              />
              <div v-else class="add-game-preview-placeholder">
                <ImageIcon :size="28" />
              </div>
            </div>

            <div class="add-game-preview-copy">
              <span class="badge cyan">Preview</span>
              <h3>{{ previewName }}</h3>
              <p>{{ previewDescription }}</p>
            </div>
          </div>

          <div class="add-game-note add-game-note-soft">
            <strong>Ready check:</strong>
            {{ readinessMessage }}
          </div>

          <p v-if="message" class="success">{{ message }}</p>
          <p v-if="error" class="error">{{ error }}</p>

          <button class="btn" type="submit" :disabled="submitting || !canSubmit">
            <PlusCircle :size="18" />
            {{ submitting ? 'Adding game...' : 'Add Game' }}
          </button>
        </form>
      </div>
    </section>
  </section>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { FileText, Gamepad2, Image as ImageIcon, LayoutDashboard, PlusCircle, Type } from 'lucide-vue-next'
import api from '../services/api'
import WorkspaceNav from '../components/WorkspaceNav.vue'
import { GAME_IMAGES } from '../utils/imageResolver'

const router = useRouter()
const submitting = ref(false)
const message = ref('')
const error = ref('')
const previewFailed = ref(false)

const form = reactive({
  name: '',
  description: '',
  cover_url: ''
})

const nameLength = computed(() => form.name.trim().length)
const descriptionLength = computed(() => form.description.trim().length)
const canSubmit = computed(() => form.name.trim().length >= 2 && form.description.trim().length >= 20)

const previewName = computed(() => form.name.trim() || 'New game collection')
const previewDescription = computed(() => {
  return form.description.trim() || 'Your description preview will appear here once you add a little more detail.'
})

const showPreviewImage = computed(() => Boolean(form.cover_url.trim()) && !previewFailed.value)

const previewImage = computed(() => {
  return form.cover_url.trim()
})

const heroPanelText = computed(() => {
  if (!form.name.trim()) return 'Ready for a new collection'
  return form.description.trim().length >= 80 ? 'Looks detailed enough to publish' : 'Add a little more context before saving'
})

const readinessMessage = computed(() => {
  if (!form.name.trim()) return 'Start with the official game name.'
  if (form.description.trim().length < 80) return 'A stronger description will make the collection more useful in browsing screens.'
  return 'Looks ready. Double-check the cover image URL if you want a custom visual.'
})

function handlePreviewError(event) {
  previewFailed.value = true
}

watch(() => form.cover_url, () => {
  previewFailed.value = false
})

async function submit() {
  message.value = ''
  error.value = ''
  submitting.value = true

  try {
    const response = await api.post('/games', {
      name: form.name.trim(),
      description: form.description.trim(),
      cover_url: form.cover_url.trim()
    })

    message.value = response.data.message || 'Game added successfully.'
    router.push('/games')
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to add game'
  } finally {
    submitting.value = false
  }
}
</script>
