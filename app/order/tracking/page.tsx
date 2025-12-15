'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Package, Truck, CheckCircle, Clock, Search, 
  MapPin, Calendar, Loader2, AlertCircle
} from 'lucide-react'
import Link from 'next/link'

interface OrderDetails {
  orderNumber: string
  status: string
  paymentStatus: string
  createdAt: string
  updatedAt: string
  trackingNumber?: string
  items: { name: string; quantity: number; price: number }[]
  total: number
  address: string
}

const statusSteps = [
  { key: 'pending', label: 'Order Placed', icon: Clock },
  { key: 'confirmed', label: 'Confirmed', icon: CheckCircle },
  { key: 'processing', label: 'Processing', icon: Package },
  { key: 'shipped', label: 'Shipped', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: MapPin }
]

export default function OrderTrackingPage() {
  const [orderNumber, setOrderNumber] = useState('')
  const [order, setOrder] = useState<OrderDetails | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searched, setSearched] = useState(false)

  const handleSearch = async () => {
    if (!orderNumber.trim()) {
      setError('Please enter an order number')
      return
    }

    setLoading(true)
    setError('')
    setSearched(true)

    try {
      const res = await fetch(`/api/orders/track?orderNumber=${encodeURIComponent(orderNumber)}`)
      if (res.ok) {
        const data = await res.json()
        setOrder(data)
      } else {
        setOrder(null)
        setError('Order not found. Please check your order number.')
      }
    } catch (err) {
      setError('Failed to fetch order. Please try again.')
      setOrder(null)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIndex = (status: string) => {
    const index = statusSteps.findIndex(s => s.key === status)
    return index === -1 ? 0 : index
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12">
      <div className="container max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Track Your Order
          </h1>
          <p className="text-muted-foreground">
            Enter your order number to see real-time updates
          </p>
        </div>

        {/* Search Box */}
        <Card className="mb-8 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Enter Order Number (e.g., CTG-123456)"
                  className="pl-10 h-12 text-lg"
                />
              </div>
              <Button onClick={handleSearch} disabled={loading} className="h-12 px-8">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Track Order'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {error && (
          <Card className="mb-8 border-red-200 bg-red-50 dark:bg-red-900/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
                <AlertCircle className="w-5 h-5" />
                <p>{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {order && (
          <>
            {/* Status Timeline */}
            <Card className="mb-8 shadow-lg overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-sm">Order Number</p>
                    <CardTitle className="text-2xl">{order.orderNumber}</CardTitle>
                  </div>
                  <Badge className="bg-white/20 text-white hover:bg-white/30 text-sm px-4 py-1">
                    {order.status === 'delivered' ? '✓ Delivered' : order.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-8">
                {/* Timeline */}
                <div className="relative">
                  {/* Progress Line */}
                  <div className="absolute top-6 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700 rounded-full">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-full transition-all duration-500"
                      style={{ width: `${(getStatusIndex(order.status) / (statusSteps.length - 1)) * 100}%` }}
                    />
                  </div>

                  {/* Steps */}
                  <div className="relative flex justify-between">
                    {statusSteps.map((step, index) => {
                      const currentIndex = getStatusIndex(order.status)
                      const isActive = index <= currentIndex
                      const isCurrent = index === currentIndex
                      const Icon = step.icon

                      return (
                        <div key={step.key} className="flex flex-col items-center">
                          <div className={`
                            w-12 h-12 rounded-full flex items-center justify-center z-10 transition-all
                            ${isActive 
                              ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-lg' 
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                            }
                            ${isCurrent ? 'ring-4 ring-blue-200 dark:ring-blue-900' : ''}
                          `}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <p className={`mt-3 text-sm font-medium ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {step.label}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Tracking Number */}
                {order.trackingNumber && (
                  <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Tracking Number</p>
                    <p className="text-lg font-mono font-bold text-blue-600">{order.trackingNumber}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Order Details */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Order Items
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex justify-between items-center py-2 border-b last:border-0">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-semibold">৳{item.price.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-blue-600">৳{order.total.toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Delivery Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Delivery Address</p>
                    <p className="font-medium">{order.address}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Order Date</p>
                    <p className="font-medium flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Payment Status</p>
                    <Badge variant={order.paymentStatus === 'paid' ? 'default' : 'secondary'}>
                      {order.paymentStatus === 'paid' ? '✓ Paid' : 'Pending'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {searched && !order && !loading && !error && (
          <Card className="text-center py-12">
            <CardContent>
              <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Order Not Found</h3>
              <p className="text-muted-foreground mb-4">
                We couldn't find an order with that number.
              </p>
              <Link href="/contact">
                <Button variant="outline">Contact Support</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {!searched && (
          <Card className="text-center py-12 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900">
            <CardContent>
              <Package className="w-16 h-16 mx-auto text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Track Your Package</h3>
              <p className="text-muted-foreground mb-4">
                Enter your order number above to see the current status
              </p>
              <p className="text-sm text-muted-foreground">
                You can find your order number in the confirmation email
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
