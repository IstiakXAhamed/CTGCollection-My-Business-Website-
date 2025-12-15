'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, Flame, Clock, Zap } from 'lucide-react'

interface LimitedStockAlertProps {
  stock: number
  threshold?: number
  variant?: 'badge' | 'banner' | 'inline'
  showIcon?: boolean
}

export function LimitedStockAlert({
  stock,
  threshold = 10,
  variant = 'inline',
  showIcon = true
}: LimitedStockAlertProps) {
  // Don't show if stock is above threshold or out of stock
  if (stock > threshold || stock <= 0) return null

  const getUrgencyLevel = () => {
    if (stock <= 2) return { color: 'red', message: 'Almost Gone!', icon: Flame }
    if (stock <= 5) return { color: 'orange', message: 'Selling Fast!', icon: Zap }
    return { color: 'yellow', message: 'Low Stock', icon: AlertTriangle }
  }

  const urgency = getUrgencyLevel()
  const Icon = urgency.icon

  if (variant === 'badge') {
    return (
      <motion.span
        initial={{ scale: 0.8 }}
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${
          urgency.color === 'red' 
            ? 'bg-red-100 text-red-700' 
            : urgency.color === 'orange'
            ? 'bg-orange-100 text-orange-700'
            : 'bg-yellow-100 text-yellow-700'
        }`}
      >
        {showIcon && <Icon className="w-3 h-3" />}
        Only {stock} left!
      </motion.span>
    )
  }

  if (variant === 'banner') {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-3 rounded-lg flex items-center gap-3 ${
          urgency.color === 'red'
            ? 'bg-red-50 border border-red-200 text-red-700'
            : urgency.color === 'orange'
            ? 'bg-orange-50 border border-orange-200 text-orange-700'
            : 'bg-yellow-50 border border-yellow-200 text-yellow-700'
        }`}
      >
        <motion.div
          animate={{ rotate: [0, -10, 10, 0] }}
          transition={{ repeat: Infinity, duration: 0.5, repeatDelay: 2 }}
        >
          <Icon className="w-5 h-5" />
        </motion.div>
        <div className="flex-1">
          <p className="font-bold">{urgency.message}</p>
          <p className="text-sm opacity-80">
            Only <strong>{stock}</strong> items remaining. Order now before it's too late!
          </p>
        </div>
        <Clock className="w-4 h-4 opacity-50" />
      </motion.div>
    )
  }

  // Inline variant (default)
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`flex items-center gap-2 text-sm font-medium ${
        urgency.color === 'red'
          ? 'text-red-600'
          : urgency.color === 'orange'
          ? 'text-orange-600'
          : 'text-yellow-600'
      }`}
    >
      <motion.div
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ repeat: Infinity, duration: 1 }}
      >
        {showIcon && <Icon className="w-4 h-4" />}
      </motion.div>
      <span>
        🔥 {urgency.message} – Only <strong>{stock}</strong> left in stock!
      </span>
    </motion.div>
  )
}

// Stock Progress Bar
export function StockProgressBar({ stock, maxStock = 100 }: { stock: number; maxStock?: number }) {
  const percentage = Math.min((stock / maxStock) * 100, 100)
  const isLow = percentage <= 20
  const isCritical = percentage <= 10

  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-xs mb-1">
        <span className={`font-medium ${isCritical ? 'text-red-600' : isLow ? 'text-orange-600' : 'text-gray-600'}`}>
          {stock} in stock
        </span>
        {isLow && (
          <motion.span
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ repeat: Infinity, duration: 1 }}
            className={`${isCritical ? 'text-red-600' : 'text-orange-600'}`}
          >
            Low Stock!
          </motion.span>
        )}
      </div>
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5 }}
          className={`h-full rounded-full ${
            isCritical 
              ? 'bg-gradient-to-r from-red-500 to-red-600' 
              : isLow 
              ? 'bg-gradient-to-r from-orange-400 to-orange-500'
              : 'bg-gradient-to-r from-green-400 to-green-500'
          }`}
        />
      </div>
    </div>
  )
}
