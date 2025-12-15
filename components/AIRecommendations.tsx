'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, ChevronLeft, ChevronRight, Eye } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'

interface Product {
  id: string
  name: string
  slug: string
  image: string
  price: number
  salePrice?: number
  category?: string
}

interface AIRecommendationsProps {
  productId: string
  productCategory?: string
  title?: string
  maxItems?: number
}

export function AIRecommendations({
  productId,
  productCategory,
  title = 'You May Also Like',
  maxItems = 6
}: AIRecommendationsProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [scrollPosition, setScrollPosition] = useState(0)

  useEffect(() => {
    fetchRecommendations()
  }, [productId])

  const fetchRecommendations = async () => {
    try {
      // Try AI recommendations first
      let res = await fetch(`/api/products/recommendations?productId=${productId}&category=${productCategory || ''}&limit=${maxItems}`)
      
      if (res.ok) {
        const data = await res.json()
        setProducts(data.products || [])
      } else {
        // Fallback to related products
        res = await fetch(`/api/products?category=${productCategory}&limit=${maxItems}`)
        if (res.ok) {
          const data = await res.json()
          // Filter out current product
          setProducts((data.products || []).filter((p: Product) => p.id !== productId))
        }
      }
    } catch (error) {
      console.error('Failed to fetch recommendations:', error)
    } finally {
      setLoading(false)
    }
  }

  const scroll = (direction: 'left' | 'right') => {
    const container = document.getElementById('recommendations-scroll')
    if (container) {
      const scrollAmount = 300
      const newPosition = direction === 'left' 
        ? scrollPosition - scrollAmount 
        : scrollPosition + scrollAmount
      
      container.scrollTo({ left: newPosition, behavior: 'smooth' })
      setScrollPosition(newPosition)
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
        <div className="flex gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="w-48 flex-shrink-0">
              <div className="aspect-square bg-gray-200 rounded-xl mb-3"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-20"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (products.length === 0) return null

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-yellow-500" />
          {title}
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => scroll('left')}
            className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 transition"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 transition"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div 
        id="recommendations-scroll"
        className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {products.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex-shrink-0 w-48 group"
          >
            <Link href={`/product/${product.slug}`}>
              <div className="aspect-square relative rounded-xl overflow-hidden mb-3 bg-gray-100">
                {product.image && (
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                )}
                {product.salePrice && (
                  <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    SALE
                  </span>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded-full p-2 shadow-lg">
                    <Eye className="w-5 h-5 text-gray-700" />
                  </div>
                </div>
              </div>
              <p className="font-medium text-sm line-clamp-2 group-hover:text-blue-600 transition">
                {product.name}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="font-bold text-blue-600">
                  {formatPrice(product.salePrice || product.price)}
                </span>
                {product.salePrice && (
                  <span className="text-sm text-gray-400 line-through">
                    {formatPrice(product.price)}
                  </span>
                )}
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* AI Badge */}
      <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
        <Sparkles className="w-3 h-3" />
        <span>Personalized recommendations powered by AI</span>
      </div>
    </div>
  )
}

// "Customers Also Bought" variant
export function CustomersAlsoBought({ productId }: { productId: string }) {
  return (
    <AIRecommendations 
      productId={productId} 
      title="Customers Also Bought"
      maxItems={4}
    />
  )
}
