'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Mail, Gift, ArrowRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

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
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address')
      return
    }

    setSubmitting(true)

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email,
          source: 'exit_intent',
          discountCode: `EXIT${discountPercent}`
        })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Subscription failed')
      }

      setSubmitted(true)
    } catch (err: any) {
      console.error('Newsletter subscription error:', err)
      setError(err.message || 'Failed to subscribe. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

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
              {!submitted ? (
                <>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring' }}
                    className="w-20 h-20 bg-white/20 backdrop-blur rounded-full flex items-center justify-center mx-auto mb-6"
                  >
                    <Gift className="w-10 h-10" />
                  </motion.div>

                  <h2 className="text-3xl md:text-4xl font-bold mb-3">
                    Wait! Don't Leave Empty-Handed 🎁
                  </h2>
                  
                  <p className="text-lg text-white/90 mb-6">
                    Get <span className="text-yellow-300 font-bold">{discountPercent}% OFF</span> your first order!
                    <br />Subscribe to our newsletter and unlock your exclusive discount.
                  </p>

                  <form onSubmit={handleSubmit} className="max-w-sm mx-auto">
                    {error && (
                      <p className="text-red-200 text-sm mb-3 bg-red-500/30 rounded-lg py-2 px-4">
                        {error}
                      </p>
                    )}

                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Enter your email"
                          className="pl-11 h-12 bg-white text-gray-900 border-0"
                        />
                      </div>
                      <Button 
                        type="submit" 
                        disabled={submitting}
                        className="h-12 px-6 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold"
                      >
                        {submitting ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <>
                            Get {discountPercent}% OFF
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </>
                        )}
                      </Button>
                    </div>
                  </form>

                  <p className="text-xs text-white/60 mt-4">
                    No spam, ever. Unsubscribe anytime.
                  </p>
                </>
              ) : (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                >
                  <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Mail className="w-10 h-10" />
                  </div>
                  <h2 className="text-3xl font-bold mb-3">You're In! 🎉</h2>
                  <p className="text-lg text-white/90 mb-4">
                    Check your email for your exclusive discount code!
                  </p>
                  <div className="bg-white/20 backdrop-blur rounded-xl p-4 inline-block">
                    <p className="text-sm text-white/70">Your code:</p>
                    <p className="text-2xl font-mono font-bold">EXIT{discountPercent}</p>
                  </div>
                  <Button
                    onClick={handleClose}
                    className="mt-6 bg-white text-purple-600 hover:bg-white/90"
                  >
                    Start Shopping
                  </Button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
