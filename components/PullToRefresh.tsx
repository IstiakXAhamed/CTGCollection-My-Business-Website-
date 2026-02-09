'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Sparkles, RefreshCw } from 'lucide-react'
import { haptics } from '@/lib/haptics'

export default function PullToRefresh() {
  const [startY, setStartY] = useState(0)
  const [pullDistance, setPullDistance] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [canRefresh, setCanRefresh] = useState(false)

  const TRIGGER_DISTANCE = 100

  const handleTouchStart = (e: TouchEvent) => {
    // Only trigger if at the top of the page
    if (window.scrollY === 0) {
      setStartY(e.touches[0].pageY)
    } else {
      setStartY(0)
    }
  }

  const handleTouchMove = (e: TouchEvent) => {
    if (startY === 0 || isRefreshing) return

    const currentY = e.touches[0].pageY
    const distance = Math.max(0, (currentY - startY) * 0.5) // Dampen pull
    setPullDistance(distance)

    if (distance > TRIGGER_DISTANCE && !canRefresh) {
      setCanRefresh(true)
      haptics.rigid() // Haptic "thud" when ready to refresh
    } else if (distance <= TRIGGER_DISTANCE && canRefresh) {
      setCanRefresh(false)
    }
  }

  const handleTouchEnd = () => {
    if (pullDistance > TRIGGER_DISTANCE && !isRefreshing) {
      refresh()
    }
    setPullDistance(0)
    setStartY(0)
    setCanRefresh(false)
  }

  const refresh = async () => {
    setIsRefreshing(true)
    haptics.medium()
    
    // Simulate refresh (actual refresh would reload data or window)
    setTimeout(() => {
      window.location.reload()
    }, 1500)
  }

  useEffect(() => {
    window.addEventListener('touchstart', handleTouchStart)
    window.addEventListener('touchmove', handleTouchMove)
    window.addEventListener('touchend', handleTouchEnd)

    return () => {
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleTouchEnd)
    }
  }, [startY, pullDistance, isRefreshing, canRefresh])

  return (
    <div 
      className="fixed top-0 left-0 right-0 z-[1000] flex justify-center pointer-events-none"
      style={{ height: pullDistance }}
    >
      <motion.div
        animate={{ 
          rotate: isRefreshing ? 360 : pullDistance * 2,
          scale: isRefreshing ? 1 : Math.min(1, pullDistance / TRIGGER_DISTANCE),
          opacity: Math.min(1, pullDistance / 40)
        }}
        transition={isRefreshing ? { repeat: Infinity, duration: 1, ease: "linear" } : { type: "spring" }}
        className={`mt-4 w-12 h-12 rounded-full flex items-center justify-center shadow-xl border backdrop-blur-xl ${
          canRefresh ? 'bg-blue-600 border-blue-400 text-white' : 'bg-white/80 dark:bg-gray-900/80 border-white/20 text-blue-600'
        }`}
      >
        {isRefreshing ? (
          <RefreshCw className="w-6 h-6 animate-spin" />
        ) : (
          <Sparkles className={`w-6 h-6 ${canRefresh ? 'animate-bounce' : ''}`} />
        )}
      </motion.div>
    </div>
  )
}
