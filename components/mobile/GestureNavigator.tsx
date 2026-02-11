'use client'

import { useEffect, useRef, useState, useCallback, ReactNode } from 'react'
import { motion, useMotionValue, useTransform, AnimatePresence, PanInfo } from 'framer-motion'
import { useRouter, usePathname } from 'next/navigation'
import { haptics } from '@/lib/haptics'
import { cn } from '@/lib/utils'

interface GestureNavigatorProps {
  children: ReactNode
  /** Enable/disable edge swipe gesture */
  enabled?: boolean
  /** Edge threshold in pixels from left side */
  edgeThreshold?: number
  /** Minimum swipe distance to trigger navigation */
  triggerThreshold?: number
  /** Pages where back navigation should be disabled */
  disabledPaths?: string[]
  /** Callback before navigation */
  onBeforeNavigate?: () => boolean | void
}

/**
 * GestureNavigator - iOS-style edge swipe to go back
 * 
 * Wraps pages and enables swiping from the left edge to navigate back.
 * Features:
 * - 20px edge detection zone
 * - Parallax page preview effect
 * - Progressive haptic feedback
 * - Back indicator arrow
 */
export function GestureNavigator({
  children,
  enabled = true,
  edgeThreshold = 20,
  triggerThreshold = 100,
  disabledPaths = ['/', '/home'],
  onBeforeNavigate,
}: GestureNavigatorProps) {
  const router = useRouter()
  const pathname = usePathname()
  const containerRef = useRef<HTMLDivElement>(null)
  
  // State
  const [isEdgeSwipe, setIsEdgeSwipe] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [shouldNavigate, setShouldNavigate] = useState(false)
  
  // Motion values
  const x = useMotionValue(0)
  const progress = useTransform(x, [0, triggerThreshold], [0, 1])
  const opacity = useTransform(x, [0, triggerThreshold], [0, 0.5])
  const scale = useTransform(x, [0, triggerThreshold], [0.95, 1])
  const arrowOpacity = useTransform(x, [20, triggerThreshold], [0, 1])
  const arrowX = useTransform(x, [0, triggerThreshold], [-20, 10])
  
  // Check if back navigation is allowed on this page
  const isBackAllowed = !disabledPaths.includes(pathname)
  const isEnabled = enabled && isBackAllowed

  // Handle pan start - detect edge swipe
  const handlePanStart = useCallback((event: PointerEvent, info: PanInfo) => {
    if (!isEnabled) return
    
    // Only trigger if starting from left edge
    const startX = info.point.x - info.offset.x
    if (startX <= edgeThreshold) {
      setIsEdgeSwipe(true)
      setIsDragging(true)
      haptics.light()
    }
  }, [isEnabled, edgeThreshold])

  // Handle pan - update position and check threshold
  const handlePan = useCallback((event: PointerEvent, info: PanInfo) => {
    if (!isEdgeSwipe || !isDragging) return
    
    // Only allow horizontal swipes moving right
    if (info.offset.x < 0) return
    
    x.set(Math.max(0, info.offset.x))
    
    // Haptic feedback at threshold
    const currentProgress = info.offset.x / triggerThreshold
    if (currentProgress >= 1 && !shouldNavigate) {
      setShouldNavigate(true)
      haptics.rigid()
    } else if (currentProgress < 0.8 && shouldNavigate) {
      setShouldNavigate(false)
      haptics.soft()
    }
  }, [isEdgeSwipe, isDragging, x, triggerThreshold, shouldNavigate])

  // Handle pan end - navigate or reset
  const handlePanEnd = useCallback((event: PointerEvent, info: PanInfo) => {
    if (!isEdgeSwipe) return
    
    const shouldTrigger = info.offset.x >= triggerThreshold || 
      (info.velocity.x > 500 && info.offset.x > 50)
    
    if (shouldTrigger) {
      // Check with callback
      const canNavigate = onBeforeNavigate?.() !== false
      if (canNavigate) {
        haptics.success()
        router.back()
      }
    } else {
      // Reset animation
      x.set(0)
    }
    
    setIsEdgeSwipe(false)
    setIsDragging(false)
    setShouldNavigate(false)
  }, [isEdgeSwipe, triggerThreshold, x, router, onBeforeNavigate])

  // Reset on route change
  useEffect(() => {
    x.set(0)
    setIsEdgeSwipe(false)
    setIsDragging(false)
    setShouldNavigate(false)
  }, [pathname, x])

  if (!isEnabled) {
    return <>{children}</>
  }

  return (
    <div ref={containerRef} className="relative h-full w-full overflow-hidden">
      {/* Back indicator overlay */}
      <AnimatePresence>
        {isDragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-40 pointer-events-none"
          >
            {/* Dark overlay */}
            <motion.div
              style={{ opacity }}
              className="absolute inset-0 bg-black"
            />
            
            {/* Back arrow indicator */}
            <motion.div
              style={{ 
                opacity: arrowOpacity,
                x: arrowX,
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-50"
            >
              <motion.div
                animate={{
                  scale: shouldNavigate ? 1.2 : 1,
                  backgroundColor: shouldNavigate ? 'rgb(59 130 246)' : 'rgba(255,255,255,0.9)',
                }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="w-12 h-12 rounded-full flex items-center justify-center shadow-xl"
              >
                <svg 
                  className={cn(
                    "w-6 h-6 transition-colors",
                    shouldNavigate ? "text-white" : "text-gray-700"
                  )}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2.5} 
                    d="M15 19l-7-7 7-7" 
                  />
                </svg>
              </motion.div>
            </motion.div>
            
            {/* Progress indicator */}
            <motion.div
              style={{ scaleX: progress }}
              className="absolute top-0 left-0 right-0 h-1 bg-blue-500 origin-left"
            />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Main content with drag effect */}
      <motion.div
        style={{ 
          x: isDragging ? x : 0,
          scale: isDragging ? scale : 1,
        }}
        onPanStart={handlePanStart}
        onPan={handlePan}
        onPanEnd={handlePanEnd}
        className="h-full w-full will-change-transform"
        transition={{ type: 'spring', stiffness: 500, damping: 50 }}
      >
        {children}
      </motion.div>
      
      {/* Edge detection zone (invisible touch target) */}
      <div 
        className="absolute left-0 top-0 bottom-0 w-5 z-30"
        style={{ touchAction: 'pan-x' }}
      />
    </div>
  )
}

/**
 * Swipeable Page Wrapper
 * A simpler component that adds page transition animations
 */
export function SwipeablePage({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  
  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="h-full w-full"
    >
      {children}
    </motion.div>
  )
}

export default GestureNavigator
