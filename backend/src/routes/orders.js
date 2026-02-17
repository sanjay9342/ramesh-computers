import express from 'express'
import { firestore } from '../lib/firebaseAdmin.js'
import { createRazorpayOrder, verifyRazorpaySignature } from '../lib/razorpay.js'
import { sendAdminOrderAlert, sendCustomerOrderStatusEmail } from '../lib/notifications.js'

const router = express.Router()
const ordersCollection = firestore.collection('orders')
const allowedStatuses = ['confirmed', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled']

const sortOrdersByDateDesc = (orders) =>
  orders.sort((a, b) => new Date(b.orderedAt || 0) - new Date(a.orderedAt || 0))

// Get all orders (admin)
router.get('/', async (req, res, next) => {
  try {
    const snapshot = await ordersCollection.get()
    const orders = sortOrdersByDateDesc(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
    res.json(orders)
  } catch (error) {
    next(error)
  }
})

// Get user's orders
router.get('/user/:userId', async (req, res, next) => {
  try {
    const snapshot = await ordersCollection.where('userId', '==', req.params.userId).get()
    const userOrders = sortOrdersByDateDesc(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
    res.json(userOrders)
  } catch (error) {
    next(error)
  }
})

// Get single order
router.get('/:id', async (req, res, next) => {
  try {
    const doc = await ordersCollection.doc(req.params.id).get()
    if (!doc.exists) {
      return res.status(404).json({ error: 'Order not found' })
    }
    res.json({ id: doc.id, ...doc.data() })
  } catch (error) {
    next(error)
  }
})

// Create new order
router.post('/', async (req, res, next) => {
  try {
    const { userId, userEmail, items, totalAmount, paymentMethod, shippingAddress, paymentId } = req.body
    if (!userId || !Array.isArray(items) || items.length === 0 || !totalAmount || !shippingAddress) {
      return res.status(400).json({ error: 'userId, items, totalAmount, and shippingAddress are required' })
    }

    const resolvedPaymentMethod = paymentMethod || 'cod'
    const newOrder = {
      userId,
      userEmail: userEmail || '',
      items,
      totalAmount: Number(totalAmount),
      status: 'confirmed',
      paymentMethod: resolvedPaymentMethod,
      paymentStatus: resolvedPaymentMethod === 'cod' ? 'pending' : 'paid',
      paymentId: paymentId || null,
      shippingAddress,
      orderedAt: new Date().toISOString(),
    }

    const ref = await ordersCollection.add(newOrder)
    const createdOrder = { id: ref.id, ...newOrder }
    await sendAdminOrderAlert(createdOrder).catch((error) => console.error('Failed to notify admin:', error.message))
    await sendCustomerOrderStatusEmail(createdOrder, 'confirmed').catch((error) =>
      console.error('Failed to notify customer:', error.message)
    )
    res.status(201).json(createdOrder)
  } catch (error) {
    next(error)
  }
})

router.post('/payment/razorpay-order', async (req, res, next) => {
  try {
    const amount = Number(req.body?.amount || 0)
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid amount is required' })
    }

    const razorpayOrder = await createRazorpayOrder({
      amount,
      receipt: `rcpt_${Date.now()}`,
    })

    res.json(razorpayOrder)
  } catch (error) {
    next(error)
  }
})

router.post('/payment/verify', async (req, res, next) => {
  try {
    const { razorpay_order_id: orderId, razorpay_payment_id: paymentId, razorpay_signature: signature } = req.body || {}
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

// Update order status
router.put('/:id/status', async (req, res, next) => {
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
