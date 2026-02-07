'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Clock, Eye, Sparkles, Heart } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { useRecentlyViewedStore } from '@/store/recently-viewed'

export function RecentlyViewedProducts() {
  const [mounted, setMounted] = useState(false)
  const products = useRecentlyViewedStore(state => state.products)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || products.length === 0) return null

  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-2 mb-6">
          <Clock className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-bold">Recently Viewed</h2>
        </div>
        
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {products.slice(0, 8).map((product) => {
             const discount = product.price && product.salePrice
              ? Math.round(((product.price - product.salePrice) / product.price) * 100)
              : 0
              
             return (
              <Link
                key={product.id}
                href={`/product/${product.slug}`}
                className="flex-shrink-0 w-48 sm:w-64"
              >
                <div className="bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow h-full group">
                  <div className="relative aspect-square bg-gray-100">
                    <Image
                      src={product.image || '/placeholder-product.jpg'}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
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
                  
                  <div className="p-3">
                    <h3 className="text-sm font-medium line-clamp-2 h-10 mb-1 leading-tight group-hover:text-blue-600 transition-colors">
                      {product.name}
                    </h3>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-2 flex-wrap">
                      <span className="text-sm sm:text-base font-bold text-blue-600 truncate">
                        {formatPrice(product.salePrice || product.price)}
                      </span>
                      {product.salePrice && product.salePrice < product.price && (
                        <span className="text-[10px] sm:text-xs text-gray-400 line-through truncate">
                          {formatPrice(product.price)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
          )})}
        </div>
      </div>
    </section>
  )
}

// Smaller inline version for sidebars
export function RecentlyViewedSidebar() {
  const [mounted, setMounted] = useState(false)
  const products = useRecentlyViewedStore(state => state.products)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || products.length === 0) return null

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
      <h3 className="font-semibold mb-4 flex items-center gap-2">
        <Clock className="w-4 h-4 text-blue-600" />
        Recently Viewed
      </h3>
      <div className="space-y-3">
        {products.slice(0, 4).map((product) => (
          <Link
            key={product.id}
            href={`/product/${product.slug}`}
            className="flex gap-3 group"
          >
            <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
              <Image
                src={product.image || '/placeholder-product.jpg'}
                alt={product.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium line-clamp-1 group-hover:text-blue-600 transition-colors">
                {product.name}
              </h4>
              <span className="text-sm text-blue-600 font-semibold">
                {formatPrice(product.salePrice || product.price)}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
