import React from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { FaHeart, FaShoppingCart, FaStar, FaRegStar } from 'react-icons/fa'
import { toast } from 'react-toastify'
import { addToCart } from '../redux/slices/cartSlice'
import { addToWishlist, removeFromWishlist } from '../redux/slices/wishlistSlice'
import { formatCurrency } from '../utils/formatters'

function ProductCard({ product, imageClassName = 'h-48' }) {
  const dispatch = useDispatch()
  const { items: wishlistItems } = useSelector((state) => state.wishlist)

  const isInWishlist = wishlistItems.some((item) => item.id === product.id)
  const discountPercentage = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0

  const handleAddToCart = (event) => {
    event.preventDefault()
    dispatch(
      addToCart({
        id: product.id,
        title: product.title,
        price: product.discountPrice || product.price,
        image: product.images?.[0] || 'https://via.placeholder.com/300',
        quantity: 1,
      })
    )
    toast.success('Added to cart!')
  }

  const handleWishlistToggle = (event) => {
    event.preventDefault()
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
    for (let i = 1; i <= 5; i += 1) {
      if (i <= rating) {
        stars.push(<FaStar key={i} className="text-fk-yellow text-xs" />)
      } else {
        stars.push(<FaRegStar key={i} className="text-fk-yellow text-xs" />)
      }
    }
    return stars
  }

  return (
    <Link to={`/product/${product.id}`} className="fk-card group block overflow-hidden">
      <div className="product-image-container relative p-3">
        <img
          src={product.images?.[0] || 'https://via.placeholder.com/300'}
          alt={product.title}
          className={`w-full ${imageClassName} object-contain mx-auto`}
        />

        <button
          onClick={handleWishlistToggle}
          className="absolute top-2 right-2 p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-all opacity-0 group-hover:opacity-100"
        >
          <FaHeart className={`text-lg ${isInWishlist ? 'text-red-500' : 'text-gray-400'}`} />
        </button>

        {discountPercentage > 0 && (
          <div className="absolute top-2 left-2 bg-fk-teal text-white text-xs font-bold px-2 py-1 rounded">
            {discountPercentage}% OFF
          </div>
        )}
      </div>

      <div className="p-3 pt-0">
        <p className="product-text-brand text-gray-500 mb-1">{product.brand}</p>
        <h3 className="product-text-title font-medium text-gray-800 line-clamp-2 mb-1">{product.title}</h3>

        <div className="flex items-center gap-1 mb-1">
          <div className="flex">{renderStars(Math.round(product.rating || 0))}</div>
          <span className="product-text-meta text-gray-500">({product.reviewCount || 0})</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="product-text-price font-bold text-gray-900">
            {formatCurrency(product.discountPrice || product.price)}
          </span>
          {product.discountPrice && (
            <span className="product-text-price-old text-gray-500 line-through">
              {formatCurrency(product.price)}
            </span>
          )}
        </div>

        {product.freeDelivery && <p className="product-text-meta text-fk-teal mt-1">Free Delivery</p>}

        <button
          onClick={handleAddToCart}
          className="product-text-cta w-full mt-2 bg-fk-blue hover:bg-fk-blue-dark text-white font-semibold py-2 rounded transition-colors"
        >
          <FaShoppingCart className="inline mr-2" />
          ADD TO CART
        </button>
      </div>
    </Link>
  )
}

export default ProductCard
