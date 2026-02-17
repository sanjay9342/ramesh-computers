import express from 'express'
import cors from 'cors'
import 'dotenv/config'

import productRoutes from './routes/products.js'
import bannerRoutes from './routes/banners.js'
import orderRoutes from './routes/orders.js'
import uploadRoutes from './routes/upload.js'
import adminRoutes from './routes/admin.js'

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors({
  origin: ['http://localhost:5174', 'http://localhost:5173'],
  credentials: true
}))
app.use(express.json())

// Routes
app.use('/api/products', productRoutes)
app.use('/api/banners', bannerRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/upload', uploadRoutes)
app.use('/api/admin', adminRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Ramesh Computers API is running' })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Something went wrong!' })
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
