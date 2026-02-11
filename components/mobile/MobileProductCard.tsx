'use client'

import { useState, useRef, useCallback } from 'react'
import { motion, useMotionValue, useTransform, AnimatePresence, PanInfo } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Heart, ShoppingCart, Eye, Star, Sparkles, Check, Plus } from 'lucide-react'
import { haptics } from '@/lib/haptics'
import { useCartStore } from '@/store/cart'
import { cn } from '@/lib/utils'

interface Product {
  id: string
  name: string
  slug: string
  basePrice: number
  salePrice?: number | null
  images: string | string[]
  category?: { name: string; slug: string }
  isFeatured?: boolean
  isBestseller?: boolean
  rating?: number
  reviewCount?: number
}

interface MobileProductCardProps {
  product: Product
  index?: number
  onQuickView?: (product: Product) => void
  onWishlistChange?: (productId: string, added: boolean) => void
  className?: string
}

export function MobileProductCard({ 
  product, 
  index = 0, 
  onQuickView,
  onWishlistChange,
  className 
}: MobileProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [showWishlistAnim, setShowWishlistAnim] = useState(false)
  const [showCartAnim, setShowCartAnim] = useState(false)
  const [isLongPressed, setIsLongPressed] = useState(false)
  const longPressTimer = useRef<NodeJS.Timeout | null>(null)
  const lastTap = useRef<number>(0)
  
  const addToCart = useCartStore((state) => state.addItem)
  
  // Swipe gesture values
  const x = useMotionValue(0)
  const background = useTransform(
    x,
    [-150, 0, 150],
    ['#22c55e', '#ffffff', '#ef4444']
  )
  const cartOpacity = useTransform(x, [0, 100, 150], [0, 0.5, 1])
  const wishlistOpacity = useTransform(x, [-150, -100, 0], [1, 0.5, 0])
  const scale = useTransform(x, [-150, 0, 150], [0.95, 1, 0.95])

  // Parse images
  const getImageUrl = useCallback(() => {
    try {
      if (typeof product.images === 'string') {
        const parsed = JSON.parse(product.images)
        return Array.isArray(parsed) ? parsed[0] : parsed
      }
      return Array.isArray(product.images) ? product.images[0] : product.images
    } catch {
      return typeof product.images === 'string' ? product.images : '/placeholder.png'
    }
  }, [product.images])

  // Calculate discount
  const discount = product.salePrice 
    ? Math.round((1 - product.salePrice / product.basePrice) * 100)
    : 0

  // Double tap to wishlist
  const handleTap = () => {
    const now = Date.now()
    const DOUBLE_TAP_DELAY = 300
    
    if (now - lastTap.current < DOUBLE_TAP_DELAY) {
      // Double tap detected
      toggleWishlist()
      lastTap.current = 0
    } else {
      lastTap.current = now
    }
  }

  // Toggle wishlist with animation
  const toggleWishlist = () => {
    haptics.success()
    setIsWishlisted(!isWishlisted)
    setShowWishlistAnim(true)
    setTimeout(() => setShowWishlistAnim(false), 1000)
    onWishlistChange?.(product.id, !isWishlisted)
  }

  // Add to cart with animation
  const handleAddToCart = () => {
    haptics.success()
    setShowCartAnim(true)
    
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.salePrice || product.basePrice,
      image: getImageUrl(),
      quantity: 1,
    })
    
    setTimeout(() => setShowCartAnim(false), 1000)
  }

  // Long press for quick view
  const handleLongPressStart = () => {
    longPressTimer.current = setTimeout(() => {
      haptics.rigid()
      setIsLongPressed(true)
      onQuickView?.(product)
    }, 500)
  }

  const handleLongPressEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
    }
  }

  // Handle swipe end
  const handleDragEnd = (_: any, info: PanInfo) => {
    const threshold = 100
    
    if (info.offset.x > threshold) {
      // Swiped right - Add to cart
      handleAddToCart()
    } else if (info.offset.x < -threshold) {
      // Swiped left - Add to wishlist
      toggleWishlist()
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className={cn("relative", className)}
    >
      {/* Swipe action backgrounds */}
      <div className="absolute inset-0 rounded-2xl overflow-hidden">
        {/* Cart action (right swipe) */}
        <motion.div 
          style={{ opacity: cartOpacity }}
          className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-green-500 to-green-400 flex items-center pl-4"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center"
          >
            <ShoppingCart className="w-6 h-6 text-white" />
          </motion.div>
        </motion.div>
        
        {/* Wishlist action (left swipe) */}
        <motion.div 
          style={{ opacity: wishlistOpacity }}
          className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-rose-500 to-pink-400 flex items-center justify-end pr-4"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center"
          >
            <Heart className="w-6 h-6 text-white" fill="white" />
          </motion.div>
        </motion.div>
      </div>

      {/* Main Card */}
      <motion.div
        style={{ x, scale }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.7}
        onDragEnd={handleDragEnd}
        onTouchStart={handleLongPressStart}
        onTouchEnd={handleLongPressEnd}
        onMouseDown={handleLongPressStart}
        onMouseUp={handleLongPressEnd}
        onMouseLeave={handleLongPressEnd}
        onClick={handleTap}
        whileTap={{ scale: 0.98 }}
        className="relative bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800 cursor-grab active:cursor-grabbing"
      >
        {/* Image Container */}
        <Link href={`/product/${product.slug}`} className="block">
          <div className="relative aspect-square overflow-hidden bg-gray-50 dark:bg-gray-800">
            <Image
              src={getImageUrl()}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
            
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />

            {/* Badges */}
            <div className="absolute top-2 left-2 flex flex-col gap-1">
              {discount > 0 && (
                <motion.span 
                  initial={{ scale: 0, rotate: -12 }}
                  animate={{ scale: 1, rotate: 0 }}
                  className="px-2 py-0.5 bg-gradient-to-r from-red-500 to-rose-500 text-white text-[10px] font-bold rounded-full shadow-lg"
                >
                  -{discount}%
                </motion.span>
              )}
              {product.isFeatured && (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1 }}
                  className="px-2 py-0.5 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[10px] font-bold rounded-full shadow-lg flex items-center gap-0.5"
                >
                  <Sparkles className="w-2.5 h-2.5" />
                  HOT
                </motion.span>
              )}
            </div>

            {/* Quick Actions */}
            <div className="absolute top-2 right-2 flex flex-col gap-1.5">
                <motion.button
                whileTap={{ scale: 0.8 }}
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist() }}
                className={cn(
                  "w-11 h-11 rounded-full flex items-center justify-center shadow-lg backdrop-blur-sm transition-colors",
                  isWishlisted 
                    ? "bg-rose-500 text-white" 
                    : "bg-white/90 dark:bg-gray-800/90 text-gray-600 dark:text-gray-300"
                )}
              >
                <Heart className="w-4 h-4" fill={isWishlisted ? "currentColor" : "none"} />
              </motion.button>
              
              {onQuickView && (
                <motion.button
                  whileTap={{ scale: 0.8 }}
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); onQuickView(product) }}
                  className="w-11 h-11 rounded-full bg-white/90 dark:bg-gray-800/90 flex items-center justify-center shadow-lg backdrop-blur-sm text-gray-600 dark:text-gray-300"
                >
                  <Eye className="w-4 h-4" />
                </motion.button>
              )}
            </div>

            {/* Rating Badge */}
            {product.rating && (
              <div className="absolute bottom-2 left-2 flex items-center gap-1 px-2 py-0.5 bg-black/60 backdrop-blur-sm rounded-full">
                <Star className="w-3 h-3 text-yellow-400" fill="currentColor" />
                <span className="text-white text-[10px] font-semibold">{product.rating.toFixed(1)}</span>
              </div>
            )}
          </div>
        </Link>

        {/* Content */}
        <div className="p-3">
          {/* Category */}
          {product.category && (
            <p className="text-[10px] text-blue-600 dark:text-blue-400 font-medium uppercase tracking-wider mb-1">
              {product.category.name}
            </p>
          )}
          
          {/* Name */}
          <Link href={`/product/${product.slug}`}>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 leading-tight mb-2">
              {product.name}
            </h3>
          </Link>

          {/* Price & Add to Cart */}
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-bold text-blue-600 dark:text-blue-400">
                ৳{(product.salePrice || product.basePrice).toLocaleString()}
              </span>
              {product.salePrice && (
                <span className="text-xs text-gray-400 line-through">
                  ৳{product.basePrice.toLocaleString()}
                </span>
              )}
            </div>
            
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={(e) => { e.preventDefault(); handleAddToCart() }}
              className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/25 active:shadow-sm transition-shadow"
            >
              <AnimatePresence mode="wait">
                {showCartAnim ? (
                  <motion.div
                    key="check"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, rotate: 180 }}
                  >
                    <Check className="w-4 h-4 text-white" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="plus"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                  >
                    <Plus className="w-4 h-4 text-white" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>

        {/* Double-tap Wishlist Animation */}
        <AnimatePresence>
          {showWishlistAnim && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                }}
                transition={{ duration: 0.4 }}
              >
                <Heart 
                  className={cn(
                    "w-20 h-20 drop-shadow-lg",
                    isWishlisted ? "text-rose-500" : "text-gray-400"
                  )} 
                  fill="currentColor" 
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Cart Added Animation */}
        <AnimatePresence>
          {showCartAnim && (
            <motion.div
              initial={{ y: 0, opacity: 1 }}
              animate={{ y: -50, opacity: 0 }}
              exit={{ opacity: 0 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 pointer-events-none"
            >
              <div className="px-3 py-1.5 bg-green-500 text-white text-xs font-semibold rounded-full shadow-lg">
                Added to Cart!
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Swipe hints (shown briefly) */}
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ delay: 2, duration: 0.5 }}
        className="absolute -bottom-6 left-0 right-0 flex justify-between px-2 text-[9px] text-gray-400 pointer-events-none"
      >
        <span>← Wishlist</span>
        <span>Cart →</span>
      </motion.div>
    </motion.div>
  )
}

export default MobileProductCard
