import express from 'express'
import { firestore } from '../lib/firebaseAdmin.js'
import { normalizeCouponInput, validateCouponForSubtotal } from '../lib/orderPricing.js'
import { requireAdmin } from '../middleware/auth.js'

const router = express.Router()
const couponsCollection = firestore.collection('coupons')

const sortCoupons = (items) =>
  items.sort((a, b) => {
    const aTime = Date.parse(a.updatedAt || a.createdAt || 0)
    const bTime = Date.parse(b.updatedAt || b.createdAt || 0)
    return bTime - aTime
  })

router.post('/validate', async (req, res, next) => {
  try {
    const code = String(req.body?.code || '').trim().toUpperCase()
    const subtotal = Number(req.body?.subtotal || 0)

    if (!code) {
      return res.status(400).json({ error: 'Coupon code is required' })
    }
    if (!Number.isFinite(subtotal) || subtotal < 0) {
      return res.status(400).json({ error: 'A valid subtotal is required' })
    }

    const couponDoc = await couponsCollection.doc(code).get()
    const coupon = couponDoc.exists ? { id: couponDoc.id, ...couponDoc.data() } : null
    const validation = validateCouponForSubtotal(coupon, subtotal)

    if (!validation.valid) {
      return res.status(400).json({ error: validation.reason })
    }

    res.json({
      valid: true,
      discountAmount: validation.discountAmount,
      coupon: validation.coupon,
    })
  } catch (error) {
    next(error)
  }
})

router.get('/', requireAdmin, async (req, res, next) => {
  try {
    const snapshot = await couponsCollection.get()
    const coupons = sortCoupons(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
    res.json(coupons)
  } catch (error) {
    next(error)
  }
})

router.post('/', requireAdmin, async (req, res, next) => {
  try {
    const payload = normalizeCouponInput(req.body)
    if (!payload.code || !payload.discountValue) {
      return res.status(400).json({ error: 'Coupon code and discount value are required' })
    }

    const docRef = couponsCollection.doc(payload.code)
    const existing = await docRef.get()
    if (existing.exists) {
      return res.status(409).json({ error: 'Coupon code already exists' })
    }

    const now = new Date().toISOString()
    const coupon = {
      ...payload,
      createdAt: now,
      updatedAt: now,
    }

    await docRef.set(coupon)
    res.status(201).json({ id: payload.code, ...coupon })
  } catch (error) {
    next(error)
  }
})

router.put('/:id', requireAdmin, async (req, res, next) => {
  try {
    const id = String(req.params.id || '').trim().toUpperCase()
    const docRef = couponsCollection.doc(id)
    const existing = await docRef.get()

    if (!existing.exists) {
      return res.status(404).json({ error: 'Coupon not found' })
    }

    const payload = normalizeCouponInput({ ...existing.data(), ...req.body, code: id })
    if (!payload.discountValue) {
      return res.status(400).json({ error: 'Discount value must be greater than zero' })
    }

    const updated = {
      ...existing.data(),
      ...payload,
      code: id,
      updatedAt: new Date().toISOString(),
    }

    await docRef.set(updated, { merge: true })
    res.json({ id, ...updated })
  } catch (error) {
    next(error)
  }
})

router.patch('/:id/status', requireAdmin, async (req, res, next) => {
  try {
    const id = String(req.params.id || '').trim().toUpperCase()
    const active = req.body?.active
    if (active === undefined) {
      return res.status(400).json({ error: 'active is required' })
    }

    const docRef = couponsCollection.doc(id)
    const existing = await docRef.get()
    if (!existing.exists) {
      return res.status(404).json({ error: 'Coupon not found' })
    }

    const updated = {
      ...existing.data(),
      active: Boolean(active),
      updatedAt: new Date().toISOString(),
    }

    await docRef.set(updated, { merge: true })
    res.json({ id, ...updated })
  } catch (error) {
    next(error)
  }
})

router.delete('/:id', requireAdmin, async (req, res, next) => {
  try {
    const id = String(req.params.id || '').trim().toUpperCase()
    const docRef = couponsCollection.doc(id)
    const existing = await docRef.get()
    if (!existing.exists) {
      return res.status(404).json({ error: 'Coupon not found' })
    }

    await docRef.delete()
    res.json({ success: true, deleted: id })
  } catch (error) {
    next(error)
  }
})

export default router
