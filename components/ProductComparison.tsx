'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Scale, X, Plus, ChevronDown, ChevronUp, Check, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Image from 'next/image'
import { formatPrice } from '@/lib/utils'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface CompareProduct {
  id: string
  name: string
  slug: string
  image: string
  price: number
  salePrice?: number
  rating?: number
  category?: string
  specs?: Record<string, string | number | boolean>
}

// Zustand store for comparison
interface CompareStore {
  products: CompareProduct[]
  addProduct: (product: CompareProduct) => void
  removeProduct: (id: string) => void
  clearAll: () => void
}

export const useCompareStore = create<CompareStore>()(
  persist(
    (set, get) => ({
      products: [],
      addProduct: (product) => {
        const { products } = get()
        if (products.length >= 4) {
          alert('Maximum 4 products can be compared')
          return
        }
        if (products.some(p => p.id === product.id)) {
          return
        }
        set({ products: [...products, product] })
      },
      removeProduct: (id) => {
        set({ products: get().products.filter(p => p.id !== id) })
      },
      clearAll: () => set({ products: [] })
    }),
    { name: 'compare-products' }
  )
)

// Compare Button for Product Cards
export function CompareButton({ product }: { product: CompareProduct }) {
  const { products, addProduct, removeProduct } = useCompareStore()
  const isInCompare = products.some(p => p.id === product.id)

  return (
    <button
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        if (isInCompare) {
          removeProduct(product.id)
        } else {
          addProduct(product)
        }
      }}
      className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm transition ${
        isInCompare
          ? 'bg-blue-600 text-white'
          : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200'
      }`}
    >
      <Scale className="w-4 h-4" />
      {isInCompare ? 'Added' : 'Compare'}
    </button>
  )
}

// Floating Compare Bar
export function CompareBar() {
  const { products, removeProduct, clearAll } = useCompareStore()
  const [isExpanded, setIsExpanded] = useState(false)

  if (products.length === 0) return null

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-800 shadow-2xl border-t"
    >
      <div className="container mx-auto px-4">
        {/* Header */}
        <div 
          className="flex items-center justify-between py-3 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-3">
            <Scale className="w-5 h-5 text-blue-600" />
            <span className="font-semibold">Compare ({products.length}/4)</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                window.location.href = '/compare'
              }}
              disabled={products.length < 2}
            >
              Compare Now
            </Button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                clearAll()
              }}
              className="text-sm text-gray-500 hover:text-red-500"
            >
              Clear All
            </button>
            {isExpanded ? (
              <ChevronDown className="w-5 h-5" />
            ) : (
              <ChevronUp className="w-5 h-5" />
            )}
          </div>
        </div>

        {/* Expanded View */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="pb-4 overflow-hidden"
            >
              <div className="flex gap-4 overflow-x-auto py-2">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="flex-shrink-0 w-32 relative group"
                  >
                    <div className="relative w-32 h-32 bg-gray-100 rounded-lg overflow-hidden">
                      {product.image && (
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      )}
                      <button
                        onClick={() => removeProduct(product.id)}
                        className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs font-medium mt-2 truncate">{product.name}</p>
                    <p className="text-xs text-blue-600 font-bold">
                      {formatPrice(product.salePrice || product.price)}
                    </p>
                  </div>
                ))}

                {/* Add More Slot */}
                {products.length < 4 && (
                  <div className="flex-shrink-0 w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <Plus className="w-6 h-6 mx-auto mb-1" />
                      <span className="text-xs">Add more</span>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

// Full Comparison Page Component
export function ProductComparison() {
  const { products, removeProduct } = useCompareStore()
  const [loading, setLoading] = useState(false)

  // Collect all unique spec keys
  const allSpecs = new Set<string>()
  products.forEach(p => {
    if (p.specs) {
      Object.keys(p.specs).forEach(key => allSpecs.add(key))
    }
  })

  const commonFeatures = [
    { key: 'price', label: 'Price' },
    { key: 'rating', label: 'Rating' },
    { key: 'category', label: 'Category' },
    ...Array.from(allSpecs).map(key => ({ key, label: key }))
  ]

  const renderValue = (product: CompareProduct, key: string) => {
    try {
      if (key === 'price') {
        return (
          <div>
            <span className="text-xl font-bold text-blue-600">
              {formatPrice(product.salePrice || product.price)}
            </span>
            {product.salePrice && (
              <span className="text-sm text-gray-400 line-through ml-2">
                {formatPrice(product.price)}
              </span>
            )}
          </div>
        )
      }

      if (key === 'rating') {
        return (
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span>{product.rating || 'N/A'}</span>
          </div>
        )
      }

      if (key === 'category') {
        return <span>{product.category || 'N/A'}</span>
      }

      const value = product.specs?.[key]
      if (typeof value === 'boolean') {
        return value ? (
          <Check className="w-5 h-5 text-green-600" />
        ) : (
          <X className="w-5 h-5 text-red-500" />
        )
      }

      return <span>{value?.toString() || '-'}</span>
    } catch (error) {
      console.error('Error rendering value:', error)
      return '-'
    }
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <Scale className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <h2 className="text-2xl font-bold mb-2">No products to compare</h2>
        <p className="text-gray-500 mb-4">Add products to compare from the shop page</p>
        <Button onClick={() => window.location.href = '/shop'}>
          Browse Products
        </Button>
      </div>
    )
  }

  if (products.length === 1) {
    return (
      <div className="text-center py-16">
        <Scale className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <h2 className="text-2xl font-bold mb-2">Add more products</h2>
        <p className="text-gray-500 mb-4">You need at least 2 products to compare</p>
        <Button onClick={() => window.location.href = '/shop'}>
          Add More Products
        </Button>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[600px]">
        <thead>
          <tr>
            <th className="text-left p-4 bg-gray-50 dark:bg-gray-800 w-40">Feature</th>
            {products.map((product) => (
              <th key={product.id} className="p-4 bg-gray-50 dark:bg-gray-800">
                <div className="text-center">
                  <div className="relative w-24 h-24 mx-auto mb-3 group">
                    {product.image && (
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover rounded-lg"
                      />
                    )}
                    <button
                      onClick={() => removeProduct(product.id)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <h3 className="font-semibold text-sm">{product.name}</h3>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {commonFeatures.map((feature, idx) => (
            <tr key={feature.key} className={idx % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'}>
              <td className="p-4 font-medium text-gray-600 dark:text-gray-400">
                {feature.label}
              </td>
              {products.map((product) => (
                <td key={product.id} className="p-4 text-center">
                  {renderValue(product, feature.key)}
                </td>
              ))}
            </tr>
          ))}
          <tr>
            <td className="p-4"></td>
            {products.map((product) => (
              <td key={product.id} className="p-4 text-center">
                <Button
                  onClick={() => window.location.href = `/product/${product.slug}`}
                  className="w-full"
                >
                  View Product
                </Button>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  )
}
