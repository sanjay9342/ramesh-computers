import React, { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'

import MainLayout from './components/layouts/MainLayout'
import AdminLayout from './components/layouts/AdminLayout'

import Home from './pages/Home'
import Products from './pages/Products'
import ProductDetails from './pages/ProductDetails'
import Cart from './pages/Cart'
import Wishlist from './pages/Wishlist'
import Checkout from './pages/Checkout'
import Orders from './pages/Orders'
import Login from './pages/Login'
import Register from './pages/Register'
import Contact from './pages/Contact'
import Policies from './pages/Policies'

import AdminDashboard from './pages/admin/Dashboard'
import AdminProducts from './pages/admin/Products'
import AdminOrders from './pages/admin/Orders'

import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'

import { fetchProducts } from './redux/slices/productSlice'
import { setUser } from './redux/slices/userSlice'
import { auth, db } from './firebase/config'

function App() {
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(fetchProducts()).catch((err) => {
      console.error('fetchProducts failed:', err)
    })
  }, [dispatch])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        dispatch(setUser(null))
        return
      }

      try {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid))
        const userData = userDoc.exists() ? userDoc.data() : {}

        dispatch(
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName || userData.displayName,
            phone: userData.phone,
            address: userData.address,
            role: userData.role || 'user',
          })
        )
      } catch (error) {
        console.error('Failed restoring auth user:', error)
      }
    })

    return () => unsubscribe()
  }, [dispatch])

  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="products" element={<Products />} />
        <Route path="category/:slug" element={<Products />} />
        <Route path="product/:id" element={<ProductDetails />} />
        <Route path="cart" element={<Cart />} />
        <Route path="wishlist" element={<Wishlist />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="contact" element={<Contact />} />
        <Route path="policies" element={<Policies />} />
        <Route
          path="checkout"
          element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          }
        />
        <Route
          path="orders"
          element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="orders" element={<AdminOrders />} />
      </Route>

      <Route
        path="*"
        element={
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-800">404</h1>
              <p className="text-gray-600 mt-2">Page not found</p>
            </div>
          </div>
        }
      />
    </Routes>
  )
}

export default App
