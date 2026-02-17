import { api } from '../utils/api'

const normalizeProduct = (product) => {
  const image = product.image || product.images?.[0] || ''
  return {
    ...product,
    image,
    images: product.images || (image ? [image] : []),
  }
}

export const getAllProducts = async (params = {}) => {
  const response = await api.get('/products', { params })
  return (response.data || []).map(normalizeProduct)
}

export const getProduct = async (id) => {
  const response = await api.get(`/products/${id}`)
  return normalizeProduct(response.data)
}

export const createProduct = async (payload) => {
  const response = await api.post('/products', payload)
  return normalizeProduct(response.data)
}

export const updateProduct = async (id, payload) => {
  const response = await api.put(`/products/${id}`, payload)
  return normalizeProduct(response.data)
}

export const deleteProduct = async (id) => {
  const response = await api.delete(`/products/${id}`)
  return response.data
}

