import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Link, Outlet, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import {
  FaBars,
  FaBell,
  FaBox,
  FaLaptop,
  FaShoppingCart,
  FaSignOutAlt,
  FaTachometerAlt,
  FaTimes,
} from 'react-icons/fa'
import { toast } from 'react-toastify'
import { logoutUser } from '../../redux/slices/userSlice'
import { api } from '../../utils/api'

const SEEN_CONFIRMED_ORDERS_KEY = 'admin_seen_confirmed_order_ids'

const getSeenOrderIds = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(SEEN_CONFIRMED_ORDERS_KEY) || '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const saveSeenOrderIds = (ids) => {
  localStorage.setItem(SEEN_CONFIRMED_ORDERS_KEY, JSON.stringify(ids))
}

function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [confirmedOrders, setConfirmedOrders] = useState([])
  const [seenOrderIds, setSeenOrderIds] = useState(getSeenOrderIds)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const notificationsRef = useRef(null)

  const menuItems = [
    { path: '/admin', icon: <FaTachometerAlt />, label: 'Dashboard' },
    { path: '/admin/products', icon: <FaBox />, label: 'Catalog + Slider' },
    { path: '/admin/orders', icon: <FaShoppingCart />, label: 'Orders' },
  ]

  const unseenConfirmedOrders = useMemo(
    () => confirmedOrders.filter((order) => !seenOrderIds.includes(order.id)),
    [confirmedOrders, seenOrderIds]
  )

  const fetchConfirmedOrders = async () => {
    try {
      const response = await api.get('/orders')
      const allOrders = Array.isArray(response.data) ? response.data : []
      const confirmed = allOrders
        .filter((order) => order.status === 'confirmed')
        .sort((a, b) => new Date(b.orderedAt || 0) - new Date(a.orderedAt || 0))
      setConfirmedOrders(confirmed)
    } catch (error) {
      console.error('Failed to fetch admin notifications:', error)
    }
  }

  useEffect(() => {
    fetchConfirmedOrders()
    const intervalId = setInterval(fetchConfirmedOrders, 30000)
    return () => clearInterval(intervalId)
  }, [])

  useEffect(() => {
    const onClickOutside = (event) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setNotificationsOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  const handleLogout = () => {
    dispatch(logoutUser())
    toast.success('Logged out successfully')
    navigate('/')
  }

  const markAllNotificationsAsRead = () => {
    const ids = Array.from(new Set([...seenOrderIds, ...confirmedOrders.map((order) => order.id)]))
    setSeenOrderIds(ids)
    saveSeenOrderIds(ids)
    toast.success('Admin notifications marked as read')
  }

  const openOrdersFromNotification = () => {
    markAllNotificationsAsRead()
    setNotificationsOpen(false)
    navigate('/admin/orders')
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-fk-blue text-white h-16 flex items-center justify-between px-4 fixed w-full top-0 z-50">
        <div className="flex items-center gap-4">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-white hover:text-fk-yellow">
            {sidebarOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
          </button>
          <Link to="/" className="flex items-center gap-2">
            <FaLaptop size={24} />
            <span className="font-bold text-lg">Ramesh Computers</span>
            <span className="bg-fk-yellow text-xs px-2 py-1 rounded">Admin</span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative" ref={notificationsRef}>
            <button
              onClick={() => setNotificationsOpen((prev) => !prev)}
              className="relative text-white hover:text-fk-yellow"
              title="Confirmed order notifications"
            >
              <FaBell size={18} />
              {unseenConfirmedOrders.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-fk-yellow text-fk-blue text-[10px] font-bold rounded-full h-5 min-w-[20px] px-1 flex items-center justify-center">
                  {unseenConfirmedOrders.length}
                </span>
              )}
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-3 w-80 bg-white text-gray-800 rounded-lg shadow-lg overflow-hidden">
                <div className="px-4 py-3 border-b bg-gray-50 flex items-center justify-between">
                  <p className="font-semibold">New Confirmed Orders</p>
                  <button
                    onClick={markAllNotificationsAsRead}
                    className="text-xs text-fk-blue hover:underline"
                  >
                    Mark all read
                  </button>
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {unseenConfirmedOrders.length === 0 ? (
                    <p className="px-4 py-4 text-sm text-gray-500">No new confirmed orders.</p>
                  ) : (
                    unseenConfirmedOrders.map((order) => (
                      <button
                        key={order.id}
                        onClick={openOrdersFromNotification}
                        className="w-full text-left px-4 py-3 border-b hover:bg-gray-50"
                      >
                        <p className="text-sm font-medium">Order {order.id}</p>
                        <p className="text-xs text-gray-600">{order.shippingAddress?.name || 'Customer'}</p>
                        <p className="text-xs text-gray-500">
                          Rs. {Number(order.totalAmount || 0).toLocaleString('en-IN')}
                        </p>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <button onClick={handleLogout} className="flex items-center gap-2 hover:text-fk-yellow">
            <FaSignOutAlt />
            <span className="hidden md:inline">Logout</span>
          </button>
        </div>
      </div>

      <div
        className={`fixed left-0 top-16 h-screen bg-white shadow-lg transition-all duration-300 z-40 ${
          sidebarOpen ? 'w-64' : 'w-0 -translate-x-full'
        }`}
      >
        <nav className="py-4">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-fk-blue hover:text-white transition-colors"
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>

      <div className={`pt-16 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
        <div className="p-6">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default AdminLayout
