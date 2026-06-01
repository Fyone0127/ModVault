<template>
  <WorkspaceNav mode="creator" />

  <section class="page-banner creator-banner upload-hero">
    <div>
      <p class="eyebrow">Creator upload</p>
      <h1>Submit a new mod</h1>
      <p>
        Build a clean submission with the right game, a strong description, and a trusted download source.
        Every upload goes through admin review before it appears in the public ModVault catalogue.
      </p>

      <div class="upload-steps">
        <span><FilePenLine :size="15" /> Add details</span>
        <span><ShieldCheck :size="15" /> Submit for review</span>
        <span><PackageCheck :size="15" /> Admin publishes</span>
      </div>
    </div>

    <div class="upload-hero-card">
      <span class="upload-hero-icon">
        <UploadCloud :size="28" />
      </span>
      <h3>Pending approval</h3>
      <p>
        Your uploaded mod appears in My Mods first. It becomes public only after admin approval and stays linked to your creator profile.
      </p>
    </div>
  </section>

  <section v-if="!canUpload" class="empty">
    You need creator access to upload mods.
    <br />
    Normal users must apply to become a creator first.

    <div class="cta-row" style="justify-content: center;">
      <RouterLink class="btn" to="/apply-creator">
        Apply Creator
      </RouterLink>
    </div>
  </section>

  <section v-else class="upload-layout">
    <article class="card upload-guide-card">
      <div class="card-body">
        <p class="eyebrow">Upload guide</p>
        <h2>Before submitting</h2>

        <div class="upload-guide-item">
          <span><Gamepad2 :size="18" /></span>
          <p>Choose the correct game so users can find the mod under the right collection and filters.</p>
        </div>

        <div class="upload-guide-item">
          <span><FileText :size="18" /></span>
          <p>Use a clear title, category, tags, and description to improve search quality and approval clarity.</p>
        </div>

        <div class="upload-guide-item">
          <span><Link2 :size="18" /></span>
          <p>Add an official source link such as CurseForge or Nexus Mods so downloads stay trustworthy.</p>
        </div>

        <div class="upload-guide-item">
          <span><ShieldCheck :size="18" /></span>
          <p>Admin reviews every submission before it becomes visible to the public ModVault catalogue.</p>
        </div>

        <div class="upload-note">
          <strong>Status:</strong>
          Creator uploads are saved as <b>pending</b> until approved.
        </div>
      </div>
    </article>

    <section class="card form-card upload-form-card">
      <div class="card-body">
        <p class="eyebrow">Mod details</p>
        <h2>Upload mod</h2>

        <section class="upload-check-grid">
          <article class="upload-check-card" :class="{ passed: form.title.trim().length >= 5 }">
            <span><Type :size="18" /></span>
            <strong>{{ form.title.trim().length }} chars</strong>
            <small>{{ form.title.trim().length >= 5 ? 'Title looks clear enough' : 'Give the mod a clearer title' }}</small>
          </article>

          <article class="upload-check-card" :class="{ passed: form.description.trim().length >= 80 }">
            <span><FileText :size="18" /></span>
            <strong>{{ form.description.trim().length }} chars</strong>
            <small>{{ form.description.trim().length >= 80 ? 'Description feels detailed enough' : 'Add more detail about what the mod does' }}</small>
          </article>

          <article class="upload-check-card" :class="{ passed: Boolean(form.game_id && form.category.trim()) }">
            <span><Layers3 :size="18" /></span>
            <strong>{{ form.game_id ? 'Game set' : 'Pick game' }}</strong>
            <small>{{ form.category.trim() ? `Category: ${form.category}` : 'Add a category so browsing stays clean' }}</small>
          </article>
        </section>

        <section class="upload-readiness-panel" aria-label="Upload readiness">
          <div class="upload-readiness-head">
            <div>
              <p class="eyebrow">Submission readiness</p>
              <h3>{{ uploadReadinessPercent }}% ready</h3>
            </div>
            <span>{{ downloadLinkLabel }}</span>
          </div>

          <div class="upload-readiness-meter">
            <span :style="{ width: `${uploadReadinessPercent}%` }"></span>
          </div>

          <div class="upload-readiness-list">
            <span
              v-for="check in uploadReadinessChecks"
              :key="check.label"
              :class="{ passed: check.passed }"
            >
              <CheckCircle2 :size="15" />
              {{ check.label }}
            </span>
          </div>
        </section>

        <form class="form-grid" @submit.prevent="submit">
          <label class="label">
            Mod title
            <input
              v-model="form.title"
              class="input"
              required
              placeholder="e.g. Better Map Tools"
            />
          </label>

          <div class="upload-form-row">
            <label class="label">
              Game
              <select v-model="form.game_id" class="select" required>
                <option value="">Select game</option>
                <option
                  v-for="game in games"
                  :key="game.id"
                  :value="game.id"
                >
                  {{ game.name }}
                </option>
              </select>
            </label>

            <label class="label">
              Category
              <input
                v-model="form.category"
                class="input"
                required
                placeholder="Gameplay, UI, Addons, Utility..."
              />
            </label>
          </div>

          <label class="label">
            Tags
            <input
              v-model="form.tags"
              class="input"
              placeholder="ui, gameplay, utility, addon"
            />
          </label>

          <label class="label">
            Download Link
            <input
              v-model="form.download_url"
              class="input"
              type="url"
              placeholder="https://www.curseforge.com/..."
            />
          </label>

          <label class="label">
            Cover image
            <input
              class="input"
              type="file"
              accept="image/*"
              @change="handleImage"
            />
          </label>

          <div v-if="previewUrl || selectedGameName || form.category || form.tags" class="upload-preview upload-preview-rich">
            <img v-if="previewUrl" :src="previewUrl" alt="Selected mod cover preview" />
            <div v-else class="upload-preview-placeholder">
              <ImageIcon :size="26" />
            </div>

            <div class="upload-preview-copy">
              <strong>{{ form.title.trim() || 'Mod preview' }}</strong>
              <p class="muted small">This is how your upload starts to read before admin review.</p>
              <div class="upload-preview-meta">
                <span v-if="selectedGameName">{{ selectedGameName }}</span>
                <span v-if="form.category.trim()">{{ form.category.trim() }}</span>
                <span v-if="form.tags.trim()">{{ tagCount }} tag{{ tagCount === 1 ? '' : 's' }}</span>
              </div>
            </div>
          </div>

          <label class="label">
            Description
            <textarea
              v-model="form.description"
              class="textarea upload-textarea"
              required
              placeholder="Describe what your mod does, what kind of player it helps, and any special highlights..."
            ></textarea>
          </label>

          <div class="upload-note upload-note-soft">
            <strong>Ready check:</strong>
            {{ readinessMessage }}
          </div>

          <p v-if="message" class="success">{{ message }}</p>
          <p v-if="error" class="error">{{ error }}</p>

          <button class="btn" type="submit" :disabled="loading || !canSubmit">
            <UploadCloud :size="18" />
            {{ loading ? 'Submitting...' : 'Submit for Approval' }}
          </button>
        </form>
      </div>
    </section>
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  CheckCircle2,
  FilePenLine,
  FileText,
  Gamepad2,
  Image as ImageIcon,
  Layers3,
  Link2,
  PackageCheck,
  ShieldCheck,
  Type,
  UploadCloud
} from 'lucide-vue-next'
import WorkspaceNav from '../components/WorkspaceNav.vue'
import api, { getCurrentUser } from '../services/api'

const router = useRouter()
const user = getCurrentUser()

const games = ref([])
const message = ref('')
const error = ref('')
const loading = ref(false)
const previewUrl = ref('')

const canUpload = computed(() => {
  return user?.role === 'creator' || user?.role === 'admin'
})

const form = reactive({
  title: '',
  game_id: '',
  category: '',
  tags: '',
  description: '',
  download_url: '',
  image: null
})

const selectedGameName = computed(() => {
  const match = games.value.find((game) => String(game.id) === String(form.game_id))
  return match?.name || ''
})

const tagCount = computed(() => {
  return form.tags.split(',').map((tag) => tag.trim()).filter(Boolean).length
})

const hasValidDownloadLink = computed(() => {
  if (!form.download_url.trim()) return false

  try {
    const parsed = new URL(form.download_url)
    return parsed.protocol === 'https:' || parsed.protocol === 'http:'
  } catch (error) {
    return false
  }
})

const uploadReadinessChecks = computed(() => [
  {
    label: 'Clear title',
    passed: form.title.trim().length >= 5
  },
  {
    label: 'Game selected',
    passed: Boolean(form.game_id)
  },
  {
    label: 'Category set',
    passed: Boolean(form.category.trim())
  },
  {
    label: 'Detailed description',
    passed: form.description.trim().length >= 80
  },
  {
    label: 'Source link added',
    passed: hasValidDownloadLink.value
  },
  {
    label: 'Cover image ready',
    passed: Boolean(form.image)
  }
])

const uploadReadinessPercent = computed(() => {
  const passed = uploadReadinessChecks.value.filter((check) => check.passed).length
  return Math.round((passed / uploadReadinessChecks.value.length) * 100)
})

const downloadLinkLabel = computed(() => {
  if (!form.download_url.trim()) return 'Source link optional'
  return hasValidDownloadLink.value ? 'Source link valid' : 'Check source link'
})

const canSubmit = computed(() => {
  return form.title.trim().length >= 3
    && form.description.trim().length >= 20
    && Boolean(form.game_id)
    && Boolean(form.category.trim())
})

const readinessMessage = computed(() => {
  if (!form.title.trim()) return 'Add a title so the upload has a clear identity.'
  if (!form.game_id) return 'Pick the correct game collection before submitting.'
  if (!form.category.trim()) return 'Add a category so users can filter the mod properly.'
  if (form.description.trim().length < 80) return 'A longer description will help admin review it faster.'
  return 'Looks ready for review. Double-check the download link and preview image if you have them.'
})

function handleImage(event) {
  const file = event.target.files[0]
  form.image = file || null

  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
  }

  previewUrl.value = file ? URL.createObjectURL(file) : ''
}

async function submit() {
  message.value = ''
  error.value = ''
  loading.value = true

  try {
    const data = new FormData()

    Object.entries(form).forEach(([key, value]) => {
      if (value) data.append(key, value)
    })

    await api.post('/mods', data, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    message.value = 'Mod uploaded successfully. It is now pending admin approval.'
    alert('Mod uploaded successfully. It is now pending admin approval.')

    router.push('/my-mods')
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to upload mod'
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  try {
    games.value = (await api.get('/games')).data
  } catch (err) {
    error.value = 'Failed to load games'
  }
})

onBeforeUnmount(() => {
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
  }
})
</script>
