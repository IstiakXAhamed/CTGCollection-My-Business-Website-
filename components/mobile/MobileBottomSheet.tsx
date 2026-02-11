'use client'

import { useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from 'framer-motion'
import { X } from 'lucide-react'
import { haptics } from '@/lib/haptics'
import { cn } from '@/lib/utils'

interface MobileBottomSheetProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  title?: string
  subtitle?: string
  snapPoints?: ('full' | 'half' | 'auto')[]
  defaultSnap?: 'full' | 'half' | 'auto'
  showHandle?: boolean
  showCloseButton?: boolean
  className?: string
  contentClassName?: string
  disableDrag?: boolean
}

export function MobileBottomSheet({
  isOpen,
  onClose,
  children,
  title,
  subtitle,
  snapPoints = ['half', 'full'],
  defaultSnap = 'half',
  showHandle = true,
  showCloseButton = true,
  className,
  contentClassName,
  disableDrag = false,
}: MobileBottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null)
  const y = useMotionValue(0)
  
  // Get snap point heights
  const getSnapHeight = useCallback((snap: string) => {
    if (typeof window === 'undefined') return 0
    const vh = window.innerHeight
    switch (snap) {
      case 'full': return vh * 0.92
      case 'half': return vh * 0.5
      case 'auto': return 'auto'
      default: return vh * 0.5
    }
  }, [])

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      haptics.light()
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Handle drag end
  const handleDragEnd = (_: any, info: PanInfo) => {
    const threshold = 100
    const velocity = info.velocity.y
    
    // If dragged down fast or far enough, close
    if (velocity > 500 || info.offset.y > threshold) {
      haptics.light()
      onClose()
    }
  }

  // Backdrop opacity based on drag
  const backdropOpacity = useTransform(y, [0, 200], [1, 0])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ opacity: backdropOpacity }}
            onClick={onClose}
            className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm"
          />
          
          {/* Sheet */}
          <motion.div
            ref={sheetRef}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            drag={disableDrag ? false : 'y'}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.5 }}
            onDragEnd={handleDragEnd}
            style={{ y }}
            className={cn(
              "fixed bottom-0 left-0 right-0 z-[201]",
              "bg-white dark:bg-gray-900",
              "rounded-t-3xl shadow-2xl",
              "max-h-[92vh] overflow-hidden",
              "flex flex-col",
              className
            )}
          >
            {/* Handle */}
            {showHandle && (
              <div className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing">
                <div className="w-10 h-1 bg-gray-300 dark:bg-gray-700 rounded-full" />
              </div>
            )}
            
            {/* Header */}
            {(title || showCloseButton) && (
              <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 dark:border-gray-800">
                <div className="flex-1">
                  {title && (
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      {title}
                    </h3>
                  )}
                  {subtitle && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {subtitle}
                    </p>
                  )}
                </div>
                
                {showCloseButton && (
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => { haptics.light(); onClose() }}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500"
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                )}
              </div>
            )}
            
            {/* Content */}
            <div 
              className={cn(
                "flex-1 overflow-y-auto overscroll-contain",
                "pb-safe",
                contentClassName
              )}
            >
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// Quick View specific bottom sheet
interface ProductQuickViewProps {
  product: {
    id: string
    name: string
    slug: string
    basePrice: number
    salePrice?: number | null
    images: string | string[]
    description?: string
    category?: { name: string }
  } | null
  isOpen: boolean
  onClose: () => void
  onAddToCart?: () => void
  onViewDetails?: () => void
}

export function ProductQuickView({ 
  product, 
  isOpen, 
  onClose,
  onAddToCart,
  onViewDetails 
}: ProductQuickViewProps) {
  if (!product) return null

  // Parse images
  const getImages = () => {
    try {
      if (typeof product.images === 'string') {
        const parsed = JSON.parse(product.images)
        return Array.isArray(parsed) ? parsed : [parsed]
      }
      return Array.isArray(product.images) ? product.images : [product.images]
    } catch {
      return [typeof product.images === 'string' ? product.images : '/placeholder.png']
    }
  }

  const images = getImages()
  const discount = product.salePrice 
    ? Math.round((1 - product.salePrice / product.basePrice) * 100)
    : 0

  return (
    <MobileBottomSheet
      isOpen={isOpen}
      onClose={onClose}
      showHandle={true}
      showCloseButton={false}
    >
      <div className="p-4">
        {/* Image Gallery */}
        <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 mb-4">
          <motion.img
            src={images[0]}
            alt={product.name}
            className="w-full h-full object-cover"
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          />
          
          {/* Discount Badge */}
          {discount > 0 && (
            <div className="absolute top-3 left-3 px-2.5 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
              -{discount}%
            </div>
          )}
          
          {/* Image count */}
          {images.length > 1 && (
            <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/60 backdrop-blur-sm text-white text-xs font-medium rounded-full">
              1/{images.length}
            </div>
          )}
        </div>
        
        {/* Product Info */}
        <div className="space-y-3">
          {/* Category */}
          {product.category && (
            <span className="text-xs text-blue-600 dark:text-blue-400 font-medium uppercase tracking-wider">
              {product.category.name}
            </span>
          )}
          
          {/* Name */}
          <h2 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
            {product.name}
          </h2>
          
          {/* Price */}
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              ৳{(product.salePrice || product.basePrice).toLocaleString()}
            </span>
            {product.salePrice && (
              <span className="text-base text-gray-400 line-through">
                ৳{product.basePrice.toLocaleString()}
              </span>
            )}
          </div>
          
          {/* Description */}
          {product.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
              {product.description}
            </p>
          )}
        </div>
        
        {/* Actions */}
        <div className="flex gap-3 mt-6 pb-4">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              haptics.success()
              onAddToCart?.()
              onClose()
            }}
            className="flex-1 h-14 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-2xl shadow-lg shadow-blue-500/25 active:shadow-sm transition-shadow"
          >
            Add to Cart
          </motion.button>
          
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              haptics.light()
              onViewDetails?.()
            }}
            className="h-14 px-6 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-semibold rounded-2xl"
          >
            View Details
          </motion.button>
        </div>
      </div>
    </MobileBottomSheet>
  )
}

export default MobileBottomSheet
