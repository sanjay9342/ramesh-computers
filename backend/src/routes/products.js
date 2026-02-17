import express from 'express'
import { firestore } from '../lib/firebaseAdmin.js'

const router = express.Router()
const productsCollection = firestore.collection('products')

const normalizeProductInput = (input = {}) => {
  const image = input.image || input.images?.[0] || ''
  return {
    title: input.title || '',
    slug: input.slug || '',
    category: input.category || '',
    brand: input.brand || '',
    price: Number(input.price || 0),
    discountPrice: input.discountPrice ? Number(input.discountPrice) : null,
    description: input.description || '',
    images: Array.isArray(input.images) && input.images.length > 0 ? input.images : (image ? [image] : []),
    image,
    specs: input.specs || {},
    stock: Number(input.stock || 0),
    rating: Number(input.rating || 0),
    reviewCount: Number(input.reviewCount || 0),
    isFeatured: Boolean(input.isFeatured),
    freeDelivery: Boolean(input.freeDelivery),
  }
}

// Get all products
router.get('/', async (req, res, next) => {
  try {
    const { category, brand, search, minPrice, maxPrice, sort } = req.query

    const snapshot = await productsCollection.get()
    let products = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

    if (category) {
      products = products.filter((p) => p.category === category)
    }

    if (brand) {
      const brands = brand.split(',')
      products = products.filter((p) => brands.includes(p.brand))
    }

    if (search) {
      const searchLower = search.toLowerCase()
      products = products.filter(
        (p) =>
          p.title?.toLowerCase().includes(searchLower) ||
          p.brand?.toLowerCase().includes(searchLower)
      )
    }

    if (minPrice) {
      products = products.filter((p) => Number(p.price || 0) >= Number.parseInt(minPrice, 10))
    }
    if (maxPrice) {
      products = products.filter((p) => Number(p.price || 0) <= Number.parseInt(maxPrice, 10))
    }

    if (sort) {
      switch (sort) {
        case 'price-low':
          products.sort((a, b) => Number(a.price || 0) - Number(b.price || 0))
          break
        case 'price-high':
          products.sort((a, b) => Number(b.price || 0) - Number(a.price || 0))
          break
        case 'rating':
          products.sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0))
          break
        case 'newest':
          products.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
          break
      }
    }

    res.json(products)
  } catch (error) {
    next(error)
  }
})

// Get categories
router.get('/categories/list', async (req, res, next) => {
  try {
    const snapshot = await productsCollection.get()
    const unique = [
      ...new Set(snapshot.docs.map((doc) => doc.data().category).filter(Boolean)),
    ]
    const categories = unique.map((slug, index) => ({
      id: index + 1,
      name: slug.charAt(0).toUpperCase() + slug.slice(1),
      slug,
    }))
    res.json(categories)
  } catch (error) {
    next(error)
  }
})

// Get single product
router.get('/:id', async (req, res, next) => {
  try {
    const doc = await productsCollection.doc(req.params.id).get()
    if (!doc.exists) {
      return res.status(404).json({ error: 'Product not found' })
    }
    res.json({ id: doc.id, ...doc.data() })
  } catch (error) {
    next(error)
  }
})

// Create product
router.post('/', async (req, res, next) => {
  try {
    const payload = normalizeProductInput(req.body)

    if (!payload.title || !payload.category || !payload.brand || !payload.price) {
      return res.status(400).json({ error: 'title, category, brand and price are required' })
    }

    const now = new Date().toISOString()
    const newProduct = {
      ...payload,
      createdAt: now,
      updatedAt: now,
    }

    const ref = await productsCollection.add(newProduct)
    res.status(201).json({ id: ref.id, ...newProduct })
  } catch (error) {
    next(error)
  }
})

// Update product
router.put('/:id', async (req, res, next) => {
  try {
    const docRef = productsCollection.doc(req.params.id)
    const existing = await docRef.get()
    if (!existing.exists) {
      return res.status(404).json({ error: 'Product not found' })
    }

    const updated = {
      ...existing.data(),
      ...normalizeProductInput({ ...existing.data(), ...req.body }),
      updatedAt: new Date().toISOString(),
    }

    await docRef.set(updated, { merge: true })
    res.json({ id: req.params.id, ...updated })
  } catch (error) {
    next(error)
  }
})

// Delete product
router.delete('/:id', async (req, res, next) => {
  try {
    const docRef = productsCollection.doc(req.params.id)
    const existing = await docRef.get()
    if (!existing.exists) {
      return res.status(404).json({ error: 'Product not found' })
    }

    await docRef.delete()
    res.json({ success: true, deleted: req.params.id })
  } catch (error) {
    next(error)
  }
})

export default router
