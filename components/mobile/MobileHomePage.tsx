'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  ChevronRight, Clock, Flame, Sparkles, TrendingUp, 
  Gift, Zap, Star, ArrowRight, Heart, Tag,
  Truck, ShieldCheck, Headphones, CreditCard
} from 'lucide-react'
import { MobileProductCard } from './MobileProductCard'
import { StoriesCarousel } from './StoriesCarousel'
import { ProductQuickView } from './MobileBottomSheet'
import { ProductGridSkeleton, StoriesSkeleton, BannerSkeleton, SectionHeaderSkeleton } from './MobileSkeletons'
import { haptics } from '@/lib/haptics'
import { cn } from '@/lib/utils'
import { useCartStore } from '@/store/cart'

// Types
interface Product {
  id: string
  name: string
  slug: string
  basePrice: number
  salePrice?: number | null
  images: string | string[]
  category?: { name: string; slug: string }
  isFeatured?: boolean
  isBestseller?: boolean
  rating?: number
}

interface Category {
  id: string
  name: string
  slug: string
  image?: string
  productCount?: number
}

interface Banner {
  id: string
  image: string
  title?: string
  subtitle?: string
  link?: string
  gradient?: string
}

// Time-based greeting
const getGreeting = () => {
  const hour = new Date().getHours()
  if (hour < 12) return { text: 'Good Morning', emoji: '☀️' }
  if (hour < 17) return { text: 'Good Afternoon', emoji: '🌤️' }
  if (hour < 21) return { text: 'Good Evening', emoji: '🌅' }
  return { text: 'Good Night', emoji: '🌙' }
}

// Flash deal countdown
function FlashDealCountdown({ endTime }: { endTime: Date }) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime()
      const end = endTime.getTime()
      const diff = end - now

      if (diff <= 0) {
        clearInterval(timer)
        return
      }

      setTimeLeft({
        hours: Math.floor(diff / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [endTime])

  return (
    <div className="flex items-center gap-1.5">
      {[
        { value: timeLeft.hours, label: 'h' },
        { value: timeLeft.minutes, label: 'm' },
        { value: timeLeft.seconds, label: 's' },
      ].map((item, i) => (
        <div key={i} className="flex items-center">
          <div className="bg-white/20 backdrop-blur-sm rounded-lg px-2 py-1 min-w-[36px] text-center">
            <span className="text-white font-bold text-sm">
              {item.value.toString().padStart(2, '0')}
            </span>
          </div>
          {i < 2 && <span className="text-white font-bold mx-0.5">:</span>}
        </div>
      ))}
    </div>
  )
}

// Section header component
function SectionHeader({ 
  title, 
  subtitle, 
  icon: Icon, 
  showAll, 
  onShowAll,
  gradient 
}: { 
  title: string
  subtitle?: string
  icon?: React.ElementType
  showAll?: boolean
  onShowAll?: () => void
  gradient?: string
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div className="flex items-center gap-2">
        {Icon && (
          <div className={cn(
            "w-8 h-8 rounded-xl flex items-center justify-center",
            gradient || "bg-blue-100 dark:bg-blue-900/30"
          )}>
            <Icon className={cn(
              "w-4 h-4",
              gradient ? "text-white" : "text-blue-600 dark:text-blue-400"
            )} />
          </div>
        )}
        <div>
          <h2 className="text-base font-bold text-gray-900 dark:text-white">{title}</h2>
          {subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>
          )}
        </div>
      </div>
      
      {showAll && (
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => { haptics.light(); onShowAll?.() }}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-full"
        >
          See All
          <ChevronRight className="w-3 h-3" />
        </motion.button>
      )}
    </div>
  )
}

// Category pill component
function CategoryPill({ category, index }: { category: Category; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link href={`/shop?category=${category.slug}`}>
        <motion.div
          whileTap={{ scale: 0.95 }}
          onClick={() => haptics.light()}
          className="flex flex-col items-center gap-2 px-1"
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800">
            {category.image ? (
              <Image
                src={category.image}
                alt={category.name}
                width={48}
                height={48}
                className="w-12 h-12 object-contain"
              />
            ) : (
              <Tag className="w-6 h-6 text-gray-400" />
            )}
          </div>
          <span className="text-[11px] font-medium text-gray-700 dark:text-gray-300 text-center line-clamp-1 max-w-[64px]">
            {category.name}
          </span>
        </motion.div>
      </Link>
    </motion.div>
  )
}

// Hero banner component
function HeroBanner({ banners }: { banners: Banner[] }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (banners.length <= 1) return
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [banners.length])

  useEffect(() => {
    scrollRef.current?.scrollTo({
      left: currentIndex * (scrollRef.current?.offsetWidth || 0),
      behavior: 'smooth',
    })
  }, [currentIndex])

  if (banners.length === 0) return null

  return (
    <div className="relative px-4">
      <div 
        ref={scrollRef}
        className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory rounded-2xl"
      >
        {banners.map((banner, index) => (
          <Link
            key={banner.id}
            href={banner.link || '/shop'}
            className="flex-shrink-0 w-full snap-center"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                "relative h-44 rounded-2xl overflow-hidden",
                banner.gradient || "bg-gradient-to-r from-blue-600 to-purple-600"
              )}
            >
              {banner.image && (
                <Image
                  src={banner.image}
                  alt={banner.title || ''}
                  fill
                  className="object-cover"
                  priority={index === 0}
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
              <div className="absolute inset-0 p-5 flex flex-col justify-center">
                {banner.subtitle && (
                  <span className="text-white/80 text-xs font-medium mb-1">
                    {banner.subtitle}
                  </span>
                )}
                {banner.title && (
                  <h2 className="text-white text-xl font-bold leading-tight mb-3">
                    {banner.title}
                  </h2>
                )}
                <div className="flex items-center gap-1 text-white text-sm font-medium">
                  Shop Now <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>
      
      {/* Dots */}
      {banners.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-3">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => { setCurrentIndex(index); haptics.light() }}
              className={cn(
                "h-1.5 rounded-full transition-all",
                index === currentIndex 
                  ? "w-6 bg-blue-600" 
                  : "w-1.5 bg-gray-300 dark:bg-gray-700"
              )}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// Flash deals section
function FlashDealsSection({ products, endTime }: { products: Product[]; endTime: Date }) {
  const router = useRouter()
  const scrollRef = useRef<HTMLDivElement>(null)

  if (products.length === 0) return null

  return (
    <div className="py-2">
      {/* Header with countdown */}
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-lg shadow-red-500/25">
            <Zap className="w-5 h-5 text-white" fill="white" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white">Flash Sale</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Ends in</p>
          </div>
        </div>
        <FlashDealCountdown endTime={endTime} />
      </div>

      {/* Products */}
      <div 
        ref={scrollRef}
        className="flex gap-3 px-4 overflow-x-auto scrollbar-hide py-2"
      >
        {products.slice(0, 6).map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex-shrink-0 w-36"
          >
            <Link href={`/product/${product.slug}`}>
              <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 mb-2">
                <Image
                  src={(() => {
                    try {
                      const imgs = typeof product.images === 'string' 
                        ? JSON.parse(product.images) 
                        : product.images
                      return Array.isArray(imgs) ? imgs[0] : imgs
                    } catch { return '/placeholder.png' }
                  })()}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
                {product.salePrice && (
                  <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded">
                    -{Math.round((1 - product.salePrice / product.basePrice) * 100)}%
                  </div>
                )}
              </div>
              <h3 className="text-xs font-medium text-gray-900 dark:text-white line-clamp-1">{product.name}</h3>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-sm font-bold text-red-500">
                  ৳{(product.salePrice || product.basePrice).toLocaleString()}
                </span>
                {product.salePrice && (
                  <span className="text-[10px] text-gray-400 line-through">
                    ৳{product.basePrice.toLocaleString()}
                  </span>
                )}
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// Features strip
function FeaturesStrip() {
  const features = [
    { icon: Truck, text: 'Free Delivery', color: 'text-blue-500' },
    { icon: ShieldCheck, text: 'Secure Pay', color: 'text-green-500' },
    { icon: Headphones, text: '24/7 Support', color: 'text-purple-500' },
    { icon: CreditCard, text: 'Easy Return', color: 'text-orange-500' },
  ]

  return (
    <div className="flex justify-around py-4 px-2 bg-gray-50 dark:bg-gray-900/50 mx-4 rounded-2xl">
      {features.map((feature, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="flex flex-col items-center gap-1"
        >
          <feature.icon className={cn("w-5 h-5", feature.color)} />
          <span className="text-[10px] font-medium text-gray-600 dark:text-gray-400">
            {feature.text}
          </span>
        </motion.div>
      ))}
    </div>
  )
}

// Main Mobile Home Page Component
export function MobileHomePage() {
  const router = useRouter()
  const addToCart = useCartStore((state) => state.addItem)
  
  // State
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<{ name?: string } | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null)
  
  // Mock stories data (in production, fetch from API)
  const stories = [
    {
      id: '1',
      name: 'New Arrivals',
      avatar: '/logo.png',
      stories: [
        { id: 's1', type: 'image' as const, url: '/placeholder.png', title: 'Fresh Collection', subtitle: 'Discover our latest arrivals', link: '/shop?sort=newest', linkText: 'Shop New' },
      ],
    },
    {
      id: '2',
      name: 'Flash Sale',
      avatar: '/logo.png',
      isLive: true,
      stories: [
        { id: 's2', type: 'image' as const, url: '/placeholder.png', title: 'Up to 50% OFF', subtitle: 'Limited time only!', link: '/shop?sale=true', linkText: 'Shop Sale' },
      ],
    },
    {
      id: '3',
      name: 'Trending',
      avatar: '/logo.png',
      stories: [
        { id: 's3', type: 'image' as const, url: '/placeholder.png', title: 'Top Picks', subtitle: 'Most loved this week', link: '/shop?featured=true' },
      ],
    },
  ]

  // Mock banners
  const banners: Banner[] = [
    { id: 'b1', image: '', title: 'Summer Collection', subtitle: 'NEW ARRIVAL', link: '/shop', gradient: 'bg-gradient-to-r from-blue-600 to-purple-600' },
    { id: 'b2', image: '', title: 'Up to 50% OFF', subtitle: 'FLASH SALE', link: '/shop?sale=true', gradient: 'bg-gradient-to-r from-red-500 to-orange-500' },
  ]

  // Flash sale end time (24 hours from now)
  const flashSaleEndTime = new Date(Date.now() + 24 * 60 * 60 * 1000)

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user
        const authRes = await fetch('/api/auth/me')
        if (authRes.ok) {
          const authData = await authRes.json()
          if (authData.authenticated) setUser(authData.user)
        }

        // Fetch products
        const productsRes = await fetch('/api/products?limit=12')
        if (productsRes.ok) {
          const data = await productsRes.json()
          setProducts(data.products || [])
          setFeaturedProducts((data.products || []).filter((p: Product) => p.isFeatured).slice(0, 6))
        }

        // Fetch categories
        const categoriesRes = await fetch('/api/categories')
        if (categoriesRes.ok) {
          const data = await categoriesRes.json()
          setCategories(data.categories || data || [])
        }
      } catch (error) {
        console.error('Failed to fetch data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const greeting = getGreeting()

  // Quick view handlers
  const handleQuickView = (product: Product) => {
    setQuickViewProduct(product)
  }

  const handleAddToCart = () => {
    if (!quickViewProduct) return
    
    const imageUrl = (() => {
      try {
        const imgs = typeof quickViewProduct.images === 'string' 
          ? JSON.parse(quickViewProduct.images) 
          : quickViewProduct.images
        return Array.isArray(imgs) ? imgs[0] : imgs
      } catch { return '/placeholder.png' }
    })()

    addToCart({
      productId: quickViewProduct.id,
      name: quickViewProduct.name,
      price: quickViewProduct.salePrice || quickViewProduct.basePrice,
      image: imageUrl,
      quantity: 1,
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 space-y-4 pb-24">
        <StoriesSkeleton />
        <BannerSkeleton />
        <SectionHeaderSkeleton />
        <ProductGridSkeleton count={4} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-24">
      {/* Personalized Greeting */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-4 pt-2 pb-3"
      >
        <h1 className="text-lg font-bold text-gray-900 dark:text-white">
          {greeting.emoji} {greeting.text}{user?.name ? `, ${user.name.split(' ')[0]}` : ''}!
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          What are you looking for today?
        </p>
      </motion.div>

      {/* Stories */}
      <StoriesCarousel stories={stories} />

      {/* Hero Banners */}
      <div className="py-3">
        <HeroBanner banners={banners} />
      </div>

      {/* Categories */}
      <div className="py-2">
        <SectionHeader 
          title="Categories" 
          icon={Tag}
          showAll 
          onShowAll={() => router.push('/shop')} 
        />
        <div className="flex gap-2 px-4 overflow-x-auto scrollbar-hide py-2">
          {categories.slice(0, 8).map((category, index) => (
            <CategoryPill key={category.id} category={category} index={index} />
          ))}
        </div>
      </div>

      {/* Features Strip */}
      <FeaturesStrip />

      {/* Flash Deals */}
      {featuredProducts.length > 0 && (
        <FlashDealsSection 
          products={featuredProducts} 
          endTime={flashSaleEndTime} 
        />
      )}

      {/* Featured Products */}
      <div className="py-2">
        <SectionHeader 
          title="Featured Products" 
          subtitle="Handpicked for you"
          icon={Sparkles}
          gradient="bg-gradient-to-br from-amber-400 to-orange-500"
          showAll 
          onShowAll={() => router.push('/shop?featured=true')} 
        />
        <div className="grid grid-cols-2 gap-3 px-4">
          {products.slice(0, 4).map((product, index) => (
            <MobileProductCard
              key={product.id}
              product={product}
              index={index}
              onQuickView={handleQuickView}
            />
          ))}
        </div>
      </div>

      {/* Trending Now */}
      <div className="py-2">
        <SectionHeader 
          title="Trending Now" 
          subtitle="Most popular this week"
          icon={TrendingUp}
          gradient="bg-gradient-to-br from-rose-500 to-pink-500"
          showAll 
          onShowAll={() => router.push('/shop?sort=popular')} 
        />
        <div className="grid grid-cols-2 gap-3 px-4">
          {products.slice(4, 8).map((product, index) => (
            <MobileProductCard
              key={product.id}
              product={product}
              index={index}
              onQuickView={handleQuickView}
            />
          ))}
        </div>
      </div>

      {/* New Arrivals */}
      <div className="py-2">
        <SectionHeader 
          title="New Arrivals" 
          subtitle="Fresh from the store"
          icon={Star}
          gradient="bg-gradient-to-br from-purple-500 to-indigo-500"
          showAll 
          onShowAll={() => router.push('/shop?sort=newest')} 
        />
        <div className="grid grid-cols-2 gap-3 px-4">
          {products.slice(8, 12).map((product, index) => (
            <MobileProductCard
              key={product.id}
              product={product}
              index={index}
              onQuickView={handleQuickView}
            />
          ))}
        </div>
      </div>

      {/* Quick View Modal */}
      <ProductQuickView
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={handleAddToCart}
        onViewDetails={() => {
          if (quickViewProduct) {
            router.push(`/product/${quickViewProduct.slug}`)
          }
        }}
      />
    </div>
  )
}

export default MobileHomePage
