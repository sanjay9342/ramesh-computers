import { api } from '../utils/api'

export const getAllBanners = async () => {
  const response = await api.get('/banners')
  return response.data || []
}

export const getActiveBanners = async () => {
  const response = await api.get('/banners', { params: { active: true } })
  return response.data || []
}

export const getBanner = async (id) => {
  const response = await api.get(`/banners/${id}`)
  return response.data
}

export const createBanner = async (payload) => {
  const response = await api.post('/banners', payload)
  return response.data
}

export const updateBanner = async (id, payload) => {
  const response = await api.put(`/banners/${id}`, payload)
  return response.data
}

export const toggleBannerStatus = async (id, active) => {
  const response = await api.patch(`/banners/${id}/status`, { active })
  return response.data
}

export const deleteBanner = async (id) => {
  const response = await api.delete(`/banners/${id}`)
  return response.data
}

