import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { FaHeart, FaShoppingCart, FaStar, FaRegStar, FaMinus, FaPlus, FaCheck, FaTruck, FaShieldAlt, FaUndo } from 'react-icons/fa'
import { toast } from 'react-toastify'
import { addToCart } from '../redux/slices/cartSlice'
import { addToWishlist, removeFromWishlist } from '../redux/slices/wishlistSlice'
import { getProduct, getAllProducts } from '../services/productService'
import ProductCard from '../components/ProductCard'

function ProductDetails() {
  const { id } = useParams()
  const dispatch = useDispatch()
  const { items: wishlistItems } = useSelector((state) => state.wishlist)
  
  const [product, setProduct] = useState(null)
  const [similarProducts, setSimilarProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    fetchProduct()
  }, [id])

  const fetchProduct = async () => {
    try {
      setLoading(true)
      // First try to get single product from Firestore
      const productData = await getProduct(id)
      
      if (productData) {
        setProduct(productData)
        // Fetch similar products
        const allProducts = await getAllProducts()
        const similar = allProducts
          .filter(p => p.category === productData.category && p.id !== productData.id)
          .slice(0, 4)
        setSimilarProducts(similar)
      } else {
        // If product not found in Firestore, try to find in local products
        const allProducts = await getAllProducts()
        const foundProduct = allProducts.find(p => p.id === id || p.id === parseInt(id))
        
        if (foundProduct) {
          setProduct(foundProduct)
          const similar = allProducts
            .filter(p => p.category === foundProduct.category && p.id !== foundProduct.id)
            .slice(0, 4)
          setSimilarProducts(similar)
        } else {
          // Product not found - show error
          setProduct(null)
        }
      }
    } catch (error) {
      console.error('Error fetching product:', error)
      setProduct(null)
    } finally {
      setLoading(false)
    }
  }

  const isInWishlist = product && wishlistItems.some(item => item.id === product.id)

  const handleAddToCart = () => {
    dispatch(addToCart({
      id: product.id,
      title: product.title,
      price: product.discountPrice || product.price,
      image: product.image || product.images?.[selectedImage] || 'https://via.placeholder.com/300',
      quantity,
    }))
    toast.success('Added to cart!')
  }

  const handleWishlistToggle = () => {
    if (isInWishlist) {
      dispatch(removeFromWishlist(product.id))
      toast.info('Removed from wishlist')
    } else {
      dispatch(addToWishlist(product))
      toast.success('Added to wishlist!')
    }
  }

  const handleQuantityChange = (delta) => {
    const newQty = quantity + delta
    if (newQty >= 1 && newQty <= (product?.stock || 10)) {
      setQuantity(newQty)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fk-blue"></div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="bg-fk-bg min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Product Not Found</h2>
          <p className="text-gray-600 mb-6">The product you're looking for doesn't exist or has been removed.</p>
          <Link to="/products" className="text-fk-blue hover:underline">Browse all products</Link>
        </div>
      </div>
    )
  }

  const discountPercentage = product.discountPrice 
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0

  const productImage = product.image || (product.images && product.images[selectedImage]) || 'https://via.placeholder.com/600'
  const productImages = product.images || (product.image ? [product.image] : [])

  const renderStars = (rating) => {
    const stars = []
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(<FaStar key={i} className="text-fk-yellow text-sm" />)
      } else {
        stars.push(<FaRegStar key={i} className="text-fk-yellow text-sm" />)
      }
    }
    return stars
  }

  return (
    <div className="bg-fk-bg min-h-screen py-4">
      <div className="max-w-7xl mx-auto px-4">
        {/* Breadcrumb */}
        <div className="mb-4 text-sm">
          <Link to="/" className="text-gray-500 hover:text-fk-blue">Home</Link>
          <span className="mx-2 text-gray-400">/</span>
          <Link to={`/category/${product.category}`} className="text-gray-500 hover:text-fk-blue capitalize">{product.category}</Link>
          <span className="mx-2 text-gray-400">/</span>
          <span className="text-gray-700">{product.title?.substring(0, 50)}...</span>
        </div>

        <div className="bg-white rounded shadow-fk p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Image Gallery */}
            <div>
              <div className="border border-gray-200 rounded p-4 mb-4">
                <img
                  src={productImage}
                  alt={product.title}
                  className="w-full h-80 object-contain"
                />
              </div>
              {productImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                  {productImages.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`border-2 rounded p-1 flex-shrink-0 ${selectedImage === index ? 'border-fk-blue' : 'border-gray-200'}`}
                    >
                      <img src={img} alt="" className="w-16 h-16 object-contain" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div>
              <p className="text-sm text-gray-500 mb-1">{product.brand}</p>
              <h1 className="text-xl font-medium text-gray-900 mb-2">{product.title}</h1>
              
              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex">{renderStars(Math.round(product.rating || 0))}</div>
                <span className="text-sm text-gray-500">{product.rating} ratings</span>
                <span className="text-sm text-gray-500">|</span>
                <span className="text-sm text-gray-500">{product.reviewCount || 0} reviews</span>
              </div>

              {/* Price */}
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl font-bold text-gray-900">
                  ₹{product.discountPrice?.toLocaleString() || product.price?.toLocaleString()}
                </span>
                {product.discountPrice && (
                  <>
                    <span className="text-lg text-gray-500 line-through">
                      ₹{product.price?.toLocaleString()}
                    </span>
                    <span className="bg-fk-teal text-white text-xs font-bold px-2 py-1 rounded">
                      {discountPercentage}% OFF
                    </span>
                  </>
                )}
              </div>

              {/* Available Offers */}
              <div className="mb-6">
                <p className="font-bold text-gray-800 mb-2">Available Offers</p>
                <ul className="space-y-1">
                  <li className="flex items-center gap-2 text-sm">
                    <FaCheck className="text-fk-teal text-xs" />
                    <span>Bank Offer: 5% Unlimited Cashback on Flipkart Axis Bank Credit Card</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <FaCheck className="text-fk-teal text-xs" />
                    <span>Special Price: Get ₹2000 off on exchange</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <FaCheck className="text-fk-teal text-xs" />
                    <span>No Cost EMI starting from ₹2,556/month</span>
                  </li>
                </ul>
              </div>

              {/* Stock & Delivery */}
              <div className="mb-6">
                {(product.stock || 0) > 0 ? (
                  <p className="text-fk-teal font-medium mb-2">✓ In Stock ({product.stock} available)</p>
                ) : (
                  <p className="text-red-500 font-medium mb-2">Out of Stock</p>
                )}
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <FaTruck />
                    <span>Free Delivery</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FaShieldAlt />
                    <span>1 Year Warranty</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FaUndo />
                    <span>7 Days Replacement</span>
                  </div>
                </div>
              </div>

              {/* Quantity & Add to Cart */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center border border-gray-300 rounded">
                  <button 
                    onClick={() => handleQuantityChange(-1)}
                    className="px-3 py-2 hover:bg-gray-100"
                    disabled={quantity <= 1}
                  >
                    <FaMinus />
                  </button>
                  <span className="px-4 py-2 border-x border-gray-300">{quantity}</span>
                  <button 
                    onClick={() => handleQuantityChange(1)}
                    className="px-3 py-2 hover:bg-gray-100"
                    disabled={quantity >= (product.stock || 10)}
                  >
                    <FaPlus />
                  </button>
                </div>
                
                <button
                  onClick={handleAddToCart}
                  disabled={!product.stock}
                  className="flex-1 bg-fk-yellow hover:bg-yellow-500 text-white font-medium py-3 px-6 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaShoppingCart className="inline mr-2" />
                  ADD TO CART
                </button>
                
                <button
                  onClick={handleWishlistToggle}
                  className="border border-gray-300 p-3 rounded hover:border-fk-blue transition-colors"
                >
                  <FaHeart className={`text-xl ${isInWishlist ? 'text-red-500' : 'text-gray-400'}`} />
                </button>
              </div>

              {/* Description */}
              {product.description && (
                <div className="border-t border-gray-200 pt-4">
                  <p className="font-bold text-gray-800 mb-3">Description</p>
                  <p className="text-sm text-gray-600">{product.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Similar Products */}
        {similarProducts.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Similar Products</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {similarProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductDetails
