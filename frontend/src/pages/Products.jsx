import React, { useEffect, useMemo, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { FaChevronDown, FaChevronUp, FaFilter, FaStar } from 'react-icons/fa'
import ProductCard from '../components/ProductCard'
import { getAllProducts } from '../services/productService'
import { formatCurrency } from '../utils/formatters'
import { CATEGORY_BRANDS } from '../data/storeInfo'

const DEFAULT_MAX_PRICE = 1000000
const normalizeCategory = (value = '') => value.toString().trim().toLowerCase()
const brands = [...new Set(Object.values(CATEGORY_BRANDS).flat())]

function Products() {
  const { slug } = useParams()
  const [searchParams] = useSearchParams()
  const initialCategory = slug ? normalizeCategory(slug) : ''
  const initialSearch = searchParams.get('search') || ''
  const initialBrand = searchParams.get('brand') || ''

  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    category: initialCategory,
    brand: initialBrand ? [initialBrand] : [],
    priceRange: [0, DEFAULT_MAX_PRICE],
    rating: 0,
    search: initialSearch,
  })
  const [sortBy, setSortBy] = useState('popularity')
  const [showFilters, setShowFilters] = useState(true)
  const [expandedSections, setExpandedSections] = useState({
    brand: true,
    price: true,
    rating: false,
  })

  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      category: slug ? normalizeCategory(slug) : '',
      brand: searchParams.get('brand') ? [searchParams.get('brand')] : [],
      search: searchParams.get('search') || '',
      priceRange: [0, DEFAULT_MAX_PRICE],
      rating: 0,
    }))
  }, [slug, searchParams])

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

  const filteredProducts = useMemo(() => {
    let filtered = [...products]

    if (filters.category) {
      filtered = filtered.filter((product) => normalizeCategory(product.category) === filters.category)
    }

    if (filters.search.trim()) {
      const term = filters.search.trim().toLowerCase()
      filtered = filtered.filter(
        (product) =>
          String(product.title || '').toLowerCase().includes(term) ||
          String(product.brand || '').toLowerCase().includes(term) ||
          String(product.description || '').toLowerCase().includes(term) ||
          String(product.sku || '').toLowerCase().includes(term)
      )
    }

    if (filters.brand.length > 0) {
      filtered = filtered.filter((product) => filters.brand.includes(product.brand))
    }

    filtered = filtered.filter(
      (product) =>
        Number(product.price || 0) >= filters.priceRange[0] &&
        Number(product.price || 0) <= filters.priceRange[1]
    )

    if (filters.rating > 0) {
      filtered = filtered.filter((product) => Number(product.rating || 0) >= filters.rating)
    }

    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => Number(a.price || 0) - Number(b.price || 0))
        break
      case 'price-high':
        filtered.sort((a, b) => Number(b.price || 0) - Number(a.price || 0))
        break
      case 'rating':
        filtered.sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0))
        break
      case 'newest':
        filtered.sort((a, b) => {
          const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0)
          const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0)
          return dateB - dateA
        })
        break
      default:
        filtered.sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0))
    }

    return filtered
  }, [products, filters, sortBy])

  const currentBrands = CATEGORY_BRANDS[filters.category] || brands

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const handleBrandToggle = (brand) => {
    const newBrands = filters.brand.includes(brand)
      ? filters.brand.filter((item) => item !== brand)
      : [...filters.brand, brand]
    setFilters((prev) => ({ ...prev, brand: newBrands }))
  }

  const handleSortChange = (event) => {
    setSortBy(event.target.value)
  }

  const handlePriceChange = (event, index) => {
    const newRange = [...filters.priceRange]
    newRange[index] = Number.parseInt(event.target.value, 10)
    setFilters((prev) => ({ ...prev, priceRange: newRange }))
  }

  const handleRatingChange = (rating) => {
    setFilters((prev) => ({ ...prev, rating }))
  }

  return (
    <div className="bg-fk-bg min-h-screen">
      <div className="w-full px-0 py-4">
        <div className="mb-4 text-sm">
          <span className="text-gray-500">Home</span>
          <span className="mx-2 text-gray-400">/</span>
          <span className="text-gray-700 capitalize">{slug || 'All Products'}</span>
        </div>

        {filters.search ? (
          <div className="mb-4 bg-white rounded-lg shadow-sm border border-gray-200 px-4 py-3">
            <p className="text-sm text-gray-600">
              Search results for <span className="font-semibold text-gray-900">"{filters.search}"</span>
            </p>
          </div>
        ) : null}

        <div className="flex gap-6">
          {showFilters && (
            <div className="w-64 flex-shrink-0 hidden lg:block">
              <div className="bg-white rounded shadow-fk p-4 sticky top-24">
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
                        max={DEFAULT_MAX_PRICE}
                        step="5000"
                        value={filters.priceRange[1]}
                        onChange={(event) => handlePriceChange(event, 1)}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-gray-600 mt-2">
                        <span>{formatCurrency(filters.priceRange[0])}</span>
                        <span>{formatCurrency(filters.priceRange[1])}</span>
                      </div>
                    </div>
                  )}
                </div>

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
                            {[...Array(5)].map((_, index) => (
                              <FaStar
                                key={index}
                                className={`text-xs ${index < rating ? 'text-fk-yellow' : 'text-gray-300'}`}
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

          <div className="flex-1">
            <div className="bg-white rounded shadow-fk p-4 mb-4 flex items-center justify-between">
              <button
                onClick={() => setShowFilters((prev) => !prev)}
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

            <p className="text-sm text-gray-600 mb-4">Showing {filteredProducts.length} products</p>

            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[...Array(8)].map((_, index) => (
                  <div key={index} className="bg-white rounded h-64 sm:h-72 animate-pulse">
                    <div className="h-40 sm:h-48 bg-gray-200 m-4 rounded"></div>
                    <div className="h-4 bg-gray-200 mx-4 mb-2 rounded"></div>
                    <div className="h-4 bg-gray-200 mx-4 w-2/3 rounded"></div>
                  </div>
                ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} imageClassName="h-40 sm:h-48" />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No products found</p>
                <p className="text-gray-400 text-sm mt-2">
                  Try adjusting your filters or add products from the admin panel.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Products
