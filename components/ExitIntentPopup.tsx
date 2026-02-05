'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Gift, ArrowRight, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface ExitIntentPopupProps {
  enabled?: boolean
  delayMs?: number // Delay before exit intent is active
  discountPercent?: number
}

export function ExitIntentPopup({
  enabled = true,
  delayMs = 5000,
  discountPercent = 10
}: ExitIntentPopupProps) {
  const [isVisible, setIsVisible] = useState(false)

  const checkAlreadyShown = useCallback(() => {
    try {
      if (typeof window !== 'undefined') {
        return localStorage.getItem('exit_popup_shown') === 'true'
      }
      return false
    } catch {
      return false
    }
  }, [])

  useEffect(() => {
    if (!enabled || checkAlreadyShown()) return

    let isActive = false
    const activateTimeout = setTimeout(() => {
      isActive = true
    }, delayMs)

    const handleMouseLeave = (e: MouseEvent) => {
      // Trigger when mouse leaves from top of page
      if (e.clientY <= 0 && isActive && !checkAlreadyShown()) {
        setIsVisible(true)
        if (typeof window !== 'undefined') {
          localStorage.setItem('exit_popup_shown', 'true')
        }
      }
    }

    document.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      clearTimeout(activateTimeout)
      document.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [enabled, delayMs, checkAlreadyShown])

  const handleClose = () => {
    setIsVisible(false)
  }

  if (!enabled) return null

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            className="relative max-w-lg w-full overflow-hidden rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 z-10 p-2 bg-white/20 hover:bg-white/40 rounded-full text-white transition"
              aria-label="Close popup"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Background Image/Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400" />
            
            {/* Content */}
            <div className="relative p-8 md:p-12 text-white text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="w-20 h-20 bg-white/20 backdrop-blur rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <Gift className="w-10 h-10" />
              </motion.div>

              <h2 className="text-3xl md:text-4xl font-bold mb-3">
                Wait! Don&apos;t Leave Empty-Handed 🎁
              </h2>
              
              <p className="text-lg text-white/90 mb-8">
                Create an account now and get <span className="text-yellow-300 font-bold">{discountPercent}% OFF</span> your first order!
              </p>

              <div className="flex flex-col gap-3">
                <Link href="/register">
                  <Button 
                    size="lg"
                    className="w-full h-14 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold text-lg shadow-lg"
                  >
                    <UserPlus className="w-5 h-5 mr-2" />
                    Create Account & Get {discountPercent}% OFF
                  </Button>
                </Link>
                
                <Link href="/login">
                  <Button 
                    variant="ghost" 
                    className="text-white/80 hover:text-white hover:bg-white/10"
                  >
                    Already have an account? Login
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>

              <p className="text-xs text-white/60 mt-6">
                Discount automatically applied at checkout for new members.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
