import React, { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import {
  FaBox,
  FaCheck,
  FaHome,
  FaRegStar,
  FaShippingFast,
  FaStar,
  FaTruck,
  FaExclamationTriangle,
  FaTimesCircle,
} from 'react-icons/fa'
import { cancelOrder, getOrder, submitProductRating } from '../firebase/services/orderService'
import LoadingScreen from '../components/LoadingScreen'
import { formatCurrency } from '../utils/formatters'

function OrderDetails() {
  const { id } = useParams()
  const location = useLocation()
  const { user } = useSelector((state) => state.user)

  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [ratingDrafts, setRatingDrafts] = useState({})
  const [ratingSubmitting, setRatingSubmitting] = useState(null)
  const [cancellingOrderId, setCancellingOrderId] = useState(null)
  const [confirmingCancel, setConfirmingCancel] = useState(false)
  const [cancelAnimating, setCancelAnimating] = useState(false)
  const [showConfirmAnimation, setShowConfirmAnimation] = useState(Boolean(location.state?.justPlaced))

  useEffect(() => {
    if (!showConfirmAnimation) return
    const timer = setTimeout(() => setShowConfirmAnimation(false), 2400)
    return () => clearTimeout(timer)
  }, [showConfirmAnimation])

  useEffect(() => {
    let ignore = false

    const loadOrder = async () => {
      if (!user?.uid || !id) {
        setLoading(false)
        return
      }
      setLoading(true)
      setError('')
      try {
        const data = await getOrder(id)
        if (!ignore) {
          setOrder(data || null)
          if (!data) setError('Order not found.')
        }
      } catch (err) {
        if (!ignore) setError('Unable to load order details.')
      } finally {
        if (!ignore) setLoading(false)
      }
    }

    loadOrder()
    return () => {
      ignore = true
    }
  }, [id, user?.uid])

  const getStatusSteps = (status) => {
    const steps = [
      { key: 'confirmed', label: 'Order Confirmed', icon: FaCheck },
      { key: 'packed', label: 'Packed', icon: FaBox },
      { key: 'shipped', label: 'Shipped', icon: FaTruck },
      { key: 'out_for_delivery', label: 'Out for Delivery', icon: FaShippingFast },
      { key: 'delivered', label: 'Delivered', icon: FaHome },
    ]
    const statusOrder = ['confirmed', 'packed', 'shipped', 'out_for_delivery', 'delivered']
    const currentIndex = statusOrder.indexOf(status)
    return steps.map((step, index) => ({
      ...step,
      completed: index <= currentIndex,
      current: index === currentIndex,
    }))
  }

  const getStatusProgress = (status) => {
    const statusOrder = ['confirmed', 'packed', 'shipped', 'out_for_delivery', 'delivered']
    const currentIndex = statusOrder.indexOf(status)
    if (currentIndex < 0) return 0
    if (statusOrder.length <= 1) return 0
    return Math.round((currentIndex / (statusOrder.length - 1)) * 100)
  }

  const getStatusColor = (status) => {
    if (status === 'confirmed') return 'bg-fk-blue text-white'
    if (status === 'packed') return 'bg-fk-yellow text-white'
    if (status === 'shipped') return 'bg-fk-teal text-white'
    if (status === 'out_for_delivery') return 'bg-fk-yellow-dark text-white'
    if (status === 'delivered') return 'bg-fk-blue-dark text-white'
    if (status === 'cancelled') return 'bg-red-500 text-white'
    return 'bg-gray-500 text-white'
  }

  const canCancelOrder = (status) => status === 'confirmed' || status === 'packed'

  const formatDate = (dateValue) => {
    if (!dateValue) return 'N/A'
    return new Date(dateValue).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  const getRatingKey = (orderId, productId) => `${orderId}:${productId}`

  const renderStars = (rating) => (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((value) => (
        value <= rating
          ? <FaStar key={value} className="text-fk-yellow text-sm" />
          : <FaRegStar key={value} className="text-fk-yellow text-sm" />
      ))}
    </div>
  )

  const handleRatingSelect = (orderId, productId, rating) => {
    const key = getRatingKey(orderId, productId)
    setRatingDrafts((prev) => ({ ...prev, [key]: rating }))
  }

  const handleSubmitRating = async (orderId, productId) => {
    const key = getRatingKey(orderId, productId)
    const rating = ratingDrafts[key]
    if (!rating || !user?.uid) return

    setRatingSubmitting(key)
    try {
      await submitProductRating(orderId, productId, user.uid, rating)
      setOrder((prev) => {
        if (!prev) return prev
        const nextRatings = {
          ...(prev.itemRatings || {}),
          [productId]: { rating, ratedAt: new Date().toISOString() },
        }
        return { ...prev, itemRatings: nextRatings }
      })
      setRatingDrafts((prev) => {
        const next = { ...prev }
        delete next[key]
        return next
      })
    } catch (error) {
      console.error('Error submitting rating:', error)
    } finally {
      setRatingSubmitting(null)
    }
  }

  const requestCancelOrder = () => {
    setConfirmingCancel(true)
  }

  const closeCancelPrompt = () => {
    setConfirmingCancel(false)
  }

  const handleCancelOrder = async () => {
    if (!user?.uid || !order?.id) return
    setCancellingOrderId(order.id)
    setConfirmingCancel(false)
    try {
      const updated = await cancelOrder(order.id, user.uid)
      if (!updated) return
      setOrder((prev) => ({ ...prev, ...updated }))
      setCancelAnimating(true)
      setTimeout(() => setCancelAnimating(false), 900)
    } catch (error) {
      console.error('Error cancelling order:', error)
    } finally {
      setCancellingOrderId(null)
    }
  }

  if (loading) {
    return <LoadingScreen text="Loading order details..." />
  }

  if (error || !order) {
    return (
      <div className="bg-fk-bg min-h-screen py-8">
        <div className="w-full px-0">
          <div className="bg-white rounded shadow-fk p-8 text-center">
            <FaBox className="text-6xl text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Order not found</h2>
            <p className="text-gray-500 mb-6">{error || 'We could not find that order.'}</p>
            <Link to="/orders" className="inline-block bg-fk-blue text-white px-6 py-3 rounded font-medium hover:bg-fk-blue-dark transition-colors">
              Back to My Orders
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-fk-bg min-h-screen py-4">
      <div className="w-full px-0">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Order Details</h1>
            <p className="text-sm text-gray-500">Order #{order.id} · Placed on {formatDate(order.orderedAt)}</p>
          </div>
          <Link to="/orders" className="text-fk-blue text-sm font-medium hover:underline">
            Back to My Orders
          </Link>
        </div>

        {showConfirmAnimation && (
          <div className="mb-6">
            <div className="order-confirmation-card">
              <div className="order-confirmation-icon">
                <FaCheck className="order-confirmation-check" />
                <span className="order-confirmation-burst b1" />
                <span className="order-confirmation-burst b2" />
                <span className="order-confirmation-burst b3" />
                <span className="order-confirmation-burst b4" />
                <span className="order-confirmation-burst b5" />
                <span className="order-confirmation-burst b6" />
              </div>
              <div className="flex-1">
                <p className="text-xs uppercase tracking-wide text-green-700 font-semibold">Order confirmed</p>
                <h2 className="text-lg md:text-xl font-bold text-gray-900">Thanks! Your order is placed.</h2>
                <p className="text-sm text-gray-600">Order #{order.id} is being processed.</p>
              </div>
              <div className="order-confirmation-sheen" />
            </div>
          </div>
        )}

        <div className={`bg-white rounded shadow-fk p-6 space-y-6 ${cancelAnimating ? 'order-cancelled-flash' : ''}`}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm text-gray-500">Order ID</p>
              <p className="text-lg font-bold text-gray-900">#{order.id}</p>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)} ${
                  order.status === 'confirmed' ? 'order-status-confirmed' : ''
                } ${order.status === 'cancelled' ? 'order-status-cancelled' : ''}`}
              >
                {(order.status || 'unknown').replace(/_/g, ' ')}
              </span>
            </div>
          </div>

          {confirmingCancel && (
            <div className="border border-red-100 bg-red-50 rounded-lg px-4 py-3 flex flex-wrap items-center justify-between gap-3 order-cancel-confirm">
              <div className="flex items-center gap-2 text-red-700 text-sm">
                <FaExclamationTriangle className="text-red-500" />
                <span>Are you sure you want to cancel this order?</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCancelOrder}
                  disabled={cancellingOrderId === order.id}
                  className="text-xs md:text-sm px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
                >
                  Yes, cancel
                </button>
                <button
                  type="button"
                  onClick={closeCancelPrompt}
                  className="text-xs md:text-sm px-3 py-1 rounded border border-gray-300 text-gray-700 hover:bg-gray-100"
                >
                  Keep order
                </button>
              </div>
            </div>
          )}

          {order.status !== 'cancelled' && (
            <div>
              <h3 className="font-bold text-gray-800 mb-3">Order Status</h3>
              <div className="order-steps-scroll overflow-x-auto pb-2">
                <div className="order-steps-track relative min-w-[520px]">
                  <div className="order-steps-line" />
                  <div
                    className="order-steps-progress order-progress-bar"
                    style={{ width: `${getStatusProgress(order.status)}%` }}
                  />
                  <div className="relative z-10 flex items-start justify-between gap-4">
                    {getStatusSteps(order.status).map((step) => (
                      <div key={step.key} className="flex flex-col items-center flex-1 min-w-[90px]">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            step.completed ? 'bg-fk-yellow text-white' : 'bg-gray-200 text-gray-400'
                          } ${order.status === 'confirmed' && step.key === 'confirmed' ? 'order-step-confirmed' : ''}`}
                        >
                          <step.icon />
                        </div>
                        <p className={`text-xs mt-2 text-center ${step.current ? 'font-bold text-fk-blue' : 'text-gray-500'}`}>{step.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div>
            <h3 className="font-bold text-gray-800 mb-3">Items</h3>
            <div className="space-y-3">
              {(order.items || []).map((item, index) => (
                <div key={`${order.id}-${index}`} className="flex gap-4">
                  <img src={item.image} alt={item.title} className="w-16 h-16 object-contain" />
                  <div className="flex-1">
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    {order.status === 'delivered' && (
                      <div className="mt-2">
                        {order.itemRatings?.[item.id]?.rating ? (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span>Your rating:</span>
                            {renderStars(order.itemRatings[item.id].rating)}
                          </div>
                        ) : (
                          <div className="flex flex-wrap items-center gap-2">
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((value) => {
                                const key = getRatingKey(order.id, item.id)
                                const selected = ratingDrafts[key] || 0
                                return (
                                  <button
                                    key={value}
                                    type="button"
                                    onClick={() => handleRatingSelect(order.id, item.id, value)}
                                    className="text-fk-yellow hover:scale-105 transition-transform"
                                    aria-label={`Rate ${value} star`}
                                  >
                                    {value <= selected ? <FaStar /> : <FaRegStar />}
                                  </button>
                                )
                              })}
                            </div>
                            <button
                              type="button"
                              onClick={() => handleSubmitRating(order.id, item.id)}
                              disabled={!ratingDrafts[getRatingKey(order.id, item.id)] || ratingSubmitting === getRatingKey(order.id, item.id)}
                              className="text-xs px-3 py-1 rounded bg-fk-blue text-white hover:bg-fk-blue-dark disabled:opacity-60"
                            >
                              {ratingSubmitting === getRatingKey(order.id, item.id) ? 'Submitting...' : 'Submit'}
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <p className="font-bold">{formatCurrency(item.price)}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Payment Method</span>
              <span className="font-medium">{order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Delivery Address</span>
              <span className="font-medium text-right">
                {order.shippingAddress?.name}, {order.shippingAddress?.street}, {order.shippingAddress?.city}, {order.shippingAddress?.pincode}
              </span>
            </div>
            {order.couponCode ? (
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Coupon</span>
                <span className="font-medium">{order.couponCode}</span>
              </div>
            ) : null}
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">{formatCurrency(order.subtotal || order.totalAmount)}</span>
            </div>
            {Number(order.discountAmount || 0) > 0 ? (
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Discount</span>
                <span className="font-medium text-fk-teal">-{formatCurrency(order.discountAmount)}</span>
              </div>
            ) : null}
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Delivery</span>
              <span className="font-medium">
                {Number(order.deliveryCharge || 0) > 0 ? formatCurrency(order.deliveryCharge) : 'FREE'}
              </span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-2 border-t">
              <span>Total</span>
              <span>{formatCurrency(order.totalAmount)}</span>
            </div>
          </div>

          {canCancelOrder(order.status) && (
            <div className="pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={requestCancelOrder}
                disabled={cancellingOrderId === order.id}
                className="w-full md:w-auto text-xs md:text-sm px-4 py-2 rounded border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                <FaTimesCircle />
                {cancellingOrderId === order.id ? 'Cancelling...' : 'Cancel Order'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default OrderDetails


