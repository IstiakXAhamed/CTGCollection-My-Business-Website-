'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Gift, X, Sparkles } from 'lucide-react'
import { useAppStandalone } from '@/hooks/useAppStandalone'

interface FloatingActionsProps {
  onSpinClick?: () => void
}

export function FloatingActions({ onSpinClick }: FloatingActionsProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [hasSpinAvailable, setHasSpinAvailable] = useState(false)
  const [spinConfig, setSpinConfig] = useState<any>(null)
  const isStandalone = useAppStandalone()

  // Check if spin is available
  useEffect(() => {
    const checkSpinAvailability = async () => {
      // 1. Fetch settings to see if enabled
      try {
        const res = await fetch('/api/settings/public')
        if (res.ok) {
           const data = await res.json()
           setSpinConfig(data.spinWheelConfig)
           // If disabled globally, hide
           if (data.spinWheelConfig?.enabled === false) {
             setHasSpinAvailable(false)
             return
           }
        }
      } catch (e) {
        console.error("Failed to fetch spin settings", e)
      }

      const lastSpin = localStorage.getItem('spin_wheel_last_spun')
      
      // If never spun, available
      if (!lastSpin) {
        setHasSpinAvailable(true)
        return
      }
      
      // If spun, check cooldown (default 24h if not specified)
      const lastSpinTime = parseInt(lastSpin)
      const cooldownMinutes = spinConfig?.cooldownMinutes || 1440 // 24 hours
      const minutesSinceSpin = (Date.now() - lastSpinTime) / (1000 * 60)
      
      setHasSpinAvailable(minutesSinceSpin >= cooldownMinutes)
    }
    
    checkSpinAvailability()
    const interval = setInterval(checkSpinAvailability, 60000) 
    return () => clearInterval(interval)
  }, [spinConfig?.cooldownMinutes])

  const handleSpinClick = () => {
    // Dispatch global event for the real SpinWheel component
    window.dispatchEvent(new Event('open-spin-wheel'))
    setIsExpanded(false)
  }

  // If feature disabled, not explicitly enabled, or in standalone PWA mode, don't render
  if (spinConfig?.enabled !== true || isStandalone) return null

  return (
    <div className="fixed bottom-48 md:bottom-52 right-4 md:right-6 z-[110] flex flex-col items-end gap-2 text-primary-foreground">
      <AnimatePresence>
        {isExpanded && (
          <motion.button
            initial={{ opacity: 0, scale: 0, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0, y: 20 }}
            onClick={handleSpinClick}
            disabled={!hasSpinAvailable}
            className={`relative flex items-center gap-2 px-4 py-2 rounded-full shadow-lg transition-all ${
              hasSpinAvailable 
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:shadow-xl' 
                : 'bg-gray-400 text-gray-100 cursor-not-allowed'
            }`}
          >
            <Gift className="w-5 h-5" />
            <span className="text-sm font-medium">
              {hasSpinAvailable ? 'Spin & Win!' : 'Come back later'}
            </span>
            {hasSpinAvailable && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse" />
            )}
          </motion.button>
        )}
      </AnimatePresence>
      
      {/* Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-12 h-12 md:w-14 md:h-14 rounded-full shadow-lg flex items-center justify-center transition-all ${
          isExpanded 
            ? 'bg-gray-700 text-white' 
            : hasSpinAvailable 
              ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
              : 'bg-gray-400 text-white'
        }`}
      >
        <AnimatePresence mode="wait">
          {isExpanded ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
            >
              <X className="w-5 h-5 md:w-6 md:h-6" />
            </motion.div>
          ) : (
            <motion.div
              key="gift"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              className="relative"
            >
              <Sparkles className="w-5 h-5 md:w-6 md:h-6" />
              {hasSpinAvailable && (
                <span className="absolute -top-1 -right-1 w-2 h-2 md:w-3 md:h-3 bg-green-400 rounded-full animate-pulse" />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  )
}

export default FloatingActions

