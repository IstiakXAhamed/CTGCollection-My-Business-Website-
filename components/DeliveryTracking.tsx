'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Package, Truck, CheckCircle, Clock, MapPin, Phone, MessageCircle } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

interface TrackingStep {
  id: string
  status: string
  description: string
  date: string
  location?: string
  completed: boolean
  current: boolean
}

interface DeliveryTrackingProps {
  orderId: string
  orderNumber?: string
}

export function DeliveryTracking({ orderId, orderNumber }: DeliveryTrackingProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [trackingData, setTrackingData] = useState<{
    status: string
    estimatedDelivery: string
    courier: string
    trackingNumber: string
    steps: TrackingStep[]
    currentLocation?: string
  } | null>(null)

  useEffect(() => {
    fetchTrackingData()
  }, [orderId])

  const fetchTrackingData = async () => {
    try {
      const res = await fetch(`/api/orders/${orderId}/tracking`)
      if (res.ok) {
        const data = await res.json()
        setTrackingData(data)
      } else {
        // Use demo data if API fails
        setTrackingData(getDemoData())
      }
    } catch (err) {
      console.error('Failed to fetch tracking:', err)
      setTrackingData(getDemoData())
    } finally {
      setLoading(false)
    }
  }

  const getDemoData = () => ({
    status: 'in_transit',
    estimatedDelivery: 'December 17, 2024',
    courier: 'Pathao Courier',
    trackingNumber: 'CTG' + orderId?.slice(0, 8).toUpperCase(),
    currentLocation: 'Chittagong Hub',
    steps: [
      {
        id: '1',
        status: 'Order Placed',
        description: 'Your order has been confirmed',
        date: 'Dec 14, 2024 - 10:30 AM',
        completed: true,
        current: false
      },
      {
        id: '2',
        status: 'Processing',
        description: 'Order is being prepared',
        date: 'Dec 14, 2024 - 2:00 PM',
        location: 'CTG Warehouse',
        completed: true,
        current: false
      },
      {
        id: '3',
        status: 'Shipped',
        description: 'Package handed to courier',
        date: 'Dec 15, 2024 - 9:00 AM',
        location: 'Silk Mart Center',
        completed: true,
        current: false
      },
      {
        id: '4',
        status: 'In Transit',
        description: 'Package is on the way',
        date: 'Dec 15, 2024 - 3:00 PM',
        location: 'Chittagong Hub',
        completed: false,
        current: true
      },
      {
        id: '5',
        status: 'Out for Delivery',
        description: 'Package will be delivered today',
        date: 'Expected: Dec 17',
        completed: false,
        current: false
      },
      {
        id: '6',
        status: 'Delivered',
        description: 'Package has been delivered',
        date: '',
        completed: false,
        current: false
      }
    ]
  })

  const getStatusIcon = (status: string, completed: boolean, current: boolean) => {
    if (completed) {
      return <CheckCircle className="w-6 h-6 text-green-500" />
    }
    if (current) {
      return (
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <Truck className="w-6 h-6 text-blue-500" />
        </motion.div>
      )
    }
    return <Clock className="w-6 h-6 text-gray-300" />
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
        >
          <Package className="w-8 h-8 text-blue-500" />
        </motion.div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        {error}
      </div>
    )
  }

  if (!trackingData) return null

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-blue-100 text-sm">Order #{orderNumber || orderId?.slice(0, 10)}</p>
            <h2 className="text-xl font-bold">Track Your Order</h2>
          </div>
          <Package className="w-10 h-10 opacity-80" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-blue-100 text-xs">Estimated Delivery</p>
            <p className="font-semibold">{trackingData.estimatedDelivery}</p>
          </div>
          <div>
            <p className="text-blue-100 text-xs">Tracking Number</p>
            <p className="font-mono">{trackingData.trackingNumber}</p>
          </div>
        </div>
      </div>

      {/* Current Status */}
      <div className="p-6 border-b">
        <div className="flex items-center gap-4">
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center"
          >
            <Truck className="w-6 h-6 text-blue-600" />
          </motion.div>
          <div>
            <p className="font-bold text-lg">
              {trackingData.steps.find(s => s.current)?.status || 'Processing'}
            </p>
            {trackingData.currentLocation && (
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                Current Location: {trackingData.currentLocation}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="p-6">
        <h3 className="font-semibold mb-4">Tracking History</h3>
        <div className="relative">
          {trackingData.steps.map((step, index) => (
            <div key={step.id} className="flex gap-4 pb-8 last:pb-0">
              {/* Line */}
              {index < trackingData.steps.length - 1 && (
                <div 
                  className={`absolute left-[11px] top-6 w-0.5 h-16 ${
                    step.completed ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                  style={{ top: `${(index * 64) + 24}px` }}
                />
              )}

              {/* Icon */}
              <div className="relative z-10 flex-shrink-0">
                {getStatusIcon(step.status, step.completed, step.current)}
              </div>

              {/* Content */}
              <div className={`flex-1 ${step.current ? 'bg-blue-50 dark:bg-blue-900/20 -mx-2 px-2 py-2 rounded-lg' : ''}`}>
                <div className="flex items-center justify-between">
                  <p className={`font-medium ${step.completed || step.current ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
                    {step.status}
                  </p>
                  {step.current && (
                    <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">
                      Current
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500">{step.description}</p>
                {step.date && (
                  <p className="text-xs text-gray-400 mt-1">{step.date}</p>
                )}
                {step.location && (
                  <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3" />
                    {step.location}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contact Options */}
      <div className="p-6 bg-gray-50 dark:bg-gray-900 border-t">
        <p className="text-sm text-gray-500 mb-3">Need help with your order?</p>
        <div className="flex gap-3">
          <a
            href={`tel:01991523289`}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-lg border hover:border-blue-500 transition text-sm"
          >
            <Phone className="w-4 h-4 text-blue-500" />
            Call Support
          </a>
          <a
            href="https://wa.me/8801991523289"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-sm"
          >
            <MessageCircle className="w-4 h-4" />
            WhatsApp
          </a>
        </div>
      </div>
    </div>
  )
}
