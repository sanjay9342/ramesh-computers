import { cloudinaryConfig } from '../config';
import { toast } from 'react-toastify';

// Upload single image to Cloudinary
export const uploadImage = async (file, folder = 'products') => {
  try {
    if (!file) {
      throw new Error('No file provided');
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      throw new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.');
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new Error('File size exceeds 10MB limit');
    }

    // Create form data for Cloudinary upload
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', cloudinaryConfig.uploadPreset);
    formData.append('folder', folder);

    // Upload to Cloudinary
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData
      }
    );

    if (!response.ok) {
      throw new Error('Failed to upload image on Cloudinary');
    }

    const data = await response.json();
    
    return {
      url: data.secure_url,
      filename: data.public_id.split('/').pop(),
      path: data.public_id
    };
  } catch (error) {
    console.error('Error uploading image:', error);
    toast.error(error.message || 'Failed to upload image on Cloudinary');
    throw error;
  }
};

// Upload multiple images to Cloudinary
export const uploadMultipleImages = async (files, folder = 'products') => {
  try {
    if (!files || files.length === 0) {
      throw new Error('No files provided');
    }

    // Limit to 5 files
    if (files.length > 5) {
      throw new Error('Maximum 5 files allowed');
    }

    const uploadPromises = Array.from(files).map(file => uploadImage(file, folder));
    const results = await Promise.all(uploadPromises);
    
    return results;
  } catch (error) {
    console.error('Error uploading multiple images:', error);
    toast.error(error.message || 'Failed to upload images on Cloudinary');
    throw error;
  }
};

// Delete image from Cloudinary
export const deleteImage = async (publicId) => {
  try {
    if (!publicId) {
      throw new Error('No public ID provided');
    }

    // For unsigned uploads, we can't directly delete without API secret
    // But we can just return success since we're using unsigned uploads
    // In production, you'd want to set up a backend endpoint for deletion
    console.log('Image deletion would require backend API with API secret');
    return true;
  } catch (error) {
    console.error('Error deleting image:', error);
    toast.error('Failed to delete image');
    throw error;
  }
};

// Get optimized image URL from Cloudinary
export const getImageURL = async (path, options = {}) => {
  try {
    if (!path) {
      return null;
    }

    // If it's already a URL, return it
    if (path.startsWith('http')) {
      return path;
    }

    // Build Cloudinary URL with transformations
    const {
      width,
      height,
      crop = 'fill',
      quality = 'auto',
      format = 'auto'
    } = options;

    let transformations = [];
    
    if (width) transformations.push(`w_${width}`);
    if (height) transformations.push(`h_${height}`);
    if (crop) transformations.push(`c_${crop}`);
    transformations.push(`q_${quality}`);
    transformations.push(`f_${format}`);

    const transformString = transformations.join(',');
    
    // Return Cloudinary URL with transformations
    return `https://res.cloudinary.com/${cloudinaryConfig.cloudName}/image/upload/${transformString}/${path}`;
  } catch (error) {
    console.error('Error getting image URL:', error);
    return null;
  }
};

