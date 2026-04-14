import axios from 'axios'
import { auth } from '../firebase/config'

const rawBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000'
const trimmedBaseUrl = rawBaseUrl.replace(/\/+$/, '')

export const apiBaseUrl = trimmedBaseUrl.endsWith('/api')
  ? trimmedBaseUrl
  : `${trimmedBaseUrl}/api`

export const api = axios.create({
  baseURL: apiBaseUrl,
  timeout: 15000,
})

api.interceptors.request.use(
  async (config) => {
    if (auth?.currentUser) {
      const token = await auth.currentUser.getIdToken()
      config.headers = config.headers || {}
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)
