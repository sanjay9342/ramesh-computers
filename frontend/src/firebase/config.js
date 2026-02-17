import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// Replace with your Firebase configuration from Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyD7dSePFNwcRiiRaV1PWmQo95H0A-FqLBw",
  authDomain: "ramesh-computers.firebaseapp.com",
  projectId: "ramesh-computers",
  storageBucket: "ramesh-computers.firebasestorage.app",
  messagingSenderId: "644005356681",
  appId: "1:644005356681:web:b176f412d052c44fa3d258"
};

// Cloudinary configuration
// Replace these with your Cloudinary credentials from Cloudinary Dashboard
const cloudinaryConfig = {
  cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'demo',
  apiKey: import.meta.env.VITE_CLOUDINARY_API_KEY || '',
  uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'ml_default'
};

// Initialize Firebase only if valid config is provided
let app = null
let auth = null
let db = null

try {
  // Check if config has valid values (not the placeholder values)
  if (firebaseConfig.apiKey && !firebaseConfig.apiKey.startsWith('YOUR_')) {
    app = initializeApp(firebaseConfig)
    auth = getAuth(app)
    db = getFirestore(app)
  } else {
    console.warn('Firebase config not properly set. Authentication features will be disabled.')
  }
} catch (error) {
  console.error('Firebase initialization error:', error)
}

export { auth, db, cloudinaryConfig }
export default app

