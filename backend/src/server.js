import express from 'express'
import cors from 'cors'
import 'dotenv/config'

import productRoutes from './routes/products.js'
import bannerRoutes from './routes/banners.js'
import orderRoutes from './routes/orders.js'
import uploadRoutes from './routes/upload.js'
import adminRoutes from './routes/admin.js'
import { runPendingOrderReminderSweep } from './lib/orderReminderSweep.js'

const app = express()
const PORT = process.env.PORT || 5000
const orderReminderSweepMs = Number(process.env.ORDER_REMINDER_SWEEP_MS || 1800000)

// ================= CORS FIX =================
const allowedOrigins = [
  'http://localhost:5174',
  'http://localhost:5173',
  'https://rameshcomputers.netlify.app'
]

app.use(
  cors({
    origin: function (origin, callback) {
      // allow Postman / mobile apps / no-origin requests
      if (!origin) return callback(null, true)

      if (allowedOrigins.includes(origin)) {
        return callback(null, true)
      } else {
        return callback(new Error('Not allowed by CORS: ' + origin))
      }
    },
    credentials: true
  })
)
// ============================================

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

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: err.message || 'Something went wrong!' })
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)

  const runSweep = async () => {
    try {
      const sentCount = await runPendingOrderReminderSweep()
      if (sentCount > 0) {
        console.log(`Sent ${sentCount} pending-order reminder(s) to admin.`)
      }
    } catch (error) {
      console.error('Pending-order reminder sweep failed:', error.message)
    }
  }

  runSweep()
  setInterval(runSweep, orderReminderSweepMs)
})
