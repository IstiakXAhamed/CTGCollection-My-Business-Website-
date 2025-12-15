'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { X, ShoppingCart, Heart, Check, Minus, Plus, Star, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

interface Product {
  id: string
  name: string
  slug: string
  description?: string
  basePrice: number
  salePrice?: number | null
  images: string[]
  category?: { name: string }
  rating?: number
  reviewCount?: number
  hasWarranty?: boolean
  warrantyPeriod?: string
  variants?: {
    id: string
    size?: string
    color?: string
    stock: number
    price?: number
  }[]
}

interface QuickViewModalProps {
  product: Product | null
  isOpen: boolean
  onClose: () => void
  onAddToCart?: (product: Product, quantity: number, variantId?: string) => void
}

export function QuickViewModal({ product, isOpen, onClose, onAddToCart }: QuickViewModalProps) {
  const [quantity, setQuantity] = useState(1)
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [selectedColor, setSelectedColor] = useState<string | null>(null)
  const [currentImage, setCurrentImage] = useState(0)
  const [addedToCart, setAddedToCart] = useState(false)

  if (!product) return null

  const price = product.salePrice || product.basePrice
  const hasDiscount = product.salePrice && product.salePrice < product.basePrice
  const discountPercent = hasDiscount 
    ? Math.round((1 - product.salePrice! / product.basePrice) * 100)
    : 0

  // Get unique sizes and colors from variants
  const sizes = [...new Set(product.variants?.map(v => v.size).filter(Boolean) || [])]
  const colors = [...new Set(product.variants?.map(v => v.color).filter(Boolean) || [])]

  const handleAddToCart = async () => {
    if (onAddToCart) {
      onAddToCart(product, quantity, selectedVariant || undefined)
      setAddedToCart(true)
      setTimeout(() => setAddedToCart(false), 2000)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.3 }}
            className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-4xl md:w-full bg-white dark:bg-gray-900 rounded-2xl shadow-2xl z-50 overflow-hidden max-h-[90vh] flex flex-col"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/90 dark:bg-gray-800/90 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col md:flex-row overflow-y-auto">
              {/* Image Section */}
              <div className="md:w-1/2 p-4 bg-gray-50 dark:bg-gray-800">
                <div className="relative aspect-square rounded-xl overflow-hidden">
                  <Image
                    src={product.images[currentImage] || '/placeholder-product.jpg'}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                  {hasDiscount && (
                    <span className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                      -{discountPercent}%
                    </span>
                  )}
                </div>
                
                {/* Thumbnails */}
                {product.images.length > 1 && (
                  <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                    {product.images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentImage(idx)}
                        className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition ${
                          currentImage === idx ? 'border-blue-500' : 'border-transparent'
                        }`}
                      >
                        <Image src={img} alt="" width={64} height={64} className="object-cover w-full h-full" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Details Section */}
              <div className="md:w-1/2 p-6 flex flex-col">
                {product.category && (
                  <span className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-2">
                    {product.category.name}
                  </span>
                )}
                
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {product.name}
                </h2>

                {/* Rating */}
                {product.rating && (
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i < Math.floor(product.rating!) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-500">
                      ({product.reviewCount || 0} reviews)
                    </span>
                  </div>
                )}

                {/* Price */}
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl font-bold text-blue-600">
                    {formatPrice(price)}
                  </span>
                  {hasDiscount && (
                    <span className="text-lg text-gray-400 line-through">
                      {formatPrice(product.basePrice)}
                    </span>
                  )}
                </div>

                {/* Warranty Badge */}
                {product.hasWarranty && product.warrantyPeriod && (
                  <div className="flex items-center gap-2 mb-4 text-green-600 bg-green-50 dark:bg-green-900/20 px-3 py-2 rounded-lg">
                    <Shield className="w-5 h-5" />
                    <span className="font-medium">{product.warrantyPeriod} Warranty</span>
                  </div>
                )}

                {/* Size Selection */}
                {sizes.length > 0 && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Size</label>
                    <div className="flex flex-wrap gap-2">
                      {sizes.map((size) => (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size!)}
                          className={`px-4 py-2 rounded-lg border-2 transition ${
                            selectedSize === size
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Color Selection */}
                {colors.length > 0 && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Color</label>
                    <div className="flex flex-wrap gap-2">
                      {colors.map((color) => (
                        <button
                          key={color}
                          onClick={() => setSelectedColor(color!)}
                          className={`px-4 py-2 rounded-lg border-2 transition ${
                            selectedColor === color
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                          }`}
                        >
                          {color}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">Quantity</label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 rounded-full border-2 border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-xl font-semibold w-12 text-center">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-10 h-10 rounded-full border-2 border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 mt-auto">
                  <Button
                    onClick={handleAddToCart}
                    className="flex-1 h-12"
                    disabled={addedToCart}
                  >
                    {addedToCart ? (
                      <>
                        <Check className="w-5 h-5 mr-2" />
                        Added!
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-5 h-5 mr-2" />
                        Add to Cart
                      </>
                    )}
                  </Button>
                  <Button variant="outline" size="icon" className="h-12 w-12">
                    <Heart className="w-5 h-5" />
                  </Button>
                </div>

                {/* View Full Details Link */}
                <Link
                  href={`/product/${product.slug}`}
                  className="mt-4 text-center text-blue-600 hover:underline"
                  onClick={onClose}
                >
                  View Full Details →
                </Link>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
