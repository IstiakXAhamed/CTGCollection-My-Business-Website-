'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Store, BadgeCheck, MapPin, Phone, Mail, Package, Star,
  ArrowLeft, Loader2, ShoppingCart
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useCartStore } from '@/store/cart'
import { useToast } from '@/hooks/use-toast'

interface Product {
  id: string
  name: string
  slug: string
  basePrice: number
  salePrice?: number
  images: string[]
  rating: number
  reviewCount: number
}

interface Shop {
  id: string
  name: string
  slug: string
  description?: string
  logo?: string
  banner?: string
  phone?: string
  email?: string
  address?: string
  city?: string
  isVerified: boolean
  rating: number
  totalSales: number
  createdAt: string
  products: Product[]
  _count: { products: number }
}

export default function PublicShopPage() {
  const params = useParams()
  const slug = params?.slug as string
  const { toast } = useToast()
  const addItem = useCartStore((state) => state.addItem)
  
  const [shop, setShop] = useState<Shop | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (slug) {
      fetchShop()
    }
  }, [slug])

  const fetchShop = async () => {
    try {
      const res = await fetch(`/api/shops/${slug}`)
      if (res.ok) {
        const data = await res.json()
        setShop(data.shop)
      } else {
        const data = await res.json()
        setError(data.error || 'Shop not found')
      }
    } catch (err) {
      setError('Failed to load shop')
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = (product: Product) => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.salePrice || product.basePrice,
      image: product.images?.[0] || '/placeholder.jpg',
      quantity: 1
    })
    toast({
      title: 'Added to cart!',
      description: `${product.name} added to your cart`
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    )
  }

  if (error || !shop) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-4">
        <Store className="w-16 h-16 text-gray-300" />
        <h1 className="text-xl font-bold text-gray-700">{error || 'Shop not found'}</h1>
        <Link href="/shop">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Shop
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Banner - Responsive height */}
      <div 
        className="h-32 sm:h-48 lg:h-64 bg-gradient-to-r from-purple-600 to-pink-600 relative"
        style={shop.banner ? { 
          backgroundImage: `url(${shop.banner})`, 
          backgroundSize: 'cover', 
          backgroundPosition: 'center' 
        } : {}}
      >
        <div className="absolute inset-0 bg-black/30" />
        <div className="container mx-auto px-3 sm:px-6">
          <Link href="/shop" className="absolute top-4 left-4 sm:left-6">
            <Button variant="secondary" size="sm" className="gap-1.5 text-xs sm:text-sm bg-white/90 hover:bg-white">
              <ArrowLeft className="w-4 h-4" /> Back
            </Button>
          </Link>
        </div>
      </div>

      {/* Shop Header - Responsive */}
      <div className="container mx-auto px-3 sm:px-6 -mt-12 sm:-mt-16 relative z-10">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
            {/* Logo */}
            <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-xl sm:rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center flex-shrink-0 mx-auto sm:mx-0 shadow-md">
              {shop.logo ? (
                <img src={shop.logo} alt={shop.name} className="w-full h-full object-cover rounded-xl sm:rounded-2xl" />
              ) : (
                <Store className="w-10 h-10 sm:w-14 sm:h-14 text-purple-600" />
              )}
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">{shop.name}</h1>
                {shop.isVerified && (
                  <BadgeCheck className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
                )}
              </div>
              
              {shop.description && (
                <p className="text-gray-600 text-sm sm:text-base mt-2 line-clamp-2">{shop.description}</p>
              )}

              {/* Stats - Responsive Grid */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 sm:gap-4 mt-3 sm:mt-4 text-xs sm:text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Package className="w-4 h-4" />
                  <span className="font-semibold">{shop._count.products}</span> Products
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span className="font-semibold">{shop.rating.toFixed(1)}</span>
                </div>
                {shop.city && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {shop.city}
                  </div>
                )}
              </div>

              {/* Contact - Mobile stack */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-4 mt-3 text-xs sm:text-sm">
                {shop.phone && (
                  <a href={`tel:${shop.phone}`} className="flex items-center gap-1 text-purple-600 hover:underline">
                    <Phone className="w-3.5 h-3.5" /> {shop.phone}
                  </a>
                )}
                {shop.email && (
                  <a href={`mailto:${shop.email}`} className="flex items-center gap-1 text-purple-600 hover:underline">
                    <Mail className="w-3.5 h-3.5" /> {shop.email}
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="container mx-auto px-3 sm:px-6 py-6 sm:py-8">
        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold mb-4 sm:mb-6">
          All Products ({shop._count.products})
        </h2>

        {shop.products.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No products yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
            {shop.products.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="overflow-hidden hover:shadow-lg transition group">
                  <Link href={`/product/${product.slug}`}>
                    <div className="aspect-square relative bg-gray-100">
                      <img 
                        src={product.images?.[0] || '/placeholder.jpg'} 
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition"
                      />
                      {product.salePrice && product.salePrice < product.basePrice && (
                        <Badge className="absolute top-2 left-2 bg-red-500 text-[10px] sm:text-xs">
                          {Math.round((1 - product.salePrice / product.basePrice) * 100)}% OFF
                        </Badge>
                      )}
                    </div>
                  </Link>
                  <CardContent className="p-2.5 sm:p-4">
                    <Link href={`/product/${product.slug}`}>
                      <h3 className="font-medium text-xs sm:text-sm line-clamp-2 hover:text-purple-600 min-h-[2rem] sm:min-h-[2.5rem]">
                        {product.name}
                      </h3>
                    </Link>
                    <div className="flex items-center gap-1 mt-1 text-[10px] sm:text-xs text-gray-500">
                      <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                      {product.rating.toFixed(1)} ({product.reviewCount})
                    </div>
                    <div className="flex items-center gap-1.5 mt-2">
                      {product.salePrice ? (
                        <>
                          <span className="font-bold text-sm sm:text-base text-purple-600">
                            ৳{product.salePrice.toLocaleString()}
                          </span>
                          <span className="text-[10px] sm:text-xs text-gray-400 line-through">
                            ৳{product.basePrice.toLocaleString()}
                          </span>
                        </>
                      ) : (
                        <span className="font-bold text-sm sm:text-base">
                          ৳{product.basePrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                    <Button 
                      size="sm" 
                      className="w-full mt-2 h-8 text-xs sm:text-sm"
                      onClick={(e) => {
                        e.preventDefault()
                        handleAddToCart(product)
                      }}
                    >
                      <ShoppingCart className="w-3.5 h-3.5 mr-1" />
                      Add
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
