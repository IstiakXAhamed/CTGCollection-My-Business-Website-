'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, ShoppingBag, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils'

interface Product {
  id: string
  name: string
  salePrice: number
  basePrice: number
  images: string[]
  slug: string
}

interface UpsellPopupProps {
  cartTotal: number
  onAddProduct: (productId: string) => void
  isOpen: boolean
  onClose: () => void
}

export default function UpsellPopup({ cartTotal, onAddProduct, isOpen, onClose }: UpsellPopupProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  // Free shipping threshold
  const FREE_SHIPPING_THRESHOLD = 2000
  const remaining = FREE_SHIPPING_THRESHOLD - cartTotal
  const progress = Math.min((cartTotal / FREE_SHIPPING_THRESHOLD) * 100, 100)

  useEffect(() => {
    if (isOpen) {
      fetchUpsellProducts()
    }
  }, [isOpen])

  const fetchUpsellProducts = async () => {
    try {
      const res = await fetch('/api/products?limit=3&sort=popular')
      if (res.ok) {
        const data = await res.json()
        setProducts(data.products?.slice(0, 3) || [])
      }
    } catch (err) {
      console.error('Failed to fetch upsell products:', err)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with Gradient */}
          <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 p-6 text-white relative">
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-3 mb-3">
              <Sparkles className="w-6 h-6" />
              <h2 className="text-xl font-bold">Wait! Special Offer 🎁</h2>
            </div>
            
            {remaining > 0 ? (
              <>
                <p className="text-white/90 mb-4">
                  Add {formatPrice(remaining)} more to get <span className="font-bold">FREE SHIPPING!</span>
                </p>
                
                {/* Progress Bar */}
                <div className="bg-white/30 rounded-full h-3 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="bg-white h-full rounded-full"
                  />
                </div>
                <div className="flex justify-between text-xs mt-1 text-white/80">
                  <span>{formatPrice(cartTotal)}</span>
                  <span>{formatPrice(FREE_SHIPPING_THRESHOLD)}</span>
                </div>
              </>
            ) : (
              <p className="text-white/90 flex items-center gap-2">
                ✨ You've unlocked <span className="font-bold">FREE SHIPPING!</span>
              </p>
            )}
          </div>

          {/* Upsell Products */}
          <div className="p-6">
            <p className="text-gray-600 mb-4 text-center">Add these popular items to your cart:</p>
            
            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading suggestions...</div>
            ) : (
              <div className="space-y-3">
                {products.map((product) => (
                  <motion.div
                    key={product.id}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="flex items-center gap-4 p-3 border rounded-xl hover:border-purple-300 hover:bg-purple-50 transition group"
                  >
                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {product.images?.[0] && (
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm truncate">{product.name}</h4>
                      <div className="flex items-center gap-2">
                        <span className="text-purple-600 font-bold">{formatPrice(product.salePrice || product.basePrice)}</span>
                        {product.salePrice && product.salePrice < product.basePrice && (
                          <span className="text-gray-400 text-sm line-through">{formatPrice(product.basePrice)}</span>
                        )}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => {
                        onAddProduct(product.id)
                        onClose()
                      }}
                      className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      Add
                    </Button>
                  </motion.div>
                ))}
              </div>
            )}

            <div className="mt-6 flex gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                No Thanks
              </Button>
              <Button
                onClick={onClose}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                Proceed to Checkout
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
