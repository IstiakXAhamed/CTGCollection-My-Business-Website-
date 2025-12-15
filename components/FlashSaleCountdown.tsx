'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Clock, Flame, Zap } from 'lucide-react'

interface FlashSaleCountdownProps {
  endTime: Date | string
  title?: string
  subtitle?: string
  onExpire?: () => void
  variant?: 'banner' | 'compact' | 'card'
  showLabel?: boolean
}

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
  isExpired: boolean
}

export function FlashSaleCountdown({
  endTime,
  title = '🔥 Flash Sale',
  subtitle = 'Hurry! Limited time offer',
  onExpire,
  variant = 'banner',
  showLabel = true
}: FlashSaleCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: false
  })
  const [mounted, setMounted] = useState(false)

  const calculateTimeLeft = useCallback((): TimeLeft => {
    try {
      const end = typeof endTime === 'string' ? new Date(endTime) : endTime
      const now = new Date()
      const difference = end.getTime() - now.getTime()

      if (difference <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true }
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
        isExpired: false
      }
    } catch (error) {
      console.error('Error calculating time:', error)
      return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true }
    }
  }, [endTime])

  useEffect(() => {
    setMounted(true)
    setTimeLeft(calculateTimeLeft())

    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft()
      setTimeLeft(newTimeLeft)

      if (newTimeLeft.isExpired) {
        clearInterval(timer)
        onExpire?.()
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [calculateTimeLeft, onExpire])

  if (!mounted) return null

  if (timeLeft.isExpired) {
    return (
      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 text-center">
        <p className="text-gray-500">This sale has ended</p>
      </div>
    )
  }

  const TimeBlock = ({ value, label }: { value: number; label: string }) => (
    <div className="text-center">
      <motion.div
        key={value}
        initial={{ scale: 1.2, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-lg px-3 py-2 min-w-[50px]"
      >
        <span className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          {value.toString().padStart(2, '0')}
        </span>
      </motion.div>
      {showLabel && (
        <span className="text-xs text-gray-500 mt-1 block uppercase tracking-wider">
          {label}
        </span>
      )}
    </div>
  )

  const Separator = () => (
    <span className="text-2xl font-bold text-gray-400 self-start mt-2">:</span>
  )

  if (variant === 'compact') {
    return (
      <div className="inline-flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-full">
        <Clock className="w-4 h-4 animate-pulse" />
        <span className="font-mono font-bold">
          {timeLeft.hours.toString().padStart(2, '0')}:
          {timeLeft.minutes.toString().padStart(2, '0')}:
          {timeLeft.seconds.toString().padStart(2, '0')}
        </span>
      </div>
    )
  }

  if (variant === 'card') {
    return (
      <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-xl p-6 text-white">
        <div className="flex items-center gap-2 mb-4">
          <Flame className="w-6 h-6 animate-pulse" />
          <h3 className="text-xl font-bold">{title}</h3>
        </div>
        <div className="flex items-center justify-center gap-2">
          <TimeBlock value={timeLeft.days} label="Days" />
          <Separator />
          <TimeBlock value={timeLeft.hours} label="Hours" />
          <Separator />
          <TimeBlock value={timeLeft.minutes} label="Mins" />
          <Separator />
          <TimeBlock value={timeLeft.seconds} label="Secs" />
        </div>
      </div>
    )
  }

  // Banner variant (default)
  return (
    <div className="bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 text-white py-3 px-4">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-center gap-4">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 animate-pulse" />
          <span className="font-bold">{title}</span>
          <span className="hidden md:inline text-orange-100">|</span>
          <span className="text-sm text-orange-100">{subtitle}</span>
        </div>

        <div className="flex items-center gap-1">
          <div className="bg-white/20 backdrop-blur px-2 py-1 rounded font-mono font-bold">
            {timeLeft.days > 0 && `${timeLeft.days}d `}
            {timeLeft.hours.toString().padStart(2, '0')}
          </div>
          <span className="font-bold">:</span>
          <div className="bg-white/20 backdrop-blur px-2 py-1 rounded font-mono font-bold">
            {timeLeft.minutes.toString().padStart(2, '0')}
          </div>
          <span className="font-bold">:</span>
          <div className="bg-white/20 backdrop-blur px-2 py-1 rounded font-mono font-bold animate-pulse">
            {timeLeft.seconds.toString().padStart(2, '0')}
          </div>
        </div>
      </div>
    </div>
  )
}

// Hook for managing flash sales
export function useFlashSale(saleId?: string) {
  const [sale, setSale] = useState<{
    id: string
    title: string
    endTime: Date
    discount: number
    products: string[]
  } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSale = async () => {
      try {
        const url = saleId 
          ? `/api/flash-sales/${saleId}` 
          : '/api/flash-sales/active'
        const res = await fetch(url)
        if (res.ok) {
          const data = await res.json()
          if (data.sale) {
            setSale({
              ...data.sale,
              endTime: new Date(data.sale.endTime)
            })
          }
        }
      } catch (error) {
        console.error('Failed to fetch flash sale:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSale()
  }, [saleId])

  return { sale, loading, isActive: !!sale }
}
