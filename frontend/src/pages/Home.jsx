import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay } from 'swiper/modules'
import { FaChevronRight } from 'react-icons/fa'
import ProductCard from '../components/ProductCard'
import { getAllProducts } from '../services/productService'
import { getActiveBanners } from '../services/bannerService'
import { useAppLoad } from '../context/AppLoadContext'
import { STORE_INFO } from '../data/storeInfo'

import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import 'swiper/css/effect-fade'

function Home() {
  const [products, setProducts] = useState([])
  const [banners, setBanners] = useState([])
  const [loading, setLoading] = useState(true)
  const [bannersReady, setBannersReady] = useState(false)
  const [activeSlide, setActiveSlide] = useState(0)
  const { setHomeReady } = useAppLoad() || {}
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.innerWidth < 640
  })

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

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640)
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const brands = ['HP', 'Dell', 'Lenovo', 'ASUS', 'Acer', 'MSI', 'Apple', 'Samsung', 'LG', 'Canon', 'Luminous', 'V-Guard']
  const homeProductLimit = isMobile ? 4 : 8
  const homeSkeletonCount = isMobile ? 4 : 8
  const topDealsLimit = 15
  const newArrivalsLimit = 15
  const bestSellingLimit = 8
  const laptopRowCardClass =
    'w-[calc(50%-0.5rem)] sm:w-[calc(50%-0.75rem)] md:w-[calc((100%-2rem)/3)] lg:w-[calc((100%-4rem)/5)] flex-shrink-0'
  const featuredProducts = products
    .filter((product) => product.isFeatured && Number(product.stock || 0) > 0)
    .slice(0, topDealsLimit)
  const laptops = products.filter((product) => product.category === 'laptops').slice(0, bestSellingLimit)
  const newArrivals = [...products]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, newArrivalsLimit)

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

  useEffect(() => {
    let active = true

    const preloadBanners = async () => {
      const sources = displayBanners.map((banner) => banner.image).filter(Boolean)
      if (sources.length === 0) {
        if (active) setBannersReady(true)
        return
      }
      setBannersReady(false)
      await Promise.all(
        sources.map(
          (src) =>
            new Promise((resolve) => {
              const img = new Image()
              img.onload = resolve
              img.onerror = resolve
              img.src = src
            })
        )
      )
      if (active) setBannersReady(true)
    }

    preloadBanners()
    return () => {
      active = false
    }
  }, [displayBanners])

  useEffect(() => {
    if (!setHomeReady) return
    if (!loading && bannersReady) {
      setHomeReady(true)
    }
  }, [bannersReady, loading, setHomeReady])

  return (
    <div className="bg-fk-bg min-h-screen">
      <div className="bg-fk-bg overflow-hidden">
        <div className="w-full px-0 py-8">
          {loading || !bannersReady ? (
            <div className="h-72 md:h-96 rounded-2xl banner-skeleton" />
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
                      <div className="h-64 sm:h-56 md:h-48 lg:h-52 bg-transparent rounded-3xl shadow-none overflow-hidden">
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

      <div className="px-0 py-6">
        <div className="w-full bg-gradient-to-r from-[#9fd8ff] via-[#d7a9ff] to-[#ff9bc5] border border-fk-border rounded-3xl shadow-fk p-3 sm:p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-[#24161f]">Top Deals</h2>
            <Link to="/products" className="text-fk-blue text-sm font-medium flex items-center gap-1 hover:underline">
              View All <FaChevronRight />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {loading ? (
              [...Array(homeSkeletonCount)].map((_, index) => (
                <div key={index} className="bg-white rounded h-64 animate-pulse">
                  <div className="h-48 bg-gray-200 m-4 rounded" />
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

      <div className="w-full px-0 py-2">
        <div className="flex items-center justify-between mb-4 pl-3 sm:pl-4 lg:pl-6">
          <h2 className="text-xl font-bold text-[#24161f]">Best Selling Laptops</h2>
          <Link
            to="/category/laptops"
            className="text-fk-blue text-sm font-medium flex items-center gap-1 hover:underline"
          >
            View All <FaChevronRight />
          </Link>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2 pr-1">
          {loading ? (
            [...Array(bestSellingLimit)].map((_, index) => (
              <div key={index} className={`${laptopRowCardClass} bg-white rounded h-64 animate-pulse`}>
                <div className="h-48 bg-gray-200 m-4 rounded" />
                <div className="h-4 bg-gray-200 mx-4 mb-2 rounded" />
                <div className="h-4 bg-gray-200 mx-4 w-2/3 rounded" />
              </div>
            ))
          ) : laptops.length > 0 ? (
            laptops.map((product) => (
              <div key={product.id} className={laptopRowCardClass}>
                <ProductCard product={product} />
              </div>
            ))
          ) : (
            <div className="min-w-full text-center py-8 text-gray-500">No laptop products found.</div>
          )}
        </div>
      </div>

      <div className="w-full px-0 py-6">
        <div className="bg-gradient-to-l from-[#d6ebff] via-[#ffe1c8] to-[#ffd9e6] border border-fk-border rounded-3xl shadow-fk p-4 sm:p-6 md:p-7 lg:p-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-[#24161f]">New Arrivals</h2>
            <Link to="/products" className="text-fk-blue text-sm font-medium flex items-center gap-1 hover:underline">
              View All <FaChevronRight />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {loading ? (
              [...Array(homeSkeletonCount)].map((_, index) => (
                <div key={index} className="bg-white rounded h-64 animate-pulse">
                  <div className="h-48 bg-gray-200 m-4 rounded" />
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
      </div>

      <div className="bg-white py-6 mt-4 border-y border-fk-border">
        <div className="w-full px-0">
          <h2 className="text-xl font-bold text-[#24161f] mb-4 px-0">Top Brands</h2>
          <div className="relative overflow-hidden rounded-xl border border-fk-border bg-gradient-to-r from-white via-[#fff7fa] to-[#fff4eb]">
            <div className="brand-marquee flex gap-4 py-3 px-0">
              {[...brands, ...brands].map((brand, index) => (
                <Link
                  key={`${brand}-${index}`}
                  to={`/products?brand=${brand}`}
                  className="flex items-center justify-center min-w-[120px] h-14 bg-white border border-fk-border rounded-lg shadow-sm hover:border-fk-blue hover:shadow-fk transition-all"
                >
                  <span className="font-bold text-[#5a3b47]">{brand}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="w-full px-0 py-8">
        <div className="bg-white border border-fk-border rounded-2xl shadow-fk px-4 py-8 text-center">
          <img
            src={STORE_INFO.logo}
            alt={STORE_INFO.name}
            className="h-24 sm:h-28 w-auto max-w-full mx-auto object-contain mb-4"
          />
          <h2 className="text-2xl font-bold text-[#24161f] mb-2">{STORE_INFO.heroTitle}</h2>
          <p className="text-[#6f5a66] mb-4">{STORE_INFO.heroText}</p>
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            {STORE_INFO.services.map((service) => (
              <span
                key={service}
                className="rounded-full border border-fk-border bg-fk-bg px-3 py-1 text-xs font-semibold text-[#6f5a66]"
              >
                {service}
              </span>
            ))}
          </div>
          <p className="text-sm text-[#8d6476]">Sales and Service | Wholesale and Retail | {STORE_INFO.location}</p>
        </div>
      </div>
    </div>
  )
}

export default Home
