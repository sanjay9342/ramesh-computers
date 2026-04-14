import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import {
  FaBars,
  FaBell,
  FaBox,
  FaTags,
  FaShoppingCart,
  FaSignOutAlt,
  FaStore,
  FaTachometerAlt,
  FaTimes,
  FaUsers,
} from 'react-icons/fa'
import { AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import { logoutUser } from '../../redux/slices/userSlice'
import { api } from '../../utils/api'
import PageTransition from '../PageTransition'
import { STORE_INFO } from '../../data/storeInfo'

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
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window === 'undefined') return true
    return window.innerWidth >= 1024
  })
  const [isDesktopSidebar, setIsDesktopSidebar] = useState(() => {
    if (typeof window === 'undefined') return true
    return window.innerWidth >= 1024
  })
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [confirmedOrders, setConfirmedOrders] = useState([])
  const [seenOrderIds, setSeenOrderIds] = useState(getSeenOrderIds)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const notificationsRef = useRef(null)
  const hasLoadedNotificationsRef = useRef(false)
  const seenOrderIdsRef = useRef(seenOrderIds)

  const menuItems = [
    { path: '/admin', icon: <FaTachometerAlt />, label: 'Dashboard' },
    { path: '/admin/products', icon: <FaBox />, label: 'Catalog + Slider' },
    { path: '/admin/orders', icon: <FaShoppingCart />, label: 'Orders' },
    { path: '/admin/place-order', icon: <FaStore />, label: 'Place Order' },
    { path: '/admin/coupons', icon: <FaTags />, label: 'Coupons' },
    { path: '/admin/customers', icon: <FaUsers />, label: 'Customers' },
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
      setConfirmedOrders((previousConfirmedOrders) => {
        const previousIds = new Set(previousConfirmedOrders.map((order) => order.id))
        const newUnseenOrders = confirmed.filter(
          (order) => !previousIds.has(order.id) && !seenOrderIdsRef.current.includes(order.id)
        )

        if (hasLoadedNotificationsRef.current && newUnseenOrders.length > 0) {
          const latestOrder = newUnseenOrders[0]
          toast.info(
            `New order ${latestOrder.id} from ${latestOrder.shippingAddress?.name || 'Customer'} is awaiting action.`
          )
        }
        hasLoadedNotificationsRef.current = true
        return confirmed
      })
    } catch (error) {
      console.error('Failed to fetch admin notifications:', error)
    }
  }

  useEffect(() => {
    seenOrderIdsRef.current = seenOrderIds
  }, [seenOrderIds])

  useEffect(() => {
    fetchConfirmedOrders()
    const intervalId = setInterval(fetchConfirmedOrders, 30000)
    return () => clearInterval(intervalId)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return undefined

    let previousDesktopState = window.innerWidth >= 1024
    const handleResize = () => {
      const nextDesktopState = window.innerWidth >= 1024
      setIsDesktopSidebar(nextDesktopState)
      if (nextDesktopState !== previousDesktopState) {
        setSidebarOpen(nextDesktopState)
        previousDesktopState = nextDesktopState
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (!isDesktopSidebar) {
      setSidebarOpen(false)
    }
  }, [isDesktopSidebar, location.pathname])

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
    <div className="min-h-screen bg-[#fff8fa]">
      <div className="bg-gradient-to-r from-fk-blue via-fk-yellow to-fk-blue-dark text-white h-16 flex items-center justify-between px-3 sm:px-4 fixed w-full top-0 z-50 shadow-fk">
        <div className="flex items-center gap-4">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-white hover:text-fk-teal transition-colors">
            {sidebarOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
          </button>
          <Link to="/" className="flex items-center gap-2 sm:gap-3 ml-1 sm:ml-2 min-w-0">
            <img
              src={STORE_INFO.logo}
              alt={STORE_INFO.name}
              className="h-10 sm:h-12 w-auto max-w-[132px] sm:max-w-[190px] object-contain"
            />
            <span className="hidden sm:inline-flex bg-white/15 text-white text-xs font-semibold px-2 py-1 rounded border border-white/20">
              Admin
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <div className="relative" ref={notificationsRef}>
            <button
              onClick={() => setNotificationsOpen((prev) => !prev)}
              className="relative text-white hover:text-fk-teal transition-colors"
              title="Confirmed order notifications"
            >
              <FaBell size={18} />
              {unseenConfirmedOrders.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-white text-fk-blue text-[10px] font-bold rounded-full h-5 min-w-[20px] px-1 flex items-center justify-center">
                  {unseenConfirmedOrders.length}
                </span>
              )}
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-3 w-[min(20rem,calc(100vw-1.5rem))] bg-white text-gray-800 rounded-lg shadow-fk overflow-hidden border border-fk-border">
                <div className="px-4 py-3 border-b border-fk-border bg-fk-bg flex items-center justify-between">
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
                        className="w-full text-left px-4 py-3 border-b border-fk-border hover:bg-fk-bg"
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

          <button onClick={handleLogout} className="flex items-center gap-2 hover:text-fk-teal transition-colors">
            <FaSignOutAlt />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>

      {sidebarOpen && !isDesktopSidebar ? (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 top-16 bg-black/35 z-30 lg:hidden"
        />
      ) : null}

      <div
        className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white border-r border-fk-border shadow-fk transition-transform duration-300 z-40 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } ${isDesktopSidebar ? 'w-64' : 'w-[280px] max-w-[84vw]'
        }`}
      >
        <nav className="py-4 overflow-y-auto h-full">
          {menuItems.map((item) => {
            const isActive = item.path === '/admin'
              ? location.pathname === '/admin'
              : location.pathname.startsWith(item.path)

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                  isActive
                    ? 'bg-fk-bg text-fk-blue border-r-4 border-fk-blue font-semibold'
                    : 'text-gray-700 hover:bg-fk-bg hover:text-fk-blue'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      <div className={`pt-16 transition-all duration-300 ${sidebarOpen && isDesktopSidebar ? 'lg:ml-64' : 'ml-0'}`}>
        <div className="p-3 sm:p-4 lg:p-6">
          <AnimatePresence mode="wait">
            <PageTransition routeKey={`${location.pathname}${location.search}`}>
              <Outlet />
            </PageTransition>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

export default AdminLayout
