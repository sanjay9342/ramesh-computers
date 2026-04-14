import { toast } from 'react-toastify'
import { api } from '../../utils/api'

const withErrorToast = (message, error) => {
  console.error(message, error)
  const responseData = error?.response?.data
  const detail =
    responseData?.error
    || (typeof responseData === 'string' ? responseData : null)
    || error?.message
  toast.error(detail || message)
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

export const createRazorpayPaymentOrder = async ({ items, couponCode }) => {
  try {
    const response = await api.post('/orders/payment/razorpay-order', { items, couponCode })
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

export const cancelOrder = async (orderId, userId) => {
  try {
    const response = await api.post(`/orders/${orderId}/cancel`, { userId })
    toast.success('Order cancelled successfully')
    return response.data
  } catch (error) {
    withErrorToast('Failed to cancel order', error)
  }
}

export const submitProductRating = async (orderId, productId, userId, rating) => {
  try {
    const response = await api.post(`/orders/${orderId}/items/${productId}/rating`, {
      userId,
      rating,
    })
    toast.success('Thanks for your rating!')
    return response.data
  } catch (error) {
    withErrorToast('Failed to submit rating', error)
  }
}
