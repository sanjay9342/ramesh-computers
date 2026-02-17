import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { firestore } from '../lib/firebaseAdmin.js'
import { sampleProducts } from '../data/sampleData.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const DB_PATH = path.join(__dirname, '..', 'data', 'db.json')

const defaultBanners = [
  {
    id: 1,
    title: 'Laptop Sale',
    subtitle: 'Up to 20% Off',
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=1200',
    link: '/products',
    active: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 2,
    title: 'Gaming Desktops',
    subtitle: 'Power Your Gaming',
    image: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=1200',
    link: '/category/desktops',
    active: true,
    createdAt: '2024-01-02T00:00:00.000Z',
    updatedAt: '2024-01-02T00:00:00.000Z',
  },
  {
    id: 3,
    title: 'Office Essentials',
    subtitle: 'Best Deals',
    image: 'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=1200',
    link: '/products',
    active: true,
    createdAt: '2024-01-03T00:00:00.000Z',
    updatedAt: '2024-01-03T00:00:00.000Z',
  },
]

const normalizeProduct = (product) => {
  const image = product.image || product.images?.[0] || ''
  return {
    title: product.title || '',
    slug: product.slug || '',
    category: product.category || '',
    brand: product.brand || '',
    price: Number(product.price || 0),
    discountPrice: product.discountPrice ? Number(product.discountPrice) : null,
    description: product.description || '',
    images: Array.isArray(product.images) && product.images.length > 0 ? product.images : (image ? [image] : []),
    image,
    specs: product.specs || {},
    stock: Number(product.stock || 0),
    rating: Number(product.rating || 0),
    reviewCount: Number(product.reviewCount || 0),
    isFeatured: Boolean(product.isFeatured),
    freeDelivery: Boolean(product.freeDelivery),
    createdAt: product.createdAt || new Date().toISOString(),
    updatedAt: product.updatedAt || product.createdAt || new Date().toISOString(),
  }
}

const normalizeBanner = (banner) => ({
  title: banner.title || '',
  subtitle: banner.subtitle || '',
  image: banner.image || '',
  link: banner.link || '/products',
  active: banner.active !== undefined ? Boolean(banner.active) : true,
  createdAt: banner.createdAt || new Date().toISOString(),
  updatedAt: banner.updatedAt || banner.createdAt || new Date().toISOString(),
})

const loadSeedData = async () => {
  try {
    const raw = await fs.readFile(DB_PATH, 'utf-8')
    const parsed = JSON.parse(raw)
    return {
      products: Array.isArray(parsed.products) ? parsed.products : [],
      banners: Array.isArray(parsed.banners) ? parsed.banners : [],
    }
  } catch {
    return {
      products: sampleProducts,
      banners: defaultBanners,
    }
  }
}

const seedCollection = async (collectionName, items, normalizer) => {
  const collection = firestore.collection(collectionName)
  const batch = firestore.batch()

  items.forEach((item, index) => {
    const docId = String(item.id ?? index + 1)
    const ref = collection.doc(docId)
    batch.set(ref, normalizer(item), { merge: true })
  })

  await batch.commit()
}

const main = async () => {
  const { products, banners } = await loadSeedData()
  await seedCollection('products', products, normalizeProduct)
  await seedCollection('banners', banners, normalizeBanner)

  console.log(`Seeded ${products.length} products and ${banners.length} banners to Firestore.`)
}

main().catch((error) => {
  console.error('Failed to seed Firestore:', error)
  process.exit(1)
})
