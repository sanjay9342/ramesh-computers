import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { FaBox, FaCheck, FaTruck, FaShippingFast, FaHome, FaChevronDown, FaChevronUp } from 'react-icons/fa'
import { getUserOrders } from '../firebase/services/orderService'

function Orders() {
  const { user } = useSelector((state) => state.user)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedOrder, setExpandedOrder] = useState(null)

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true)
        if (!user?.uid) {
          setOrders([])
          return
        }
        const data = await getUserOrders(user.uid)
        setOrders(data)
      } finally {
        setLoading(false)
      }
    }

    loadOrders()
  }, [user?.uid])

  const getStatusSteps = (status) => {
    const steps = [
      { key: 'confirmed', label: 'Order Confirmed', icon: FaCheck },
      { key: 'packed', label: 'Packed', icon: FaBox },
      { key: 'shipped', label: 'Shipped', icon: FaTruck },
      { key: 'out_for_delivery', label: 'Out for Delivery', icon: FaShippingFast },
      { key: 'delivered', label: 'Delivered', icon: FaHome },
    ]
    const statusOrder = ['confirmed', 'packed', 'shipped', 'out_for_delivery', 'delivered']
    const currentIndex = statusOrder.indexOf(status)
    return steps.map((step, index) => ({ ...step, completed: index <= currentIndex, current: index === currentIndex }))
  }

  const getStatusColor = (status) => {
    if (status === 'confirmed') return 'bg-blue-500'
    if (status === 'packed') return 'bg-yellow-500'
    if (status === 'shipped') return 'bg-purple-500'
    if (status === 'out_for_delivery') return 'bg-orange-500'
    if (status === 'delivered') return 'bg-green-500'
    if (status === 'cancelled') return 'bg-red-500'
    return 'bg-gray-500'
  }

  const formatDate = (dateValue) => {
    if (!dateValue) return 'N/A'
    return new Date(dateValue).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  const toggleOrder = (orderId) => setExpandedOrder(expandedOrder === orderId ? null : orderId)

  if (loading) {
    return <div className="bg-fk-bg min-h-screen py-8 text-center text-gray-500">Loading your orders...</div>
  }

  if (orders.length === 0) {
    return (
      <div className="bg-fk-bg min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-white rounded shadow-fk p-8 text-center">
            <FaBox className="text-6xl text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No orders yet</h2>
            <p className="text-gray-500 mb-6">You haven&apos;t placed any orders yet.</p>
            <Link to="/products" className="inline-block bg-fk-blue text-white px-6 py-3 rounded font-medium hover:bg-fk-blue-dark transition-colors">
              Start Shopping
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-fk-bg min-h-screen py-4">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">My Orders</h1>
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded shadow-fk overflow-hidden">
              <div className="p-4 cursor-pointer hover:bg-gray-50" onClick={() => toggleOrder(order.id)}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-gray-800">Order #{order.id}</p>
                    <p className="text-sm text-gray-500">Placed on {formatDate(order.orderedAt)}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-full text-white text-sm ${getStatusColor(order.status)}`}>
                      {(order.status || 'unknown').replace(/_/g, ' ')}
                    </span>
                    {expandedOrder === order.id ? <FaChevronUp /> : <FaChevronDown />}
                  </div>
                </div>
              </div>

              {expandedOrder === order.id && (
                <div className="border-t border-gray-200 p-4">
                  {order.status !== 'cancelled' && (
                    <div className="mb-6">
                      <h3 className="font-bold text-gray-800 mb-3">Order Status</h3>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {getStatusSteps(order.status).map((step) => (
                          <div key={step.key} className="flex flex-col items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step.completed ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                              <step.icon />
                            </div>
                            <p className={`text-xs mt-2 text-center ${step.current ? 'font-bold text-fk-blue' : 'text-gray-500'}`}>{step.label}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mb-4">
                    <h3 className="font-bold text-gray-800 mb-3">Items</h3>
                    <div className="space-y-3">
                      {(order.items || []).map((item, index) => (
                        <div key={`${order.id}-${index}`} className="flex gap-4">
                          <img src={item.image} alt={item.title} className="w-16 h-16 object-contain" />
                          <div className="flex-1">
                            <p className="font-medium">{item.title}</p>
                            <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                          </div>
                          <p className="font-bold">Rs. {Number(item.price || 0).toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Payment Method</span>
                      <span className="font-medium">{order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Delivery Address</span>
                      <span className="font-medium text-right">
                        {order.shippingAddress?.name}, {order.shippingAddress?.street}, {order.shippingAddress?.city}, {order.shippingAddress?.pincode}
                      </span>
                    </div>
                    <div className="flex justify-between font-bold text-lg pt-2 border-t">
                      <span>Total</span>
                      <span>Rs. {Number(order.totalAmount || 0).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Orders
