import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { FaEnvelope, FaLock, FaUser, FaPhone, FaEye, FaEyeSlash } from 'react-icons/fa'
import { toast } from 'react-toastify'
import { registerUser } from '../redux/slices/userSlice'

function Register() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading, error } = useSelector((state) => state.user)
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.name || !formData.email || !formData.phone || !formData.password) {
      toast.error('Please fill all required fields')
      return
    }
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    
    const normalizedEmail = formData.email.trim().toLowerCase()
    const result = await dispatch(registerUser({
      email: normalizedEmail,
      password: formData.password,
      name: formData.name.trim(),
      phone: formData.phone.trim()
    }))
    
    if (registerUser.fulfilled.match(result)) {
      toast.success('Registration successful! Verification email sent. Please verify and login.')
      navigate('/login', { state: { email: normalizedEmail } })
    } else {
      const code = result.payload?.code
      const message = result.payload?.message || error || 'Registration failed'
      toast.error(message)
      if (code === 'auth/email-already-in-use') {
        navigate('/login', { state: { email: normalizedEmail } })
      }
    }
  }

  return (
    <div className="bg-fk-bg min-h-screen py-8">
      <div className="max-w-md mx-auto px-4">
        <div className="bg-white rounded shadow-fk p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Create Account</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
              <div className="relative">
                <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-fk-blue"
                />
              </div>
            </div>
            
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-fk-blue"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
              <div className="relative">
                <FaPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-fk-blue"
                />
              </div>
            </div>
            
            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a password"
                  className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded focus:outline-none focus:border-fk-blue"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password *</label>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-fk-blue"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-fk-blue text-white font-medium py-3 rounded hover:bg-fk-blue-dark transition-colors disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>

          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-fk-blue font-medium hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register
