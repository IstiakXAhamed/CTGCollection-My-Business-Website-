'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ShoppingBag, Truck, Shield, HeadphonesIcon, Star, Users, Package, TrendingUp, ArrowRight, Sparkles, Heart, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import Image from 'next/image'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'
import { TestimonialsCarousel } from '@/components/TestimonialsCarousel'

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

  useEffect(() => {
    fetchFeaturedProducts()
  }, [])

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
    { icon: <ShoppingBag className="w-7 h-7" />, title: "Quality Products", description: "Curated collection of premium products", color: "from-blue-500 to-blue-600" },
    { icon: <Truck className="w-7 h-7" />, title: "Fast Delivery", description: "Deliver across Bangladesh within 3-5 days", color: "from-green-500 to-emerald-600" },
    { icon: <Shield className="w-7 h-7" />, title: "Secure Payment", description: "100% secure payment via SSL encryption", color: "from-purple-500 to-purple-600" },
    { icon: <HeadphonesIcon className="w-7 h-7" />, title: "24/7 Support", description: "Always here to help you", color: "from-orange-500 to-red-500" }
  ]

  const stats = [
    { value: "10K+", label: "Happy Customers", icon: <Users className="w-6 h-6" /> },
    { value: "5K+", label: "Products", icon: <Package className="w-6 h-6" /> },
    { value: "99%", label: "Satisfaction", icon: <Star className="w-6 h-6" /> },
    { value: "24/7", label: "Support", icon: <HeadphonesIcon className="w-6 h-6" /> }
  ]

  const categories = [
    { name: 'Fashion', gradient: 'from-pink-600 via-purple-600 to-indigo-600', icon: '👗' },
    { name: 'Electronics', gradient: 'from-blue-600 via-cyan-600 to-teal-600', icon: '📱' },
    { name: 'Home & Living', gradient: 'from-orange-600 via-red-600 to-pink-600', icon: '🏠' },
    { name: 'Beauty', gradient: 'from-rose-600 via-pink-600 to-fuchsia-600', icon: '💄' }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Enhanced */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white">
        {/* Floating decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white/5 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
          {/* Floating shapes */}
          <motion.div 
            animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
            transition={{ duration: 5, repeat: Infinity }}
            className="absolute top-1/4 right-1/4 w-16 h-16 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20"
          />
          <motion.div 
            animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
            transition={{ duration: 6, repeat: Infinity }}
            className="absolute bottom-1/3 left-1/4 w-12 h-12 bg-white/10 rounded-full backdrop-blur-sm border border-white/20"
          />
        </div>
        
        <div className="relative container mx-auto px-4 py-16 sm:py-24 md:py-32 lg:py-36">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto px-2 sm:px-0"
          >
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-6"
            >
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span className="text-sm font-medium">Premium E-commerce Store</span>
            </motion.div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold mb-4 sm:mb-6 leading-tight">
              Welcome to<br />
              <span className="bg-gradient-to-r from-yellow-200 via-pink-200 to-cyan-200 bg-clip-text text-transparent">
                CTG Collection
              </span>
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-6 sm:mb-8 text-blue-50/90 max-w-2xl mx-auto px-2">
              Discover premium fashion and lifestyle products delivered to your doorstep
            </p>
            
            <div className="flex gap-3 sm:gap-4 justify-center flex-wrap px-2">
              <Button 
                asChild
                size="lg" 
                className="bg-white text-blue-600 hover:bg-white/90 hover:scale-105 hover:shadow-2xl text-sm sm:text-base lg:text-lg px-4 sm:px-6 lg:px-8 py-3 sm:py-4 lg:py-6 h-auto font-semibold transition-all duration-300 group min-h-[48px]"
              >
                <Link href="/shop">
                  Shop Now
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              
              <Button 
                asChild
                size="lg" 
                className="bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white hover:bg-white/20 hover:scale-105 text-sm sm:text-base lg:text-lg px-4 sm:px-6 lg:px-8 py-3 sm:py-4 lg:py-6 h-auto font-semibold transition-all duration-300 min-h-[48px]"
              >
                <Link href="/shop?featured=true">
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Featured
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 80C1200 80 1320 70 1380 65L1440 60V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* Stats Section - New */}
      <section className="py-8 -mt-8 relative z-10">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-xl border p-6 md:p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl flex items-center justify-center text-blue-600">
                    {stat.icon}
                  </div>
                  <p className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Enhanced */}
      <section className="py-16 container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Us?</h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">We provide the best shopping experience in Bangladesh</p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <Card className="group text-center p-6 border-2 border-gray-100 hover:border-blue-200 hover:shadow-xl transition-all duration-300 h-full">
                <CardContent className="pt-4 flex flex-col items-center">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    {feature.icon}
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-gray-500 text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Products - New */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-blue-50/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex items-center justify-between mb-10"
          >
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-3">
                <Sparkles className="w-8 h-8 text-yellow-500" />
                Featured Products
              </h2>
              <p className="text-gray-500">Handpicked items just for you</p>
            </div>
            <Link href="/shop?featured=true">
              <Button variant="outline" className="hidden md:flex items-center gap-2 hover:bg-blue-50">
                View All
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[1,2,3,4].map(i => (
                <div key={i} className="aspect-square bg-gray-200 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {featuredProducts.slice(0, 8).map((product, idx) => {
                // Images are already parsed by API - handle both array and string
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
                // Check if it's a local image (starts with / and not http)
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
                    <Link href={`/product/${product.slug}`}>
                      <Card className="group overflow-hidden border-0 shadow-md hover:shadow-2xl transition-all duration-300 bg-white">
                        <div className="relative aspect-square overflow-hidden bg-gray-100">
                          <Image
                            src={imageUrl}
                            alt={product.name}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                            unoptimized={isLocalImage}
                          />
                          {/* Overlay on hover */}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
                          {/* Quick actions */}
                          <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                            <button className="w-9 h-9 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-red-50 transition">
                              <Heart className="w-4 h-4 text-gray-600 hover:text-red-500" />
                            </button>
                            <button className="w-9 h-9 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-50 transition">
                              <Eye className="w-4 h-4 text-gray-600 hover:text-blue-500" />
                            </button>
                          </div>
                          {/* Badges */}
                          <div className="absolute top-3 left-3 flex flex-col gap-2">
                            {product.isFeatured && (
                              <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1">
                                <Sparkles className="w-3 h-3" /> Featured
                              </span>
                            )}
                            {discount > 0 && (
                              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                                {discount}% OFF
                              </span>
                            )}
                          </div>
                        </div>
                        <CardContent className="p-4">
                          <p className="text-xs text-gray-400 mb-1">{product.category?.name || 'Product'}</p>
                          <h3 className="font-medium text-gray-800 line-clamp-1 mb-2 group-hover:text-blue-600 transition-colors">
                            {product.name}
                          </h3>
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-blue-600">
                              {formatPrice(product.salePrice || product.basePrice)}
                            </span>
                            {product.salePrice && product.basePrice > product.salePrice && (
                              <span className="text-sm text-gray-400 line-through">
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
            <div className="text-center py-12 text-gray-500">
              <p>No featured products available</p>
              <Link href="/shop">
                <Button className="mt-4">Browse All Products</Button>
              </Link>
            </div>
          )}

          <div className="text-center mt-8 md:hidden">
            <Link href="/shop?featured=true">
              <Button>View All Products</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Shop by Category</h2>
            <p className="text-gray-500 text-lg">Explore our diverse collections</p>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link href={`/shop?category=${encodeURIComponent(category.name)}`}>
                  <Card className="relative overflow-hidden cursor-pointer group hover:shadow-2xl transition-all duration-500">
                    <div className={`aspect-[4/3] bg-gradient-to-br ${category.gradient} relative`}>
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all duration-500" />
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6">
                        <span className="text-6xl mb-4 transform group-hover:scale-125 transition-transform duration-500">
                          {category.icon}
                        </span>
                        <h3 className="text-2xl font-bold tracking-wide">{category.name}</h3>
                        <div className="w-8 h-1 bg-white/50 rounded-full mt-3 scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
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

      {/* Newsletter Section - New */}
      <section className="py-16 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto text-center text-white"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Subscribe to Our Newsletter
            </h2>
            <p className="text-blue-100 mb-8">
              Get exclusive offers, new arrivals, and special discounts directly in your inbox!
            </p>
            
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 h-12 bg-white/10 border-white/20 text-white placeholder:text-white/60 backdrop-blur-sm"
                required
              />
              <Button 
                type="submit" 
                className="h-12 px-8 bg-white text-blue-600 hover:bg-white/90 font-semibold"
                disabled={subscribing}
              >
                {subscribing ? 'Subscribing...' : 'Subscribe'}
              </Button>
            </form>
            
            <p className="text-xs text-blue-200 mt-4">
              No spam, unsubscribe anytime. We respect your privacy.
            </p>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Card className="bg-gradient-to-r from-gray-900 to-gray-800 text-white border-0 overflow-hidden relative">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-40 h-40 bg-blue-500 rounded-full blur-3xl" />
              <div className="absolute bottom-0 right-0 w-60 h-60 bg-purple-500 rounded-full blur-3xl" />
            </div>
            <CardContent className="p-10 md:p-16 text-center relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Start Shopping?
              </h2>
              <p className="text-xl mb-8 text-gray-300 max-w-2xl mx-auto">
                Join thousands of happy customers and discover amazing products at unbeatable prices
              </p>
              <div className="flex gap-4 justify-center flex-wrap">
                <Button 
                  asChild
                  size="lg" 
                  className="bg-white text-gray-900 hover:bg-gray-100 hover:scale-105 transition-all duration-300 font-semibold"
                >
                  <Link href="/shop">Explore Products</Link>
                </Button>
                <Button 
                  asChild
                  size="lg" 
                  className="bg-transparent border-2 border-white text-white hover:bg-white/10 hover:scale-105 transition-all duration-300 font-semibold"
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
