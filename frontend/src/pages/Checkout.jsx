import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { FaCreditCard, FaMoneyBillWave } from 'react-icons/fa'
import { toast } from 'react-toastify'
import { doc, setDoc } from 'firebase/firestore'
import { clearCart } from '../redux/slices/cartSlice'
import { setUser } from '../redux/slices/userSlice'
import {
  createOrder,
  createRazorpayPaymentOrder,
  verifyRazorpayPayment,
} from '../firebase/services/orderService'
import { db } from '../firebase/config'
import { formatCurrency } from '../utils/formatters'
import { STORE_INFO } from '../data/storeInfo'

const loadRazorpaySdk = () =>
  new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true)
      return
    }
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })

function Checkout() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { items, totalAmount, coupon } = useSelector((state) => state.cart)
  const { user } = useSelector((state) => state.user)

  const [step, setStep] = useState(1)
  const [paymentMethod, setPaymentMethod] = useState('cod')
  const [placingOrder, setPlacingOrder] = useState(false)
  const [locating, setLocating] = useState(false)
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [address, setAddress] = useState({
    name: user?.displayName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    street: '',
    city: '',
    state: '',
    pincode: '',
    landmark: '',
  })

  const discountAmount = Number(coupon?.discountAmount || 0)
  const deliveryCharge = totalAmount > 500 ? 0 : 50
  const finalTotal = Math.max(0, totalAmount + deliveryCharge - discountAmount)

  const normalizePhoneDigits = (value) => String(value || '').replace(/\D/g, '')
  const isValidPhone = (value) => normalizePhoneDigits(value).length === 10
  const hasSavedAddress = Boolean(
    user?.address &&
      user.address.name &&
      user.address.email &&
      user.address.phone &&
      user.address.street &&
      user.address.city &&
      user.address.pincode
  )

  useEffect(() => {
    if (!user?.uid) return
    const savedAddress = user?.address && typeof user.address === 'object' ? user.address : {}
    setAddress((prev) => ({
      ...prev,
      name: prev.name || savedAddress.name || user?.displayName || '',
      email: prev.email || user?.email || savedAddress.email || '',
      phone: prev.phone || savedAddress.phone || user?.phone || '',
      street: prev.street || savedAddress.street || '',
      city: prev.city || savedAddress.city || '',
      state: prev.state || savedAddress.state || '',
      pincode: prev.pincode || savedAddress.pincode || '',
      landmark: prev.landmark || savedAddress.landmark || '',
    }))
  }, [user?.uid, user?.address, user?.displayName, user?.email, user?.phone])

  useEffect(() => {
    if (hasSavedAddress) {
      setShowAddressForm(false)
    }
  }, [hasSavedAddress])

  const handleAddressChange = (event) => {
    const { name, value } = event.target
    setAddress((prev) => ({ ...prev, [name]: value }))
  }

  const fillAddressFromGeo = (components) => {
    const lineParts = [components?.house_number, components?.road, components?.suburb, components?.neighbourhood].filter(Boolean)
    const streetLine = lineParts.join(', ').trim()
    const cityVal =
      components?.city ||
      components?.town ||
      components?.village ||
      components?.municipality ||
      components?.county
    const landmarkVal = components?.amenity || components?.building || components?.neighbourhood || components?.suburb

    setAddress((prev) => ({
      ...prev,
      street: streetLine || prev.street,
      city: cityVal || prev.city,
      state: components?.state || prev.state,
      pincode: components?.postcode || prev.pincode,
      landmark: landmarkVal || prev.landmark,
    }))
  }

  const handleUseCurrentLocation = async () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported in this browser')
      return
    }

    setLocating(true)
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        })
      })

      const { latitude, longitude } = position.coords
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`
      )
      if (!response.ok) throw new Error('Failed to reverse geocode location')
      const data = await response.json()
      fillAddressFromGeo(data.address || {})
      toast.success('Address filled from current location')
    } catch (error) {
      console.error(error)
      toast.error(error.message || 'Unable to fetch current location')
    } finally {
      setLocating(false)
    }
  }

  const handleSubmitAddress = async (event) => {
    event.preventDefault()
    if (!address.name || !address.email || !address.phone || !address.street || !address.city || !address.pincode) {
      toast.error('Please fill all required fields')
      return
    }
    if (!isValidPhone(address.phone)) {
      toast.error('Please enter a valid 10-digit mobile number')
      return
    }
    if (!user?.uid) {
      toast.error('Please login to continue')
      return
    }

    const profilePayload = {
      phone: address.phone,
      address: {
        name: address.name,
        email: address.email,
        phone: address.phone,
        street: address.street,
        city: address.city,
        state: address.state,
        pincode: address.pincode,
        landmark: address.landmark,
      },
      updatedAt: new Date().toISOString(),
    }

    try {
      await setDoc(doc(db, 'users', user.uid), profilePayload, { merge: true })
      dispatch(setUser({ ...user, phone: address.phone, address: profilePayload.address }))
    } catch (error) {
      console.error('Failed to save address to profile:', error)
    }

    setShowAddressForm(false)
    setStep(2)
  }

  const handleUseSavedAddress = () => {
    if (!address.name || !address.email || !address.phone || !address.street || !address.city || !address.pincode) {
      toast.error('Please complete your address before continuing')
      setShowAddressForm(true)
      return
    }
    if (!isValidPhone(address.phone)) {
      toast.error('Please enter a valid 10-digit mobile number')
      setShowAddressForm(true)
      return
    }
    setShowAddressForm(false)
    setStep(2)
  }

  const completeOrder = async (paymentId = null) => {
    const payload = {
      userId: user?.uid,
      userEmail: user?.email,
      items: items.map((item) => ({
        id: item.id,
        title: item.title,
        image: item.image,
        price: Number(item.price),
        quantity: Number(item.quantity),
      })),
      paymentMethod,
      paymentId,
      shippingAddress: address,
      couponCode: coupon?.code || null,
    }

    const createdOrder = await createOrder(payload)
    dispatch(clearCart())
    toast.success('Order placed successfully!')

    if (createdOrder?.id) {
      navigate(`/orders/${createdOrder.id}`, { replace: true, state: { justPlaced: true } })
    } else {
      navigate('/orders', { replace: true })
    }
  }

  const payWithRazorpay = async () => {
    const razorpayKeyId = import.meta.env.VITE_RAZORPAY_KEY_ID
    if (!razorpayKeyId || razorpayKeyId === 'your_razorpay_key_id') {
      throw new Error('Razorpay key is not configured')
    }

    const sdkLoaded = await loadRazorpaySdk()
    if (!sdkLoaded) {
      throw new Error('Unable to load payment gateway')
    }

    const razorpayOrder = await createRazorpayPaymentOrder({
      items: items.map((item) => ({
        id: item.id,
        quantity: item.quantity,
      })),
      couponCode: coupon?.code || null,
    })

    await new Promise((resolve, reject) => {
      const instance = new window.Razorpay({
        key: razorpayKeyId,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: STORE_INFO.name,
        description: 'Order Payment',
        order_id: razorpayOrder.id,
        prefill: {
          name: address.name,
          email: user?.email || '',
          contact: address.phone,
        },
        handler: async (response) => {
          try {
            await verifyRazorpayPayment(response)
            await completeOrder(response.razorpay_payment_id)
            resolve(true)
          } catch (error) {
            reject(error)
          }
        },
        modal: {
          ondismiss: () => reject(new Error('Payment cancelled')),
        },
      })
      instance.open()
    })
  }

  const handlePlaceOrder = async () => {
    try {
      setPlacingOrder(true)
      if (paymentMethod === 'razorpay') {
        await payWithRazorpay()
        return
      }
      await completeOrder()
    } catch (error) {
      toast.error(error?.response?.data?.error || error?.message || 'Failed to place order')
    } finally {
      setPlacingOrder(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="bg-fk-bg min-h-screen py-8">
        <div className="w-full px-0 text-center">
          <p className="text-gray-500">Your cart is empty</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-fk-bg min-h-screen py-4">
      <div className="w-full px-0">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h1>

        <div className="flex items-center justify-center mb-8">
          <div className={`flex items-center ${step >= 1 ? 'text-fk-blue' : 'text-gray-400'}`}>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step >= 1 ? 'bg-fk-blue text-white' : 'bg-gray-300'
              }`}
            >
              1
            </div>
            <span className="ml-2 font-medium">Address</span>
          </div>
          <div className="w-16 h-1 bg-gray-300 mx-4">
            <div className={`h-full ${step >= 2 ? 'bg-fk-blue' : 'bg-gray-300'}`}></div>
          </div>
          <div className={`flex items-center ${step >= 2 ? 'text-fk-blue' : 'text-gray-400'}`}>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step >= 2 ? 'bg-fk-blue text-white' : 'bg-gray-300'
              }`}
            >
              2
            </div>
            <span className="ml-2 font-medium">Payment</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {step === 1 && (
              <div className="bg-white rounded shadow-fk p-6">
                <h2 className="text-lg font-bold mb-4">Delivery Address</h2>
                {hasSavedAddress && !showAddressForm ? (
                  <div className="space-y-4">
                    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <p className="font-semibold text-gray-900">{address.name}</p>
                      <p className="text-sm text-gray-600">{address.email}</p>
                      <p className="text-sm text-gray-600">{address.phone}</p>
                      <p className="text-sm text-gray-700 mt-2">
                        {address.street}, {address.city}, {address.state || 'N/A'} - {address.pincode}
                      </p>
                      {address.landmark ? <p className="text-xs text-gray-500 mt-1">Landmark: {address.landmark}</p> : null}
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        type="button"
                        onClick={handleUseSavedAddress}
                        className="flex-1 bg-fk-blue text-white font-medium py-3 rounded hover:bg-fk-blue-dark transition-colors"
                      >
                        Use this address
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAddressForm(true)}
                        className="flex-1 border border-fk-blue text-fk-blue font-medium py-3 rounded hover:bg-fk-bg transition-colors"
                      >
                        Change address
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitAddress} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        name="name"
                        value={address.name}
                        onChange={handleAddressChange}
                        placeholder="Full Name *"
                        className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-fk-blue"
                        required
                      />
                      <input
                        type="email"
                        name="email"
                        value={address.email}
                        readOnly
                        placeholder="Email Address *"
                        className="w-full border border-gray-300 rounded px-4 py-2 bg-gray-50 text-gray-600 focus:outline-none focus:border-fk-blue"
                        required
                      />
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      value={address.phone}
                      onChange={handleAddressChange}
                      placeholder="Phone Number *"
                      className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-fk-blue"
                      inputMode="numeric"
                      pattern="[0-9]{10}"
                      required
                    />
                    <button
                      type="button"
                      onClick={handleUseCurrentLocation}
                      disabled={locating}
                      className="w-full bg-fk-yellow text-white font-semibold py-2 rounded hover:bg-fk-yellow-dark transition-colors disabled:opacity-60"
                    >
                      {locating ? 'Fetching your location...' : 'Use my current location'}
                    </button>
                    <input
                      type="text"
                      name="street"
                      value={address.street}
                      onChange={handleAddressChange}
                      placeholder="Street Address *"
                      className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-fk-blue"
                      required
                    />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <input
                        type="text"
                        name="city"
                        value={address.city}
                        onChange={handleAddressChange}
                        placeholder="City *"
                        className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-fk-blue"
                        required
                      />
                      <input
                        type="text"
                        name="state"
                        value={address.state}
                        onChange={handleAddressChange}
                        placeholder="State"
                        className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-fk-blue"
                      />
                      <input
                        type="text"
                        name="pincode"
                        value={address.pincode}
                        onChange={handleAddressChange}
                        placeholder="Pincode *"
                        className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-fk-blue"
                        required
                      />
                    </div>
                    <input
                      type="text"
                      name="landmark"
                      value={address.landmark}
                      onChange={handleAddressChange}
                      placeholder="Landmark (Optional)"
                      className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-fk-blue"
                    />
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        type="submit"
                        className="flex-1 bg-fk-blue text-white font-medium py-3 rounded hover:bg-fk-blue-dark transition-colors"
                      >
                        Continue to Payment
                      </button>
                      {hasSavedAddress && (
                        <button
                          type="button"
                          onClick={() => setShowAddressForm(false)}
                          className="flex-1 border border-gray-300 text-gray-700 font-medium py-3 rounded hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>
                )}
              </div>
            )}

            {step === 2 && (
              <div className="bg-white rounded shadow-fk p-6">
                <h2 className="text-lg font-bold mb-4">Payment Method</h2>
                <div className="space-y-3 mb-6">
                  <label
                    className={`flex items-center p-4 border rounded cursor-pointer ${
                      paymentMethod === 'cod' ? 'border-fk-blue bg-fk-bg' : 'border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      className="mr-3"
                    />
                    <FaMoneyBillWave className="text-fk-teal mr-3" />
                    <div>
                      <p className="font-medium">Cash on Delivery</p>
                      <p className="text-sm text-gray-500">Pay when you receive the product</p>
                    </div>
                  </label>
                  <label
                    className={`flex items-center p-4 border rounded cursor-pointer ${
                      paymentMethod === 'razorpay' ? 'border-fk-blue bg-fk-bg' : 'border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="razorpay"
                      checked={paymentMethod === 'razorpay'}
                      onChange={() => setPaymentMethod('razorpay')}
                      className="mr-3"
                    />
                    <FaCreditCard className="text-fk-blue mr-3" />
                    <div>
                      <p className="font-medium">Online Payment (Razorpay)</p>
                      <p className="text-sm text-gray-500">UPI, Cards, Net Banking</p>
                    </div>
                  </label>
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 border border-fk-blue text-fk-blue font-medium py-3 rounded hover:bg-fk-bg transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={placingOrder}
                    className="flex-1 bg-fk-yellow text-white font-semibold py-3 rounded hover:bg-fk-yellow-dark transition-colors disabled:opacity-60"
                  >
                    {placingOrder ? 'Processing...' : 'Place Order'}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded shadow-fk p-4 sticky top-24">
              <h3 className="font-bold text-gray-800 mb-4">Order Summary</h3>
              <div className="space-y-3 mb-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <img src={item.image} alt={item.title} className="w-16 h-16 object-contain" />
                    <div className="flex-1">
                      <p className="text-sm line-clamp-2">{item.title}</p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-medium">{formatCurrency(item.totalPrice)}</p>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>{formatCurrency(totalAmount)}</span>
                </div>
                {coupon ? (
                  <div className="flex justify-between text-sm">
                    <span>Coupon ({coupon.code})</span>
                    <span className="text-fk-teal">-{formatCurrency(discountAmount)}</span>
                  </div>
                ) : null}
                <div className="flex justify-between text-sm">
                  <span>Delivery</span>
                  <span>{deliveryCharge === 0 ? 'FREE' : formatCurrency(deliveryCharge)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>Total</span>
                  <span>{formatCurrency(finalTotal)}</span>
                </div>
              </div>

              {coupon ? (
                <div className="mt-4 rounded border border-fk-border bg-fk-bg px-3 py-2">
                  <p className="text-sm font-medium text-fk-blue">{coupon.code} is applied</p>
                  <p className="text-xs text-gray-600">{coupon.description || 'Discount included in this order.'}</p>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Checkout
