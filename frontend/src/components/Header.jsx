import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import {
  FaSearch,
  FaShoppingCart,
  FaHeart,
  FaUser,
  FaSignOutAlt,
  FaBox,
  FaLaptop,
  FaDesktop,
  FaVolumeUp,
  FaPrint,
  FaVideo,
  FaHeadphones,
  FaListAlt,
  FaSolarPanel,
} from 'react-icons/fa'
import { toast } from 'react-toastify'
import { logoutUser } from '../redux/slices/userSlice'
import { PRODUCT_CATEGORIES, STORE_INFO } from '../data/storeInfo'

function Header() {
  const [searchQuery, setSearchQuery] = useState('')
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showCategories, setShowCategories] = useState(true)
  const userMenuRef = useRef(null)
  const lastScrollYRef = useRef(0)
  const lastToggleYRef = useRef(0)
  const showCategoriesRef = useRef(true)
  const tickingRef = useRef(false)
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()

  const { user, isAuthenticated } = useSelector((state) => state.user)
  const { totalQuantity } = useSelector((state) => state.cart)
  const { items: wishlistItems } = useSelector((state) => state.wishlist)

  const categoryIcons = {
    laptops: <FaLaptop />,
    desktops: <FaDesktop />,
    speakers: <FaVolumeUp />,
    printers: <FaPrint />,
    solar: <FaSolarPanel />,
    cctv: <FaVideo />,
    accessories: <FaHeadphones />,
  }

  const categories = [
    { name: 'For You', slug: '', icon: <FaListAlt /> },
    ...PRODUCT_CATEGORIES.map((category) => ({
      ...category,
      icon: categoryIcons[category.slug],
    })),
  ]

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const handleLogout = () => {
    dispatch(logoutUser())
    toast.success('Logged out successfully')
    setShowUserMenu(false)
    navigate('/')
  }

  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    showCategoriesRef.current = showCategories
  }, [showCategories])

  useEffect(() => {
    const handleScroll = () => {
      if (tickingRef.current) return
      tickingRef.current = true

      window.requestAnimationFrame(() => {
        const currentY = window.scrollY || 0
        const delta = currentY - lastScrollYRef.current
        const minDelta = 2
        const toggleDistance = 8
        const topShowThreshold = 6

        if (currentY <= topShowThreshold) {
          if (!showCategoriesRef.current) {
            showCategoriesRef.current = true
            setShowCategories(true)
          }
          lastScrollYRef.current = currentY
          lastToggleYRef.current = currentY
          tickingRef.current = false
          return
        }

        if (Math.abs(delta) >= minDelta) {
          if (delta > 0 && showCategoriesRef.current) {
            if (Math.abs(currentY - lastToggleYRef.current) >= toggleDistance) {
              showCategoriesRef.current = false
              lastToggleYRef.current = currentY
              setShowCategories(false)
            }
          } else if (delta < 0 && !showCategoriesRef.current) {
            if (Math.abs(currentY - lastToggleYRef.current) >= toggleDistance) {
              showCategoriesRef.current = true
              lastToggleYRef.current = currentY
              setShowCategories(true)
            }
          }
        }

        lastScrollYRef.current = currentY
        tickingRef.current = false
      })
    }

    lastScrollYRef.current = window.scrollY || 0
    lastToggleYRef.current = lastScrollYRef.current
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header className="sticky top-0 z-50 border-b border-fk-border bg-white/95 shadow-[0_10px_24px_rgba(94,13,54,0.06)] backdrop-blur">
      <div className="w-full px-0 pr-3 sm:pr-4 lg:pr-6">
        <div className="flex items-center justify-between py-2">
          <Link to="/" className="flex items-center self-center shrink-0 ml-3 sm:ml-4 lg:ml-6">
            <img
              src={STORE_INFO.logo}
              alt={STORE_INFO.name}
              className="h-12 sm:h-14 md:h-16 w-auto max-w-[180px] sm:max-w-[220px] md:max-w-[260px] object-contain"
            />
          </Link>

          <form onSubmit={handleSearch} className="md:hidden flex-1 max-w-[200px] mx-2">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 pl-3 pr-10 rounded-full border border-fk-border bg-fk-bg focus:border-fk-blue focus:outline-none focus:ring-2 focus:ring-fk-blue/20 text-xs text-[#2f1b24] placeholder:text-[#9a7a88]"
              />
              <button
                type="submit"
                className="absolute right-1 top-1 h-7 w-7 flex items-center justify-center bg-fk-blue hover:bg-fk-blue-dark rounded-full transition-colors"
              >
                <FaSearch className="text-white text-xs" />
              </button>
            </div>
          </form>

          <form
            onSubmit={handleSearch}
            className="hidden md:flex flex-1 max-w-2xl mx-3 items-center"
          >
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search for products, brands and more"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-4 pr-12 rounded-full border-2 border-fk-border bg-fk-bg focus:border-fk-blue focus:outline-none focus:ring-2 focus:ring-fk-blue/20 text-sm text-[#2f1b24] placeholder:text-[#9a7a88]"
              />
              <button
                type="submit"
                className="absolute right-1 top-1 h-8 w-9 flex items-center justify-center bg-fk-blue hover:bg-fk-blue-dark rounded-full transition-colors"
              >
                <FaSearch className="text-white" />
              </button>
            </div>
          </form>

          <div className="flex items-center gap-4 md:gap-8 text-[#4a2735]">
            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 text-[#3f212d] font-semibold hover:text-fk-blue"
                >
                  <abbr title={user?.displayName || user?.email || 'Account'} className="no-underline">
                    <FaUser />
                  </abbr>
                  <span className="hidden sm:inline">{user?.displayName || 'Account'}</span>
                </button>
                {showUserMenu && (
                  <div className="absolute top-full right-0 mt-1 w-48 bg-white rounded-lg border border-fk-border shadow-fk py-2 z-50">
                    <Link
                      to="/orders"
                      className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-fk-bg"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <FaBox className="text-fk-blue" />
                      My Orders
                    </Link>
                    <Link
                      to="/wishlist"
                      className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-fk-bg"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <FaHeart className="text-fk-teal" />
                      Wishlist
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-fk-bg w-full"
                    >
                      <FaSignOutAlt className="text-red-500" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="text-[#3f212d] font-semibold hover:text-fk-blue">
                Login
              </Link>
            )}

            <Link to="/wishlist" className="hidden sm:flex items-center gap-2 text-[#3f212d] font-semibold hover:text-fk-blue">
              <div className="relative">
                <FaHeart className="text-xl" />
                {wishlistItems.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-fk-blue text-white text-xs font-bold min-w-[20px] h-5 px-1 rounded-full flex items-center justify-center">
                    {wishlistItems.length}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline">Wishlist</span>
            </Link>

            <Link to="/cart" className="flex items-center gap-2 text-[#3f212d] font-semibold hover:text-fk-blue">
              <div className="relative">
                <FaShoppingCart className="text-xl" />
                {totalQuantity > 0 && (
                  <span className="absolute -top-2 -right-2 bg-fk-blue text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {totalQuantity}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline">Cart</span>
            </Link>
          </div>
        </div>
      </div>

      <div
        className={`overflow-hidden border-t border-fk-border/70 bg-[#fff8fa] transition-[max-height,opacity,transform] duration-300 ease-in-out ${
          showCategories
            ? 'max-h-[120px] opacity-100 translate-y-0'
            : 'max-h-0 opacity-0 -translate-y-2 pointer-events-none'
        }`}
      >
        <div className="w-full px-0">
          <nav className="flex items-center gap-6 md:gap-7 min-h-[64px] md:min-h-[80px] py-2 md:py-3 overflow-x-auto text-base font-semibold text-[#6f5a66] md:justify-between w-full pl-2 pr-2 sm:pl-3 sm:pr-3 lg:pl-6 lg:pr-6">
            {categories.map((category) => {
              const isActive =
                (category.slug && location.pathname === `/category/${category.slug}`) ||
                (!category.slug && location.pathname === '/')

              return (
                <Link
                  key={category.slug}
                  to={category.slug ? `/category/${category.slug}` : '/'}
                  className={`group whitespace-nowrap flex flex-col items-center gap-2 px-2 py-2 transition-colors ${
                    isActive ? 'text-fk-blue' : 'text-[#6f5a66] hover:text-fk-blue'
                  }`}
                >
                  <span
                    className={`w-10 h-10 md:w-11 md:h-11 rounded-2xl flex items-center justify-center text-lg md:text-xl transition-colors ${
                      isActive
                        ? 'bg-gradient-to-br from-fk-blue to-fk-teal text-white shadow-fk'
                        : 'bg-white border border-fk-border text-fk-blue group-hover:border-fk-blue group-hover:bg-fk-bg group-hover:text-fk-blue'
                    }`}
                  >
                    {category.icon}
                  </span>
                  <span className="text-xs md:text-sm font-semibold">{category.name}</span>
                </Link>
              )
            })}
            <Link
              to="/products"
              className="ml-auto whitespace-nowrap text-sm font-medium text-fk-blue hover:text-fk-teal transition-colors hidden md:inline"
            >
              View All
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}

export default Header
