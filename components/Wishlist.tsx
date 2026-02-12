'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Trash2, ShoppingCart, Share2, ArrowRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useWishlistStore } from '@/store/wishlist'
import { formatPrice } from '@/lib/utils'
import { haptics } from '@/lib/haptics'
import { useCartStore } from '@/store/cart'
import { MobileProductCard } from './mobile/MobileProductCard'
import Image from 'next/image'

export function WishlistButton({ product, className }: { product: any; className?: string }) {
  const { isInWishlist, addItem, removeItem, toggleItem, items } = useWishlistStore()
  const isWishlisted = isInWishlist(product.id)
  const [showAnim, setShowAnim] = useState(false)

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    haptics.medium()
    toggleItem({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      basePrice: product.basePrice,
      salePrice: product.salePrice,
      images: product.images,
      category: product.category,
    })

    if (!isWishlisted) {
      setShowAnim(true)
      setTimeout(() => setShowAnim(false), 1000)
    }
  }

  return (
    <div className={className}>
      <motion.button
        whileTap={{ scale: 0.85 }}
        onClick={handleToggle}
        className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all ${
          isWishlisted
            ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
            : 'bg-white/90 dark:bg-gray-800/90 text-gray-600 dark:text-gray-300 hover:bg-rose-50 dark:hover:bg-rose-900/20'
        }`}
      >
        <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />

        {/* Heart pop animation */}
        <AnimatePresence>
          {showAnim && !isWishlisted && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1.5, opacity: 0 }}
              exit={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <Heart className="w-8 h-8 text-rose-500" fill="currentColor" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  )
}

export function WishlistPage() {
  const { items, removeItem, clearWishlist } = useWishlistStore()
  const addToCart = useCartStore((state) => state.addItem)

  const handleAddToCart = (product: any) => {
    haptics.success()
    const imageUrl = (() => {
      try {
        const imgs = typeof product.images === 'string' ? JSON.parse(product.images) : product.images
        return Array.isArray(imgs) ? imgs[0] : imgs
      } catch {
        return '/placeholder.png'
      }
    })()

    addToCart({
      productId: product.id,
      name: product.name,
      price: product.salePrice || product.basePrice,
      image: imageUrl,
      quantity: 1,
    })
  }

  const handleShare = async (product: any) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: `Check out ${product.name} on Silk Mart!`,
          url: `${window.location.origin}/product/${product.slug}`,
        })
        haptics.success()
      } catch (err) {
        // User cancelled or share failed
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(`${window.location.origin}/product/${product.slug}`)
      haptics.success()
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <Heart className="w-12 h-12 text-gray-400" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Your wishlist is empty</h1>
            <p className="text-muted-foreground mb-6">Save items you love to buy them later</p>
            <Link href="/shop">
              <Button className="bg-gradient-to-r from-blue-500 to-purple-600">
                <Sparkles className="w-4 h-4 mr-2" />
                Start Shopping
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-2xl font-bold">My Wishlist</h1>
            <p className="text-muted-foreground">{items.length} items saved</p>
          </div>
          <Button variant="outline" onClick={clearWishlist}>
            <Trash2 className="w-4 h-4 mr-2" />
            Clear All
          </Button>
        </motion.div>

        {/* Wishlist Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <AnimatePresence mode="popLayout">
            {items.map((product, index) => (
              <motion.div
                key={product.productId}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="overflow-hidden group">
                  <CardContent className="p-0">
                    {/* Image */}
                    <div className="relative aspect-square overflow-hidden">
                      <Image
                        src={
                          (() => {
                            try {
                              const imgs = typeof product.images === 'string' ? JSON.parse(product.images) : product.images
                              return Array.isArray(imgs) ? imgs[0] : imgs
                            } catch {
                              return '/placeholder.png'
                            }
                          })()
                        }
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />

                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                      {/* Actions */}
                      <div className="absolute top-2 right-2 flex flex-col gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-8 h-8 bg-white/90 dark:bg-gray-800/90 rounded-full"
                          onClick={() => handleShare(product)}
                        >
                          <Share2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-8 h-8 bg-white/90 dark:bg-gray-800/90 rounded-full text-rose-500"
                          onClick={() => {
                            haptics.light()
                            removeItem(product.productId)
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      {/* Add to Cart Button */}
                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        whileHover={{ y: 0, opacity: 1 }}
                        className="absolute bottom-2 left-2 right-2"
                      >
                        <Button
                          className="w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                          size="sm"
                          onClick={() => handleAddToCart(product)}
                        >
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Add to Cart
                        </Button>
                      </motion.div>
                    </div>

                    {/* Info */}
                    <div className="p-3">
                      <Link href={`/product/${product.slug}`}>
                        <h3 className="font-semibold text-sm line-clamp-2 hover:text-blue-600 transition-colors">
                          {product.name}
                        </h3>
                      </Link>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-bold text-blue-600">
                          {formatPrice(product.salePrice || product.basePrice)}
                        </span>
                        {product.salePrice && product.salePrice < product.basePrice && (
                          <span className="text-xs text-gray-400 line-through">
                            {formatPrice(product.basePrice)}
                          </span>
                        )}
                      </div>
                      {product.category && (
                        <p className="text-xs text-muted-foreground mt-1">{product.category.name}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Continue Shopping */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 text-center"
        >
          <Link href="/shop">
            <Button variant="outline" className="gap-2">
              Continue Shopping
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  )
}

export default { WishlistButton, WishlistPage }
