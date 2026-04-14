import { api } from '../utils/api'

export const getUsers = async () => {
  const response = await api.get('/admin/users')
  return response.data || []
}

export const updateUser = async (id, payload) => {
  const response = await api.put(`/admin/users/${id}`, payload)
  return response.data
}
