'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Tag, Clock, X, Copy, Check } from 'lucide-react'

interface ActiveCoupon {
  id: string
  code: string
  description: string
  discountType: string
  discountValue: number
  validUntil: string
}

export function CouponBanner() {
  const [coupons, setCoupons] = useState<ActiveCoupon[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [dismissed, setDismissed] = useState(false)
  const [copied, setCopied] = useState(false)
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    // Check if already dismissed in this session
    if (sessionStorage.getItem('coupon_banner_dismissed')) {
      setDismissed(true)
      return
    }
    fetchActiveCoupons()
  }, [])

  const fetchActiveCoupons = async () => {
    try {
      const res = await fetch('/api/coupons/active')
      if (res.ok) {
        const data = await res.json()
        setCoupons(data.coupons || [])
      }
    } catch (error) {
      console.error('Failed to fetch coupons:', error)
    }
  }

  // Countdown timer
  useEffect(() => {
    if (coupons.length === 0) return

    const currentCoupon = coupons[currentIndex]
    if (!currentCoupon) return

    const updateTimer = () => {
      const end = new Date(currentCoupon.validUntil).getTime()
      const now = Date.now()
      const diff = end - now

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        return
      }

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000)
      })
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [coupons, currentIndex])

  // Rotate banners
  useEffect(() => {
    if (coupons.length <= 1) return
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % coupons.length)
    }, 10000)
    return () => clearInterval(interval)
  }, [coupons.length])

  const handleDismiss = () => {
    setDismissed(true)
    sessionStorage.setItem('coupon_banner_dismissed', 'true')
  }

  const handleCopy = () => {
    if (!coupons[currentIndex]) return
    navigator.clipboard.writeText(coupons[currentIndex].code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const formatTime = (n: number) => n.toString().padStart(2, '0')

  if (dismissed || coupons.length === 0) return null

  const coupon = coupons[currentIndex]
  if (!coupon) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white relative overflow-hidden"
      >
        <div className="container mx-auto px-4 py-3 flex items-center justify-center gap-4 flex-wrap">
          {/* Coupon Info */}
          <div className="flex items-center gap-2">
            <Tag className="w-5 h-5" />
            <span className="font-semibold">
              {coupon.discountType === 'percentage' 
                ? `${coupon.discountValue}% OFF` 
                : `৳${coupon.discountValue} OFF`}
            </span>
            <span className="hidden sm:inline text-white/90">— {coupon.description || 'Limited Time Offer!'}</span>
          </div>

          {/* Countdown Timer */}
          <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-lg backdrop-blur-sm">
            <Clock className="w-4 h-4 text-yellow-300" />
            <div className="flex items-center gap-1 font-mono font-bold text-sm">
              {timeLeft.days > 0 && (
                <>
                  <span className="bg-white/20 px-1.5 py-0.5 rounded">{timeLeft.days}d</span>
                  <span className="text-yellow-300">:</span>
                </>
              )}
              <span className="bg-white/20 px-1.5 py-0.5 rounded">{formatTime(timeLeft.hours)}</span>
              <span className="text-yellow-300 animate-pulse">:</span>
              <span className="bg-white/20 px-1.5 py-0.5 rounded">{formatTime(timeLeft.minutes)}</span>
              <span className="text-yellow-300 animate-pulse">:</span>
              <span className="bg-white/20 px-1.5 py-0.5 rounded">{formatTime(timeLeft.seconds)}</span>
            </div>
          </div>

          {/* Copy Code Button */}
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-full text-sm font-bold transition-all backdrop-blur-sm"
          >
            <span className="font-mono">{coupon.code}</span>
            {copied ? <Check className="w-4 h-4 text-green-300" /> : <Copy className="w-4 h-4" />}
          </button>

          {/* Dismiss Button */}
          <button
            onClick={handleDismiss}
            className="absolute right-2 p-1 hover:bg-white/20 rounded-full transition"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

export default CouponBanner
