import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyD7dSePFNwcRiiRaV1PWmQo95H0A-FqLBw',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'ramesh-computers.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'ramesh-computers',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'ramesh-computers.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '644005356681',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:644005356681:web:b176f412d052c44fa3d258',
}

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

export { auth, db }
export default app

