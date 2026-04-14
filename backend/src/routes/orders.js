import express from 'express'
import { firestore } from '../lib/firebaseAdmin.js'
import { createRazorpayOrder, verifyRazorpaySignature } from '../lib/razorpay.js'
import {
  sendAdminOrderAlert,
  sendAdminOrderCancelled,
  sendCustomerOrderStatusEmail,
} from '../lib/notifications.js'
import { buildOrderPricing } from '../lib/orderPricing.js'
import { requireAdmin, requireAuth, requireSelfOrAdmin } from '../middleware/auth.js'

const router = express.Router()
const ordersCollection = firestore.collection('orders')
const productsCollection = firestore.collection('products')
const couponsCollection = firestore.collection('coupons')
const allowedStatuses = ['confirmed', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled']
const cancelableStatuses = ['confirmed', 'packed']
const acceptedPaymentMethods = new Set(['cod', 'razorpay'])

const sortOrdersByDateDesc = (orders) =>
  orders.sort((a, b) => new Date(b.orderedAt || 0) - new Date(a.orderedAt || 0))

const normalizeRequestedItems = (items = []) =>
  items.map((item) => ({
    id: String(item?.id || '').trim(),
    title: String(item?.title || '').trim(),
    image: item?.image || '',
    price: Number(item?.price || 0),
    quantity: Number(item?.quantity || 1),
  }))

const hasInvalidRequestedItems = (items = []) =>
  items.some((item) => !item.id || item.quantity <= 0 || !Number.isFinite(item.quantity))

const normalizeShippingAddress = (input = {}, fallbackEmail = '') => ({
  name: String(input?.name || '').trim(),
  email: String(input?.email || fallbackEmail || '').trim(),
  phone: String(input?.phone || '').trim(),
  street: String(input?.street || '').trim(),
  city: String(input?.city || '').trim(),
  state: String(input?.state || '').trim(),
  pincode: String(input?.pincode || '').trim(),
  landmark: String(input?.landmark || '').trim(),
})

const validateShippingAddress = (address) =>
  address.name && address.email && address.phone && address.street && address.city && address.pincode

const getQuantityByProductId = (items) =>
  items.reduce((acc, item) => {
    if (!item.id) return acc
    const quantity = Number(item.quantity || 0)
    if (!Number.isFinite(quantity) || quantity <= 0) return acc

    const existing = acc.get(item.id)
    if (existing) {
      existing.quantity += quantity
    } else {
      acc.set(item.id, {
        id: item.id,
        title: item.title,
        quantity,
      })
    }
    return acc
  }, new Map())

const getDocInContext = (docRef, transaction) =>
  transaction ? transaction.get(docRef) : docRef.get()

const loadOrderPricing = async ({ requestedItems, requestedCouponCode = '', transaction = null }) => {
  const quantityByProductId = getQuantityByProductId(requestedItems)
  const stockAdjustments = Array.from(quantityByProductId.values())
  const productRefs = stockAdjustments.map((item) => productsCollection.doc(item.id))
  const productDocs = await Promise.all(productRefs.map((ref) => getDocInContext(ref, transaction)))

  const productsById = new Map()
  for (let index = 0; index < stockAdjustments.length; index += 1) {
    const item = stockAdjustments[index]
    const productDoc = productDocs[index]
    if (!productDoc.exists) {
      const error = new Error(`Product not found: ${item.title || item.id}`)
      error.statusCode = 400
      throw error
    }

    const productData = { id: productDoc.id, ...productDoc.data() }
    const currentStock = Number(productData.stock || 0)
    if (currentStock < item.quantity) {
      const error = new Error(
        `Insufficient stock for "${productData.title || item.title || item.id}". Available: ${currentStock}, requested: ${item.quantity}`
      )
      error.statusCode = 400
      throw error
    }

    productsById.set(productDoc.id, productData)
  }

  let couponDocRef = null
  let couponData = null
  if (requestedCouponCode) {
    couponDocRef = couponsCollection.doc(requestedCouponCode)
    const couponDoc = await getDocInContext(couponDocRef, transaction)
    if (!couponDoc.exists) {
      const error = new Error('Coupon not found')
      error.statusCode = 400
      throw error
    }
    couponData = { id: couponDoc.id, ...couponDoc.data() }
  }

  const pricing = buildOrderPricing({
    productsById,
    requestedItems,
    coupon: couponData,
  })

  return {
    pricing,
    stockAdjustments,
    productRefs,
    productsById,
    couponDocRef,
    couponData,
  }
}

const canAccessOrder = (order, reqUser) =>
  reqUser?.role === 'admin' || String(order?.userId || '') === String(reqUser?.uid || '')

// Get all orders (admin)
router.get('/', requireAdmin, async (req, res, next) => {
  try {
    const snapshot = await ordersCollection.get()
    const orders = sortOrdersByDateDesc(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
    res.json(orders)
  } catch (error) {
    next(error)
  }
})

// Get user's orders
router.get('/user/:userId', requireAuth, requireSelfOrAdmin((req) => req.params.userId), async (req, res, next) => {
  try {
    const snapshot = await ordersCollection.where('userId', '==', req.params.userId).get()
    const userOrders = sortOrdersByDateDesc(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
    res.json(userOrders)
  } catch (error) {
    next(error)
  }
})

// Get single order
router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const doc = await ordersCollection.doc(req.params.id).get()
    if (!doc.exists) {
      return res.status(404).json({ error: 'Order not found' })
    }

    const order = { id: doc.id, ...doc.data() }
    if (!canAccessOrder(order, req.user)) {
      return res.status(403).json({ error: 'You are not allowed to access this order' })
    }

    res.json(order)
  } catch (error) {
    next(error)
  }
})

router.post('/payment/razorpay-order', requireAuth, async (req, res, next) => {
  try {
    const requestedItems = normalizeRequestedItems(req.body?.items || [])
    const requestedCouponCode = String(req.body?.couponCode || '').trim().toUpperCase()

    if (!Array.isArray(requestedItems) || requestedItems.length === 0) {
      return res.status(400).json({ error: 'Order items are required to initialize payment' })
    }
    if (hasInvalidRequestedItems(requestedItems)) {
      return res.status(400).json({ error: 'Invalid order item data' })
    }

    const { pricing } = await loadOrderPricing({
      requestedItems,
      requestedCouponCode,
    })

    const razorpayOrder = await createRazorpayOrder({
      amount: pricing.totalAmount,
      receipt: `rcpt_${Date.now()}`,
    })

    res.json({
      ...razorpayOrder,
      pricing: {
        subtotal: pricing.subtotal,
        deliveryCharge: pricing.deliveryCharge,
        discountAmount: pricing.discountAmount,
        totalAmount: pricing.totalAmount,
        coupon: pricing.coupon || null,
      },
    })
  } catch (error) {
    if (error?.statusCode) {
      return res.status(error.statusCode).json({ error: error.message })
    }
    next(error)
  }
})

router.post('/payment/verify', requireAuth, async (req, res, next) => {
  try {
    const {
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: signature,
    } = req.body || {}
    if (!orderId || !paymentId || !signature) {
      return res.status(400).json({ error: 'Payment verification details are required' })
    }

    const isValid = verifyRazorpaySignature({ orderId, paymentId, signature })
    if (!isValid) {
      return res.status(400).json({ error: 'Invalid payment signature' })
    }

    res.json({ verified: true })
  } catch (error) {
    next(error)
  }
})

// Create new order
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const requestedItems = normalizeRequestedItems(req.body?.items || [])
    const shippingAddress = normalizeShippingAddress(req.body?.shippingAddress || {}, req.user?.email)
    const requestedCouponCode = String(req.body?.couponCode || '').trim().toUpperCase()
    const paymentMethod = acceptedPaymentMethods.has(String(req.body?.paymentMethod || '').trim())
      ? String(req.body?.paymentMethod || '').trim()
      : 'cod'
    const paymentId = req.body?.paymentId || null

    if (!Array.isArray(requestedItems) || requestedItems.length === 0) {
      return res.status(400).json({ error: 'At least one order item is required' })
    }
    if (hasInvalidRequestedItems(requestedItems)) {
      return res.status(400).json({ error: 'Invalid order item data' })
    }
    if (paymentMethod === 'razorpay' && !paymentId) {
      return res.status(400).json({ error: 'Verified payment ID is required for Razorpay orders' })
    }
    if (!validateShippingAddress(shippingAddress)) {
      return res.status(400).json({ error: 'Complete shipping address is required' })
    }

    const now = new Date().toISOString()
    const orderRef = ordersCollection.doc()
    let createdOrder = null

    await firestore.runTransaction(async (transaction) => {
      const context = await loadOrderPricing({
        requestedItems,
        requestedCouponCode,
        transaction,
      })

      const newOrder = {
        userId: req.user.uid,
        userEmail: req.user.email || shippingAddress.email || '',
        items: context.pricing.items,
        subtotal: context.pricing.subtotal,
        deliveryCharge: context.pricing.deliveryCharge,
        discountAmount: context.pricing.discountAmount,
        totalAmount: context.pricing.totalAmount,
        couponCode: context.pricing.coupon?.code || null,
        coupon: context.pricing.coupon || null,
        status: 'confirmed',
        paymentMethod,
        paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
        paymentId,
        shippingAddress,
        orderedAt: now,
        updatedAt: now,
      }

      context.stockAdjustments.forEach((item, index) => {
        const productDoc = context.productsById.get(item.id)
        const currentStock = Number(productDoc?.stock || 0)
        transaction.update(context.productRefs[index], {
          stock: currentStock - item.quantity,
          updatedAt: now,
        })
      })

      if (context.couponDocRef && context.couponData) {
        transaction.set(
          context.couponDocRef,
          {
            usedCount: Number(context.couponData.usedCount || 0) + 1,
            updatedAt: now,
          },
          { merge: true }
        )
      }

      transaction.set(orderRef, newOrder)
      createdOrder = { id: orderRef.id, ...newOrder }
    })

    await sendAdminOrderAlert(createdOrder).catch((error) =>
      console.error('Failed to notify admin:', error.message)
    )
    await sendCustomerOrderStatusEmail(createdOrder, 'confirmed').catch((error) =>
      console.error('Failed to notify customer:', error.message)
    )

    res.status(201).json(createdOrder)
  } catch (error) {
    if (error?.statusCode) {
      return res.status(error.statusCode).json({ error: error.message })
    }
    next(error)
  }
})

// Submit product rating (only after delivery)
router.post('/:id/items/:productId/rating', requireAuth, async (req, res, next) => {
  try {
    const rating = Number(req.body?.rating)
    const orderId = String(req.params.id || '').trim()
    const productId = String(req.params.productId || '').trim()

    if (!orderId || !productId) {
      return res.status(400).json({ error: 'orderId and productId are required' })
    }
    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'rating must be between 1 and 5' })
    }

    const orderRef = ordersCollection.doc(orderId)
    const productRef = productsCollection.doc(productId)
    const now = new Date().toISOString()
    let updatedOrder = null
    let updatedProduct = null

    await firestore.runTransaction(async (transaction) => {
      const [orderDoc, productDoc] = await Promise.all([
        transaction.get(orderRef),
        transaction.get(productRef),
      ])

      if (!orderDoc.exists) {
        const error = new Error('Order not found')
        error.statusCode = 404
        throw error
      }
      if (!productDoc.exists) {
        const error = new Error('Product not found')
        error.statusCode = 404
        throw error
      }

      const orderData = orderDoc.data() || {}
      if (String(orderData.userId || '') !== req.user.uid) {
        const error = new Error('Order does not belong to this user')
        error.statusCode = 403
        throw error
      }
      if (orderData.status !== 'delivered') {
        const error = new Error('Order is not delivered yet')
        error.statusCode = 400
        throw error
      }

      const hasItem =
        Array.isArray(orderData.items) &&
        orderData.items.some((item) => String(item?.id || '').trim() === productId)
      if (!hasItem) {
        const error = new Error('Product not found in this order')
        error.statusCode = 400
        throw error
      }

      const existingRatings = orderData.itemRatings || {}
      if (existingRatings[productId]) {
        const error = new Error('Product already rated for this order')
        error.statusCode = 400
        throw error
      }

      const productData = productDoc.data() || {}
      const currentReviewCount = Math.max(0, Number(productData.reviewCount || 0))
      const currentRating = Math.max(0, Number(productData.rating || 0))
      const nextReviewCount = currentReviewCount + 1
      const nextRating = Number(
        ((currentRating * currentReviewCount + rating) / nextReviewCount).toFixed(1)
      )

      const nextItemRatings = {
        ...existingRatings,
        [productId]: {
          rating,
          ratedAt: now,
        },
      }

      const orderUpdate = {
        itemRatings: nextItemRatings,
        updatedAt: now,
      }

      transaction.set(orderRef, orderUpdate, { merge: true })
      transaction.set(
        productRef,
        { rating: nextRating, reviewCount: nextReviewCount, updatedAt: now },
        { merge: true }
      )

      updatedOrder = { id: orderDoc.id, ...orderData, ...orderUpdate }
      updatedProduct = {
        id: productDoc.id,
        ...productData,
        rating: nextRating,
        reviewCount: nextReviewCount,
        updatedAt: now,
      }
    })

    res.json({ order: updatedOrder, product: updatedProduct })
  } catch (error) {
    if (error?.statusCode) {
      return res.status(error.statusCode).json({ error: error.message })
    }
    next(error)
  }
})

// Cancel order by customer (only before shipping)
router.post('/:id/cancel', requireAuth, async (req, res, next) => {
  try {
    const orderRef = ordersCollection.doc(req.params.id)
    let updatedOrder = null

    await firestore.runTransaction(async (transaction) => {
      const orderDoc = await transaction.get(orderRef)
      if (!orderDoc.exists) {
        const error = new Error('Order not found')
        error.statusCode = 404
        throw error
      }

      const orderData = orderDoc.data() || {}
      if (String(orderData.userId || '') !== req.user.uid) {
        const error = new Error('Order does not belong to this user')
        error.statusCode = 403
        throw error
      }
      if (!cancelableStatuses.includes(orderData.status)) {
        const error = new Error('Order cannot be cancelled at this stage')
        error.statusCode = 400
        throw error
      }

      const quantityByProductId = getQuantityByProductId(orderData.items || [])
      const restockItems = Array.from(quantityByProductId.values())
      const productRefs = restockItems.map((item) => productsCollection.doc(item.id))
      const productDocs = await Promise.all(productRefs.map((ref) => transaction.get(ref)))

      for (let index = 0; index < restockItems.length; index += 1) {
        const restock = restockItems[index]
        const productDoc = productDocs[index]
        if (!productDoc.exists) continue
        const productData = productDoc.data() || {}
        const currentStock = Number(productData.stock || 0)
        transaction.set(
          productRefs[index],
          { stock: currentStock + restock.quantity, updatedAt: new Date().toISOString() },
          { merge: true }
        )
      }

      if (orderData.couponCode) {
        const couponRef = couponsCollection.doc(String(orderData.couponCode || '').trim().toUpperCase())
        const couponDoc = await transaction.get(couponRef)
        if (couponDoc.exists) {
          const couponData = couponDoc.data() || {}
          const currentUsedCount = Math.max(0, Number(couponData.usedCount || 0))
          transaction.set(
            couponRef,
            {
              usedCount: Math.max(0, currentUsedCount - 1),
              updatedAt: new Date().toISOString(),
            },
            { merge: true }
          )
        }
      }

      const now = new Date().toISOString()
      const orderUpdate = {
        status: 'cancelled',
        updatedAt: now,
        cancelledAt: now,
      }

      transaction.set(orderRef, orderUpdate, { merge: true })
      updatedOrder = { id: orderDoc.id, ...orderData, ...orderUpdate }
    })

    await sendCustomerOrderStatusEmail(updatedOrder, 'cancelled').catch((error) =>
      console.error('Failed to notify customer:', error.message)
    )
    await sendAdminOrderCancelled(updatedOrder).catch((error) =>
      console.error('Failed to notify admin:', error.message)
    )

    res.json(updatedOrder)
  } catch (error) {
    if (error?.statusCode) {
      return res.status(error.statusCode).json({ error: error.message })
    }
    next(error)
  }
})

// Update order status
router.put('/:id/status', requireAdmin, async (req, res, next) => {
  try {
    const { status } = req.body
    if (!status) {
      return res.status(400).json({ error: 'status is required' })
    }
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' })
    }

    const docRef = ordersCollection.doc(req.params.id)
    const existing = await docRef.get()
    if (!existing.exists) {
      return res.status(404).json({ error: 'Order not found' })
    }

    const updated = {
      ...existing.data(),
      status,
      updatedAt: new Date().toISOString(),
    }

    await docRef.set(updated, { merge: true })
    await sendCustomerOrderStatusEmail({ id: req.params.id, ...updated }, status).catch((error) =>
      console.error('Failed to notify customer:', error.message)
    )
    res.json({ id: req.params.id, ...updated })
  } catch (error) {
    next(error)
  }
})

export default router
