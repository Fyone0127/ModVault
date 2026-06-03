import { createRouter, createWebHistory } from 'vue-router'

import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import ForgotPassword from '../views/ForgotPassword.vue'
import ResetPassword from '../views/ResetPassword.vue'
import Games from '../views/Games.vue'
import Mods from '../views/Mods.vue'
import ModDetail from '../views/ModDetail.vue'
import Favourites from '../views/Favourites.vue'
import Dashboard from '../views/Dashboard.vue'
import UploadMod from '../views/UploadMod.vue'
import MyMods from '../views/MyMods.vue'
import ReviewHistory from '../views/ReviewHistory.vue'
import AdminApprovals from '../views/AdminApprovals.vue'
import ApplyCreator from '../views/ApplyCreator.vue'
import AdminCreatorRequests from '../views/AdminCreatorRequests.vue'
import AdminAddGame from '../views/AdminAddGame.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/register',
    name: 'Register',
    component: Register
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: ForgotPassword
  },
  {
    path: '/reset-password',
    name: 'ResetPassword',
    component: ResetPassword
  },
  {
    path: '/games',
    name: 'Games',
    component: Games
  },
  {
    path: '/mods',
    name: 'Mods',
    component: Mods
  },
  {
    path: '/mods/:id',
    name: 'ModDetail',
    component: ModDetail,
    props: true
  },
  {
    path: '/favourites',
    name: 'Favourites',
    component: Favourites,
    meta: {
      requiresAuth: true,
      roles: ['user', 'creator']
    }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: {
      requiresAuth: true,
      roles: ['user', 'creator', 'admin']
    }
  },
  {
    path: '/apply-creator',
    name: 'ApplyCreator',
    component: ApplyCreator,
    meta: {
      requiresAuth: true,
      roles: ['user']
    }
  },
  {
    path: '/upload',
    name: 'UploadMod',
    component: UploadMod,
    meta: {
      requiresAuth: true,
      roles: ['creator', 'admin']
    }
  },
  {
    path: '/my-mods',
    name: 'MyMods',
    component: MyMods,
    meta: {
      requiresAuth: true,
      roles: ['creator', 'admin']
    }
  },
  {
    path: '/reviews',
    name: 'ReviewHistory',
    component: ReviewHistory,
    meta: {
      requiresAuth: true,
      roles: ['user', 'creator']
    }
  },
  {
    path: '/admin/approvals',
    name: 'AdminApprovals',
    component: AdminApprovals,
    meta: {
      requiresAuth: true,
      roles: ['admin']
    }
  },
  {
    path: '/admin/creator-requests',
    name: 'AdminCreatorRequests',
    component: AdminCreatorRequests,
    meta: {
      requiresAuth: true,
      roles: ['admin']
    }
  },
  {
    path: '/admin/games/new',
    name: 'AdminAddGame',
    component: AdminAddGame,
    meta: {
      requiresAuth: true,
      roles: ['admin']
    }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to) {
    if (to.hash) {
      return {
        el: to.hash,
        top: 90,
        behavior: 'smooth'
      }
    }

    return { top: 0 }
  }
})

function getStoredUser() {
  const rawUser = localStorage.getItem('modvault_user')

  if (!rawUser) {
    return null
  }

  try {
    return JSON.parse(rawUser)
  } catch (error) {
    localStorage.removeItem('modvault_user')
    localStorage.removeItem('modvault_token')
    return null
  }
}

router.beforeEach((to) => {
  const token = localStorage.getItem('modvault_token')
  const user = getStoredUser()

  if (to.meta.requiresAuth && !token) {
    return '/login'
  }

  if (to.meta.roles && user) {
    const allowedRoles = to.meta.roles

    if (!allowedRoles.includes(user.role)) {
      return '/dashboard'
    }
  }

  if ((to.path === '/login' || to.path === '/register' || to.path === '/forgot-password' || to.path === '/reset-password') && token) {
    return '/dashboard'
  }
})

export default router
