import { toast } from 'react-toastify'
import { api } from '../../utils/api'

const validateFile = (file) => {
  if (!file) {
    throw new Error('No file provided')
  }

  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  if (!validTypes.includes(file.type)) {
    throw new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.')
  }

  const maxSize = 5 * 1024 * 1024
  if (file.size > maxSize) {
    throw new Error('File size exceeds 5MB limit')
  }
}

export const uploadImage = async (file, folder = 'products') => {
  try {
    validateFile(file)

    const formData = new FormData()
    formData.append('image', file)
    formData.append('folder', folder)

    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    return {
      url: response.data?.url,
      filename: String(response.data?.public_id || '')
        .split('/')
        .pop(),
      path: response.data?.public_id,
    }
  } catch (error) {
    const message = error?.response?.data?.error || error?.message || 'Failed to upload image'
    console.error('Error uploading image:', error)
    toast.error(message)
    throw error
  }
}

export const uploadMultipleImages = async (files, folder = 'products') => {
  try {
    if (!files || files.length === 0) {
      throw new Error('No files provided')
    }
    if (files.length > 5) {
      throw new Error('Maximum 5 files allowed')
    }

    Array.from(files).forEach(validateFile)

    const formData = new FormData()
    Array.from(files).forEach((file) => formData.append('images', file))
    formData.append('folder', folder)

    const response = await api.post('/upload/multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    return (response.data || []).map((item) => ({
      url: item.url,
      filename: String(item.public_id || '').split('/').pop(),
      path: item.public_id,
    }))
  } catch (error) {
    const message = error?.response?.data?.error || error?.message || 'Failed to upload images'
    console.error('Error uploading multiple images:', error)
    toast.error(message)
    throw error
  }
}
