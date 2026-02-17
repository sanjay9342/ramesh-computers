import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { sampleProducts } from './sampleData.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const DB_PATH = path.join(__dirname, 'db.json')

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

const defaultDb = {
  products: sampleProducts.map((product) => ({
    ...product,
    image: product.image || product.images?.[0] || '',
    images: product.images || (product.image ? [product.image] : []),
    updatedAt: product.updatedAt || product.createdAt,
  })),
  banners: defaultBanners,
}

const ensureDb = async () => {
  try {
    await fs.access(DB_PATH)
  } catch {
    await fs.writeFile(DB_PATH, JSON.stringify(defaultDb, null, 2), 'utf-8')
  }
}

export const readDb = async () => {
  await ensureDb()
  const raw = await fs.readFile(DB_PATH, 'utf-8')
  const parsed = JSON.parse(raw)

  return {
    products: Array.isArray(parsed.products) ? parsed.products : [],
    banners: Array.isArray(parsed.banners) ? parsed.banners : [],
  }
}

export const writeDb = async (data) => {
  const normalized = {
    products: Array.isArray(data.products) ? data.products : [],
    banners: Array.isArray(data.banners) ? data.banners : [],
  }
  await fs.writeFile(DB_PATH, JSON.stringify(normalized, null, 2), 'utf-8')
}

export const nextNumericId = (items) => {
  const max = items.reduce((value, item) => {
    const id = Number(item?.id)
    if (Number.isFinite(id) && id > value) return id
    return value
  }, 0)

  return max + 1
}

