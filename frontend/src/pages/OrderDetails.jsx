import React, { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import {
  FaArrowLeft,
  FaBox,
  FaCheck,
  FaCreditCard,
  FaExclamationTriangle,
  FaHome,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaReceipt,
  FaRegStar,
  FaShippingFast,
  FaStar,
  FaTimesCircle,
  FaTruck,
} from 'react-icons/fa'
import { cancelOrder, getOrder, submitProductRating } from '../firebase/services/orderService'
import LoadingScreen from '../components/LoadingScreen'
import { formatCurrency } from '../utils/formatters'
import { getOrderDisplayId } from '../utils/orderDisplay'

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
    const timer = setTimeout(() => setShowConfirmAnimation(false), 3200)
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
      } catch (loadError) {
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
      completed: currentIndex >= 0 && index <= currentIndex,
      current: index === currentIndex,
    }))
  }

  const getStatusProgress = (status) => {
    const statusOrder = ['confirmed', 'packed', 'shipped', 'out_for_delivery', 'delivered']
    const currentIndex = statusOrder.indexOf(status)
    if (currentIndex < 0 || statusOrder.length <= 1) return 0
    return Math.round((currentIndex / (statusOrder.length - 1)) * 100)
  }

  const getStatusBadgeClass = (status) => {
    if (status === 'confirmed') return 'border-transparent bg-[#1f6fb2] text-white'
    if (status === 'packed') return 'border-[#f6dfb4] bg-[#fff8eb] text-[#9a6300]'
    if (status === 'shipped') return 'border-[#cce8de] bg-[#eefbf5] text-[#1d7a56]'
    if (status === 'out_for_delivery') return 'border-[#ffd7c7] bg-[#fff3ec] text-[#b55a2a]'
    if (status === 'delivered') return 'border-[#cde6d9] bg-[#effaf3] text-[#206847]'
    if (status === 'cancelled') return 'border-[#f5c2c7] bg-[#fff2f3] text-[#b42338]'
    return 'border-gray-200 bg-gray-100 text-gray-600'
  }

  const getStatusSummary = (status) => {
    if (status === 'confirmed') return 'Your order is confirmed and waiting for packing.'
    if (status === 'packed') return 'Your items are packed and getting ready for shipment.'
    if (status === 'shipped') return 'Your order is on the way to your delivery address.'
    if (status === 'out_for_delivery') return 'Your package is out for delivery today.'
    if (status === 'delivered') return 'Delivered successfully. You can rate your purchased items below.'
    if (status === 'cancelled') return 'This order was cancelled and will not move further.'
    return 'We are updating the latest progress for this order.'
  }

  const canCancelOrder = (status) => status === 'confirmed' || status === 'packed'

  const formatDate = (dateValue) => {
    if (!dateValue) return 'N/A'
    return new Date(dateValue).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const getRatingKey = (orderId, productId) => `${orderId}:${productId}`

  const renderStars = (rating) => (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((value) =>
        value <= rating ? (
          <FaStar key={value} className="text-[#e2a400] text-sm" />
        ) : (
          <FaRegStar key={value} className="text-[#e2a400] text-sm" />
        )
      )}
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
    } catch (submitError) {
      console.error('Error submitting rating:', submitError)
    } finally {
      setRatingSubmitting(null)
    }
  }

  const requestCancelOrder = () => {
    setConfirmingCancel(true)
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
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
    } catch (cancelError) {
      console.error('Error cancelling order:', cancelError)
    } finally {
      setCancellingOrderId(null)
    }
  }

  if (loading) {
    return <LoadingScreen text="Loading order details..." />
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-[#f7f8fb] py-8">
        <div className="mx-auto w-full max-w-3xl px-3 sm:px-4 lg:px-6">
          <div className="rounded-lg border border-[#e5ecf3] bg-white p-8 text-center shadow-sm">
            <FaBox className="mx-auto mb-4 text-6xl text-gray-300" />
            <h2 className="text-2xl font-bold text-gray-800">Order not found</h2>
            <p className="mt-2 text-gray-500">{error || 'We could not find that order.'}</p>
            <Link
              to="/orders"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#1f6fb2] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#195a90]"
            >
              <FaArrowLeft className="text-xs" />
              Back to My Orders
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const displayOrderId = getOrderDisplayId(order)
  const orderItems = Array.isArray(order.items) ? order.items : []
  const statusLabel = (order.status || 'unknown').replace(/_/g, ' ')
  const paymentLabel = order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'
  const confirmationEmail = order.userEmail || user?.email || order.shippingAddress?.email || ''
  const addressLines = [
    order.shippingAddress?.street,
    [order.shippingAddress?.city, order.shippingAddress?.state].filter(Boolean).join(', '),
    order.shippingAddress?.pincode,
  ].filter(Boolean)

  return (
    <div className="min-h-screen bg-[#f7f8fb] py-3 sm:py-4">
      <div className="mx-auto w-full max-w-7xl px-3 sm:px-4 lg:px-6">
        <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#2a6ca8]">Order Details</p>
            <h1 className="mt-1 text-2xl font-bold text-gray-900 sm:text-3xl">Order {displayOrderId}</h1>
            <p className="mt-1 text-sm text-gray-500">Placed on {formatDate(order.orderedAt)}</p>
          </div>
          <Link
            to="/orders"
            className="inline-flex items-center gap-2 rounded-lg border border-[#d5dfeb] bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-[#f8fafc]"
          >
            <FaArrowLeft className="text-xs" />
            Back to My Orders
          </Link>
        </div>

        {confirmingCancel ? (
          <div className="order-cancel-confirm mb-3 rounded-lg border border-[#f5c2c7] bg-[#fff4f5] p-4 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#ffe4e8] text-[#b42338]">
                  <FaExclamationTriangle />
                </div>
                <div>
                  <p className="font-semibold text-[#8f2130]">Cancel order {displayOrderId}?</p>
                  <p className="mt-1 text-sm text-[#b42338]">
                    This will stop the current order flow and mark the order as cancelled.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleCancelOrder}
                  disabled={cancellingOrderId === order.id}
                  className="rounded-lg bg-[#c63d4f] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#aa3040] disabled:opacity-60"
                >
                  {cancellingOrderId === order.id ? 'Cancelling...' : 'Yes, cancel order'}
                </button>
                <button
                  type="button"
                  onClick={closeCancelPrompt}
                  className="rounded-lg border border-[#d7dfe9] bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-[#f8fafc]"
                >
                  Keep Order
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {showConfirmAnimation ? (
          <div className="order-confirmation-card mb-3">
            <div className="order-confirmation-sheen" />
            <div className="order-confirmation-icon">
              <FaCheck className="order-confirmation-check" />
              <span className="order-confirmation-burst b1" />
              <span className="order-confirmation-burst b2" />
              <span className="order-confirmation-burst b3" />
              <span className="order-confirmation-burst b4" />
              <span className="order-confirmation-burst b5" />
              <span className="order-confirmation-burst b6" />
            </div>

            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8b1451]">Order Confirmed</p>
              <p className="mt-1 text-lg font-bold text-gray-900 sm:text-xl">Order {displayOrderId} placed successfully</p>
              <p className="mt-1 text-sm text-gray-600">We have started processing your items.</p>
              <p className="mt-2 text-sm text-[#5c4c57]">
                {confirmationEmail
                  ? `Confirmation email sent to ${confirmationEmail}.`
                  : 'Your order confirmation email is being prepared now.'}
              </p>
            </div>
          </div>
        ) : null}

        <section
          className={`overflow-hidden rounded-lg border border-[#e5ecf3] bg-white shadow-sm ${
            cancelAnimating ? 'order-cancelled-flash' : ''
          }`}
        >
          <div className="bg-[linear-gradient(135deg,#eef7ff_0%,#fff7ef_48%,#fdf2f6_100%)] px-4 py-4 sm:px-5 sm:py-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div className="max-w-3xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-[#d7e4ef] bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-[#245a90]">
                    Order Number {displayOrderId}
                  </span>
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize ${getStatusBadgeClass(order.status)}`}
                  >
                    {statusLabel}
                  </span>
                </div>

                <p className="mt-3 text-2xl font-bold text-gray-900 sm:text-3xl">{formatCurrency(order.totalAmount)}</p>
                <p className="mt-2 text-sm text-gray-600 sm:text-base">{getStatusSummary(order.status)}</p>
              </div>

              {canCancelOrder(order.status) ? (
                <button
                  type="button"
                  onClick={requestCancelOrder}
                  disabled={cancellingOrderId === order.id}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#f2c3c8] bg-[#fff4f5] px-4 py-2.5 text-sm font-semibold text-[#b42338] transition hover:bg-[#ffecee] disabled:opacity-60"
                >
                  <FaTimesCircle />
                  {cancellingOrderId === order.id ? 'Cancelling...' : 'Cancel Order'}
                </button>
              ) : null}
            </div>

            <div className="mt-4 grid gap-3 border-t border-white/70 pt-4 sm:grid-cols-2 xl:grid-cols-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-gray-500">Payment</p>
                <div className="mt-2 flex items-center gap-2 text-sm font-semibold text-gray-900">
                  <FaCreditCard className="text-[#245a90]" />
                  <span>{paymentLabel}</span>
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-gray-500">Items</p>
                <p className="mt-2 text-sm font-semibold text-gray-900">
                  {orderItems.length} item{orderItems.length === 1 ? '' : 's'}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-gray-500">Ship To</p>
                <p className="mt-2 text-sm font-semibold text-gray-900">
                  {order.shippingAddress?.city || order.shippingAddress?.name || 'Address pending'}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-gray-500">Placed On</p>
                <p className="mt-2 text-sm font-semibold text-gray-900">{formatDate(order.orderedAt)}</p>
              </div>
            </div>
          </div>
        </section>

        {order.status !== 'cancelled' ? (
          <section className="mt-4 rounded-lg border border-[#e5ecf3] bg-white p-4 shadow-sm sm:p-5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-gray-900">Delivery Progress</h2>
                <p className="text-sm text-gray-500">Live order movement from confirmation to delivery.</p>
              </div>
              <p className="text-sm font-semibold text-[#245a90]">{getStatusProgress(order.status)}%</p>
            </div>

            <div className="order-steps-scroll overflow-x-auto pb-2">
              <div className="order-steps-track relative min-w-[560px]">
                <div className="order-steps-line" />
                <div
                  className="order-steps-progress order-progress-bar"
                  style={{ width: `${getStatusProgress(order.status)}%` }}
                />
                <div className="relative z-10 flex items-start justify-between gap-4">
                  {getStatusSteps(order.status).map((step) => (
                    <div key={step.key} className="flex min-w-[96px] flex-1 flex-col items-center">
                      <div
                        className={`flex h-11 w-11 items-center justify-center rounded-full border text-sm ${
                          step.completed
                            ? 'border-[#1f6fb2] bg-[#1f6fb2] text-white'
                            : 'border-[#d8e1ec] bg-white text-gray-400'
                        } ${order.status === 'confirmed' && step.key === 'confirmed' ? 'order-step-confirmed' : ''}`}
                      >
                        <step.icon />
                      </div>
                      <p className={`mt-2 text-center text-xs ${step.current ? 'font-semibold text-[#245a90]' : 'text-gray-500'}`}>
                        {step.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        ) : null}

        <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,1fr)]">
          <section className="rounded-lg border border-[#e5ecf3] bg-white p-4 shadow-sm sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-gray-900">Items</h2>
                <p className="text-sm text-gray-500">Products included in this order.</p>
              </div>
              <p className="text-sm font-medium text-gray-500">
                {orderItems.length} item{orderItems.length === 1 ? '' : 's'}
              </p>
            </div>

            <div className="mt-5 divide-y divide-[#edf1f5]">
              {orderItems.map((item, index) => {
                const lineTotal = Number(item.price || 0) * Number(item.quantity || 1)
                const itemKey = getRatingKey(order.id, item.id)

                return (
                  <div key={`${order.id}-${index}`} className="py-4 first:pt-0 last:pb-0">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex min-w-0 items-start gap-4">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.title}
                            className="h-20 w-20 rounded-lg border border-[#edf1f5] bg-white object-contain"
                          />
                        ) : (
                          <div className="flex h-20 w-20 items-center justify-center rounded-lg border border-[#edf1f5] bg-[#f8fafc] text-xs text-gray-400">
                            No image
                          </div>
                        )}

                        <div className="min-w-0">
                          <p className="text-base font-semibold text-gray-900">{item.title}</p>
                          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
                            <span>Qty: {item.quantity}</span>
                            <span>Unit price: {formatCurrency(item.price)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="sm:text-right">
                        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-gray-400">Line Total</p>
                        <p className="mt-1 text-lg font-bold text-gray-900">{formatCurrency(lineTotal)}</p>
                      </div>
                    </div>

                    {order.status === 'delivered' ? (
                      <div className="mt-4 border-t border-[#edf1f5] pt-4">
                        {order.itemRatings?.[item.id]?.rating ? (
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <span className="text-sm text-gray-600">Your rating</span>
                            {renderStars(order.itemRatings[item.id].rating)}
                          </div>
                        ) : (
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((value) => {
                                const selected = ratingDrafts[itemKey] || 0
                                return (
                                  <button
                                    key={value}
                                    type="button"
                                    onClick={() => handleRatingSelect(order.id, item.id, value)}
                                    className="text-[#e2a400] transition hover:scale-105"
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
                              disabled={!ratingDrafts[itemKey] || ratingSubmitting === itemKey}
                              className="rounded-lg bg-[#1f6fb2] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#195a90] disabled:opacity-60"
                            >
                              {ratingSubmitting === itemKey ? 'Submitting...' : 'Submit Rating'}
                            </button>
                          </div>
                        )}
                      </div>
                    ) : null}
                  </div>
                )
              })}
            </div>
          </section>

          <div className="space-y-0 overflow-hidden rounded-lg border border-[#e5ecf3] bg-white shadow-sm">
            <section className="p-5">
              <div>
                <h2 className="text-base font-bold text-gray-900">Delivery Details</h2>
                <p className="text-sm text-gray-500">Where this order is being sent.</p>
              </div>

              <div className="mt-4 space-y-3 text-sm text-gray-700">
                <div className="flex items-start gap-3">
                  <FaMapMarkerAlt className="mt-1 text-[#245a90]" />
                  <div>
                    <p className="font-semibold text-gray-900">{order.shippingAddress?.name || 'Customer'}</p>
                    {addressLines.map((line) => (
                      <p key={line}>{line}</p>
                    ))}
                    {order.shippingAddress?.landmark ? <p>Landmark: {order.shippingAddress.landmark}</p> : null}
                  </div>
                </div>

                {order.shippingAddress?.phone ? (
                  <div className="flex items-start gap-3">
                    <FaPhoneAlt className="mt-1 text-[#245a90]" />
                    <p>{order.shippingAddress.phone}</p>
                  </div>
                ) : null}
              </div>
            </section>

            <section className="border-t border-[#e8edf4] p-5">
              <div>
                <h2 className="text-base font-bold text-gray-900">Payment Summary</h2>
                <p className="text-sm text-gray-500">Billing and payment details for this order.</p>
              </div>

              <div className="mt-4 text-sm">
                <div className="flex items-center justify-between gap-4 border-b border-[#eef2f6] py-3 first:pt-0">
                  <span className="text-gray-500">Order Number</span>
                  <span className="font-semibold text-gray-900">{displayOrderId}</span>
                </div>

                <div className="flex items-center justify-between gap-4 border-b border-[#eef2f6] py-3">
                  <span className="text-gray-500">Payment Method</span>
                  <span className="font-medium text-gray-900">{paymentLabel}</span>
                </div>

                {order.paymentStatus ? (
                  <div className="flex items-center justify-between gap-4 border-b border-[#eef2f6] py-3">
                    <span className="text-gray-500">Payment Status</span>
                    <span className="font-medium capitalize text-gray-900">{order.paymentStatus}</span>
                  </div>
                ) : null}

                {order.couponCode ? (
                  <div className="flex items-center justify-between gap-4 border-b border-[#eef2f6] py-3">
                    <span className="text-gray-500">Coupon</span>
                    <span className="font-medium text-gray-900">{order.couponCode}</span>
                  </div>
                ) : null}

                <div className="flex items-center justify-between gap-4 border-b border-[#eef2f6] py-3">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-medium text-gray-900">{formatCurrency(order.subtotal || order.totalAmount)}</span>
                </div>

                {Number(order.discountAmount || 0) > 0 ? (
                  <div className="flex items-center justify-between gap-4 border-b border-[#eef2f6] py-3">
                    <span className="text-gray-500">Discount</span>
                    <span className="font-medium text-[#1a7a52]">-{formatCurrency(order.discountAmount)}</span>
                  </div>
                ) : null}

                <div className="flex items-center justify-between gap-4 border-b border-[#eef2f6] py-3">
                  <span className="text-gray-500">Delivery Charge</span>
                  <span className="font-medium text-gray-900">
                    {Number(order.deliveryCharge || 0) > 0 ? formatCurrency(order.deliveryCharge) : 'FREE'}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4 border-t border-[#e8edf4] pt-3 text-base">
                  <span className="inline-flex items-center gap-2 font-semibold text-gray-900">
                    <FaReceipt className="text-[#245a90]" />
                    Total
                  </span>
                  <span className="font-bold text-gray-900">{formatCurrency(order.totalAmount)}</span>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderDetails
