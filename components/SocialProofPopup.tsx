'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingBag, X, MapPin } from 'lucide-react'
import Image from 'next/image'

interface PurchaseNotification {
  id: string
  productName: string
  productImage?: string
  customerName: string
  location: string
  timeAgo: string
}

// Sample data for social proof (mix with real data from API)
const SAMPLE_PURCHASES: PurchaseNotification[] = [
  { id: '1', productName: 'Eau de Parfum 50ml', productImage: '', customerName: 'Rahim', location: 'Dhaka', timeAgo: '2 minutes ago' },
  { id: '2', productName: 'Premium Cotton T-Shirt', productImage: '', customerName: 'Fatima', location: 'Chittagong', timeAgo: '5 minutes ago' },
  { id: '3', productName: 'Wireless Earbuds Pro', productImage: '', customerName: 'Karim', location: 'Sylhet', timeAgo: '8 minutes ago' },
  { id: '4', productName: 'Smart Watch Series X', productImage: '', customerName: 'Nadia', location: 'Rajshahi', timeAgo: '12 minutes ago' },
  { id: '5', productName: 'Designer Sunglasses', productImage: '', customerName: 'Hasan', location: 'Khulna', timeAgo: '15 minutes ago' },
  { id: '6', productName: 'Leather Wallet', productImage: '', customerName: 'Aisha', location: 'Comilla', timeAgo: '18 minutes ago' },
]

interface SocialProofPopupProps {
  enabled?: boolean
  intervalMs?: number
  displayDurationMs?: number
  position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right'
  fetchRealData?: boolean
}

export function SocialProofPopup({
  enabled = true,
  intervalMs = 15000, // Show every 15 seconds
  displayDurationMs = 5000, // Display for 5 seconds
  position = 'bottom-left',
  fetchRealData = false
}: SocialProofPopupProps) {
  const [notification, setNotification] = useState<PurchaseNotification | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [purchases, setPurchases] = useState<PurchaseNotification[]>(SAMPLE_PURCHASES)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [dismissed, setDismissed] = useState(false)

  // Fetch real purchase data
  const fetchRecentPurchases = useCallback(async () => {
    if (!fetchRealData) return

    try {
      const res = await fetch('/api/orders/recent?limit=10')
      if (res.ok) {
        const data = await res.json()
        if (data.orders?.length > 0) {
          const formattedPurchases = data.orders.map((order: any) => ({
            id: order.id,
            productName: order.items?.[0]?.product?.name || 'Product',
            productImage: order.items?.[0]?.product?.images?.[0] || '',
            customerName: order.address?.name?.split(' ')[0] || 'Customer',
            location: order.address?.district || 'Bangladesh',
            timeAgo: formatTimeAgo(new Date(order.createdAt))
          }))
          setPurchases(formattedPurchases)
        }
      }
    } catch (error) {
      console.error('Failed to fetch recent purchases:', error)
      // Keep using sample data on error
    }
  }, [fetchRealData])

  useEffect(() => {
    if (fetchRealData) {
      fetchRecentPurchases()
      // Refresh every 5 minutes
      const refreshInterval = setInterval(fetchRecentPurchases, 5 * 60 * 1000)
      return () => clearInterval(refreshInterval)
    }
  }, [fetchRealData, fetchRecentPurchases])

  useEffect(() => {
    if (!enabled || dismissed || purchases.length === 0) return

    // Initial delay before first notification
    const initialDelay = setTimeout(() => {
      showNextNotification()
    }, 5000)

    // Set up interval for subsequent notifications
    const interval = setInterval(() => {
      showNextNotification()
    }, intervalMs)

    return () => {
      clearTimeout(initialDelay)
      clearInterval(interval)
    }
  }, [enabled, dismissed, purchases, intervalMs, currentIndex])

  const showNextNotification = () => {
    try {
      const nextPurchase = purchases[currentIndex % purchases.length]
      setNotification(nextPurchase)
      setIsVisible(true)
      setCurrentIndex(prev => (prev + 1) % purchases.length)

      // Auto-hide after display duration
      setTimeout(() => {
        setIsVisible(false)
      }, displayDurationMs)
    } catch (error) {
      console.error('Error showing notification:', error)
    }
  }

  const handleDismiss = () => {
    setIsVisible(false)
    setDismissed(true)
  }

  const getPositionClasses = () => {
    switch (position) {
      case 'bottom-left': return 'bottom-4 left-4'
      case 'bottom-right': return 'bottom-4 right-4'
      case 'top-left': return 'top-4 left-4'
      case 'top-right': return 'top-4 right-4'
      default: return 'bottom-4 left-4'
    }
  }

  if (!enabled || dismissed) return null

  return (
    <AnimatePresence>
      {isVisible && notification && (
        <motion.div
          initial={{ opacity: 0, x: position.includes('left') ? -100 : 100, y: 0 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, x: position.includes('left') ? -100 : 100 }}
          className={`fixed ${getPositionClasses()} z-40 max-w-sm`}
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 p-4 flex items-start gap-3">
            {/* Product Image */}
            <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-lg flex items-center justify-center flex-shrink-0">
              {notification.productImage ? (
                <Image
                  src={notification.productImage}
                  alt={notification.productName}
                  width={56}
                  height={56}
                  className="rounded-lg object-cover"
                />
              ) : (
                <ShoppingBag className="w-6 h-6 text-blue-600" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-sm">
                <span className="font-semibold">{notification.customerName}</span>
                <span className="text-gray-500"> from </span>
                <span className="font-medium">{notification.location}</span>
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                Just purchased{' '}
                <span className="font-semibold text-blue-600">{notification.productName}</span>
              </p>
              <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {notification.timeAgo}
              </p>
            </div>

            {/* Close Button */}
            <button
              onClick={handleDismiss}
              className="text-gray-400 hover:text-gray-600 transition p-1"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Verified Badge */}
          <div className="absolute -top-2 -right-2">
            <div className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow">
              ✓ Verified
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Helper function
function formatTimeAgo(date: Date): string {
  try {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
    if (seconds < 60) return 'Just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`
    return `${Math.floor(seconds / 86400)} days ago`
  } catch {
    return 'Recently'
  }
}
