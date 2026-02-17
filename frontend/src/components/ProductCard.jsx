import React from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { FaHeart, FaShoppingCart, FaStar, FaRegStar } from 'react-icons/fa'
import { toast } from 'react-toastify'
import { addToCart } from '../redux/slices/cartSlice'
import { addToWishlist, removeFromWishlist } from '../redux/slices/wishlistSlice'

function ProductCard({ product }) {
  const dispatch = useDispatch()
  const { items: wishlistItems } = useSelector((state) => state.wishlist)
  
  const isInWishlist = wishlistItems.some(item => item.id === product.id)
  
  const discountPercentage = product.discountPrice 
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0

  const handleAddToCart = (e) => {
    e.preventDefault()
    dispatch(addToCart({
      id: product.id,
      title: product.title,
      price: product.discountPrice || product.price,
      image: product.images?.[0] || 'https://via.placeholder.com/300',
      quantity: 1,
    }))
    toast.success('Added to cart!')
  }

  const handleWishlistToggle = (e) => {
    e.preventDefault()
    if (isInWishlist) {
      dispatch(removeFromWishlist(product.id))
      toast.info('Removed from wishlist')
    } else {
      dispatch(addToWishlist(product))
      toast.success('Added to wishlist!')
    }
  }

  const renderStars = (rating) => {
    const stars = []
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(<FaStar key={i} className="text-fk-yellow text-xs" />)
      } else {
        stars.push(<FaRegStar key={i} className="text-fk-yellow text-xs" />)
      }
    }
    return stars
  }

  return (
    <Link to={`/product/${product.id}`} className="fk-card group">
      {/* Image Container */}
      <div className="product-image-container relative p-4">
        <img
          src={product.images?.[0] || 'https://via.placeholder.com/300'}
          alt={product.title}
          className="w-full h-48 object-contain mx-auto"
        />
        
        {/* Wishlist Button */}
        <button
          onClick={handleWishlistToggle}
          className="absolute top-2 right-2 p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-all opacity-0 group-hover:opacity-100"
        >
          <FaHeart className={`text-lg ${isInWishlist ? 'text-red-500' : 'text-gray-400'}`} />
        </button>

        {/* Discount Badge */}
        {discountPercentage > 0 && (
          <div className="absolute top-2 left-2 bg-fk-teal text-white text-xs font-bold px-2 py-1 rounded">
            {discountPercentage}% OFF
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4 pt-0">
        {/* Brand */}
        <p className="text-xs text-gray-500 mb-1">{product.brand}</p>
        
        {/* Title */}
        <h3 className="text-sm font-medium text-gray-800 line-clamp-2 h-10 mb-2">
          {product.title}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-2">
          <div className="flex">{renderStars(Math.round(product.rating || 0))}</div>
          <span className="text-xs text-gray-500">({product.reviewCount || 0})</span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-gray-900">
            ₹{product.discountPrice?.toLocaleString() || product.price?.toLocaleString()}
          </span>
          {product.discountPrice && (
            <span className="text-sm text-gray-500 line-through">
              ₹{product.price?.toLocaleString()}
            </span>
          )}
        </div>

        {/* Free Delivery */}
        {product.freeDelivery && (
          <p className="text-xs text-fk-teal mt-1">Free Delivery</p>
        )}

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          className="w-full mt-3 bg-fk-yellow hover:bg-yellow-500 text-white font-medium py-2 rounded transition-colors"
        >
          ADD TO CART
        </button>
      </div>
    </Link>
  )
}

export default ProductCard
