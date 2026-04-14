import { api } from '../utils/api'

export const validateCoupon = async ({ code, subtotal }) => {
  const response = await api.post('/coupons/validate', { code, subtotal })
  return response.data
}

export const getAllCoupons = async () => {
  const response = await api.get('/coupons')
  return response.data || []
}

export const createCoupon = async (payload) => {
  const response = await api.post('/coupons', payload)
  return response.data
}

export const updateCoupon = async (id, payload) => {
  const response = await api.put(`/coupons/${id}`, payload)
  return response.data
}

export const toggleCouponStatus = async (id, active) => {
  const response = await api.patch(`/coupons/${id}/status`, { active })
  return response.data
}

export const deleteCoupon = async (id) => {
  const response = await api.delete(`/coupons/${id}`)
  return response.data
}
