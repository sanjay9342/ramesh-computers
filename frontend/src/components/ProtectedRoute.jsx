import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'

function ProtectedRoute({ children }) {
  const location = useLocation()
  const { isAuthenticated } = useSelector((state) => state.user)

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}

export default ProtectedRoute
