'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Package, Plus, Minus, ShoppingBag, Check, Tag, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Image from 'next/image'
import { formatPrice } from '@/lib/utils'

interface BundleProduct {
  id: string
  name: string
  image: string
  price: number
  salePrice?: number
  category?: string
}

interface ProductBundleProps {
  mainProduct: BundleProduct
  suggestedProducts: BundleProduct[]
  discountPercent?: number
  onAddBundle: (products: BundleProduct[]) => void
}

export function ProductBundle({
  mainProduct,
  suggestedProducts,
  discountPercent = 15,
  onAddBundle
}: ProductBundleProps) {
  const [selectedProducts, setSelectedProducts] = useState<string[]>([mainProduct.id])
  const [showBundle, setShowBundle] = useState(suggestedProducts.length > 0)

  const toggleProduct = (productId: string) => {
    if (productId === mainProduct.id) return // Can't remove main product
    
    setSelectedProducts(prev => 
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
  }

  const allProducts = [mainProduct, ...suggestedProducts]
  const selectedItems = allProducts.filter(p => selectedProducts.includes(p.id))
  
  const originalTotal = selectedItems.reduce((sum, p) => sum + (p.salePrice || p.price), 0)
  const bundleDiscount = selectedItems.length > 1 ? originalTotal * (discountPercent / 100) : 0
  const bundleTotal = originalTotal - bundleDiscount

  const handleAddBundle = () => {
    try {
      onAddBundle(selectedItems)
    } catch (error) {
      console.error('Add bundle error:', error)
    }
  }

  if (!showBundle) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-6 border border-purple-200 dark:border-purple-800"
    >
      <div className="flex items-center gap-2 mb-4">
        <Package className="w-6 h-6 text-purple-600" />
        <h3 className="text-lg font-bold">Complete the Look 💫</h3>
        {discountPercent > 0 && (
          <span className="ml-auto bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full">
            SAVE {discountPercent}%
          </span>
        )}
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Buy together and save! Select items to create your bundle.
      </p>

      {/* Products Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {allProducts.slice(0, 4).map((product, index) => {
          const isSelected = selectedProducts.includes(product.id)
          const isMain = product.id === mainProduct.id

          return (
            <motion.div
              key={product.id}
              whileHover={{ scale: 1.02 }}
              onClick={() => toggleProduct(product.id)}
              className={`relative rounded-xl overflow-hidden cursor-pointer border-2 transition ${
                isSelected 
                  ? 'border-purple-500 bg-white dark:bg-gray-800' 
                  : 'border-transparent bg-white/50 dark:bg-gray-800/50 opacity-70'
              } ${isMain ? 'ring-2 ring-purple-300' : ''}`}
            >
              {/* Checkbox */}
              <div className={`absolute top-2 right-2 z-10 w-6 h-6 rounded-full flex items-center justify-center ${
                isSelected 
                  ? 'bg-purple-500 text-white' 
                  : 'bg-white/80 border border-gray-300'
              }`}>
                {isSelected && <Check className="w-4 h-4" />}
              </div>

              {/* Main Product Badge */}
              {isMain && (
                <div className="absolute top-2 left-2 z-10 bg-purple-600 text-white text-xs px-2 py-0.5 rounded-full">
                  Main
                </div>
              )}

              {/* Product Image */}
              <div className="aspect-square relative bg-gray-100">
                {product.image && (
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                )}
              </div>

              {/* Info */}
              <div className="p-3">
                <p className="text-sm font-medium truncate">{product.name}</p>
                <p className="text-sm text-purple-600 font-bold">
                  {formatPrice(product.salePrice || product.price)}
                </p>
              </div>

              {/* + between items */}
              {index < allProducts.slice(0, 4).length - 1 && (
                <div className="absolute -right-3 top-1/2 -translate-y-1/2 z-20 w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 text-sm font-bold">
                  +
                </div>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Pricing Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-600">Original Price ({selectedItems.length} items)</span>
          <span className="text-gray-500 line-through">{formatPrice(originalTotal)}</span>
        </div>
        {bundleDiscount > 0 && (
          <div className="flex items-center justify-between mb-2 text-green-600">
            <span className="flex items-center gap-1">
              <Tag className="w-4 h-4" />
              Bundle Discount
            </span>
            <span>-{formatPrice(bundleDiscount)}</span>
          </div>
        )}
        <div className="flex items-center justify-between pt-2 border-t font-bold text-lg">
          <span>Bundle Price</span>
          <span className="text-purple-600">{formatPrice(bundleTotal)}</span>
        </div>
      </div>

      {/* Add Bundle Button */}
      <Button
        onClick={handleAddBundle}
        disabled={selectedItems.length < 2}
        className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
      >
        <Sparkles className="w-5 h-5 mr-2" />
        Add Bundle to Cart
        {bundleDiscount > 0 && (
          <span className="ml-2 bg-white/20 px-2 py-0.5 rounded text-sm">
            Save {formatPrice(bundleDiscount)}
          </span>
        )}
      </Button>
    </motion.div>
  )
}

// Frequently Bought Together (simpler version)
export function FrequentlyBoughtTogether({ 
  products,
  onAddAll
}: { 
  products: BundleProduct[]
  onAddAll: (products: BundleProduct[]) => void 
}) {
  if (products.length === 0) return null

  const total = products.reduce((sum, p) => sum + (p.salePrice || p.price), 0)

  return (
    <div className="border rounded-xl p-4">
      <h4 className="font-bold mb-3 flex items-center gap-2">
        <ShoppingBag className="w-5 h-5" />
        Frequently Bought Together
      </h4>
      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
        {products.map((product, idx) => (
          <div key={product.id} className="flex items-center">
            <div className="w-16 h-16 relative bg-gray-100 rounded-lg flex-shrink-0">
              {product.image && (
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover rounded-lg"
                />
              )}
            </div>
            {idx < products.length - 1 && (
              <Plus className="w-4 h-4 mx-2 text-gray-400" />
            )}
          </div>
        ))}
        <div className="ml-auto text-right">
          <p className="text-lg font-bold">{formatPrice(total)}</p>
          <p className="text-xs text-gray-500">{products.length} items</p>
        </div>
      </div>
      <Button 
        onClick={() => onAddAll(products)} 
        variant="outline" 
        className="w-full"
      >
        Add All to Cart
      </Button>
    </div>
  )
}
