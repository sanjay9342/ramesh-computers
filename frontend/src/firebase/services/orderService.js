import { toast } from 'react-toastify'
import { api } from '../../utils/api'

const withErrorToast = (message, error) => {
  console.error(message, error)
  toast.error(error?.response?.data?.error || message)
  throw error
}

export const getAllOrders = async () => {
  try {
    const response = await api.get('/orders')
    return response.data || []
  } catch (error) {
    withErrorToast('Failed to fetch orders', error)
  }
}

export const getUserOrders = async (userId) => {
  try {
    const response = await api.get(`/orders/user/${userId}`)
    return response.data || []
  } catch (error) {
    withErrorToast('Failed to fetch your orders', error)
  }
}

export const getOrder = async (id) => {
  try {
    const response = await api.get(`/orders/${id}`)
    return response.data
  } catch (error) {
    withErrorToast('Failed to fetch order', error)
  }
}

export const createOrder = async (orderData) => {
  try {
    const response = await api.post('/orders', orderData)
    return response.data
  } catch (error) {
    withErrorToast('Failed to place order', error)
  }
}

export const updateOrderStatus = async (id, status) => {
  try {
    const response = await api.put(`/orders/${id}/status`, { status })
    toast.success('Order status updated successfully!')
    return response.data
  } catch (error) {
    withErrorToast('Failed to update order status', error)
  }
}

export const createRazorpayPaymentOrder = async (amount) => {
  try {
    const response = await api.post('/orders/payment/razorpay-order', { amount })
    return response.data
  } catch (error) {
    withErrorToast('Failed to initialize payment', error)
  }
}

export const verifyRazorpayPayment = async (payload) => {
  try {
    const response = await api.post('/orders/payment/verify', payload)
    return response.data
  } catch (error) {
    withErrorToast('Payment verification failed', error)
  }
}
