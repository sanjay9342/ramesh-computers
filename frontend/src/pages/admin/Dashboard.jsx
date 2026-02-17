import React, { useState, useEffect } from 'react'
import { FaBox, FaShoppingCart, FaRupeeSign, FaArrowUp, FaArrowDown } from 'react-icons/fa'
import { getAllOrders } from '../../firebase/services/orderService'
import { getAllProducts } from '../../services/productService'

function Dashboard() {
  const [stats, setStats] = useState([])
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const brands = ['HP', 'Dell', 'Lenovo', 'ASUS', 'Acer', 'MSI', 'Apple', 'Samsung', 'LG', 'Canon']

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch orders and products
      const [orders, products] = await Promise.all([
        getAllOrders(),
        getAllProducts()
      ])

      // Calculate stats
      const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0)
      const pendingOrders = orders.filter(o => o.status === 'confirmed' || o.status === 'packed').length
      const shippedOrders = orders.filter(o => o.status === 'shipped').length
      const deliveredOrders = orders.filter(o => o.status === 'delivered').length

      setStats([
        { label: 'Total Orders', value: orders.length.toString(), icon: <FaShoppingCart />, change: '+12%', up: true },
        { label: 'Total Products', value: products.length.toString(), icon: <FaBox />, change: '+5%', up: true },
        { label: 'Pending Orders', value: pendingOrders.toString(), icon: <FaShoppingCart />, change: '-3%', up: false },
        { label: 'Revenue', value: `₹${(totalRevenue / 100000).toFixed(1)}L`, icon: <FaRupeeSign />, change: '+8%', up: true },
      ])

      // Get recent orders (last 5)
      setRecentOrders(orders.slice(0, 5))

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      // Set default stats on error
      setStats([
        { label: 'Total Orders', value: '0', icon: <FaShoppingCart />, change: '+0%', up: true },
        { label: 'Total Products', value: '0', icon: <FaBox />, change: '+0%', up: true },
        { label: 'Pending Orders', value: '0', icon: <FaShoppingCart />, change: '+0%', up: true },
        { label: 'Revenue', value: '₹0L', icon: <FaRupeeSign />, change: '+0%', up: true },
      ])
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const colors = {
      confirmed: 'bg-blue-100 text-blue-800',
      packed: 'bg-yellow-100 text-yellow-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-fk-blue bg-opacity-10 rounded-full flex items-center justify-center text-fk-blue">
                {stat.icon}
              </div>
              <div className={`flex items-center gap-1 text-sm ${stat.up ? 'text-green-500' : 'text-red-500'}`}>
                {stat.up ? <FaArrowUp /> : <FaArrowDown />}
                {stat.change}
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
            <p className="text-sm text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Recent Orders</h2>
        {recentOrders.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No orders yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Order ID</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Customer</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Amount</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">{order.id}</td>
                    <td className="py-3 px-4">{order.shippingAddress?.name || 'N/A'}</td>
                    <td className="py-3 px-4">₹{order.totalAmount?.toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs ${
                        getStatusBadge(order.status)
                      }`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Top Brands */}
      <div className="bg-white rounded-lg shadow p-6 mt-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Top Brands</h2>
        <div className="relative overflow-hidden rounded-xl border border-gray-100">
          <div className="brand-marquee flex gap-4 py-3 px-2">
            {[...brands, ...brands].map((brand, index) => (
              <span
                key={`${brand}-${index}`}
                className="px-3 py-2 bg-slate-100 rounded-full text-sm font-semibold text-gray-800 whitespace-nowrap"
              >
                {brand}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
