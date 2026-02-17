import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { FaTrash, FaMinus, FaPlus, FaShoppingBag } from 'react-icons/fa'
import { toast } from 'react-toastify'
import { removeFromCart, updateQuantity } from '../redux/slices/cartSlice'

function Cart() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { items, totalAmount, totalQuantity } = useSelector((state) => state.cart)
  const { isAuthenticated } = useSelector((state) => state.user)
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState(null)

  const handleQuantityChange = (id, delta, currentQty) => {
    const newQty = currentQty + delta
    if (newQty >= 1) {
      dispatch(updateQuantity({ id, quantity: newQty }))
    }
  }

  const handleRemove = (id) => {
    dispatch(removeFromCart(id))
    toast.info('Item removed from cart')
  }

  const handleApplyCoupon = () => {
    if (couponCode.toUpperCase() === 'RAMESH10') {
      setAppliedCoupon({ code: 'RAMESH10', discount: 10 })
      toast.success('Coupon applied! 10% off')
    } else if (couponCode.toUpperCase() === 'SAVE500') {
      setAppliedCoupon({ code: 'SAVE500', discount: 500 })
      toast.success('Coupon applied! ₹500 off')
    } else {
      toast.error('Invalid coupon code')
    }
  }

  const discount = appliedCoupon 
    ? appliedCoupon.discount > 100 
      ? appliedCoupon.discount 
      : totalAmount * (appliedCoupon.discount / 100)
    : 0

  const finalTotal = Math.max(0, totalAmount - discount)
  const deliveryCharge = finalTotal > 500 ? 0 : 50

  const handleProceedToCheckout = () => {
    if (!isAuthenticated) {
      toast.info('Please login to place order')
      navigate('/login', { state: { from: { pathname: '/checkout' } } })
      return
    }
    navigate('/checkout')
  }

  if (items.length === 0) {
    return (
      <div className="bg-fk-bg min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-white rounded shadow-fk p-8 text-center">
            <FaShoppingBag className="text-6xl text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
            <p className="text-gray-500 mb-6">Looks like you haven't added anything to your cart yet.</p>
            <Link 
              to="/products" 
              className="inline-block bg-fk-blue text-white px-6 py-3 rounded font-medium hover:bg-fk-blue-dark transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-fk-bg min-h-screen py-4">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">My Cart ({totalQuantity} items)</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="bg-white rounded shadow-fk p-4">
                <div className="flex gap-4">
                  {/* Product Image */}
                  <Link to={`/product/${item.id}`} className="w-24 h-24 flex-shrink-0">
                    <img 
                      src={item.image} 
                      alt={item.title} 
                      className="w-full h-full object-contain"
                    />
                  </Link>

                  {/* Product Info */}
                  <div className="flex-1">
                    <Link to={`/product/${item.id}`} className="text-sm font-medium text-gray-800 hover:text-fk-blue line-clamp-2">
                      {item.title}
                    </Link>
                    <p className="text-sm text-gray-500 mt-1">₹{item.price.toLocaleString()}</p>
                    
                    {/* Quantity & Remove */}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-gray-300 rounded">
                        <button 
                          onClick={() => handleQuantityChange(item.id, -1, item.quantity)}
                          className="px-3 py-1 hover:bg-gray-100"
                          disabled={item.quantity <= 1}
                        >
                          <FaMinus className="text-xs" />
                        </button>
                        <span className="px-4 py-1 border-x border-gray-300">{item.quantity}</span>
                        <button 
                          onClick={() => handleQuantityChange(item.id, 1, item.quantity)}
                          className="px-3 py-1 hover:bg-gray-100"
                        >
                          <FaPlus className="text-xs" />
                        </button>
                      </div>
                      
                      <button 
                        onClick={() => handleRemove(item.id)}
                        className="text-red-500 hover:text-red-700 text-sm font-medium"
                      >
                        <FaTrash className="inline mr-1" />
                        REMOVE
                      </button>
                    </div>
                  </div>

                  {/* Item Total */}
                  <div className="text-right">
                    <p className="font-bold text-lg">₹{item.totalPrice.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Price Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded shadow-fk p-4 sticky top-24">
              <h3 className="font-bold text-gray-800 mb-4">Price Details</h3>
              
              {/* Coupon */}
              <div className="mb-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Apply Coupon"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-fk-blue"
                  />
                  <button 
                    onClick={handleApplyCoupon}
                    className="bg-fk-blue text-white px-4 py-2 rounded text-sm font-medium hover:bg-fk-blue-dark"
                  >
                    Apply
                  </button>
                </div>
                {appliedCoupon && (
                  <p className="text-xs text-fk-teal mt-2">
                    ✓ {appliedCoupon.code} applied - ₹{discount.toFixed(0)} off
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-2">Try: RAMESH10 or SAVE500</p>
              </div>

              <div className="border-t border-gray-200 py-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Price ({totalQuantity} items)</span>
                  <span>₹{totalAmount.toLocaleString()}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Discount</span>
                    <span className="text-fk-teal">-₹{discount.toFixed(0)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Delivery Charges</span>
                  <span>{deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}</span>
                </div>
              </div>

              <div className="border-t border-gray-200 py-4">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>₹{(finalTotal + deliveryCharge).toLocaleString()}</span>
                </div>
                {finalTotal < 500 && (
                  <p className="text-xs text-fk-teal mt-2">Add ₹{500 - totalAmount} more for free delivery</p>
                )}
              </div>

              <button
                onClick={handleProceedToCheckout}
                className="w-full bg-fk-yellow hover:bg-yellow-500 text-white font-medium py-3 rounded transition-colors"
              >
                PLACE ORDER
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart
