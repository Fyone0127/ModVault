import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'
export const UPLOAD_BASE_URL = import.meta.env.VITE_UPLOAD_BASE_URL || 'http://localhost:5000/uploads'

const api = axios.create({
  baseURL: API_BASE_URL
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('modvault_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export function saveSession(data) {
  localStorage.setItem('modvault_token', data.token)
  localStorage.setItem('modvault_user', JSON.stringify(data.user))
  window.dispatchEvent(new Event('session-changed'))
}

export function clearSession() {
  localStorage.removeItem('modvault_token')
  localStorage.removeItem('modvault_user')
  window.dispatchEvent(new Event('session-changed'))
}

export function getCurrentUser() {
  const raw = localStorage.getItem('modvault_user')
  return raw ? JSON.parse(raw) : null
}

export default api
