'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Bell, BellRing, Loader2, Check, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

interface PriceDropAlertProps {
  productId: string
  productName: string
  currentPrice: number
  variant?: 'button' | 'inline' | 'card'
}

export function PriceDropAlert({ 
  productId, 
  productName, 
  currentPrice,
  variant = 'button'
}: PriceDropAlertProps) {
  const { data: session } = useSession()
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [subscribed, setSubscribed] = useState(false)
  const [error, setError] = useState('')

  const handleSubscribe = async () => {
    if (!session?.user?.email) {
      setError('Please login to subscribe to price alerts')
      return
    }

    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/price-alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          email: session.user.email,
          currentPrice
        })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to subscribe')
      }

      setSubscribed(true)
    } catch (err: any) {
      console.error('Price alert subscription error:', err)
      setError(err.message || 'Failed to subscribe. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (subscribed) {
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex items-center gap-2 text-green-600 bg-green-50 dark:bg-green-900/20 px-4 py-2 rounded-lg"
      >
        <Check className="w-5 h-5" />
        <span className="text-sm font-medium">We'll notify you when the price drops!</span>
      </motion.div>
    )
  }

  if (variant === 'button') {
    return (
      <>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition"
        >
          <Bell className="w-4 h-4" />
          Price Drop Alert
        </button>

        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800"
          >
            <div className="flex items-center gap-2 mb-3">
              <BellRing className="w-5 h-5 text-amber-600" />
              <span className="font-medium">Get notified when price drops</span>
            </div>

            {error && (
              <p className="text-red-500 text-sm mb-2">{error}</p>
            )}

            {!session ? (
              <Link href="/login">
                <Button className="w-full bg-amber-500 hover:bg-amber-600">
                  Login to set alert
                </Button>
              </Link>
            ) : (
              <div className="flex flex-col gap-2">
                <p className="text-xs text-gray-500 mb-1">
                  We'll notify you at <strong>{session.user?.email}</strong>
                </p>
                <Button onClick={handleSubscribe} disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Notify Me'}
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </>
    )
  }

  if (variant === 'card') {
    return (
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl p-6 border border-amber-200 dark:border-amber-800">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-amber-100 dark:bg-amber-800 rounded-full flex items-center justify-center">
            <BellRing className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h4 className="font-bold">Price Drop Alert</h4>
            <p className="text-sm text-gray-600">We'll email you when this item goes on sale</p>
          </div>
        </div>

        {error && (
          <p className="text-red-500 text-sm mb-3">{error}</p>
        )}

        {!session ? (
          <Link href="/login">
            <Button className="w-full bg-amber-500 hover:bg-amber-600 py-6 text-base">
              Login to get notified
            </Button>
          </Link>
        ) : (
          <div className="flex flex-col gap-3">
             <p className="text-sm text-gray-500">
               Notify at: <strong>{session.user?.email}</strong>
             </p>
             <Button 
              onClick={handleSubscribe} 
              disabled={loading}
              className="bg-amber-500 hover:bg-amber-600 w-full"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Bell className="w-4 h-4 mr-2" />
                  Enable Price Alert
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    )
  }

  // Inline variant
  return (
    <div className="flex items-center gap-2">
      {!session ? (
        <Link href="/login" className="text-xs text-blue-600 hover:underline">
          Login for alerts
        </Link>
      ) : (
        <Button 
          size="sm" 
          onClick={handleSubscribe} 
          disabled={loading}
          variant="outline"
          className="h-9 px-3"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bell className="w-4 h-4 mr-2" />}
          {loading ? 'Subscribing...' : 'Price Alert'}
        </Button>
      )}
    </div>
  )
}
