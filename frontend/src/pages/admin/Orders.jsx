import React, { useEffect, useMemo, useState } from 'react'
import { FaEye, FaSearch, FaTimes } from 'react-icons/fa'
import { toast } from 'react-toastify'
import { getAllOrders, updateOrderStatus } from '../../firebase/services/orderService'
import { formatCurrency } from '../../utils/formatters'
import { getOrderDisplayId, matchesOrderSearch } from '../../utils/orderDisplay'

function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const data = await getAllOrders()
      setOrders(data)
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus)
      const orderLabel = getOrderDisplayId(orders.find((order) => order.id === orderId) || { id: orderId })
      await fetchOrders()
      toast.success(`Order ${orderLabel} status updated to ${newStatus}`)
    } catch (error) {
      console.error('Error updating order status:', error)
    }
  }

  const handleViewOrder = (order) => {
    setSelectedOrder(order)
    setShowDetailModal(true)
  }

  const getStatusOptions = (currentStatus) => {
    const statuses = ['confirmed', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled']
    const currentIndex = statuses.indexOf(currentStatus)
    if (currentIndex === -1) return statuses.slice(0, -1)
    return statuses.slice(currentIndex + 1)
  }

  const getStatusBadge = (status) => {
    const colors = {
      confirmed: 'bg-fk-blue text-white',
      packed: 'bg-fk-yellow text-white',
      shipped: 'bg-fk-teal text-white',
      out_for_delivery: 'bg-fk-yellow-dark text-white',
      delivered: 'bg-fk-blue-dark text-white',
      cancelled: 'bg-red-100 text-red-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const filteredOrders = useMemo(() => {
    if (!searchTerm.trim()) return orders
    return orders.filter((order) => matchesOrderSearch(order, searchTerm))
  }, [orders, searchTerm])

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A'
    if (timestamp.toDate) {
      return timestamp.toDate().toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    }
    return new Date(timestamp).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Orders Management</h1>

      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by order number"
              value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-fk-blue"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading orders...</div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {searchTerm ? 'No orders match that number.' : 'No orders yet.'}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="divide-y divide-gray-100 md:hidden">
            {filteredOrders.map((order) => (
              <article key={order.id} className="p-4 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-gray-900">Order {getOrderDisplayId(order)}</p>
                    <p className="text-sm text-gray-500 mt-1">{order.shippingAddress?.name || 'N/A'}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${getStatusBadge(order.status)}`}>
                    {(order.status || '').replace(/_/g, ' ')}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-400">Date</p>
                    <p className="font-medium text-gray-800">{formatDate(order.orderedAt)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Amount</p>
                    <p className="font-medium text-gray-800">{formatCurrency(order.totalAmount)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Payment</p>
                    <p className="font-medium text-gray-800">
                      {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">Items</p>
                    <p className="font-medium text-gray-800">{Array.isArray(order.items) ? order.items.length : 0}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => handleViewOrder(order)}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-fk-blue text-white py-2.5 text-sm font-medium hover:bg-fk-blue-dark"
                  >
                    <FaEye />
                    View Details
                  </button>
                  {order.status !== 'delivered' && order.status !== 'cancelled' ? (
                    <select
                      value=""
                      onChange={(event) => updateStatus(order.id, event.target.value)}
                      className="text-sm border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:border-fk-blue"
                    >
                      <option value="">Update Status</option>
                      {getStatusOptions(order.status).map((status) => (
                        <option key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </option>
                      ))}
                    </select>
                  ) : null}
                </div>
              </article>
            ))}
          </div>

          <div className="hidden md:block overflow-x-auto">
            <table className="w-full min-w-[860px]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Order Number</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Customer</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Amount</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Payment</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="border-t hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{getOrderDisplayId(order)}</td>
                    <td className="py-3 px-4">{order.shippingAddress?.name || 'N/A'}</td>
                    <td className="py-3 px-4">{formatDate(order.orderedAt)}</td>
                    <td className="py-3 px-4">{formatCurrency(order.totalAmount)}</td>
                    <td className="py-3 px-4">
                      <span className="text-sm">
                        {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs ${getStatusBadge(order.status)}`}>
                        {(order.status || '').replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewOrder(order)}
                          className="text-fk-blue hover:text-fk-blue-dark p-2"
                          title="View Details"
                        >
                          <FaEye />
                        </button>
                        {order.status !== 'delivered' && order.status !== 'cancelled' && (
                          <select
                            value=""
                            onChange={(event) => updateStatus(order.id, event.target.value)}
                            className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-fk-blue"
                          >
                            <option value="">Update Status</option>
                            {getStatusOptions(order.status).map((status) => (
                              <option key={status} value={status}>
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showDetailModal && selectedOrder ? (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-5 sm:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Order Details - {getOrderDisplayId(selectedOrder)}</h2>
              <button
                onClick={() => {
                  setShowDetailModal(false)
                  setSelectedOrder(null)
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Order Information</h3>
                  <p className="text-sm">
                    <span className="font-medium">Order Number:</span> {getOrderDisplayId(selectedOrder)}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Date:</span> {formatDate(selectedOrder.orderedAt)}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Status:</span>
                    <span className={`ml-2 px-2 py-1 rounded text-xs ${getStatusBadge(selectedOrder.status)}`}>
                      {selectedOrder.status}
                    </span>
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Payment Method:</span>{' '}
                    {selectedOrder.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online'}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Payment Status:</span> {selectedOrder.paymentStatus}
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Shipping Address</h3>
                  <p className="text-sm">{selectedOrder.shippingAddress?.name}</p>
                  <p className="text-sm">{selectedOrder.shippingAddress?.street}</p>
                  <p className="text-sm">
                    {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state}
                  </p>
                  <p className="text-sm">PIN: {selectedOrder.shippingAddress?.pincode}</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Order Items</h3>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left py-2 px-4 text-sm font-medium">Item</th>
                        <th className="text-right py-2 px-4 text-sm font-medium">Price</th>
                        <th className="text-right py-2 px-4 text-sm font-medium">Qty</th>
                        <th className="text-right py-2 px-4 text-sm font-medium">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items?.map((item, index) => (
                        <tr key={index} className="border-t">
                          <td className="py-2 px-4 text-sm">{item.title}</td>
                          <td className="py-2 px-4 text-sm text-right">{formatCurrency(item.price)}</td>
                          <td className="py-2 px-4 text-sm text-right">{item.quantity}</td>
                          <td className="py-2 px-4 text-sm text-right">
                            {formatCurrency(item.price * item.quantity)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      {selectedOrder.couponCode ? (
                        <tr>
                          <td colSpan="3" className="py-2 px-4 text-sm font-medium text-right">
                            Coupon:
                          </td>
                          <td className="py-2 px-4 text-sm text-right">{selectedOrder.couponCode}</td>
                        </tr>
                      ) : null}
                      <tr>
                        <td colSpan="3" className="py-2 px-4 text-sm font-medium text-right">
                          Subtotal:
                        </td>
                        <td className="py-2 px-4 text-sm text-right">
                          {formatCurrency(selectedOrder.subtotal || selectedOrder.totalAmount)}
                        </td>
                      </tr>
                      {Number(selectedOrder.discountAmount || 0) > 0 ? (
                        <tr>
                          <td colSpan="3" className="py-2 px-4 text-sm font-medium text-right">
                            Discount:
                          </td>
                          <td className="py-2 px-4 text-sm text-right text-fk-teal">
                            -{formatCurrency(selectedOrder.discountAmount)}
                          </td>
                        </tr>
                      ) : null}
                      <tr>
                        <td colSpan="3" className="py-2 px-4 text-sm font-medium text-right">
                          Delivery:
                        </td>
                        <td className="py-2 px-4 text-sm text-right">
                          {Number(selectedOrder.deliveryCharge || 0) > 0 ? formatCurrency(selectedOrder.deliveryCharge) : 'FREE'}
                        </td>
                      </tr>
                      <tr>
                        <td colSpan="3" className="py-2 px-4 text-sm font-medium text-right">
                          Total:
                        </td>
                        <td className="py-2 px-4 text-sm font-bold text-right">
                          {formatCurrency(selectedOrder.totalAmount)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {selectedOrder.status !== 'delivered' && selectedOrder.status !== 'cancelled' ? (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Update Status</h3>
                  <div className="flex gap-2 flex-wrap">
                    {getStatusOptions(selectedOrder.status).map((status) => (
                      <button
                        key={status}
                        onClick={() => updateStatus(selectedOrder.id, status)}
                        className="px-4 py-2 bg-fk-blue text-white rounded hover:bg-fk-blue-dark text-sm"
                      >
                        Mark as {status.charAt(0).toUpperCase() + status.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default AdminOrders
