import React, { useEffect, useState, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { FaFilter, FaChevronDown, FaChevronUp, FaStar } from 'react-icons/fa'
import ProductCard from '../components/ProductCard'
import { getAllProducts } from '../services/productService'

function Products() {
  const { slug } = useParams()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    category: '',
    brand: [],
    priceRange: [0, 100000],
    rating: 0,
  })
  const [sortBy, setSortBy] = useState('popularity')
  
  const [showFilters, setShowFilters] = useState(true)
  const [expandedSections, setExpandedSections] = useState({
    brand: true,
    price: true,
    rating: false
  })

  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    if (slug) {
      setFilters(prev => ({ ...prev, category: slug }))
    }
  }, [slug])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const data = await getAllProducts()
      setProducts(data)
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  // Apply filters and sorting client-side
  const filteredProducts = useMemo(() => {
    let filtered = [...products]
    
    // Category filter
    if (filters.category) {
      filtered = filtered.filter(p => p.category === filters.category)
    }
    
    // Brand filter
    if (filters.brand.length > 0) {
      filtered = filtered.filter(p => filters.brand.includes(p.brand))
    }
    
    // Price filter
    filtered = filtered.filter(
      p => (p.price || 0) >= filters.priceRange[0] && (p.price || 0) <= filters.priceRange[1]
    )
    
    // Rating filter
    if (filters.rating > 0) {
      filtered = filtered.filter(p => (p.rating || 0) >= filters.rating)
    }
    
    // Sorting
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => (a.price || 0) - (b.price || 0))
        break
      case 'price-high':
        filtered.sort((a, b) => (b.price || 0) - (a.price || 0))
        break
      case 'rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0))
        break
      case 'newest':
        filtered.sort((a, b) => {
          const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0)
          const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0)
          return dateB - dateA
        })
        break
      default:
        // popularity - sort by rating
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0))
    }
    
    return filtered
  }, [products, filters, sortBy])

  const brands = ['HP', 'Dell', 'Lenovo', 'ASUS', 'Acer', 'MSI', 'Apple', 'Samsung', 'LG', 'Canon', 'Epson']
  
  const categoryBrands = {
    laptops: ['HP', 'Dell', 'Lenovo', 'ASUS', 'Acer', 'MSI', 'Apple'],
    desktops: ['HP', 'Dell', 'Lenovo', 'ASUS', 'Acer', 'MSI'],
    speakers: ['JBL', 'Sony', 'Bose', 'Logitech', 'Philips'],
    printers: ['HP', 'Canon', 'Epson', 'Brother'],
    cctv: ['CP Plus', 'Godrej', 'Hikvision', 'Essence'],
    accessories: ['Logitech', 'Dell', 'HP', 'Lenovo', 'Samsung']
  }

  const currentBrands = categoryBrands[filters.category] || brands

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const handleBrandToggle = (brand) => {
    const newBrands = filters.brand.includes(brand)
      ? filters.brand.filter(b => b !== brand)
      : [...filters.brand, brand]
    setFilters(prev => ({ ...prev, brand: newBrands }))
  }

  const handleSortChange = (e) => {
    setSortBy(e.target.value)
  }

  const handlePriceChange = (e, index) => {
    const newRange = [...filters.priceRange]
    newRange[index] = parseInt(e.target.value)
    setFilters(prev => ({ ...prev, priceRange: newRange }))
  }

  const handleRatingChange = (rating) => {
    setFilters(prev => ({ ...prev, rating }))
  }

  return (
    <div className="bg-fk-bg min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Breadcrumb */}
        <div className="mb-4 text-sm">
          <span className="text-gray-500">Home</span>
          <span className="mx-2 text-gray-400">/</span>
          <span className="text-gray-700 capitalize">{slug || 'All Products'}</span>
        </div>

        <div className="flex gap-6">
          {/* Filters Sidebar */}
          {showFilters && (
            <div className="w-64 flex-shrink-0 hidden lg:block">
              <div className="bg-white rounded shadow-fk p-4 sticky top-24">
                {/* Brand Filter */}
                <div className="border-b border-gray-200 pb-4 mb-4">
                  <button 
                    onClick={() => toggleSection('brand')}
                    className="flex items-center justify-between w-full font-bold text-gray-800"
                  >
                    Brand
                    {expandedSections.brand ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
                  </button>
                  {expandedSections.brand && (
                    <div className="mt-3 space-y-2">
                      {currentBrands.map((brand) => (
                        <label key={brand} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={filters.brand.includes(brand)}
                            onChange={() => handleBrandToggle(brand)}
                            className="rounded border-gray-300 text-fk-blue focus:ring-fk-blue"
                          />
                          <span className="text-sm text-gray-700">{brand}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Price Filter */}
                <div className="border-b border-gray-200 pb-4 mb-4">
                  <button 
                    onClick={() => toggleSection('price')}
                    className="flex items-center justify-between w-full font-bold text-gray-800"
                  >
                    Price
                    {expandedSections.price ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
                  </button>
                  {expandedSections.price && (
                    <div className="mt-3">
                      <input
                        type="range"
                        min="0"
                        max="200000"
                        step="5000"
                        value={filters.priceRange[1]}
                        onChange={(e) => handlePriceChange(e, 1)}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-gray-600 mt-2">
                        <span>₹{filters.priceRange[0].toLocaleString()}</span>
                        <span>₹{filters.priceRange[1].toLocaleString()}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Rating Filter */}
                <div>
                  <button 
                    onClick={() => toggleSection('rating')}
                    className="flex items-center justify-between w-full font-bold text-gray-800"
                  >
                    Rating
                    {expandedSections.rating ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
                  </button>
                  {expandedSections.rating && (
                    <div className="mt-3 space-y-2">
                      {[4, 3, 2, 1].map((rating) => (
                        <label key={rating} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="rating"
                            checked={filters.rating === rating}
                            onChange={() => handleRatingChange(rating)}
                            className="border-gray-300 text-fk-blue focus:ring-fk-blue"
                          />
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <FaStar 
                                key={i} 
                                className={`text-xs ${i < rating ? 'text-fk-yellow' : 'text-gray-300'}`} 
                              />
                            ))}
                            <span className="text-sm text-gray-600 ml-1">& above</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Products Grid */}
          <div className="flex-1">
            {/* Sort and Filter Bar */}
            <div className="bg-white rounded shadow-fk p-4 mb-4 flex items-center justify-between">
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 text-gray-700 hover:text-fk-blue"
              >
                <FaFilter />
                <span>{showFilters ? 'Hide Filters' : 'Show Filters'}</span>
              </button>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Sort by:</span>
                <select 
                  value={sortBy} 
                  onChange={handleSortChange}
                  className="border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:border-fk-blue"
                >
                  <option value="popularity">Popularity</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Best Rating</option>
                  <option value="newest">Newest First</option>
                </select>
              </div>
            </div>

            {/* Results Count */}
            <p className="text-sm text-gray-600 mb-4">
              Showing {filteredProducts.length} products
            </p>

            {/* Products Grid */}
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-white rounded h-80 animate-pulse">
                    <div className="h-48 bg-gray-200 m-4 rounded"></div>
                    <div className="h-4 bg-gray-200 mx-4 mb-2 rounded"></div>
                    <div className="h-4 bg-gray-200 mx-4 w-2/3 rounded"></div>
                  </div>
                ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No products found</p>
                <p className="text-gray-400 text-sm mt-2">Try adjusting your filters or add products from admin panel</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Products
