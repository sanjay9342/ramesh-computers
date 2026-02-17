import React from 'react'
import { Link } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { FaHeart, FaShoppingCart, FaTrash, FaRegHeart } from 'react-icons/fa'
import { toast } from 'react-toastify'
import { removeFromWishlist } from '../redux/slices/wishlistSlice'
import { addToCart } from '../redux/slices/cartSlice'
import ProductCard from '../components/ProductCard'

function Wishlist() {
  const dispatch = useDispatch()
  const { items } = useSelector((state) => state.wishlist)

  const handleRemove = (id) => {
    dispatch(removeFromWishlist(id))
    toast.info('Removed from wishlist')
  }

  const handleMoveToCart = (product) => {
    dispatch(addToCart({
      id: product.id,
      title: product.title,
      price: product.discountPrice || product.price,
      image: product.images?.[0] || 'https://via.placeholder.com/300',
      quantity: 1,
    }))
    dispatch(removeFromWishlist(product.id))
    toast.success('Moved to cart!')
  }

  if (items.length === 0) {
    return (
      <div className="bg-fk-bg min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-white rounded shadow-fk p-8 text-center">
            <FaRegHeart className="text-6xl text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Your wishlist is empty</h2>
            <p className="text-gray-500 mb-6">Save your favorite products to buy later.</p>
            <Link 
              to="/products" 
              className="inline-block bg-fk-blue text-white px-6 py-3 rounded font-medium hover:bg-fk-blue-dark transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-fk-bg min-h-screen py-4">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">My Wishlist ({items.length} items)</h1>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((product) => (
            <div key={product.id} className="bg-white rounded shadow-fk group relative">
              <button
                onClick={() => handleRemove(product.id)}
                className="absolute top-2 right-2 z-10 p-2 rounded-full bg-white shadow-md hover:bg-red-50 transition-colors"
              >
                <FaTrash className="text-red-500" />
              </button>
              
              <Link to={`/product/${product.id}`}>
                <div className="product-image-container p-4">
                  <img
                    src={product.images?.[0] || product.image || 'https://via.placeholder.com/300'}
                    alt={product.title}
                    className="w-full h-40 object-contain"
                  />
                </div>
                <div className="p-4 pt-0">
                  <p className="text-xs text-gray-500 mb-1">{product.brand}</p>
                  <h3 className="text-sm font-medium text-gray-800 line-clamp-2 mb-2">
                    {product.title}
                  </h3>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg font-bold text-gray-900">
                      ₹{product.discountPrice?.toLocaleString() || product.price?.toLocaleString()}
                    </span>
                    {product.discountPrice && (
                      <span className="text-sm text-gray-500 line-through">
                        ₹{product.price?.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
              
              <div className="p-4 pt-0">
                <button
                  onClick={() => handleMoveToCart(product)}
                  className="w-full bg-fk-yellow hover:bg-yellow-500 text-white font-medium py-2 rounded transition-colors flex items-center justify-center gap-2"
                >
                  <FaShoppingCart />
                  Move to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Wishlist
