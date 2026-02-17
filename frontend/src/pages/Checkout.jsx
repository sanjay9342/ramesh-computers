import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { FaCreditCard, FaMoneyBillWave } from 'react-icons/fa'
import { toast } from 'react-toastify'
import { clearCart } from '../redux/slices/cartSlice'
import {
  createOrder,
  createRazorpayPaymentOrder,
  verifyRazorpayPayment,
} from '../firebase/services/orderService'

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
  const { items, totalAmount } = useSelector((state) => state.cart)
  const { user } = useSelector((state) => state.user)

  const [step, setStep] = useState(1)
  const [paymentMethod, setPaymentMethod] = useState('cod')
  const [placingOrder, setPlacingOrder] = useState(false)
  const [locating, setLocating] = useState(false)
  const [address, setAddress] = useState({
    name: user?.displayName || '',
    phone: user?.phone || '',
    street: '',
    city: '',
    state: '',
    pincode: '',
    landmark: '',
  })

  const deliveryCharge = totalAmount > 500 ? 0 : 50
  const finalTotal = totalAmount + deliveryCharge

  const handleAddressChange = (event) => {
    const { name, value } = event.target
    setAddress((prev) => ({ ...prev, [name]: value }))
  }

  const fillAddressFromGeo = (components) => {
    // Build a fuller street line if possible
    const lineParts = [
      components?.house_number,
      components?.road,
      components?.suburb,
      components?.neighbourhood,
    ].filter(Boolean)
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
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`
      )
      if (!res.ok) throw new Error('Failed to reverse geocode location')
      const data = await res.json()
      fillAddressFromGeo(data.address || {})
      toast.success('Address filled from current location')
    } catch (error) {
      console.error(error)
      toast.error(error.message || 'Unable to fetch current location')
    } finally {
      setLocating(false)
    }
  }

  const handleSubmitAddress = (event) => {
    event.preventDefault()
    if (!address.name || !address.phone || !address.street || !address.city || !address.pincode) {
      toast.error('Please fill all required fields')
      return
    }
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
      totalAmount: finalTotal,
      paymentMethod,
      paymentId,
      shippingAddress: address,
    }

    const createdOrder = await createOrder(payload)
    dispatch(clearCart())
    toast.success('Order placed successfully!')
    navigate('/orders', { replace: true, state: { orderId: createdOrder?.id } })
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

    const razorpayOrder = await createRazorpayPaymentOrder(finalTotal)

    await new Promise((resolve, reject) => {
      const instance = new window.Razorpay({
        key: razorpayKeyId,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: 'Ramesh Computers',
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
      toast.error(error?.message || 'Failed to place order')
    } finally {
      setPlacingOrder(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="bg-fk-bg min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-500">Your cart is empty</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-fk-bg min-h-screen py-4">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h1>

        <div className="flex items-center justify-center mb-8">
          <div className={`flex items-center ${step >= 1 ? 'text-fk-blue' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-fk-blue text-white' : 'bg-gray-300'}`}>1</div>
            <span className="ml-2 font-medium">Address</span>
          </div>
          <div className="w-16 h-1 bg-gray-300 mx-4">
            <div className={`h-full ${step >= 2 ? 'bg-fk-blue' : 'bg-gray-300'}`}></div>
          </div>
          <div className={`flex items-center ${step >= 2 ? 'text-fk-blue' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-fk-blue text-white' : 'bg-gray-300'}`}>2</div>
            <span className="ml-2 font-medium">Payment</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {step === 1 && (
              <div className="bg-white rounded shadow-fk p-6">
                <h2 className="text-lg font-bold mb-4">Delivery Address</h2>
                <form onSubmit={handleSubmitAddress} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" name="name" value={address.name} onChange={handleAddressChange} placeholder="Full Name *" className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-fk-blue" required />
                    <input type="tel" name="phone" value={address.phone} onChange={handleAddressChange} placeholder="Phone Number *" className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-fk-blue" required />
                  </div>
                  <button
                    type="button"
                    onClick={handleUseCurrentLocation}
                    disabled={locating}
                    className="w-full bg-fk-yellow text-white font-medium py-2 rounded hover:bg-yellow-500 transition-colors disabled:opacity-60"
                  >
                    {locating ? 'Fetching your location...' : 'Use my current location'}
                  </button>
                  <input type="text" name="street" value={address.street} onChange={handleAddressChange} placeholder="Street Address *" className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-fk-blue" required />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input type="text" name="city" value={address.city} onChange={handleAddressChange} placeholder="City *" className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-fk-blue" required />
                    <input type="text" name="state" value={address.state} onChange={handleAddressChange} placeholder="State" className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-fk-blue" />
                    <input type="text" name="pincode" value={address.pincode} onChange={handleAddressChange} placeholder="Pincode *" className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-fk-blue" required />
                  </div>
                  <input type="text" name="landmark" value={address.landmark} onChange={handleAddressChange} placeholder="Landmark (Optional)" className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-fk-blue" />
                  <button type="submit" className="w-full bg-fk-blue text-white font-medium py-3 rounded hover:bg-fk-blue-dark transition-colors">
                    Continue to Payment
                  </button>
                </form>
              </div>
            )}

            {step === 2 && (
              <div className="bg-white rounded shadow-fk p-6">
                <h2 className="text-lg font-bold mb-4">Payment Method</h2>
                <div className="space-y-3 mb-6">
                  <label className={`flex items-center p-4 border rounded cursor-pointer ${paymentMethod === 'cod' ? 'border-fk-blue bg-blue-50' : 'border-gray-300'}`}>
                    <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="mr-3" />
                    <FaMoneyBillWave className="text-green-500 mr-3" />
                    <div>
                      <p className="font-medium">Cash on Delivery</p>
                      <p className="text-sm text-gray-500">Pay when you receive the product</p>
                    </div>
                  </label>
                  <label className={`flex items-center p-4 border rounded cursor-pointer ${paymentMethod === 'razorpay' ? 'border-fk-blue bg-blue-50' : 'border-gray-300'}`}>
                    <input type="radio" name="payment" value="razorpay" checked={paymentMethod === 'razorpay'} onChange={() => setPaymentMethod('razorpay')} className="mr-3" />
                    <FaCreditCard className="text-fk-blue mr-3" />
                    <div>
                      <p className="font-medium">Online Payment (Razorpay)</p>
                      <p className="text-sm text-gray-500">UPI, Cards, Net Banking</p>
                    </div>
                  </label>
                </div>
                <div className="flex gap-4">
                  <button onClick={() => setStep(1)} className="flex-1 border border-fk-blue text-fk-blue font-medium py-3 rounded hover:bg-blue-50 transition-colors">
                    Back
                  </button>
                  <button onClick={handlePlaceOrder} disabled={placingOrder} className="flex-1 bg-fk-yellow text-white font-medium py-3 rounded hover:bg-yellow-500 transition-colors disabled:opacity-60">
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
                    <p className="font-medium">Rs. {item.totalPrice.toLocaleString()}</p>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-200 pt-3 space-y-2">
                <div className="flex justify-between text-sm"><span>Subtotal</span><span>Rs. {totalAmount.toLocaleString()}</span></div>
                <div className="flex justify-between text-sm"><span>Delivery</span><span>{deliveryCharge === 0 ? 'FREE' : `Rs. ${deliveryCharge}`}</span></div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t"><span>Total</span><span>Rs. {finalTotal.toLocaleString()}</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Checkout
