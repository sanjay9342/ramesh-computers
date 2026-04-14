import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { FaTrash, FaMinus, FaPlus, FaShoppingBag } from 'react-icons/fa'
import { toast } from 'react-toastify'
import { applyCoupon, removeCoupon, removeFromCart, updateQuantity } from '../redux/slices/cartSlice'
import { validateCoupon } from '../services/couponService'
import { formatCurrency } from '../utils/formatters'

function Cart() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { items, totalAmount, totalQuantity, coupon } = useSelector((state) => state.cart)
  const { isAuthenticated } = useSelector((state) => state.user)
  const [couponCode, setCouponCode] = useState(coupon?.code || '')
  const [couponLoading, setCouponLoading] = useState(false)

  useEffect(() => {
    const syncCoupon = async () => {
      if (!coupon?.code || totalAmount <= 0) return
      try {
        const result = await validateCoupon({ code: coupon.code, subtotal: totalAmount })
        dispatch(
          applyCoupon({
            ...result.coupon,
            discountAmount: result.discountAmount,
          })
        )
      } catch (error) {
        console.warn('Stored coupon is no longer valid:', error)
        dispatch(removeCoupon())
        setCouponCode('')
      }
    }

    syncCoupon()
  }, [coupon?.code, totalAmount, dispatch])

  useEffect(() => {
    if (items.length === 0 && coupon) {
      dispatch(removeCoupon())
      setCouponCode('')
    }
  }, [items.length, coupon, dispatch])

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

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Enter a coupon code')
      return
    }

    try {
      setCouponLoading(true)
      const result = await validateCoupon({ code: couponCode.trim(), subtotal: totalAmount })
      dispatch(
        applyCoupon({
          ...result.coupon,
          discountAmount: result.discountAmount,
        })
      )
      toast.success(`Coupon ${result.coupon.code} applied successfully`)
    } catch (error) {
      dispatch(removeCoupon())
      toast.error(error?.response?.data?.error || 'Invalid coupon code')
    } finally {
      setCouponLoading(false)
    }
  }

  const handleRemoveCoupon = () => {
    dispatch(removeCoupon())
    setCouponCode('')
    toast.info('Coupon removed')
  }

  const discount = Number(coupon?.discountAmount || 0)
  const deliveryCharge = totalAmount > 500 ? 0 : 50
  const finalTotal = Math.max(0, totalAmount + deliveryCharge - discount)

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
        <div className="w-full px-0">
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
      <div className="w-full px-0">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">My Cart ({totalQuantity} items)</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="bg-white rounded shadow-fk p-4">
                <div className="flex gap-4">
                  <Link to={`/product/${item.id}`} className="w-24 h-24 flex-shrink-0">
                    <img src={item.image} alt={item.title} className="w-full h-full object-contain" />
                  </Link>

                  <div className="flex-1">
                    <Link
                      to={`/product/${item.id}`}
                      className="text-sm font-medium text-gray-800 hover:text-fk-blue line-clamp-2"
                    >
                      {item.title}
                    </Link>
                    <p className="text-sm text-gray-500 mt-1">{formatCurrency(item.price)}</p>

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

                  <div className="text-right">
                    <p className="font-bold text-lg">{formatCurrency(item.totalPrice)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded shadow-fk p-4 sticky top-24">
              <h3 className="font-bold text-gray-800 mb-4">Price Details</h3>

              <div className="mb-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Apply Coupon"
                    value={couponCode}
                    onChange={(event) => setCouponCode(event.target.value.toUpperCase())}
                    className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-fk-blue uppercase"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    disabled={couponLoading}
                    className="bg-fk-blue text-white px-4 py-2 rounded text-sm font-medium hover:bg-fk-blue-dark disabled:opacity-60"
                  >
                    {couponLoading ? 'Checking...' : 'Apply'}
                  </button>
                </div>
                {coupon ? (
                  <div className="mt-3 rounded border border-fk-border bg-fk-bg px-3 py-2">
                    <p className="text-sm font-medium text-fk-blue">{coupon.code} applied</p>
                    <p className="text-xs text-gray-600">
                      Saving {formatCurrency(discount)}
                      {coupon.description ? ` | ${coupon.description}` : ''}
                    </p>
                    <button onClick={handleRemoveCoupon} className="text-xs text-red-500 mt-2 hover:underline">
                      Remove coupon
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 mt-2">Apply a live coupon created from the admin panel.</p>
                )}
              </div>

              <div className="border-t border-gray-200 py-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Price ({totalQuantity} items)</span>
                  <span>{formatCurrency(totalAmount)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Discount</span>
                    <span className="text-fk-teal">-{formatCurrency(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Delivery Charges</span>
                  <span>{deliveryCharge === 0 ? 'FREE' : formatCurrency(deliveryCharge)}</span>
                </div>
              </div>

              <div className="border-t border-gray-200 py-4">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>{formatCurrency(finalTotal)}</span>
                </div>
                {deliveryCharge > 0 && (
                  <p className="text-xs text-fk-teal mt-2">
                    Add {formatCurrency(500 - totalAmount)} more for free delivery
                  </p>
                )}
              </div>

              <button
                onClick={handleProceedToCheckout}
                className="w-full bg-fk-yellow hover:bg-fk-yellow-dark text-white font-semibold py-3 rounded transition-colors"
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
