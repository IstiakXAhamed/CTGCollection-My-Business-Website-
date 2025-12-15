'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { RefreshCw, ShoppingCart, Check, Loader2, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils'
import Image from 'next/image'

interface OrderItem {
  id: string
  name: string
  image?: string
  price: number
  quantity: number
  variant?: string
}

interface Order {
  id: string
  orderNumber: string
  items: OrderItem[]
  total: number
  date: string
}

interface EasyReorderProps {
  order: Order
  onReorder: (items: OrderItem[]) => Promise<void>
}

export function EasyReorder({ order, onReorder }: EasyReorderProps) {
  const [loading, setLoading] = useState(false)
  const [reordered, setReordered] = useState(false)

  const handleReorder = async () => {
    setLoading(true)
    try {
      await onReorder(order.items)
      setReordered(true)
    } catch (error) {
      console.error('Reorder error:', error)
      alert('Failed to add items to cart')
    } finally {
      setLoading(false)
    }
  }

  if (reordered) {
    return (
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-lg"
      >
        <Check className="w-5 h-5" />
        <span className="font-medium">Added to cart!</span>
      </motion.div>
    )
  }

  return (
    <div className="border rounded-xl p-4 hover:shadow-md transition">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Package className="w-5 h-5 text-blue-600" />
          <span className="font-medium">Order #{order.orderNumber}</span>
        </div>
        <span className="text-sm text-gray-500">{order.date}</span>
      </div>

      {/* Items Preview */}
      <div className="flex items-center gap-2 mb-4">
        {order.items.slice(0, 4).map((item, idx) => (
          <div 
            key={item.id} 
            className="w-12 h-12 bg-gray-100 rounded-lg relative flex-shrink-0"
          >
            {item.image ? (
              <Image
                src={item.image}
                alt={item.name}
                fill
                className="object-cover rounded-lg"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                {item.name.slice(0, 2)}
              </div>
            )}
            {item.quantity > 1 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">
                {item.quantity}
              </span>
            )}
          </div>
        ))}
        {order.items.length > 4 && (
          <span className="text-sm text-gray-500">
            +{order.items.length - 4} more
          </span>
        )}
        <div className="ml-auto text-right">
          <p className="font-bold">{formatPrice(order.total)}</p>
          <p className="text-xs text-gray-500">{order.items.length} items</p>
        </div>
      </div>

      <Button 
        onClick={handleReorder} 
        disabled={loading}
        className="w-full"
        variant="outline"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Adding to Cart...
          </>
        ) : (
          <>
            <RefreshCw className="w-4 h-4 mr-2" />
            Reorder All Items
          </>
        )}
      </Button>
    </div>
  )
}

// Quick Reorder from Account Page
export function QuickReorderButton({ 
  orderId, 
  compact = false 
}: { 
  orderId: string
  compact?: boolean 
}) {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleReorder = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/orders/${orderId}/reorder`, {
        method: 'POST',
        credentials: 'include'
      })

      if (res.ok) {
        setSuccess(true)
        setTimeout(() => setSuccess(false), 2000)
      } else {
        const data = await res.json()
        throw new Error(data.error || 'Failed to reorder')
      }
    } catch (error: any) {
      console.error('Reorder error:', error)
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <span className="text-green-600 flex items-center gap-1">
        <Check className="w-4 h-4" /> Added!
      </span>
    )
  }

  if (compact) {
    return (
      <button
        onClick={handleReorder}
        disabled={loading}
        className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            <RefreshCw className="w-4 h-4" />
            Reorder
          </>
        )}
      </button>
    )
  }

  return (
    <Button onClick={handleReorder} disabled={loading} variant="outline" size="sm">
      {loading ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <RefreshCw className="w-4 h-4 mr-2" />
      )}
      Reorder
    </Button>
  )
}
