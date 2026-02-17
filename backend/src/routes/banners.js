import express from 'express'
import { firestore } from '../lib/firebaseAdmin.js'

const router = express.Router()
const bannersCollection = firestore.collection('banners')

const normalizeBannerInput = (input = {}) => ({
  title: input.title || '',
  subtitle: input.subtitle || '',
  image: input.image || '',
  link: input.link || '/products',
  active: input.active !== undefined ? Boolean(input.active) : true,
})

router.get('/', async (req, res, next) => {
  try {
    const { active } = req.query
    const snapshot = await bannersCollection.get()
    let banners = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

    if (active === 'true') {
      banners = banners.filter((banner) => banner.active)
    }

    banners.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    res.json(banners)
  } catch (error) {
    next(error)
  }
})

router.get('/:id', async (req, res, next) => {
  try {
    const doc = await bannersCollection.doc(req.params.id).get()
    if (!doc.exists) {
      return res.status(404).json({ error: 'Banner not found' })
    }

    res.json({ id: doc.id, ...doc.data() })
  } catch (error) {
    next(error)
  }
})

router.post('/', async (req, res, next) => {
  try {
    const payload = normalizeBannerInput(req.body)
    if (!payload.title || !payload.image) {
      return res.status(400).json({ error: 'title and image are required' })
    }

    const now = new Date().toISOString()
    const banner = {
      ...payload,
      createdAt: now,
      updatedAt: now,
    }

    const ref = await bannersCollection.add(banner)
    res.status(201).json({ id: ref.id, ...banner })
  } catch (error) {
    next(error)
  }
})

router.put('/:id', async (req, res, next) => {
  try {
    const docRef = bannersCollection.doc(req.params.id)
    const existing = await docRef.get()
    if (!existing.exists) {
      return res.status(404).json({ error: 'Banner not found' })
    }

    const updated = {
      ...existing.data(),
      ...normalizeBannerInput({ ...existing.data(), ...req.body }),
      updatedAt: new Date().toISOString(),
    }

    await docRef.set(updated, { merge: true })
    res.json({ id: req.params.id, ...updated })
  } catch (error) {
    next(error)
  }
})

router.patch('/:id/status', async (req, res, next) => {
  try {
    const { active } = req.body
    if (active === undefined) {
      return res.status(400).json({ error: 'active is required' })
    }

    const docRef = bannersCollection.doc(req.params.id)
    const existing = await docRef.get()
    if (!existing.exists) {
      return res.status(404).json({ error: 'Banner not found' })
    }

    const updated = {
      ...existing.data(),
      active: Boolean(active),
      updatedAt: new Date().toISOString(),
    }

    await docRef.set(updated, { merge: true })
    res.json({ id: req.params.id, ...updated })
  } catch (error) {
    next(error)
  }
})

router.delete('/:id', async (req, res, next) => {
  try {
    const docRef = bannersCollection.doc(req.params.id)
    const existing = await docRef.get()
    if (!existing.exists) {
      return res.status(404).json({ error: 'Banner not found' })
    }

    await docRef.delete()
    res.json({ success: true, deleted: req.params.id })
  } catch (error) {
    next(error)
  }
})

export default router
