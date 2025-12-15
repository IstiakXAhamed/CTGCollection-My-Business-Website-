'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Copy, Check, Sparkles } from 'lucide-react'

export function WelcomeBanner() {
  const [isVisible, setIsVisible] = useState(true)
  const [copied, setCopied] = useState(false)
  const couponCode = 'WELCOME10'

  useEffect(() => {
    // Check if already dismissed in this session
    const dismissed = sessionStorage.getItem('welcome_banner_dismissed')
    if (dismissed) {
      setIsVisible(false)
    }
  }, [])

  const handleCopy = () => {
    navigator.clipboard.writeText(couponCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDismiss = () => {
    setIsVisible(false)
    sessionStorage.setItem('welcome_banner_dismissed', 'true')
  }

  if (!isVisible) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-500 text-white relative overflow-hidden"
      >
        {/* Animated shine effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shine" />
        
        <div className="container mx-auto px-4 py-2.5 flex items-center justify-center gap-2 md:gap-4 relative flex-wrap">
          <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse flex-shrink-0" />
          
          <p className="text-xs sm:text-sm md:text-base font-medium text-center">
            🎉 <span className="font-bold">Welcome!</span> Get <span className="font-bold text-yellow-300">10% OFF</span> on your first order!
          </p>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold transition-all backdrop-blur-sm flex-shrink-0 border border-white/30"
          >
            <span className="hidden sm:inline">Use Code:</span>
            <span className="font-mono text-yellow-300">{couponCode}</span>
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
        
        {/* Decorative dots */}
        <div className="absolute top-1/2 left-1/4 w-1.5 h-1.5 bg-white rounded-full animate-ping opacity-40" />
        <div className="absolute top-1/4 right-1/4 w-1 h-1 bg-white rounded-full animate-ping opacity-30 animation-delay-200" />
      </motion.div>
    </AnimatePresence>
  )
}

export default WelcomeBanner
