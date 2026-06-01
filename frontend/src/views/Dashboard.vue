<template>
  <section class="role-dashboard-page" :class="dashboardConfig.pageClass">
    <WorkspaceNav
      v-if="dashboardConfig.workspaceMode"
      :mode="dashboardConfig.workspaceMode"
      :standalone="false"
    />

    <section class="page-banner role-hero" :class="dashboardConfig.heroClass">
      <div>
        <p class="eyebrow">{{ dashboardConfig.eyebrow }}</p>
        <h1>{{ dashboardConfig.title }}</h1>
        <p>{{ dashboardConfig.description }}</p>

        <div class="cta-row">
          <RouterLink
            v-for="(action, index) in dashboardConfig.heroActions"
            :key="action.to"
            :class="index === 0 ? 'btn' : 'btn-secondary'"
            :to="action.to"
          >
            <component :is="action.icon" :size="18" />
            {{ action.label }}
          </RouterLink>
        </div>
      </div>

      <aside class="role-hero-panel">
        <span class="role-emblem">
          <component :is="dashboardConfig.badgeIcon" :size="34" />
        </span>

        <p>{{ dashboardConfig.roleLabel }}</p>
        <h2>{{ dashboardConfig.badgeTitle }}</h2>

        <div class="role-meter">
          <span :style="{ width: `${dashboardConfig.readiness}%` }"></span>
        </div>

        <small>{{ dashboardConfig.readinessText }}</small>
      </aside>
    </section>

    <section class="grid dashboard-stat-grid">
      <article
        v-for="card in dashboardConfig.stats"
        :key="card.label"
        class="dashboard-stat-card role-stat-card"
      >
        <span class="dashboard-stat-icon">
          <component :is="card.icon" :size="22" />
        </span>

        <p>{{ card.label }}</p>
        <h2>{{ card.value }}</h2>
        <small>{{ card.caption }}</small>
      </article>
    </section>

    <section class="role-command-grid single-panel">
      <article class="card role-focus-card">
        <div class="card-body">
          <p class="eyebrow">{{ dashboardConfig.focusEyebrow }}</p>
          <h2>{{ dashboardConfig.focusTitle }}</h2>

          <div class="role-focus-list">
            <RouterLink
              v-for="item in dashboardConfig.focus"
              :key="item.title"
              class="role-focus-item"
              :to="item.to"
            >
              <span>
                <component :is="item.icon" :size="20" />
              </span>

              <div>
                <strong>{{ item.title }}</strong>
                <p>{{ item.text }}</p>
              </div>
            </RouterLink>
          </div>
        </div>
      </article>

    </section>

    <section
      v-if="dashboardConfig.studio"
      class="creator-studio-grid"
      aria-label="Creator studio snapshot"
    >
      <article class="card creator-studio-health">
        <div class="card-body">
          <p class="eyebrow">{{ dashboardConfig.studio.eyebrow }}</p>
          <h2>{{ dashboardConfig.studio.title }}</h2>
          <p class="muted">{{ dashboardConfig.studio.text }}</p>

          <div class="creator-studio-meter">
            <span :style="{ width: `${dashboardConfig.studio.progress}%` }"></span>
          </div>
          <small>{{ dashboardConfig.studio.progressLabel }}</small>

          <div class="creator-studio-metrics">
            <article
              v-for="metric in dashboardConfig.studio.metrics"
              :key="metric.label"
            >
              <strong>{{ metric.value }}</strong>
              <span>{{ metric.label }}</span>
            </article>
          </div>
        </div>
      </article>

      <article class="card creator-studio-plan">
        <div class="card-body">
          <p class="eyebrow">Release plan</p>
          <h2>Keep the pipeline warm</h2>

          <div class="creator-studio-checklist">
            <RouterLink
              v-for="item in dashboardConfig.studio.checklist"
              :key="item.title"
              :to="item.to"
            >
              <span>
                <component :is="item.icon" :size="18" />
              </span>

              <div>
                <strong>{{ item.title }}</strong>
                <p>{{ item.text }}</p>
              </div>
            </RouterLink>
          </div>
        </div>
      </article>
    </section>

    <section
      v-if="dashboardConfig.collection"
      class="grid user-dashboard-grid"
    >
      <article class="card user-journey-card">
        <div class="card-body">
          <p class="eyebrow">{{ dashboardConfig.collection.eyebrow }}</p>
          <h2>{{ dashboardConfig.collection.title }}</h2>
          <p class="muted">{{ dashboardConfig.collection.text }}</p>

          <div class="user-journey-progress">
            <div class="role-meter mini">
              <span :style="{ width: `${dashboardConfig.collection.progress}%` }"></span>
            </div>
            <small>{{ dashboardConfig.collection.progressLabel }}</small>
          </div>

          <div class="user-journey-milestones">
            <div
              v-for="item in dashboardConfig.collection.milestones"
              :key="item.label"
              class="user-journey-milestone"
            >
              <strong>{{ item.value }}</strong>
              <span>{{ item.label }}</span>
            </div>
          </div>
        </div>
      </article>

      <article class="card user-insight-card">
        <div class="card-body">
          <p class="eyebrow">{{ dashboardConfig.collection.nextEyebrow }}</p>
          <h2>{{ dashboardConfig.collection.nextTitle }}</h2>

          <div class="user-insight-list">
            <RouterLink
              v-for="item in dashboardConfig.collection.nextSteps"
              :key="item.title"
              class="user-insight-item"
              :to="item.to"
            >
              <span>
                <component :is="item.icon" :size="18" />
              </span>

              <div>
                <strong>{{ item.title }}</strong>
                <p>{{ item.text }}</p>
              </div>
            </RouterLink>
          </div>
        </div>
      </article>
    </section>

    <section class="section-title">
      <div>
        <p class="eyebrow">{{ dashboardConfig.toolsEyebrow }}</p>
        <h2>{{ dashboardConfig.toolsTitle }}</h2>
      </div>
    </section>

    <section class="grid role-action-grid enhanced-role-grid">
      <RouterLink
        v-for="action in dashboardConfig.actions"
        :key="action.to + action.title"
        class="role-action-card enhanced-action-card"
        :to="action.to"
      >
        <span class="feature-icon">
          <component :is="action.icon" :size="22" />
        </span>

        <h3>{{ action.title }}</h3>
        <p>{{ action.text }}</p>
      </RouterLink>
    </section>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import {
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  Download,
  FileText,
  FolderKanban,
  Gamepad2,
  Heart,
  Package,
  Rocket,
  Search,
  ShieldCheck,
  Star,
  UploadCloud,
  UserRound,
  Users,
  Wrench
} from 'lucide-vue-next'
import WorkspaceNav from '../components/WorkspaceNav.vue'
import api, { getCurrentUser } from '../services/api'

const user = getCurrentUser()
const stats = ref({})

function count(value) {
  return Number(value || 0)
}

function percent(value, total) {
  if (!total) return 0
  return Math.min(100, Math.round((value / total) * 100))
}

const dashboardConfig = computed(() => {
  const role = user?.role || 'user'

  if (role === 'admin') {
    const published = count(stats.value.publishedMods || stats.value.mods)
    const pending = count(stats.value.pendingMods || stats.value.pending)
    const totalMods = published + pending
    const approvalRate = totalMods ? percent(published, totalMods) : 100

    return {
      heroClass: 'admin-banner',
      workspaceMode: 'admin',
      eyebrow: 'Admin command center',
      title: `Welcome, ${user?.username || 'Admin'}`,
      description: 'Prioritise moderation work, keep the catalogue clean, and manage creator access from one focused workspace.',
      roleLabel: 'Admin',
      badgeTitle: 'Moderator Access',
      badgeIcon: ShieldCheck,
      readiness: approvalRate,
      readinessText: `${approvalRate}% publication balance`,
      heroActions: [
        { label: 'Review Mods', to: '/admin/approvals', icon: ClipboardCheck },
        { label: 'Creator Requests', to: '/admin/creator-requests', icon: Users },
        { label: 'Add Game', to: '/admin/games/new', icon: Gamepad2 }
      ],
      stats: [
        { label: 'Total Games', value: count(stats.value.games), caption: 'Public collections', icon: Gamepad2 },
        { label: 'Published Mods', value: published, caption: 'Visible to users', icon: Package },
        { label: 'Pending Mods', value: pending, caption: 'Waiting review', icon: Clock3 },
        { label: 'Total Users', value: count(stats.value.users), caption: 'Registered accounts', icon: Users }
      ],
      focusEyebrow: 'Today priority',
      focusTitle: 'Moderation queue',
      focus: [
        { title: 'Clear pending uploads', text: `${pending} mod${pending === 1 ? '' : 's'} waiting for decision`, to: '/admin/approvals', icon: ClipboardCheck },
        { title: 'Review creator access', text: 'Check whether applicants are ready to upload responsibly', to: '/admin/creator-requests', icon: UserRound },
        { title: 'Expand the library', text: 'Add new game collections when the catalogue needs another world', to: '/admin/games/new', icon: Gamepad2 }
      ],
      toolsEyebrow: 'Admin tools',
      toolsTitle: 'Moderation actions',
      actions: [
        { title: 'Approve Mods', text: 'Review creator submissions before they become public.', to: '/admin/approvals', icon: CheckCircle2 },
        { title: 'Creator Requests', text: 'Approve or reject users who apply to become creators.', to: '/admin/creator-requests', icon: UserRound },
        { title: 'Add Game', text: 'Create a new game collection so creators can upload mods under it.', to: '/admin/games/new', icon: Gamepad2 }
      ]
    }
  }

  if (role === 'creator') {
    const uploaded = count(stats.value.myMods)
    const approved = count(stats.value.approved)
    const pending = count(stats.value.pending)
    const rejected = count(stats.value.rejected)
    const approvalRate = uploaded ? percent(approved, uploaded) : 0
    const releaseScore = uploaded
      ? Math.min(100, Math.max(approvalRate, 18) + (pending ? 5 : 16) + (count(stats.value.reviews) ? 8 : 0))
      : 12

    return {
      heroClass: 'creator-banner',
      pageClass: 'creator-mode-page',
      workspaceMode: 'creator',
      eyebrow: 'Creator studio',
      title: 'Manage your mod releases',
      description: 'Track submissions, prepare cleaner uploads, and measure how your published mods are performing.',
      roleLabel: 'Creator',
      badgeTitle: 'Upload Access',
      badgeIcon: UploadCloud,
      readiness: Math.max(approvalRate, uploaded ? 20 : 0),
      readinessText: uploaded ? `${approvalRate}% approved` : 'Ready for first upload',
      heroActions: [
        { label: 'Upload Mod', to: '/upload', icon: UploadCloud },
        { label: 'My Mods', to: '/my-mods', icon: FolderKanban }
      ],
      stats: [
        { label: 'My Uploaded Mods', value: uploaded, caption: 'All submissions', icon: Package },
        { label: 'Approved', value: approved, caption: 'Published mods', icon: CheckCircle2 },
        { label: 'Pending', value: pending, caption: 'In admin review', icon: Clock3 },
        { label: 'ModVault Clicks', value: count(stats.value.downloads), caption: 'Audience activity', icon: Download }
      ],
      focusEyebrow: 'Creator flow',
      focusTitle: 'Next best steps',
      focus: [
        { title: 'Prepare a polished upload', text: 'Use strong tags, a clear category, and a trustworthy source link', to: '/upload', icon: UploadCloud },
        { title: 'Track review status', text: `${pending} pending, ${rejected} rejected, ${approved} approved`, to: '/my-mods', icon: FolderKanban },
        { title: 'Study community feedback', text: `${count(stats.value.reviews)} review${count(stats.value.reviews) === 1 ? '' : 's'} written by you`, to: '/reviews', icon: Star }
      ],
      studio: {
        eyebrow: 'Studio health',
        title: uploaded ? 'Release pipeline snapshot' : 'Your first release starts here',
        text: uploaded
          ? 'Use this snapshot to decide whether to polish a pending upload, inspect published work, or write more community feedback.'
          : 'Upload your first mod to start building an approval history and creator presence.',
        progress: releaseScore,
        progressLabel: uploaded ? `${releaseScore}% creator momentum` : 'No release history yet',
        metrics: [
          { label: 'Approval rate', value: uploaded ? `${approvalRate}%` : '0%' },
          { label: 'In review', value: pending },
          { label: 'Feedback notes', value: count(stats.value.reviews) }
        ],
        checklist: [
          {
            title: uploaded ? 'Prepare the next submission' : 'Create your first upload',
            text: 'Keep the title tight, category clear, and source link trustworthy.',
            to: '/upload',
            icon: UploadCloud
          },
          {
            title: pending ? 'Watch pending reviews' : 'Audit your release list',
            text: pending ? `${pending} upload${pending === 1 ? '' : 's'} still waiting for admin review.` : 'Check approved, rejected, and pending states from one release tracker.',
            to: '/my-mods',
            icon: FolderKanban
          },
          {
            title: 'Stay close to player feedback',
            text: 'Writing and reading reviews helps sharpen what good mod notes look like.',
            to: '/reviews',
            icon: Star
          }
        ]
      },
      toolsEyebrow: 'Creator tools',
      toolsTitle: 'Your workflow',
      actions: [
        { title: 'Upload Mod', text: 'Submit a new mod with title, category, description, image, and download link.', to: '/upload', icon: UploadCloud },
        { title: 'My Mods', text: 'Track whether your uploaded mods are pending, approved, or rejected.', to: '/my-mods', icon: FolderKanban },
        { title: 'Review History', text: 'View reviews you have submitted for other mods.', to: '/reviews', icon: Star }
      ]
    }
  }

  const favourites = count(stats.value.favourites)
  const reviews = count(stats.value.reviews)
  const availableMods = count(stats.value.mods)
  const games = count(stats.value.games)
  const collectionScore = Math.min(100, favourites * 20 + reviews * 15)
  const nextFavouriteGoal = favourites >= 5 ? favourites : 5
  const nextReviewGoal = reviews >= 3 ? reviews : 3
  const discoveryPercent = Math.min(100, favourites * 14 + reviews * 18 + (games ? 10 : 0))

  return {
    pageClass: 'player-mode-page',
    heroClass: 'user-banner',
    workspaceMode: 'player',
    eyebrow: 'Player dashboard',
    title: `Welcome, ${user?.username || 'Player'}`,
    description: 'Build a saved collection, review mods you try, and apply for creator access when you are ready.',
    roleLabel: 'User',
    badgeTitle: 'Community Access',
    badgeIcon: UserRound,
    readiness: Math.max(collectionScore, 12),
    readinessText: favourites || reviews ? 'Collection is growing' : 'Start your first collection',
    heroActions: [
      { label: 'Browse Mods', to: '/mods', icon: Search },
      { label: 'Apply Creator', to: '/apply-creator', icon: Wrench }
    ],
    stats: [
      { label: 'Saved Favourites', value: favourites, caption: 'Stored mods', icon: Heart },
      { label: 'Reviews Written', value: reviews, caption: 'Community feedback', icon: Star },
      { label: 'Available Games', value: games, caption: 'Game worlds', icon: Gamepad2 },
      { label: 'Available Mods', value: availableMods, caption: 'Catalogue items', icon: Package }
    ],
    focusEyebrow: 'Player flow',
    focusTitle: 'Build your vault',
    focus: [
      { title: 'Browse the catalogue', text: 'Find mods by game, category, keyword, and rating', to: '/mods', icon: Search },
      { title: 'Save strong finds', text: `${favourites} favourite${favourites === 1 ? '' : 's'} saved so far`, to: '/favourites', icon: Heart },
      { title: 'Share useful reviews', text: `${reviews} review${reviews === 1 ? '' : 's'} written`, to: '/reviews', icon: Star }
    ],
    collection: {
      eyebrow: 'Collection status',
      title: favourites || reviews ? 'Your mod taste is taking shape' : 'Start your first collection run',
      text: favourites || reviews
        ? 'Keep building a sharper library with saved finds and useful review notes.'
        : 'Browse a few games, save the mods you like, and leave a review once you try one.',
      progress: Math.max(discoveryPercent, 10),
      progressLabel: favourites || reviews
        ? `${discoveryPercent}% profile momentum`
        : 'Open a few collections to get started',
      milestones: [
        { label: 'Saved mods', value: favourites },
        { label: 'Reviews shared', value: reviews },
        { label: 'Games to explore', value: games }
      ],
      nextEyebrow: 'Next milestone',
      nextTitle: 'Good next moves',
      nextSteps: [
        {
          title: favourites < 5 ? `Save ${nextFavouriteGoal - favourites} more favourites` : 'Refresh your favourites list',
          text: favourites < 5 ? 'Build a stronger shortlist you can come back to quickly.' : 'Revisit your saved picks and look for new standouts.',
          to: '/mods',
          icon: Heart
        },
        {
          title: reviews < 3 ? `Write ${nextReviewGoal - reviews} more review${nextReviewGoal - reviews === 1 ? '' : 's'}` : 'Keep sharing helpful reviews',
          text: reviews < 3 ? 'A few ratings and comments make your dashboard feel more alive.' : 'Your feedback already adds value, so keep the momentum going.',
          to: '/reviews',
          icon: Star
        },
        {
          title: 'Step toward creator access',
          text: 'When you are ready, apply to upload your own mod projects and join the creator side of ModVault.',
          to: '/apply-creator',
          icon: Rocket
        }
      ]
    },
    toolsEyebrow: 'Quick access',
    toolsTitle: 'Your activity',
    actions: [
      { title: 'Favourites', text: 'Open your saved mod collection and revisit mods you like.', to: '/favourites', icon: Heart },
      { title: 'My Reviews', text: 'Check your previous ratings and comments.', to: '/reviews', icon: FileText },
      { title: 'Become a Creator', text: 'Apply for creator access to upload your own mods.', to: '/apply-creator', icon: Rocket }
    ]
  }
})

async function loadStats() {
  try {
    const response = await api.get('/dashboard')
    stats.value = response.data
  } catch (error) {
    console.error(error)

    stats.value = {
      games: 0,
      mods: 0,
      publishedMods: 0,
      pendingMods: 0,
      users: 0,
      myMods: 0,
      favourites: 0,
      reviews: 0,
      downloads: 0
    }
  }
}

onMounted(loadStats)

</script>
