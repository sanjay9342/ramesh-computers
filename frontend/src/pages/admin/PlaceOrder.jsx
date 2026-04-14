import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { FaArrowRight, FaBoxOpen, FaSearch, FaShoppingCart, FaStore } from 'react-icons/fa'
import { toast } from 'react-toastify'
import { getAllProducts } from '../../services/productService'
import { addToCart } from '../../redux/slices/cartSlice'
import { formatCurrency } from '../../utils/formatters'

function AdminPlaceOrder() {
  const dispatch = useDispatch()
  const { items, totalAmount, totalQuantity } = useSelector((state) => state.cart)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true)
        const data = await getAllProducts()
        setProducts(data)
      } catch (error) {
        console.error('Failed to load products for admin ordering:', error)
        toast.error('Unable to load products for admin ordering')
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [])

  const categories = useMemo(
    () => ['all', ...new Set(products.map((product) => product.category).filter(Boolean))],
    [products]
  )

  const filteredProducts = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    return products.filter((product) => {
      const matchesStock = Number(product.stock || 0) > 0
      const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter
      const matchesSearch = !normalizedSearch
        || product.title?.toLowerCase().includes(normalizedSearch)
        || product.brand?.toLowerCase().includes(normalizedSearch)
        || product.sku?.toLowerCase().includes(normalizedSearch)

      return matchesStock && matchesCategory && matchesSearch
    })
  }, [categoryFilter, products, searchTerm])

  const handleAddToCart = (product) => {
    const unitPrice = Number(product.discountPrice || product.price || 0)
    dispatch(
      addToCart({
        ...product,
        price: unitPrice,
        quantity: 1,
      })
    )
    toast.success(`${product.title} added to cart`)
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-[#e8dde7] bg-white p-4 sm:p-6 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#d5e5f4] bg-[#f4fbff] px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-[#25558a]">
              <FaStore className="text-[11px]" />
              Admin Checkout Desk
            </div>
            <h1 className="mt-3 text-2xl font-bold text-gray-900 sm:text-3xl">Create customer orders from admin</h1>
            <p className="mt-2 text-sm text-gray-600 sm:text-base">
              Pick products here, add them to the live cart, and continue to checkout when you are ready to place the order.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              to="/cart"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#d7dfe9] px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-[#f7fafc]"
            >
              <FaShoppingCart />
              Open Cart
            </Link>
            <Link
              to="/checkout"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#1f6fb2] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#18598e]"
            >
              Continue to Checkout
              <FaArrowRight className="text-xs" />
            </Link>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <div className="rounded-lg border border-[#e8edf4] bg-[#fbfdff] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-gray-500">Cart Items</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">{totalQuantity}</p>
          </div>
          <div className="rounded-lg border border-[#e8edf4] bg-[#fffaf4] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-gray-500">Cart Value</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">{formatCurrency(totalAmount)}</p>
          </div>
          <div className="rounded-lg border border-[#e8edf4] bg-[#f5fff9] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-gray-500">Products Ready</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">{products.filter((product) => Number(product.stock || 0) > 0).length}</p>
          </div>
          <div className="rounded-lg border border-[#e8edf4] bg-[#fff7fa] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-gray-500">Current Selection</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">{items.length}</p>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-[#e8dde7] bg-white p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-md">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search title, brand or SKU"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm focus:border-[#1f6fb2] focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const isActive = categoryFilter === category
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setCategoryFilter(category)}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                    isActive
                      ? 'bg-[#1f6fb2] text-white'
                      : 'border border-[#d7dfe9] bg-white text-gray-700 hover:bg-[#f7fafc]'
                  }`}
                >
                  {category === 'all' ? 'All Products' : category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              )
            })}
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-[#e8dde7] bg-white p-4 sm:p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Available products</h2>
            <p className="text-sm text-gray-500">Only in-stock products are shown here.</p>
          </div>
          <p className="text-sm font-medium text-gray-500">{filteredProducts.length} results</p>
        </div>

        {loading ? (
          <div className="py-12 text-center text-gray-500">Loading products...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-12 text-center text-gray-500">
            <FaBoxOpen className="mx-auto mb-3 text-4xl text-gray-300" />
            No matching products available right now.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredProducts.map((product) => {
              const displayPrice = Number(product.discountPrice || product.price || 0)

              return (
                <article key={product.id} className="flex h-full flex-col rounded-lg border border-[#e8edf4] p-4 transition hover:border-[#b7d0e9] hover:bg-[#fbfdff]">
                  <div className="flex items-start gap-4">
                    {(product.image || product.images?.[0]) ? (
                      <img
                        src={product.image || product.images?.[0]}
                        alt={product.title}
                        className="h-24 w-24 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="flex h-24 w-24 items-center justify-center rounded-lg bg-gray-100 text-xs text-gray-400">
                        No image
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#4b7aa4]">
                        {(product.category || 'general').replace(/_/g, ' ')}
                      </p>
                      <h3 className="mt-1 line-clamp-2 text-base font-semibold text-gray-900">{product.title}</h3>
                      <p className="mt-1 text-sm text-gray-500">{product.brand || 'No brand'}</p>
                      {product.sku ? <p className="mt-1 text-xs text-gray-400">{product.sku}</p> : null}
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-400">Price</p>
                      <p className="font-semibold text-gray-900">{formatCurrency(displayPrice)}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Stock</p>
                      <p className="font-semibold text-gray-900">{product.stock}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleAddToCart(product)}
                    className="mt-4 inline-flex items-center justify-center gap-2 rounded-lg bg-[#1f6fb2] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#18598e]"
                  >
                    <FaShoppingCart />
                    Add to Cart
                  </button>
                </article>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}

export default AdminPlaceOrder
