import { admin, firestore } from '../lib/firebaseAdmin.js'

const usersCollection = firestore.collection('users')

const getBearerToken = (req) => {
  const header = req.headers.authorization || ''
  if (!header.startsWith('Bearer ')) return ''
  return header.slice('Bearer '.length).trim()
}

export const requireAuth = async (req, res, next) => {
  try {
    const token = getBearerToken(req)
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    const decoded = await admin.auth().verifyIdToken(token)
    const userDoc = await usersCollection.doc(decoded.uid).get()
    const profile = userDoc.exists ? userDoc.data() || {} : {}

    req.user = {
      uid: decoded.uid,
      email: decoded.email || profile.email || '',
      role: profile.role || 'user',
      displayName: profile.displayName || decoded.name || '',
    }

    next()
  } catch (error) {
    next(Object.assign(new Error('Invalid or expired auth token'), { statusCode: 401 }))
  }
}

export const requireAdmin = (req, res, next) =>
  requireAuth(req, res, () => {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' })
    }
    next()
  })

export const requireSelfOrAdmin = (resolveUid) => (req, res, next) => {
  const targetUid = typeof resolveUid === 'function' ? resolveUid(req) : resolveUid
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' })
  }
  if (req.user.role === 'admin' || req.user.uid === targetUid) {
    return next()
  }
  return res.status(403).json({ error: 'You are not allowed to access this resource' })
}
