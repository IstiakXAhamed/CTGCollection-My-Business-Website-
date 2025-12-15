'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Clock, Eye } from 'lucide-react'
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
          {products.slice(0, 8).map((product) => (
            <Link
              key={product.id}
              href={`/product/${product.slug}`}
              className="flex-shrink-0 w-40 group"
            >
              <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 mb-2">
                <Image
                  src={product.image || '/placeholder-product.jpg'}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                  <Eye className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
              <h3 className="text-sm font-medium line-clamp-2 group-hover:text-blue-600 transition-colors">
                {product.name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm font-bold text-blue-600">
                  {formatPrice(product.salePrice || product.price)}
                </span>
                {product.salePrice && product.salePrice < product.price && (
                  <span className="text-xs text-gray-400 line-through">
                    {formatPrice(product.price)}
                  </span>
                )}
              </div>
            </Link>
          ))}
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
