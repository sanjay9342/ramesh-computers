import React, { useState, useEffect, useMemo } from 'react'
import { FaPlus, FaEdit, FaTrash, FaSearch, FaTimes, FaImages } from 'react-icons/fa'
import { toast } from 'react-toastify'
import {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../../services/productService'
import {
  getAllBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  toggleBannerStatus,
} from '../../services/bannerService'
import { uploadImage } from '../../firebase/services/uploadService'

const initialProductForm = {
  title: '',
  category: '',
  brand: '',
  price: '',
  discountPrice: '',
  stock: '',
  rating: '',
  description: '',
  image: '',
  isFeatured: false,
}

const initialBannerForm = {
  title: '',
  subtitle: '',
  image: '',
  link: '/products',
  active: true,
}

function AdminProducts() {
  const [products, setProducts] = useState([])
  const [banners, setBanners] = useState([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [loadingBanners, setLoadingBanners] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [uploading, setUploading] = useState(false)

  const [showProductModal, setShowProductModal] = useState(false)
  const [showDeleteProductModal, setShowDeleteProductModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [deletingProduct, setDeletingProduct] = useState(null)
  const [productForm, setProductForm] = useState(initialProductForm)

  const [showBannerModal, setShowBannerModal] = useState(false)
  const [showDeleteBannerModal, setShowDeleteBannerModal] = useState(false)
  const [editingBanner, setEditingBanner] = useState(null)
  const [deletingBanner, setDeletingBanner] = useState(null)
  const [bannerForm, setBannerForm] = useState(initialBannerForm)

  useEffect(() => {
    fetchProducts()
    fetchBanners()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoadingProducts(true)
      const data = await getAllProducts()
      setProducts(data)
    } catch (error) {
      console.error('Error fetching products:', error)
      toast.error('Unable to load products')
    } finally {
      setLoadingProducts(false)
    }
  }

  const fetchBanners = async () => {
    try {
      setLoadingBanners(true)
      const data = await getAllBanners()
      setBanners(data)
    } catch (error) {
      console.error('Error fetching banners:', error)
      toast.error('Unable to load slider images')
    } finally {
      setLoadingBanners(false)
    }
  }

  const filteredProducts = useMemo(
    () =>
      products.filter(
        (product) =>
          product.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.category?.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [products, searchTerm]
  )

  const productStats = useMemo(() => {
    const featured = products.filter((product) => product.isFeatured).length
    const lowStock = products.filter((product) => Number(product.stock || 0) <= 5).length
    return {
      total: products.length,
      featured,
      lowStock,
    }
  }, [products])

  const handleProductInputChange = (event) => {
    const { name, value, type, checked } = event.target
    setProductForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleBannerInputChange = (event) => {
    const { name, value, type, checked } = event.target
    setBannerForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleImageUpload = async (event, type) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setUploading(true)
      const folder = type === 'banner' ? 'banners' : 'products'
      const result = await uploadImage(file, folder)

      if (type === 'banner') {
        setBannerForm((prev) => ({ ...prev, image: result.url }))
      } else {
        setProductForm((prev) => ({ ...prev, image: result.url }))
      }
      toast.success('Image uploaded successfully!')
    } catch (error) {
      console.error('Error uploading image:', error)
    } finally {
      setUploading(false)
    }
  }

  const submitProduct = async (event) => {
    event.preventDefault()
    const payload = {
      title: productForm.title.trim(),
      category: productForm.category,
      brand: productForm.brand.trim(),
      price: Number(productForm.price),
      discountPrice: productForm.discountPrice ? Number(productForm.discountPrice) : null,
      stock: Number(productForm.stock),
      rating: productForm.rating ? Number(productForm.rating) : 0,
      description: productForm.description.trim(),
      image: productForm.image,
      isFeatured: Boolean(productForm.isFeatured),
    }

    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, payload)
      } else {
        await createProduct(payload)
      }
      await fetchProducts()
      closeProductModal()
    } catch (error) {
      console.error('Error saving product:', error)
      toast.error(error?.message || 'Unable to save product')
    }
  }

  const submitBanner = async (event) => {
    event.preventDefault()
    const payload = {
      title: bannerForm.title.trim(),
      subtitle: bannerForm.subtitle.trim(),
      image: bannerForm.image,
      link: bannerForm.link.trim() || '/products',
      active: Boolean(bannerForm.active),
    }

    try {
      if (editingBanner) {
        await updateBanner(editingBanner.id, payload)
      } else {
        await createBanner(payload)
      }
      await fetchBanners()
      closeBannerModal()
    } catch (error) {
      console.error('Error saving banner:', error)
      toast.error(error?.message || 'Unable to save slider image')
    }
  }

  const openEditProduct = (product) => {
    setEditingProduct(product)
    setProductForm({
      title: product.title || '',
      category: product.category || '',
      brand: product.brand || '',
      price: product.price?.toString() || '',
      discountPrice: product.discountPrice?.toString() || '',
      stock: product.stock?.toString() || '',
      rating: product.rating?.toString() || '',
      description: product.description || '',
      image: product.image || product.images?.[0] || '',
      isFeatured: Boolean(product.isFeatured),
    })
    setShowProductModal(true)
  }

  const openEditBanner = (banner) => {
    setEditingBanner(banner)
    setBannerForm({
      title: banner.title || '',
      subtitle: banner.subtitle || '',
      image: banner.image || '',
      link: banner.link || '/products',
      active: banner.active ?? true,
    })
    setShowBannerModal(true)
  }

  const closeProductModal = () => {
    setShowProductModal(false)
    setEditingProduct(null)
    setProductForm(initialProductForm)
  }

  const closeBannerModal = () => {
    setShowBannerModal(false)
    setEditingBanner(null)
    setBannerForm(initialBannerForm)
  }

  const confirmDeleteProduct = (product) => {
    setDeletingProduct(product)
    setShowDeleteProductModal(true)
  }

  const confirmDeleteBanner = (banner) => {
    setDeletingBanner(banner)
    setShowDeleteBannerModal(true)
  }

  const onDeleteProduct = async () => {
    if (!deletingProduct) return
    try {
      await deleteProduct(deletingProduct.id)
      await fetchProducts()
      setShowDeleteProductModal(false)
      setDeletingProduct(null)
    } catch (error) {
      console.error('Error deleting product:', error)
    }
  }

  const onDeleteBanner = async () => {
    if (!deletingBanner) return
    try {
      await deleteBanner(deletingBanner.id)
      await fetchBanners()
      setShowDeleteBannerModal(false)
      setDeletingBanner(null)
    } catch (error) {
      console.error('Error deleting banner:', error)
    }
  }

  const onToggleBannerStatus = async (banner) => {
    try {
      await toggleBannerStatus(banner.id, !banner.active)
      await fetchBanners()
    } catch (error) {
      console.error('Error toggling banner:', error)
    }
  }

  return (
    <div className="space-y-8">
      <section className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Product Control Center</h1>
            <p className="text-sm text-gray-500 mt-1">Manage product catalog and homepage sliders in one place.</p>
          </div>
          <button
            onClick={() => {
              setEditingProduct(null)
              setProductForm(initialProductForm)
              setShowProductModal(true)
            }}
            className="bg-fk-blue text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-fk-blue-dark"
          >
            <FaPlus /> Add Product
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Total Products</p>
            <p className="text-2xl font-bold text-gray-800">{productStats.total}</p>
          </div>
          <div className="rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Featured Products</p>
            <p className="text-2xl font-bold text-gray-800">{productStats.featured}</p>
          </div>
          <div className="rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Low Stock (&lt;= 5)</p>
            <p className="text-2xl font-bold text-gray-800">{productStats.lowStock}</p>
          </div>
        </div>
      </section>

      <section className="bg-white rounded-lg shadow p-4">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search products by title, brand, category"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-fk-blue"
          />
        </div>
      </section>

      <section className="bg-white rounded-lg shadow overflow-x-auto">
        {loadingProducts ? (
          <div className="p-8 text-center text-gray-500">Loading products...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No products found.</div>
        ) : (
          <table className="w-full min-w-[900px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Image</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Product</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Category</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Brand</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Price</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Stock</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Featured</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id} className="border-t hover:bg-gray-50">
                  <td className="py-3 px-4">
                    {product.image ? (
                      <img src={product.image} alt={product.title} className="w-12 h-12 object-cover rounded" />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">
                        No image
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4 font-medium">{product.title}</td>
                  <td className="py-3 px-4 capitalize">{product.category}</td>
                  <td className="py-3 px-4">{product.brand}</td>
                  <td className="py-3 px-4">
                    Rs. {Number(product.discountPrice || product.price || 0).toLocaleString()}
                  </td>
                  <td className="py-3 px-4">{product.stock}</td>
                  <td className="py-3 px-4">{product.isFeatured ? 'Yes' : 'No'}</td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button onClick={() => openEditProduct(product)} className="text-fk-blue hover:text-fk-blue-dark p-2">
                        <FaEdit />
                      </button>
                      <button onClick={() => confirmDeleteProduct(product)} className="text-red-500 hover:text-red-700 p-2">
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <FaImages /> Home Slider Management
            </h2>
            <p className="text-sm text-gray-500 mt-1">Add and manage homepage slider images.</p>
          </div>
          <button
            onClick={() => {
              setEditingBanner(null)
              setBannerForm(initialBannerForm)
              setShowBannerModal(true)
            }}
            className="bg-fk-blue text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-fk-blue-dark"
          >
            <FaPlus /> Add Slider
          </button>
        </div>

        {loadingBanners ? (
          <div className="p-4 text-gray-500">Loading sliders...</div>
        ) : banners.length === 0 ? (
          <div className="p-4 text-gray-500">No slider images yet.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {banners.map((banner) => (
              <div key={banner.id} className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="h-40 bg-gray-100">
                  {banner.image ? (
                    <img src={banner.image} alt={banner.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">No image</div>
                  )}
                </div>
                <div className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-gray-800">{banner.title}</h3>
                      <p className="text-sm text-gray-500">{banner.subtitle || 'No subtitle'}</p>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        banner.active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {banner.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 break-all">{banner.link}</p>
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => onToggleBannerStatus(banner)}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded text-sm"
                    >
                      {banner.active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button onClick={() => openEditBanner(banner)} className="text-fk-blue p-2 hover:bg-blue-50 rounded">
                      <FaEdit />
                    </button>
                    <button onClick={() => confirmDeleteBanner(banner)} className="text-red-500 p-2 hover:bg-red-50 rounded">
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {showProductModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{editingProduct ? 'Edit Product' : 'Add Product'}</h2>
              <button onClick={closeProductModal} className="text-gray-500 hover:text-gray-700">
                <FaTimes />
              </button>
            </div>
            <form onSubmit={submitProduct} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Title</label>
                <input
                  type="text"
                  name="title"
                  value={productForm.title}
                  onChange={handleProductInputChange}
                  className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-fk-blue"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    name="category"
                    value={productForm.category}
                    onChange={handleProductInputChange}
                    className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-fk-blue"
                    required
                  >
                    <option value="">Select category</option>
                    <option value="laptops">Laptops</option>
                    <option value="desktops">Desktops</option>
                    <option value="speakers">Speakers</option>
                    <option value="printers">Printers</option>
                    <option value="cctv">CCTV</option>
                    <option value="accessories">Accessories</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                  <input
                    type="text"
                    name="brand"
                    value={productForm.brand}
                    onChange={handleProductInputChange}
                    className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-fk-blue"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                  <input
                    type="number"
                    name="price"
                    min="0"
                    value={productForm.price}
                    onChange={handleProductInputChange}
                    className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-fk-blue"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Discount Price</label>
                  <input
                    type="number"
                    name="discountPrice"
                    min="0"
                    value={productForm.discountPrice}
                    onChange={handleProductInputChange}
                    className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-fk-blue"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                  <input
                    type="number"
                    name="stock"
                    min="0"
                    value={productForm.stock}
                    onChange={handleProductInputChange}
                    className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-fk-blue"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rating (0-5)</label>
                  <input
                    type="number"
                    name="rating"
                    min="0"
                    max="5"
                    step="0.1"
                    value={productForm.rating}
                    onChange={handleProductInputChange}
                    className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-fk-blue"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  rows="4"
                  value={productForm.description}
                  onChange={handleProductInputChange}
                  className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-fk-blue"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) => handleImageUpload(event, 'product')}
                    className="border border-gray-300 rounded px-4 py-2 w-full"
                  />
                  {uploading && <span className="text-sm text-gray-500">Uploading...</span>}
                </div>
                {productForm.image && (
                  <img src={productForm.image} alt="Preview" className="w-24 h-24 object-cover rounded mt-2" />
                )}
              </div>

              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  name="isFeatured"
                  checked={productForm.isFeatured}
                  onChange={handleProductInputChange}
                />
                Show in featured products
              </label>

              <div className="flex gap-4">
                <button type="button" onClick={closeProductModal} className="flex-1 border border-gray-300 text-gray-700 py-2 rounded hover:bg-gray-50">
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-fk-blue text-white py-2 rounded hover:bg-fk-blue-dark disabled:opacity-60"
                  disabled={uploading}
                >
                  {editingProduct ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showBannerModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{editingBanner ? 'Edit Slider Image' : 'Add Slider Image'}</h2>
              <button onClick={closeBannerModal} className="text-gray-500 hover:text-gray-700">
                <FaTimes />
              </button>
            </div>
            <form onSubmit={submitBanner} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  name="title"
                  value={bannerForm.title}
                  onChange={handleBannerInputChange}
                  className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-fk-blue"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
                <input
                  type="text"
                  name="subtitle"
                  value={bannerForm.subtitle}
                  onChange={handleBannerInputChange}
                  className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-fk-blue"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slider Image</label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) => handleImageUpload(event, 'banner')}
                    className="border border-gray-300 rounded px-4 py-2 w-full"
                  />
                  {uploading && <span className="text-sm text-gray-500">Uploading...</span>}
                </div>
                {bannerForm.image && (
                  <img src={bannerForm.image} alt="Preview" className="w-full h-28 object-cover rounded mt-2" />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Link</label>
                <input
                  type="text"
                  name="link"
                  value={bannerForm.link}
                  onChange={handleBannerInputChange}
                  placeholder="/products"
                  className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-fk-blue"
                  required
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" name="active" checked={bannerForm.active} onChange={handleBannerInputChange} />
                Set as active
              </label>
              <div className="flex gap-4">
                <button type="button" onClick={closeBannerModal} className="flex-1 border border-gray-300 text-gray-700 py-2 rounded hover:bg-gray-50">
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-fk-blue text-white py-2 rounded hover:bg-fk-blue-dark disabled:opacity-60"
                  disabled={uploading}
                >
                  {editingBanner ? 'Update Slider' : 'Create Slider'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteProductModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-bold mb-2">Delete Product</h2>
            <p className="text-gray-600 mb-6">Are you sure you want to delete "{deletingProduct?.title}"?</p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteProductModal(false)
                  setDeletingProduct(null)
                }}
                className="flex-1 border border-gray-300 py-2 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button onClick={onDeleteProduct} className="flex-1 bg-red-500 text-white py-2 rounded hover:bg-red-600">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteBannerModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-bold mb-2">Delete Slider Image</h2>
            <p className="text-gray-600 mb-6">Are you sure you want to delete "{deletingBanner?.title}"?</p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteBannerModal(false)
                  setDeletingBanner(null)
                }}
                className="flex-1 border border-gray-300 py-2 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button onClick={onDeleteBanner} className="flex-1 bg-red-500 text-white py-2 rounded hover:bg-red-600">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminProducts
