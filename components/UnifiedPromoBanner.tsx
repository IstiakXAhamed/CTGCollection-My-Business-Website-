'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Gift, Sparkles, Clock, Copy, Check, X, ChevronLeft, ChevronRight, Tag, Percent, Zap, Star, Heart, Flame } from 'lucide-react'

export interface PromoBanner {
  id: string
  message: string
  code?: string
  discount?: number
  endTime?: string // ISO string for JSON compatibility
  preset: string // gradient preset name
  icon: string
  enabled: boolean
  order: number
  // Size options
  size?: 'compact' | 'normal' | 'large'
  fontSize?: 'sm' | 'base' | 'lg' | 'xl'
  padding?: 'tight' | 'normal' | 'relaxed'
}

// Size presets
export const SIZE_PRESETS = {
  compact: { py: 'py-2', height: 'min-h-[40px]' },
  normal: { py: 'py-3', height: 'min-h-[50px]' },
  large: { py: 'py-4', height: 'min-h-[65px]' }
}

export const FONT_SIZE_PRESETS = {
  sm: 'text-xs sm:text-sm',
  base: 'text-sm sm:text-base',
  lg: 'text-base sm:text-lg',
  xl: 'text-lg sm:text-xl'
}

export const PADDING_PRESETS = {
  tight: 'px-3',
  normal: 'px-4 sm:px-6',
  relaxed: 'px-6 sm:px-8'
}

// Gradient presets with names
export const GRADIENT_PRESETS = {
  'sunset': 'from-rose-500 via-pink-500 to-purple-600',
  'ocean': 'from-blue-500 via-cyan-500 to-teal-500',
  'fire': 'from-amber-500 via-orange-500 to-red-600',
  'forest': 'from-green-500 via-emerald-500 to-teal-600',
  'midnight': 'from-indigo-600 via-purple-600 to-pink-600',
  'gold': 'from-yellow-400 via-amber-500 to-orange-500',
  'neon': 'from-fuchsia-500 via-purple-500 to-cyan-500',
  'dark': 'from-gray-800 via-gray-900 to-black',
  'rainbow': 'from-red-500 via-yellow-500 to-green-500',
  'royal': 'from-purple-700 via-violet-600 to-indigo-700',
}

export const ICON_OPTIONS = [
  { value: 'gift', label: 'Gift', icon: Gift },
  { value: 'sparkles', label: 'Sparkles', icon: Sparkles },
  { value: 'tag', label: 'Tag', icon: Tag },
  { value: 'percent', label: 'Percent', icon: Percent },
  { value: 'zap', label: 'Zap', icon: Zap },
  { value: 'star', label: 'Star', icon: Star },
  { value: 'heart', label: 'Heart', icon: Heart },
  { value: 'flame', label: 'Flame', icon: Flame },
]

// Default banners
const DEFAULT_BANNERS: PromoBanner[] = [
  {
    id: '1',
    message: '🔥 FLASH SALE! Use code WELCOME10 for 10% OFF',
    code: 'WELCOME10',
    discount: 10,
    endTime: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
    preset: 'sunset',
    icon: 'sparkles',
    enabled: true,
    order: 0
  },
  {
    id: '2',
    message: '🚚 FREE SHIPPING on orders over ৳2000!',
    code: 'FREESHIP',
    preset: 'ocean',
    icon: 'gift',
    enabled: true,
    order: 1
  },
  {
    id: '3',
    message: '✨ NEW ARRIVALS - Check out our latest collection!',
    preset: 'fire',
    icon: 'star',
    enabled: true,
    order: 2
  }
]

export default function UnifiedPromoBanner() {
  const [banners, setBanners] = useState<PromoBanner[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(true)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [countdown, setCountdown] = useState<Record<string, { days: number; hours: number; minutes: number; seconds: number }>>({})
  const [isPaused, setIsPaused] = useState(false)

  // Load banners from localStorage or use defaults
  useEffect(() => {
    const loadBanners = () => {
      const saved = localStorage.getItem('ctg_promo_banners')
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          setBanners(parsed.filter((b: PromoBanner) => b.enabled).sort((a: PromoBanner, b: PromoBanner) => a.order - b.order))
        } catch {
          setBanners(DEFAULT_BANNERS.filter(b => b.enabled))
        }
      } else {
        setBanners(DEFAULT_BANNERS.filter(b => b.enabled))
        localStorage.setItem('ctg_promo_banners', JSON.stringify(DEFAULT_BANNERS))
      }

      const dismissed = sessionStorage.getItem('promo_dismissed')
      if (dismissed) setIsVisible(false)
    }

    loadBanners()

    // Listen for storage changes (when admin updates banners)
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'ctg_promo_banners') loadBanners()
    }
    window.addEventListener('storage', handleStorage)
    
    // Custom event for same-tab updates
    const handleCustomUpdate = () => loadBanners()
    window.addEventListener('bannersUpdated', handleCustomUpdate)

    return () => {
      window.removeEventListener('storage', handleStorage)
      window.removeEventListener('bannersUpdated', handleCustomUpdate)
    }
  }, [])

  // Auto-rotate banners
  useEffect(() => {
    if (banners.length <= 1 || isPaused) return
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length)
    }, 6000)
    return () => clearInterval(interval)
  }, [banners.length, isPaused])

  // Countdown timer
  useEffect(() => {
    const updateCountdowns = () => {
      const newCountdowns: Record<string, { days: number; hours: number; minutes: number; seconds: number }> = {}
      banners.forEach(banner => {
        if (banner.endTime) {
          const diff = new Date(banner.endTime).getTime() - Date.now()
          if (diff > 0) {
            newCountdowns[banner.id] = {
              days: Math.floor(diff / (1000 * 60 * 60 * 24)),
              hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
              minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
              seconds: Math.floor((diff % (1000 * 60)) / 1000)
            }
          }
        }
      })
      setCountdown(newCountdowns)
    }
    updateCountdowns()
    const interval = setInterval(updateCountdowns, 1000)
    return () => clearInterval(interval)
  }, [banners])

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedCode(code)
      setTimeout(() => setCopiedCode(null), 2000)
    } catch {
      const el = document.createElement('textarea')
      el.value = code
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopiedCode(code)
      setTimeout(() => setCopiedCode(null), 2000)
    }
  }

  const handleDismiss = () => {
    setIsVisible(false)
    sessionStorage.setItem('promo_dismissed', 'true')
  }

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length)
    setIsPaused(true)
    setTimeout(() => setIsPaused(false), 10000)
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length)
    setIsPaused(true)
    setTimeout(() => setIsPaused(false), 10000)
  }

  const getIcon = (iconName: string) => {
    const iconMap: Record<string, any> = {
      gift: Gift, sparkles: Sparkles, tag: Tag, percent: Percent,
      zap: Zap, star: Star, heart: Heart, flame: Flame
    }
    const IconComponent = iconMap[iconName] || Sparkles
    return <IconComponent className="w-6 h-6" />
  }

  if (!isVisible || banners.length === 0) return null

  const currentBanner = banners[currentIndex]
  const currentCountdown = countdown[currentBanner.id]
  const gradient = GRADIENT_PRESETS[currentBanner.preset as keyof typeof GRADIENT_PRESETS] || GRADIENT_PRESETS.sunset
  
  // Apply size presets
  const sizeClass = SIZE_PRESETS[currentBanner.size || 'normal']
  const fontSizeClass = FONT_SIZE_PRESETS[currentBanner.fontSize || 'base']
  const paddingClass = PADDING_PRESETS[currentBanner.padding || 'normal']

  return (
    <div 
      className={`relative overflow-hidden bg-gradient-to-r ${gradient} text-white shadow-lg`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Shimmer background effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" style={{ backgroundSize: '200% 100%' }} />

      {/* Progress bar */}
      {banners.length > 1 && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-white/20">
          <motion.div
            key={currentIndex}
            className="h-full bg-white/70"
            initial={{ width: '0%' }}
            animate={{ width: isPaused ? undefined : '100%' }}
            transition={{ duration: 6, ease: 'linear' }}
          />
        </div>
      )}

      <div className={`max-w-7xl mx-auto ${paddingClass} ${sizeClass.py} relative ${sizeClass.height} flex items-center`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentBanner.id}
            initial={{ opacity: 0, y: 15, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.98 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className={`flex items-center justify-center gap-4 flex-wrap w-full ${fontSizeClass}`}
          >
            {/* Animated Icon */}
            <motion.span
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 5, -5, 0] 
              }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
              className="bg-white/20 p-2 rounded-full"
            >
              {getIcon(currentBanner.icon)}
            </motion.span>

            {/* Message - Larger */}
            <span className="font-bold text-base md:text-xl tracking-wide text-center">
              {currentBanner.message}
            </span>

            {/* Coupon Code - More Prominent */}
            {currentBanner.code && (
              <motion.button
                onClick={() => handleCopyCode(currentBanner.code!)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 bg-white text-gray-900 px-4 py-2 rounded-full transition-all text-sm md:text-base font-bold shadow-lg hover:shadow-xl border-2 border-white/50"
              >
                <span className="tracking-widest">{currentBanner.code}</span>
                {copiedCode === currentBanner.code ? (
                  <Check className="w-5 h-5 text-green-600" />
                ) : (
                  <Copy className="w-5 h-5" />
                )}
              </motion.button>
            )}

            {/* Countdown Timer - Larger */}
            {currentCountdown && (
              <motion.div 
                className="flex items-center gap-2 bg-black/30 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20"
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <Clock className="w-5 h-5" />
                <span className="font-mono text-base md:text-lg font-bold">
                  {currentCountdown.days > 0 && (
                    <span className="text-yellow-300">{currentCountdown.days}d </span>
                  )}
                  <span className="text-white">
                    {String(currentCountdown.hours).padStart(2, '0')}:
                    {String(currentCountdown.minutes).padStart(2, '0')}:
                    {String(currentCountdown.seconds).padStart(2, '0')}
                  </span>
                </span>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation arrows */}
        {banners.length > 1 && (
          <>
            <button
              onClick={goToPrev}
              className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 p-2 bg-white/20 hover:bg-white/30 rounded-full transition backdrop-blur-sm"
              aria-label="Previous banner"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-12 md:right-14 top-1/2 -translate-y-1/2 p-2 bg-white/20 hover:bg-white/30 rounded-full transition backdrop-blur-sm"
              aria-label="Next banner"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 p-2 bg-white/20 hover:bg-white/30 rounded-full transition backdrop-blur-sm"
          aria-label="Dismiss banner"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Dot indicators - More visible */}
      {banners.length > 1 && (
        <div className="flex justify-center gap-2 pb-3">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentIndex(index)
                setIsPaused(true)
                setTimeout(() => setIsPaused(false), 10000)
              }}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? 'bg-white w-6' 
                  : 'bg-white/40 hover:bg-white/60'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
