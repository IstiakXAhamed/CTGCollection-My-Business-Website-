'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { ChevronLeft, ChevronRight } from 'lucide-react'
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
        className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth"
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
              className="flex-shrink-0 w-64"
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="relative aspect-square mb-3 bg-gray-100 rounded-lg overflow-hidden">
                    <Image
                      src={imageUrl}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                    {discount > 0 && (
                      <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                        -{discount}%
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-sm mb-2 line-clamp-2">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-blue-600">
                      {formatPrice(product.salePrice || product.basePrice)}
                    </span>
                    {product.salePrice && (
                      <span className="text-sm text-gray-500 line-through">
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
