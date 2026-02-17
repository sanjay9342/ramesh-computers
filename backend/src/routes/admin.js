import express from 'express'
import { firestore } from '../lib/firebaseAdmin.js'

const router = express.Router()
const usersCollection = firestore.collection('users')
const ADMIN_SECRET = process.env.ADMIN_SECRET || ''

const requireSecret = (req, res, next) => {
  const headerSecret = req.headers['x-admin-secret'] || req.body?.secret
  if (!ADMIN_SECRET || headerSecret !== ADMIN_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  next()
}

// Promote or create user with role (admin/user)
router.post('/set-role', requireSecret, async (req, res, next) => {
  try {
    const { uid, email, role = 'user', displayName = '', phone = '' } = req.body || {}
    if (!uid && !email) {
      return res.status(400).json({ error: 'uid or email is required' })
    }
    if (!['admin', 'user'].includes(role)) {
      return res.status(400).json({ error: 'role must be admin or user' })
    }

    let targetDoc = null

    if (uid) {
      targetDoc = usersCollection.doc(uid)
    } else {
      const byEmail = await usersCollection.where('email', '==', email).limit(1).get()
      if (!byEmail.empty) {
        targetDoc = byEmail.docs[0].ref
      }
    }

    if (!targetDoc) {
      // Create by uid if provided, otherwise fail
      if (!uid) {
        return res.status(404).json({ error: 'User not found; provide uid to create' })
      }
      targetDoc = usersCollection.doc(uid)
    }

    await targetDoc.set(
      {
        uid: uid || targetDoc.id,
        email: email || null,
        displayName,
        phone,
        role,
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      },
      { merge: true }
    )

    const snapshot = await targetDoc.get()
    res.json({ id: targetDoc.id, ...snapshot.data() })
  } catch (error) {
    next(error)
  }
})

// List users (for admin panel use)
router.get('/users', requireSecret, async (req, res, next) => {
  try {
    const snapshot = await usersCollection.get()
    const users = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    res.json(users)
  } catch (error) {
    next(error)
  }
})

export default router
