'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from 'framer-motion'
import Image from 'next/image'
import { X, ZoomIn, ZoomOut, Share2, Heart, ChevronLeft, ChevronRight } from 'lucide-react'
import { haptics } from '@/lib/haptics'
import { cn } from '@/lib/utils'

interface MobileProductGalleryProps {
  images: string[]
  productName: string
  onShare?: () => void
  onWishlist?: () => void
  isWishlisted?: boolean
}

/**
 * MobileProductGallery - Immersive full-screen product image gallery
 * 
 * Features:
 * - Swipe between images
 * - Pinch to zoom (up to 3x)
 * - Double-tap to zoom toggle
 * - Full-screen mode
 * - Image counter dots
 * - Share & wishlist actions
 */
export function MobileProductGallery({
  images,
  productName,
  onShare,
  onWishlist,
  isWishlisted = false,
}: MobileProductGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [scale, setScale] = useState(1)
  const [lastTap, setLastTap] = useState(0)
  
  const containerRef = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  
  // Ensure we have valid images
  const validImages = images.length > 0 ? images : ['/placeholder.png']
  
  // Handle swipe between images
  const handleDragEnd = useCallback((event: any, info: PanInfo) => {
    if (scale > 1) return // Don't swipe when zoomed
    
    const threshold = 50
    const velocity = info.velocity.x
    const offset = info.offset.x
    
    if (offset < -threshold || velocity < -500) {
      // Swipe left - next image
      if (currentIndex < validImages.length - 1) {
        setCurrentIndex(prev => prev + 1)
        haptics.light()
      }
    } else if (offset > threshold || velocity > 500) {
      // Swipe right - previous image
      if (currentIndex > 0) {
        setCurrentIndex(prev => prev - 1)
        haptics.light()
      }
    }
  }, [currentIndex, validImages.length, scale])

  // Double tap to zoom
  const handleTap = useCallback(() => {
    const now = Date.now()
    const DOUBLE_TAP_DELAY = 300
    
    if (now - lastTap < DOUBLE_TAP_DELAY) {
      // Double tap detected
      if (scale === 1) {
        setScale(2)
        haptics.rigid()
      } else {
        setScale(1)
        x.set(0)
        y.set(0)
        haptics.soft()
      }
    }
    setLastTap(now)
  }, [lastTap, scale, x, y])

  // Toggle fullscreen
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
    setScale(1)
    x.set(0)
    y.set(0)
    haptics.rigid()
  }

  // Reset zoom when changing images
  useEffect(() => {
    setScale(1)
    x.set(0)
    y.set(0)
  }, [currentIndex, x, y])

  // Compact gallery view (for product page)
  const CompactGallery = (
    <div className="relative bg-gray-100 dark:bg-gray-900">
      {/* Main Image */}
      <motion.div
        ref={containerRef}
        className="relative aspect-square overflow-hidden"
        onTap={handleTap}
      >
        <motion.div
          drag={scale > 1 ? true : 'x'}
          dragConstraints={scale > 1 ? { left: -100, right: 100, top: -100, bottom: 100 } : { left: 0, right: 0 }}
          dragElastic={0.1}
          onDragEnd={handleDragEnd}
          style={{ x, y, scale }}
          className="w-full h-full"
        >
          <Image
            src={validImages[currentIndex]}
            alt={`${productName} - Image ${currentIndex + 1}`}
            fill
            className="object-cover"
            priority={currentIndex === 0}
            sizes="100vw"
          />
        </motion.div>

        {/* Zoom indicator */}
        <AnimatePresence>
          {scale > 1 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1"
            >
              <ZoomIn className="w-3 h-3" />
              {scale.toFixed(1)}x
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action buttons */}
        <div className="absolute top-4 right-4 flex gap-2">
          {onWishlist && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => { onWishlist(); haptics.rigid() }}
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-sm transition-colors",
                isWishlisted 
                  ? "bg-red-500 text-white" 
                  : "bg-white/80 dark:bg-black/50 text-gray-700 dark:text-white"
              )}
            >
              <Heart className={cn("w-5 h-5", isWishlisted && "fill-current")} />
            </motion.button>
          )}
          
          {onShare && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => { onShare(); haptics.light() }}
              className="w-10 h-10 rounded-full bg-white/80 dark:bg-black/50 backdrop-blur-sm flex items-center justify-center text-gray-700 dark:text-white"
            >
              <Share2 className="w-5 h-5" />
            </motion.button>
          )}
          
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={toggleFullscreen}
            className="w-10 h-10 rounded-full bg-white/80 dark:bg-black/50 backdrop-blur-sm flex items-center justify-center text-gray-700 dark:text-white"
          >
            <ZoomIn className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Navigation arrows (for desktop/tablet) */}
        {validImages.length > 1 && (
          <>
            <button
              onClick={() => { setCurrentIndex(prev => Math.max(0, prev - 1)); haptics.light() }}
              className={cn(
                "absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 dark:bg-black/50 backdrop-blur-sm items-center justify-center text-gray-700 dark:text-white hidden sm:flex transition-opacity",
                currentIndex === 0 && "opacity-50 pointer-events-none"
              )}
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={() => { setCurrentIndex(prev => Math.min(validImages.length - 1, prev + 1)); haptics.light() }}
              className={cn(
                "absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 dark:bg-black/50 backdrop-blur-sm items-center justify-center text-gray-700 dark:text-white hidden sm:flex transition-opacity",
                currentIndex === validImages.length - 1 && "opacity-50 pointer-events-none"
              )}
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}
      </motion.div>

      {/* Dots indicator */}
      {validImages.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
          {validImages.map((_, index) => (
            <button
              key={index}
              onClick={() => { setCurrentIndex(index); haptics.light() }}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                index === currentIndex 
                  ? "w-6 bg-blue-600" 
                  : "w-2 bg-white/60 dark:bg-white/40"
              )}
            />
          ))}
        </div>
      )}

      {/* Thumbnail strip */}
      {validImages.length > 1 && (
        <div className="flex gap-2 p-3 overflow-x-auto scrollbar-hide">
          {validImages.map((img, index) => (
            <motion.button
              key={index}
              whileTap={{ scale: 0.95 }}
              onClick={() => { setCurrentIndex(index); haptics.light() }}
              className={cn(
                "relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors",
                index === currentIndex 
                  ? "border-blue-600" 
                  : "border-transparent"
              )}
            >
              <Image
                src={img}
                alt={`Thumbnail ${index + 1}`}
                fill
                className="object-cover"
                sizes="64px"
              />
            </motion.button>
          ))}
        </div>
      )}
    </div>
  )

  // Fullscreen gallery view
  const FullscreenGallery = (
    <AnimatePresence>
      {isFullscreen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] bg-black"
        >
          {/* Close button */}
          <motion.button
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleFullscreen}
            className="absolute top-4 right-4 z-10 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white"
          >
            <X className="w-6 h-6" />
          </motion.button>

          {/* Image counter */}
          <div className="absolute top-4 left-4 z-10 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium">
            {currentIndex + 1} / {validImages.length}
          </div>

          {/* Zoom controls */}
          <div className="absolute bottom-24 right-4 z-10 flex flex-col gap-2">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => { setScale(prev => Math.min(3, prev + 0.5)); haptics.light() }}
              className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white"
            >
              <ZoomIn className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => { setScale(prev => Math.max(1, prev - 0.5)); x.set(0); y.set(0); haptics.light() }}
              className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white"
            >
              <ZoomOut className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Main fullscreen image */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            onTap={handleTap}
          >
            <motion.div
              drag
              dragConstraints={{ left: -200 * scale, right: 200 * scale, top: -200 * scale, bottom: 200 * scale }}
              dragElastic={0.1}
              onDragEnd={handleDragEnd}
              style={{ x, y, scale }}
              className="relative w-full h-full"
            >
              <Image
                src={validImages[currentIndex]}
                alt={`${productName} - Image ${currentIndex + 1}`}
                fill
                className="object-contain"
                priority
                sizes="100vw"
              />
            </motion.div>
          </motion.div>

          {/* Bottom thumbnails */}
          <div className="absolute bottom-8 left-0 right-0 px-4">
            <div className="flex gap-2 justify-center overflow-x-auto scrollbar-hide py-2">
              {validImages.map((img, index) => (
                <motion.button
                  key={index}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => { setCurrentIndex(index); haptics.light() }}
                  className={cn(
                    "relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all",
                    index === currentIndex 
                      ? "border-white scale-110" 
                      : "border-transparent opacity-60"
                  )}
                >
                  <Image
                    src={img}
                    alt={`Thumbnail ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="56px"
                  />
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )

  return (
    <>
      {CompactGallery}
      {FullscreenGallery}
    </>
  )
}

export default MobileProductGallery
