'use client'

import { useState, useEffect, memo } from 'react'
import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'
import { Badge } from '@/components/ui/badge'
import { ShoppingBag, Truck, Shield, HeadphonesIcon, Star, Users, Package, TrendingUp, ArrowRight, Sparkles, Heart, Eye, Store, BadgeCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import Image from 'next/image'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'
import { useSiteSettings } from '@/hooks/useSiteSettings'
import { PWAInstallBanner } from '@/components/PWAInstallBanner'
import { useAppStandalone } from '@/hooks/useAppStandalone'

// Lazy load heavy components for better performance
const TestimonialsCarousel = dynamic(() => import('@/components/TestimonialsCarousel').then(mod => mod.TestimonialsCarousel), {
  ssr: false,
  loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded-xl" />
})

const SpinWheel = dynamic(() => import('@/components/SpinWheel').then(mod => mod.SpinWheel), {
  ssr: false,
  loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded-xl" />
})

const MobileHomePage = dynamic(() => import('@/components/mobile/MobileHomePage').then(mod => mod.MobileHomePage), {
  ssr: false
})

interface Product {
  id: string
  name: string
  slug: string
  basePrice: number
  salePrice: number | null
  images: string | string[]
  isFeatured: boolean
  category?: { name: string }
}

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [subscribing, setSubscribing] = useState(false)
  const [multiVendorEnabled, setMultiVendorEnabled] = useState(false)
  const { settings } = useSiteSettings()
  const isStandalone = useAppStandalone()

  useEffect(() => {
    fetchFeaturedProducts()
    fetch('/api/settings/public')
      .then(res => res.json())
      .then(data => setMultiVendorEnabled(data.multiVendorEnabled))
      .catch(err => console.error('Settings fetch error:', err))
  }, [])

  // Render elite mobile experience for installed PWA users
  if (isStandalone) {
    return <MobileHomePage />
  }

  const fetchFeaturedProducts = async () => {
    try {
      const res = await fetch('/api/products?featured=true&limit=8')
      if (res.ok) {
        const data = await res.json()
        setFeaturedProducts(data.products || [])
      }
    } catch (error) {
      console.error('Failed to fetch products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setSubscribing(true)
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      const data = await res.json()
      alert(data.message || 'Thank you for subscribing!')
      if (data.success) setEmail('')
    } catch (error) {
      alert('Failed to subscribe. Please try again.')
    } finally {
      setSubscribing(false)
    }
  }

  const features = [
    { icon: <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" />, title: settings?.value1Title || "Quality Products", description: settings?.value1Desc || "Curated premium products", color: "from-blue-500 to-blue-600" },
    { icon: <Truck className="w-5 h-5 sm:w-6 sm:h-6" />, title: settings?.value2Title || "Fast Delivery", description: settings?.value2Desc || "3-5 days nationwide", color: "from-green-500 to-emerald-600" },
    { icon: <Shield className="w-5 h-5 sm:w-6 sm:h-6" />, title: settings?.value3Title || "Secure Payment", description: settings?.value3Desc || "100% SSL encrypted", color: "from-purple-500 to-purple-600" },
    { icon: <HeadphonesIcon className="w-5 h-5 sm:w-6 sm:h-6" />, title: settings?.value4Title || "24/7 Support", description: settings?.value4Desc || "Always here to help", color: "from-orange-500 to-red-500" }
  ]

  const stats = [
    { value: settings?.stat1Value || "10K+", label: settings?.stat1Label || "Customers", icon: <Users className="w-4 h-4 sm:w-5 sm:h-5" /> },
    { value: settings?.stat2Value || "5K+", label: settings?.stat2Label || "Products", icon: <Package className="w-4 h-4 sm:w-5 sm:h-5" /> },
    { value: settings?.stat3Value || "99%", label: settings?.stat3Label || "Satisfaction", icon: <Star className="w-4 h-4 sm:w-5 sm:h-5" /> },
    { value: settings?.stat4Value || "24/7", label: settings?.stat4Label || "Support", icon: <HeadphonesIcon className="w-4 h-4 sm:w-5 sm:h-5" /> }
  ]

  const categories = [
    { name: 'Fashion', gradient: 'from-pink-600 via-purple-600 to-indigo-600', icon: '👗' },
    { name: 'Electronics', gradient: 'from-blue-600 via-cyan-600 to-teal-600', icon: '📱' },
    { name: 'Fragrance', gradient: 'from-amber-500 via-orange-600 to-red-600', icon: '✨' },
    { name: 'Home & Living', gradient: 'from-orange-600 via-red-600 to-pink-600', icon: '🏠' }
  ]

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Hero Section - Compact for mobile */}
      <section className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white">
        {/* Floating decorative elements - hidden on mobile for performance */}
        <div className="absolute inset-0 overflow-hidden hidden sm:block">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white/5 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <motion.div 
            animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
            transition={{ duration: 5, repeat: Infinity }}
            className="absolute top-1/4 right-1/4 w-16 h-16 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20"
          />
        </div>
        
        <div className="relative container mx-auto px-4 py-8 sm:py-16 md:py-24 lg:py-32">
          <motion.div
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-3xl mx-auto px-2"
          >
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-4 sm:mb-6"
            >
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-300" />
              <span className="text-xs sm:text-sm font-medium">Premium E-commerce</span>
            </motion.div>
            
            <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-5 leading-tight">
              Welcome to<br className="sm:hidden" />
              <span className="hidden sm:inline"> </span>
              <span className="bg-gradient-to-r from-yellow-200 via-pink-200 to-cyan-200 bg-clip-text text-transparent block sm:inline">
                Silk Mart
              </span>
            </h1>
            
            <p className="text-xs sm:text-sm md:text-base lg:text-lg mb-4 sm:mb-6 text-blue-50/90 max-w-xl mx-auto">
              Premium fashion & lifestyle products delivered to your doorstep
            </p>
            
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center items-center">
              <Button 
                asChild
                className="bg-white text-blue-600 hover:bg-white/90 text-xs sm:text-sm px-5 py-2 h-9 sm:h-10 font-semibold transition-all duration-300 group w-full sm:w-auto max-w-[160px]"
              >
                <Link href="/shop">
                  Shop Now
                  <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              
              <Button 
                asChild
                className="bg-white/10 backdrop-blur-sm border border-white/30 text-white hover:bg-white/20 text-xs sm:text-sm px-5 py-2 h-9 sm:h-10 font-semibold transition-all duration-300 w-full sm:w-auto max-w-[160px]"
              >
                <Link href="/shop?featured=true">
                  <Sparkles className="w-3.5 h-3.5 mr-1" />
                  Featured
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Wave divider - Fixed with bottom-[-1px] to prevent sub-pixel leak */}
        <div className="absolute -bottom-[1px] left-0 right-0 w-full overflow-hidden leading-[0]">
          <svg 
            viewBox="0 0 1440 80" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg" 
            className="relative block w-full h-auto"
            preserveAspectRatio="none"
          >
            <path d="M0 80L60 73C120 67 240 53 360 47C480 40 600 40 720 43C840 47 960 53 1080 53C1200 53 1320 47 1380 43L1440 40V80H1380C1320 80 1200 80 1080 80C960 80 840 80 720 80C600 80 480 80 360 80C240 80 120 80 60 80H0Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* Categories Section - FIRST after hero (Product-related) */}
      <section className="py-6 sm:py-10 md:py-14">
        <div className="container mx-auto px-3 sm:px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-4 sm:mb-8"
          >
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2">Shop by Category</h2>
            <p className="text-gray-500 text-xs sm:text-sm">Explore our collections</p>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
            {categories.map((category, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link href={`/shop?category=${encodeURIComponent(category.name)}`}>
                  <Card className="relative overflow-hidden cursor-pointer group hover:shadow-xl transition-all duration-500">
                    <div className={`aspect-[4/3] sm:aspect-[4/3] bg-gradient-to-br ${category.gradient} relative`}>
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all duration-500" />
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-3 sm:p-6">
                        <span className="text-3xl sm:text-5xl mb-2 sm:mb-3 transform group-hover:scale-110 transition-transform duration-500">
                          {category.icon}
                        </span>
                        <h3 className="text-sm sm:text-xl font-bold tracking-wide text-center">{category.name}</h3>
                      </div>
                      {/* Shine effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products - SECOND (Product-related) */}
      <section className="py-6 sm:py-10 md:py-14 bg-gradient-to-br from-gray-50 to-blue-50/30">
        <div className="container mx-auto px-3 sm:px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex items-center justify-between mb-4 sm:mb-8"
          >
            <div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 flex items-center gap-2">
                <Sparkles className="w-5 h-5 sm:w-7 sm:h-7 text-yellow-500" />
                Featured Products
              </h2>
              <p className="text-gray-500 text-xs sm:text-sm">Handpicked items for you</p>
            </div>
            <Link href="/shop">
              <Button variant="outline" size="sm" className="hidden md:flex items-center gap-2 hover:bg-blue-50">
                View All
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
              {[1,2,3,4].map(i => (
                <div key={i} className="aspect-square bg-gray-200 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
              {featuredProducts.slice(0, 8).map((product, idx) => {
                let images: string[] = []
                if (Array.isArray(product.images)) {
                  images = product.images
                } else if (typeof product.images === 'string') {
                  try {
                    images = JSON.parse(product.images)
                  } catch {
                    images = []
                  }
                }
                const imageUrl = images && images[0] ? images[0] : '/placeholder.png'
                const isLocalImage = imageUrl.startsWith('/') && !imageUrl.startsWith('//')
                const discount = product.basePrice && product.salePrice
                  ? Math.round(((product.basePrice - product.salePrice) / product.basePrice) * 100)
                  : 0

                return (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Link href={`/product/${product.slug}`} prefetch={false}>
                      <Card className="group overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-300 bg-white">
                        <div className="relative aspect-square overflow-hidden bg-gray-100">
                          <Image
                            src={imageUrl}
                            alt={product.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                            unoptimized={isLocalImage}
                            priority={idx < 4}
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
                          />
                          {/* Quick actions - hidden on mobile */}
                          <div className="absolute top-2 right-2 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 hidden sm:flex">
                            <button className="w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-red-50 transition">
                              <Heart className="w-3.5 h-3.5 text-gray-600" />
                            </button>
                            <button className="w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-50 transition">
                              <Eye className="w-3.5 h-3.5 text-gray-600" />
                            </button>
                          </div>
                          {/* UNIFIED SMART LAYOUT - Clean & Consistent */}
                          
                          {/* Discount Badge: Top Left (Red Tag) */}
                          {discount > 0 && (
                            <div className="absolute top-2 left-2 z-10">
                              <span className="bg-red-500 text-white text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-md shadow-md">
                                -{discount}%
                              </span>
                            </div>
                          )}

                          {/* Featured Icon: Top Right (Gold Star) */}
                          {product.isFeatured && (
                            <div className="absolute top-2 right-2 z-10">
                              <div className="bg-white/90 backdrop-blur-sm p-1.5 rounded-full shadow-md">
                                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-500 fill-yellow-500" />
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <CardContent className="p-2 sm:p-3">
                          {/* Category */}
                          <p className="text-[10px] sm:text-xs text-gray-500 mb-1 truncate">{product.category?.name || 'Product'}</p>
                          
                          {/* Name */}
                          <h3 className="font-medium text-xs sm:text-sm text-gray-900 line-clamp-2 sm:line-clamp-1 h-8 sm:h-auto mb-2 sm:mb-1 leading-tight group-hover:text-blue-600 transition-colors">
                            {product.name}
                          </h3>
                          
                          {/* Price Stack - Flex Column on Mobile, Row on Desktop */}
                          <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-2 flex-wrap">
                            <span className="text-sm sm:text-base font-bold text-blue-600 truncate">
                              {formatPrice(product.salePrice || product.basePrice)}
                            </span>
                            {product.salePrice && product.basePrice > product.salePrice && (
                              <span className="text-[10px] sm:text-xs text-gray-400 line-through truncate">
                                {formatPrice(product.basePrice)}
                              </span>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm">No featured products available</p>
              <Link href="/shop">
                <Button size="sm" className="mt-3">Browse All Products</Button>
              </Link>
            </div>
          )}

          <div className="text-center mt-4 sm:mt-6 md:hidden">
            <Link href="/shop">
              <Button size="sm">View All Products</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section - Compact (Service-related) */}
      <section className="py-6 sm:py-10">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border p-4 sm:p-6">
            <div className="grid grid-cols-4 gap-2 sm:gap-6">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-1.5 sm:mb-2 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-lg flex items-center justify-center text-blue-600">
                    {stat.icon}
                  </div>
                  <p className="text-lg sm:text-2xl md:text-3xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-[10px] sm:text-xs text-gray-500">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Compact (Service-related) */}
      <section className="py-6 sm:py-10 md:py-14 container mx-auto px-3 sm:px-4">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-4 sm:mb-8"
        >
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2">Why Choose Us?</h2>
          <p className="text-gray-500 text-xs sm:text-sm">Best shopping experience in Bangladesh</p>
        </motion.div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <Card className="group text-center p-3 sm:p-5 border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all duration-300 h-full">
                <CardContent className="p-0 flex flex-col items-center">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white mb-2 sm:mb-3 group-hover:scale-105 transition-transform duration-300`}>
                    {feature.icon}
                  </div>
                  <h3 className="font-semibold text-xs sm:text-sm mb-0.5 sm:mb-1">{feature.title}</h3>
                  <p className="text-gray-500 text-[10px] sm:text-xs">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Become a Seller CTA - Multi-Vendor Only */}
      {multiVendorEnabled && (
        <section className="py-8 sm:py-12 container mx-auto px-3 sm:px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <div className="bg-gray-900 rounded-2xl sm:rounded-3xl p-5 sm:p-8 md:p-10 relative overflow-hidden text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-5 sm:gap-8">
              {/* Background Effects */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-pink-600/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
              
              <div className="relative z-10 max-w-xl">
                <Badge className="mb-3 bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 border-purple-500/50 text-xs">
                  <Store className="w-3 h-3 mr-1" /> Seller Zone
                </Badge>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2 sm:mb-3">
                  Become a Seller on{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                    South Asia's First Marketplace
                  </span>
                </h2>
                <p className="text-gray-400 text-sm sm:text-base mb-4">
                  Join our network of sellers. 0% commission for the first month.
                </p>
                <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                  <div className="flex items-center gap-1.5 text-xs text-gray-300">
                    <BadgeCheck className="w-3.5 h-3.5 text-green-500" /> Verified
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-300">
                    <TrendingUp className="w-3.5 h-3.5 text-blue-500" /> Analytics
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-300">
                    <Shield className="w-3.5 h-3.5 text-purple-500" /> Secure
                  </div>
                </div>
              </div>

              <div className="relative z-10 flex flex-col gap-2">
                <Button 
                  asChild
                  size="lg" 
                  className="h-11 sm:h-12 px-6 text-sm sm:text-base bg-white text-gray-900 hover:bg-gray-100 font-bold"
                >
                  <Link href="/become-seller">
                    Start Selling <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Link>
                </Button>
                <p className="text-center text-[10px] text-gray-500">
                  Takes less than 2 minutes
                </p>
              </div>
            </div>
          </motion.div>
        </section>
      )}

      {/* PWA Install Banner - Above Newsletter */}
      <PWAInstallBanner />

      {/* Newsletter Section */}
      <section className="py-8 sm:py-12 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 relative overflow-hidden">
        <div className="absolute inset-0 hidden sm:block">
          <div className="absolute top-10 left-10 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-xl mx-auto text-center text-white"
          >
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-3">
              Subscribe to Newsletter
            </h2>
            <p className="text-blue-100 text-sm sm:text-base mb-4 sm:mb-6">
              Get exclusive offers and new arrivals in your inbox!
            </p>
            
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 h-10 sm:h-11 bg-white/10 border-white/20 text-white placeholder:text-white/60 backdrop-blur-sm text-sm"
                required
              />
              <Button 
                type="submit" 
                className="h-10 sm:h-11 px-6 bg-white text-blue-600 hover:bg-white/90 font-semibold text-sm"
                disabled={subscribing}
              >
                {subscribing ? 'Subscribing...' : 'Subscribe'}
              </Button>
            </form>
            
            <p className="text-[10px] sm:text-xs text-blue-200 mt-3">
              No spam, unsubscribe anytime.
            </p>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-8 sm:py-12 container mx-auto px-3 sm:px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Card className="bg-gradient-to-r from-gray-900 to-gray-800 text-white border-0 overflow-hidden relative">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500 rounded-full blur-3xl" />
              <div className="absolute bottom-0 right-0 w-48 h-48 bg-purple-500 rounded-full blur-3xl" />
            </div>
            <CardContent className="p-6 sm:p-10 md:p-12 text-center relative z-10">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-3">
                Ready to Start Shopping?
              </h2>
              <p className="text-sm sm:text-base mb-4 sm:mb-6 text-gray-300 max-w-xl mx-auto">
                Join thousands of happy customers and discover amazing products
              </p>
              <div className="flex gap-2 sm:gap-3 justify-center flex-wrap">
                <Button 
                  asChild
                  className="bg-white text-gray-900 hover:bg-gray-100 font-semibold text-sm h-10"
                >
                  <Link href="/shop">Explore Products</Link>
                </Button>
                <Button 
                  asChild
                  className="bg-transparent border-2 border-white text-white hover:bg-white/10 font-semibold text-sm h-10"
                >
                  <Link href="/register">Create Account</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        {/* Testimonials Section */}
        <TestimonialsCarousel />
      </section>
    </div>
  )
}
