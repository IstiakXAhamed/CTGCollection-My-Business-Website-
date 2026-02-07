'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { ChevronLeft, ChevronRight, Sparkles, Heart, Eye } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import type { Product } from '@/types'

interface RelatedProductsProps {
  currentProductId: string
  categoryId: string
}

export function RelatedProducts({ currentProductId, categoryId }: RelatedProductsProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [scrollPosition, setScrollPosition] = useState(0)

  useEffect(() => {
    fetchRelatedProducts()
  }, [categoryId])

  const fetchRelatedProducts = async () => {
    try {
      const res = await fetch(`/api/products?category=${categoryId}&limit=8`)
      if (res.ok) {
        const data = await res.json()
        // Filter out current product
        const related = data.products.filter((p: any) => p.id !== currentProductId)
        setProducts(related.slice(0, 6))
      }
    } catch (error) {
      console.error('Failed to fetch related products:', error)
    }
  }

  const scroll = (direction: 'left' | 'right') => {
    const container = document.getElementById('related-products-scroll')
    if (container) {
      const scrollAmount = 300
      const newPosition = direction === 'left' 
        ? scrollPosition - scrollAmount 
        : scrollPosition + scrollAmount
      
      container.scrollTo({ left: newPosition, behavior: 'smooth' })
      setScrollPosition(newPosition)
    }
  }

  if (products.length === 0) return null

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">You May Also Like</h2>
        <div className="flex gap-2">
          <button
            onClick={() => scroll('left')}
            className="p-2 rounded-full border hover:bg-gray-50 disabled:opacity-50"
            disabled={scrollPosition <= 0}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="p-2 rounded-full border hover:bg-gray-50"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div
        id="related-products-scroll"
        className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {products.map((product) => {
          const images = typeof product.images === 'string' 
            ? JSON.parse(product.images) 
            : product.images
          const imageUrl = images?.[0] || '/placeholder.png'
          const discount = product.basePrice && product.salePrice
            ? Math.round(((product.basePrice - product.salePrice) / product.basePrice) * 100)
            : 0

          return (
            <Link
              key={product.id}
              href={`/product/${product.slug}`}
              className="flex-shrink-0 w-48 sm:w-64"
            >
              <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer h-full border-0 shadow-sm bg-white group">
                <div className="relative aspect-square overflow-hidden bg-gray-100 rounded-t-xl">
                  <Image
                    src={imageUrl}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    unoptimized={imageUrl.startsWith('/') && !imageUrl.startsWith('//')}
                  />
                  
                  {/* Quick actions - hidden on mobile */}
                  <div className="absolute top-2 right-2 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 hidden sm:flex z-20">
                     <button className="w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-red-50 transition">
                       <Heart className="w-4 h-4 text-gray-600" />
                     </button>
                     <button className="w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-50 transition">
                       <Eye className="w-4 h-4 text-gray-600" />
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

                <CardContent className="p-3">
                  {/* Category */}
                  <p className="text-[10px] sm:text-xs text-gray-500 mb-1 truncate">{product.category?.name || 'Product'}</p>
                  
                  {/* Name */}
                  <h3 className="font-medium text-xs sm:text-sm text-gray-900 line-clamp-2 h-8 sm:h-auto mb-2 sm:mb-1 leading-tight group-hover:text-blue-600 transition-colors">
                    {product.name}
                  </h3>
                  
                  {/* Price Stack */}
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
          )
        })}
      </div>
    </div>
  )
}
