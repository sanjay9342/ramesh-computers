import express from 'express'
import multer from 'multer'
import { cloudinary } from '../lib/cloudinary.js'

const router = express.Router()

// Configure multer for memory storage
const storage = multer.memoryStorage()
const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
})

const uploadToCloudinary = (file, folder = 'products') =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
      },
      (error, result) => {
        if (error) {
          reject(error)
          return
        }
        resolve(result)
      }
    )
    stream.end(file.buffer)
  })

// Upload endpoint to Cloudinary
router.post('/', upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    const folder = req.body?.folder || 'products'
    const result = await uploadToCloudinary(req.file, folder)

    res.json({
      url: result.secure_url,
      public_id: result.public_id,
    })
  } catch (error) {
    next(error)
  }
})

// Multiple file upload
router.post('/multiple', upload.array('images', 5), async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' })
    }

    const folder = req.body?.folder || 'products'
    const results = await Promise.all(
      req.files.map((file) => uploadToCloudinary(file, folder))
    )

    res.json(
      results.map((result) => ({
        url: result.secure_url,
        public_id: result.public_id,
      }))
    )
  } catch (error) {
    next(error)
  }
})

export default router
