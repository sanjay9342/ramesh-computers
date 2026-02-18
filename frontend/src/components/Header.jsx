import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { FaSearch, FaShoppingCart, FaHeart, FaUser, FaSignOutAlt, FaBox, FaLaptop, FaDesktop, FaVolumeUp, FaPrint, FaVideo, FaHeadphones, FaListAlt } from 'react-icons/fa'
import { toast } from 'react-toastify'
import { logoutUser } from '../redux/slices/userSlice'

function Header() {
  const [searchQuery, setSearchQuery] = useState('')
  const [showUserMenu, setShowUserMenu] = useState(false)
  const userMenuRef = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  
  const { user, isAuthenticated } = useSelector((state) => state.user)
  const { totalQuantity } = useSelector((state) => state.cart)
  const { items: wishlistItems } = useSelector((state) => state.wishlist)

  const categories = [
    { name: 'For You', slug: '', icon: <FaListAlt /> },
    { name: 'Laptops', slug: 'laptops', icon: <FaLaptop /> },
    { name: 'Desktops', slug: 'desktops', icon: <FaDesktop /> },
    { name: 'Speakers', slug: 'speakers', icon: <FaVolumeUp /> },
    { name: 'Printers', slug: 'printers', icon: <FaPrint /> },
    { name: 'CCTV', slug: 'cctv', icon: <FaVideo /> },
    { name: 'Accessories', slug: 'accessories', icon: <FaHeadphones /> },
  ]

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/products?search=${searchQuery}`)
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


  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-4">
        <div className="flex items-center justify-between min-h-[94px] py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="text-fk-blue font-bold text-xl">
              Ramesh<span className="text-fk-yellow">Computers</span>
            </span>
          </Link>

          {/* Search Bar (desktop only) */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex flex-1 max-w-2xl mx-3"
          >
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search for products, brands and more"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-4 pr-12 rounded-full border-2 border-fk-blue focus:outline-none focus:ring-2 focus:ring-fk-blue text-sm"
              />
              <button
                type="submit"
                className="absolute right-1 top-1 h-8 w-9 flex items-center justify-center bg-fk-yellow hover:bg-yellow-500 rounded-full transition-colors"
              >
                <FaSearch className="text-white" />
              </button>
            </div>
          </form>

          {/* Right Section */}
          <div className="flex items-center gap-7 md:gap-8 text-[#444444]">
            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 text-slate-800 font-semibold hover:text-fk-blue"
                >
                  <abbr title={user?.displayName || user?.email || 'Account'} className="no-underline">
                    <FaUser />
                  </abbr>
                  <span className="hidden sm:inline">{user?.displayName || 'Account'}</span>
                </button>
                {showUserMenu && (
                  <div className="absolute top-full right-0 mt-1 w-48 bg-white rounded shadow-lg py-2 z-50">
                    <Link
                      to="/orders"
                      className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <FaBox className="text-fk-blue" />
                      My Orders
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 w-full"
                    >
                      <FaSignOutAlt className="text-red-500" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="text-slate-800 font-semibold hover:text-fk-blue">
                Login
              </Link>
            )}

            <Link to="/wishlist" className="flex items-center gap-2 text-slate-800 font-semibold hover:text-fk-blue">
              <div className="relative">
                <FaHeart className="text-xl" />
                {wishlistItems.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-fk-yellow text-xs min-w-[20px] h-5 px-1 rounded-full flex items-center justify-center">
                    {wishlistItems.length}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline">Wishlist</span>
            </Link>

            {/* Cart always visible */}
            <Link to="/cart" className="flex items-center gap-2 text-slate-800 font-semibold hover:text-fk-blue">
              <div className="relative">
                <FaShoppingCart className="text-xl" />
                {totalQuantity > 0 && (
                  <span className="absolute -top-2 -right-2 bg-fk-yellow text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {totalQuantity}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline">Cart</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Categories Navbar */}
      <div className="bg-white border-t border-gray-100 sticky top-[94px] z-40">
        <div className="max-w-7xl mx-auto px-3 sm:px-4">
          <nav className="flex items-center gap-8 h-16 overflow-x-auto text-base font-semibold text-[#444444] md:justify-between w-full px-1">
            {categories.map((category) => (
              <Link
                key={category.slug}
                to={category.slug ? `/category/${category.slug}` : '/'}
                className={`whitespace-nowrap flex flex-col items-center gap-1 pb-1 border-b-2 px-2 ${
                  (category.slug && location.pathname === `/category/${category.slug}`) || (!category.slug && location.pathname === '/')
                    ? 'text-fk-blue border-fk-blue'
                    : 'text-[#444444] border-transparent hover:text-fk-blue hover:border-fk-blue'
                } transition-colors`}
              >
                <span className="text-lg md:text-xl">{category.icon}</span>
                <span className="text-xs md:text-sm font-semibold">{category.name}</span>
              </Link>
            ))}
            <Link
              to="/products"
              className="ml-auto whitespace-nowrap text-sm font-medium text-fk-yellow hover:text-yellow-600 transition-colors hidden md:inline"
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
