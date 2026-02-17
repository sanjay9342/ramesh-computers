import React from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

function AdminRoute({ children }) {
  const { user, isAuthenticated } = useSelector((state) => state.user)

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: { pathname: '/admin' } }} />
  }

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-fk-bg px-4">
        <div className="max-w-md w-full bg-white rounded shadow-fk p-6 text-center">
          <h2 className="text-xl font-bold text-gray-800 mb-2">Admin Access Only</h2>
          <p className="text-gray-600 mb-4">
            Your account is registered as customer. Only admin users can open this page.
          </p>
          <Link to="/" className="inline-block bg-fk-blue text-white px-4 py-2 rounded hover:bg-fk-blue-dark">
            Go to Home
          </Link>
        </div>
      </div>
    )
  }

  return children
}

export default AdminRoute
