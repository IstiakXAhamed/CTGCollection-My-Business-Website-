'use client'

import { useState, useEffect } from 'react'
import { X, Copy, Check, Gift, Clock } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

export function PromoBar() {
  const [isVisible, setIsVisible] = useState(true)
  const [copied, setCopied] = useState(false)
  const [settings, setSettings] = useState({
    promoEnabled: true,
    promoCode: 'WELCOME10',
    promoMessage: '🎉 FLASH SALE! Use code WELCOME10 for 10% OFF',
    promoEndTime: null as string | null
  })
  const [loading, setLoading] = useState(true)
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null)
  const [isExpired, setIsExpired] = useState(false)

  useEffect(() => {
    // Fetch settings from database API
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/settings')
        if (res.ok) {
          const data = await res.json()
          setSettings({
            promoEnabled: data.promoEnabled,
            promoCode: data.promoCode,
            promoMessage: data.promoMessage,
            promoEndTime: data.promoEndTime
          })
        }
      } catch (error) {
        console.log('Using default promo settings')
      } finally {
        setLoading(false)
      }
    }
    
    fetchSettings()
    
    // Check if dismissed in this session
    const dismissed = sessionStorage.getItem('promo_dismissed')
    if (dismissed) {
      setIsVisible(false)
    }
  }, [])

  // Countdown timer effect - uses server timestamp for accuracy
  useEffect(() => {
    if (!settings.promoEndTime) {
      setTimeLeft(null)
      return
    }

    const calculateTimeLeft = () => {
      const endTime = new Date(settings.promoEndTime!).getTime()
      const now = Date.now()
      const difference = endTime - now

      if (difference <= 0) {
        setIsExpired(true)
        setTimeLeft(null)
        return
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      })
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(timer)
  }, [settings.promoEndTime])

  const handleCopy = () => {
    navigator.clipboard.writeText(settings.promoCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDismiss = () => {
    setIsVisible(false)
    sessionStorage.setItem('promo_dismissed', 'true')
  }

  const formatTime = (num: number) => num.toString().padStart(2, '0')

  // Don't render if loading, disabled, dismissed, or expired
  if (loading || !settings.promoEnabled || !isVisible || isExpired) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-500 text-white relative overflow-hidden"
      >
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/50 via-transparent to-red-500/50 animate-pulse" />
        
        <div className="container mx-auto px-4 py-2.5 flex items-center justify-center gap-2 md:gap-4 relative flex-wrap">
          <Gift className="w-5 h-5 animate-bounce flex-shrink-0 hidden sm:block" />
          
          <p className="text-xs sm:text-sm md:text-base font-medium text-center">
            {settings.promoMessage}
          </p>

          {/* Countdown Timer */}
          {timeLeft && (
            <div className="flex items-center gap-1.5 bg-black/30 px-2 py-1 rounded-lg backdrop-blur-sm">
              <Clock className="w-3.5 h-3.5 text-yellow-300" />
              <div className="flex items-center gap-0.5 text-xs sm:text-sm font-mono font-bold">
                {timeLeft.days > 0 && (
                  <>
                    <span className="bg-white/20 px-1 sm:px-1.5 py-0.5 rounded text-yellow-100">{timeLeft.days}d</span>
                    <span className="text-yellow-300">:</span>
                  </>
                )}
                <span className="bg-white/20 px-1 sm:px-1.5 py-0.5 rounded text-yellow-100">{formatTime(timeLeft.hours)}</span>
                <span className="text-yellow-300 animate-pulse">:</span>
                <span className="bg-white/20 px-1 sm:px-1.5 py-0.5 rounded text-yellow-100">{formatTime(timeLeft.minutes)}</span>
                <span className="text-yellow-300 animate-pulse">:</span>
                <span className="bg-white/20 px-1 sm:px-1.5 py-0.5 rounded text-yellow-100">{formatTime(timeLeft.seconds)}</span>
              </div>
            </div>
          )}

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold transition-all backdrop-blur-sm flex-shrink-0"
          >
            <span className="hidden sm:inline">Code:</span>
            <span className="font-mono">{settings.promoCode}</span>
            {copied ? (
              <Check className="w-3.5 h-3.5 text-green-300" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>

          <button
            onClick={handleDismiss}
            className="absolute right-2 md:right-4 p-1 hover:bg-white/20 rounded-full transition flex-shrink-0"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sparkle effects */}
        <div className="absolute top-1/2 left-1/4 w-2 h-2 bg-white rounded-full animate-ping opacity-50" />
        <div className="absolute top-1/2 right-1/3 w-1.5 h-1.5 bg-white rounded-full animate-ping opacity-30 animation-delay-200" />
      </motion.div>
    </AnimatePresence>
  )
}

export default PromoBar
