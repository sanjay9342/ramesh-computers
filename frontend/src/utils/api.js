import axios from 'axios'

const rawBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000'
const trimmedBaseUrl = rawBaseUrl.replace(/\/+$/, '')

export const apiBaseUrl = trimmedBaseUrl.endsWith('/api')
  ? trimmedBaseUrl
  : `${trimmedBaseUrl}/api`

export const api = axios.create({
  baseURL: apiBaseUrl,
  timeout: 15000,
})

