import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay } from 'swiper/modules'
import {
  FaLaptop,
  FaDesktop,
  FaVolumeUp,
  FaPrint,
  FaVideo,
  FaHeadphones,
  FaChevronRight,
} from 'react-icons/fa'
import ProductCard from '../components/ProductCard'
import { getAllProducts } from '../services/productService'
import { getActiveBanners } from '../services/bannerService'

import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import 'swiper/css/effect-fade'

function Home() {
  const [products, setProducts] = useState([])
  const [banners, setBanners] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeSlide, setActiveSlide] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [productsData, bannersData] = await Promise.all([getAllProducts(), getActiveBanners()])
        setProducts(productsData)
        setBanners(bannersData)
      } catch (error) {
        console.error('Error fetching home page data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const categories = [
    { name: 'Laptops', slug: 'laptops', icon: <FaLaptop size={28} /> },
    { name: 'Desktops', slug: 'desktops', icon: <FaDesktop size={28} /> },
    { name: 'Speakers', slug: 'speakers', icon: <FaVolumeUp size={28} /> },
    { name: 'Printers', slug: 'printers', icon: <FaPrint size={28} /> },
    { name: 'CCTV', slug: 'cctv', icon: <FaVideo size={28} /> },
    { name: 'Accessories', slug: 'accessories', icon: <FaHeadphones size={28} /> },
  ]

  const brands = ['HP', 'Dell', 'Lenovo', 'ASUS', 'Acer', 'MSI', 'Apple', 'Samsung', 'LG', 'Canon']

  const featuredProducts = products.filter((product) => product.isFeatured).slice(0, 8)
  const laptops = products.filter((product) => product.category === 'laptops').slice(0, 8)
  const newArrivals = [...products]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 8)

  const defaultBanners = useMemo(
    () => [
      {
        id: 1,
        image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=1400',
        title: 'Laptop Sale',
        subtitle: 'Up to 20% Off',
        link: '/products',
      },
      {
        id: 2,
        image: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=1400',
        title: 'Gaming Desktops',
        subtitle: 'Power Your Gaming',
        link: '/category/desktops',
      },
      {
        id: 3,
        image: 'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=1400',
        title: 'Office Essentials',
        subtitle: 'Best Deals',
        link: '/products',
      },
    ],
    []
  )

  const displayBanners = banners.length > 0 ? banners : defaultBanners

  return (
    <div className="bg-white min-h-screen">
      <div className="bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {loading ? (
            <div className="h-72 md:h-96 bg-slate-600/40 rounded-2xl animate-pulse" />
          ) : (
            <div className="relative">
              <Swiper
                modules={[Navigation, Pagination, Autoplay]}
                navigation
                pagination={{ clickable: true }}
                autoplay={{ delay: 4500, disableOnInteraction: false }}
                loop={displayBanners.length > 1}
                slidesPerView={1}
                spaceBetween={16}
                breakpoints={{
                  640: { slidesPerView: 2, spaceBetween: 18 },
                  1024: { slidesPerView: 3, spaceBetween: 24 },
                }}
                onSlideChange={(swiper) => setActiveSlide(swiper.realIndex)}
                className="rounded-2xl overflow-hidden"
              >
                {displayBanners.map((banner) => (
                  <SwiperSlide key={banner.id}>
                    <Link to={banner.link || '/products'} className="block">
                      <div className="h-40 md:h-48 lg:h-52 bg-transparent rounded-3xl shadow-none overflow-hidden">
                        <img src={banner.image} alt={banner.title} className="w-full h-full object-cover" />
                      </div>
                    </Link>
                  </SwiperSlide>
                ))}
              </Swiper>

              <div className="absolute bottom-4 right-4 z-10 bg-black/45 text-white text-xs px-3 py-1 rounded-full">
                {displayBanners.length > 0 ? activeSlide + 1 : 0}/{displayBanners.length}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-6 md:mt-10 relative z-10">
        <div className="bg-white rounded-2xl shadow-lg p-4 md:p-5">
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 md:gap-4">
            {categories.map((category) => (
              <Link
                key={category.slug}
                to={`/category/${category.slug}`}
                className="group flex flex-col items-center gap-2 py-2"
              >
                <div className="w-14 h-14 rounded-2xl bg-slate-100 text-fk-blue flex items-center justify-center group-hover:bg-fk-blue group-hover:text-white transition-colors">
                  {category.icon}
                </div>
                <span className="text-xs md:text-sm font-semibold text-slate-700 group-hover:text-fk-blue">
                  {category.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="px-4 py-6">
        <div className="max-w-7xl mx-auto bg-gradient-to-r from-[#e3f2ff] via-[#f1e6ff] to-[#ffe9f5] rounded-3xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Top Deals</h2>
            <Link to="/products" className="text-fk-blue text-sm font-medium flex items-center gap-1 hover:underline">
              View All <FaChevronRight />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {loading ? (
              [...Array(5)].map((_, index) => (
                <div key={index} className="bg-white rounded h-72 animate-pulse">
                  <div className="h-40 bg-gray-200 m-4 rounded" />
                  <div className="h-4 bg-gray-200 mx-4 mb-2 rounded" />
                  <div className="h-4 bg-gray-200 mx-4 w-2/3 rounded" />
                </div>
              ))
            ) : featuredProducts.length > 0 ? (
              featuredProducts.map((product) => <ProductCard key={product.id} product={product} />)
            ) : (
              <div className="col-span-full text-center py-8 text-gray-500">No featured products found.</div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-2">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Best Selling Laptops</h2>
          <Link
            to="/category/laptops"
            className="text-fk-blue text-sm font-medium flex items-center gap-1 hover:underline"
          >
            View All <FaChevronRight />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {loading ? (
            [...Array(5)].map((_, index) => (
              <div key={index} className="bg-white rounded h-72 animate-pulse">
                <div className="h-40 bg-gray-200 m-4 rounded" />
                <div className="h-4 bg-gray-200 mx-4 mb-2 rounded" />
                <div className="h-4 bg-gray-200 mx-4 w-2/3 rounded" />
              </div>
            ))
          ) : laptops.length > 0 ? (
            laptops.map((product) => <ProductCard key={product.id} product={product} />)
          ) : (
            <div className="col-span-full text-center py-8 text-gray-500">No laptop products found.</div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">New Arrivals</h2>
          <Link to="/products" className="text-fk-blue text-sm font-medium flex items-center gap-1 hover:underline">
            View All <FaChevronRight />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {loading ? (
            [...Array(5)].map((_, index) => (
              <div key={index} className="bg-white rounded h-72 animate-pulse">
                <div className="h-40 bg-gray-200 m-4 rounded" />
                <div className="h-4 bg-gray-200 mx-4 mb-2 rounded" />
                <div className="h-4 bg-gray-200 mx-4 w-2/3 rounded" />
              </div>
            ))
          ) : newArrivals.length > 0 ? (
            newArrivals.map((product) => <ProductCard key={product.id} product={product} />)
          ) : (
            <div className="col-span-full text-center py-8 text-gray-500">No new arrivals found.</div>
          )}
        </div>
      </div>

      <div className="bg-white py-6 mt-4">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Top Brands</h2>
          <div className="relative overflow-hidden rounded-xl border border-gray-100">
            <div className="brand-marquee flex gap-4 py-3 px-2">
              {[...brands, ...brands].map((brand, index) => (
                <Link
                  key={`${brand}-${index}`}
                  to={`/products?brand=${brand}`}
                  className="flex items-center justify-center min-w-[120px] h-14 bg-white border border-gray-200 rounded-lg shadow-sm hover:border-fk-blue hover:shadow-md transition-all"
                >
                  <span className="font-bold text-gray-700">{brand}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Ramesh Computers</h2>
          <p className="text-gray-600 mb-4">Best Deals on Laptops, Desktops and Accessories</p>
          <p className="text-sm text-gray-500">Sales and Service | Wholesale and Retail | Tamil Nadu</p>
        </div>
      </div>
    </div>
  )
}

export default Home
