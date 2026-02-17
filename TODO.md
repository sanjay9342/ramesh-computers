# Task: Update to Firestore + Cloudinary

## Task Summary:
Change all products to be managed in admin page (Firestore) and use Cloudinary for image uploads.

## Completed:
- [x] 1. Update firebase/config.js - Add Cloudinary config
- [x] 2. Update uploadService.js - Switch from Firebase Storage to Cloudinary
- [x] 3. Update Home.jsx - Fetch banners and products from Firestore
- [x] 4. Update Products.jsx - Fetch products from Firestore
- [x] 5. Update ProductDetails.jsx - Fetch product from Firestore

## What was changed:
1. **firebase/config.js**: Added Cloudinary configuration with environment variables
2. **uploadService.js**: Changed from Firebase Storage to Cloudinary API for image uploads
3. **Home.jsx**: 
   - Now fetches banners from Firestore using getActiveBanners()
   - Now fetches products from Firestore using getAllProducts()
   - Falls back to default banners if no banners in Firestore
4. **Products.jsx**: 
   - Now fetches products from Firestore using getAllProducts()
   - Client-side filtering and sorting (same as before)
5. **ProductDetails.jsx**: 
   - Now fetches product from Firestore using getProduct()
   - Fetches similar products from Firestore

## Cloudinary Setup Instructions:
1. Go to Cloudinary Dashboard (cloudinary.com)
2. Create an account or sign in
3. Copy your cloud name
4. Go to Settings > Upload > Upload presets
5. Add an upload preset (e.g., "ml_default") or create a new one
6. Add these environment variables to your .env file:

```
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
```

## Notes:
- The admin pages (Products, Banners) already had full CRUD with Firestore
- Now all frontend pages (Home, Products, ProductDetails) fetch directly from Firestore
- Image uploads now go to Cloudinary instead of Firebase Storage
- The app will use default/demo data if Firestore collections are empty
