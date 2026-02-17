import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa'
import { toast } from 'react-toastify'
import { loginUser, resetPassword, resendVerificationEmail } from '../redux/slices/userSlice'

function Login() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { loading, error } = useSelector((state) => state.user)

  const from = location.state?.from?.pathname || '/'
  const [formData, setFormData] = useState({ email: location.state?.email || '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [showReset, setShowReset] = useState(false)
  const [resetEmail, setResetEmail] = useState(location.state?.email || '')
  const [showVerifyHelp, setShowVerifyHelp] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!formData.email || !formData.password) {
      toast.error('Please enter email and password')
      return
    }

    const result = await dispatch(loginUser(formData))
    if (loginUser.fulfilled.match(result)) {
      toast.success('Login successful!')
      navigate(from, { replace: true })
      return
    }

    const code = result.payload?.code
    toast.error(result.payload?.message || result.payload || error || 'Login failed')
    setShowVerifyHelp(code === 'auth/email-not-verified')
  }

  const handleResetPassword = async () => {
    if (!resetEmail) {
      toast.error('Please enter your email')
      return
    }

    const result = await dispatch(resetPassword(resetEmail))
    if (resetPassword.fulfilled.match(result)) {
      toast.success('Password reset email sent. Please check your inbox.')
      setShowReset(false)
      return
    }

    toast.error(result.payload?.message || result.payload || 'Failed to send reset email')
  }

  const handleResendVerification = async () => {
    if (!formData.email || !formData.password) {
      toast.error('Enter your email and password to resend verification mail')
      return
    }

    const result = await dispatch(
      resendVerificationEmail({
        email: formData.email,
        password: formData.password,
      })
    )
    if (resendVerificationEmail.fulfilled.match(result)) {
      toast.success('Verification email sent. Please check inbox/spam.')
      return
    }
    toast.error(result.payload?.message || result.payload || 'Failed to send verification email')
  }

  return (
    <div className="bg-fk-bg min-h-screen py-8">
      <div className="max-w-md mx-auto px-4">
        <div className="bg-white rounded shadow-fk p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Login</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded focus:outline-none focus:border-fk-blue"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-fk-blue text-white font-medium py-3 rounded hover:bg-fk-blue-dark transition-colors disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Login'}
            </button>

            <button
              type="button"
              onClick={() => {
                setResetEmail(formData.email || location.state?.email || '')
                setShowReset((prev) => !prev)
              }}
              className="w-full text-fk-blue text-sm hover:underline"
            >
              Forgot password?
            </button>

            {showReset && (
              <div className="border border-gray-200 rounded p-3 bg-gray-50">
                <label className="block text-sm font-medium text-gray-700 mb-2">Reset your password</label>
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(event) => setResetEmail(event.target.value)}
                  placeholder="Enter registered email"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-fk-blue"
                />
                <button
                  type="button"
                  onClick={handleResetPassword}
                  disabled={loading}
                  className="mt-2 w-full bg-fk-yellow text-white text-sm font-medium py-2 rounded hover:bg-yellow-500 disabled:opacity-50"
                >
                  Send Reset Email
                </button>
              </div>
            )}

            {showVerifyHelp && (
              <div className="border border-blue-200 rounded p-3 bg-blue-50">
                <p className="text-sm text-blue-800 mb-2">Your email is not verified yet.</p>
                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={loading}
                  className="w-full bg-fk-blue text-white text-sm font-medium py-2 rounded hover:bg-fk-blue-dark disabled:opacity-50"
                >
                  Resend Verification Email
                </button>
              </div>
            )}
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-fk-blue font-medium hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
