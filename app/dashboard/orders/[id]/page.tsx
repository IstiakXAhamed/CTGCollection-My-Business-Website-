'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Package, Truck, CheckCircle, MapPin, FileDown, Shield, CreditCard, Loader2 } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

const statusSteps = ['pending', 'confirmed', 'processing', 'shipped', 'delivered']

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [downloadingReceipt, setDownloadingReceipt] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchOrder(params.id as string)
    }
  }, [params.id])

  const fetchOrder = async (orderId: string) => {
    try {
      const res = await fetch(`/api/user/orders/${orderId}`, { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setOrder(data)
      }
    } catch (error) {
      console.error('Failed to fetch order:', error)
    } finally {
      setLoading(false)
    }
  }

  const downloadReceipt = async () => {
    setDownloadingReceipt(true)
    try {
      const res = await fetch(`/api/orders/${order.id}/receipt`, { credentials: 'include' })
      const data = await res.json()
      
      if (res.ok && data.receiptUrl) {
        // Open receipt in new tab
        window.open(data.receiptUrl, '_blank')
      } else {
        alert(data.error || 'Receipt not available yet')
      }
    } catch (error) {
      alert('Failed to download receipt')
    } finally {
      setDownloadingReceipt(false)
    }
  }

  if (loading) return <div className="text-center py-12">Loading order...</div>
  if (!order) return <div className="text-center py-12">Order not found</div>

  const currentStepIndex = statusSteps.indexOf(order.status)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Orders
        </Button>
        
        {/* Receipt Download - Only show if payment is confirmed */}
        {order.paymentStatus === 'paid' && (
          <Button 
            onClick={downloadReceipt}
            disabled={downloadingReceipt}
            className="bg-green-600 hover:bg-green-700"
          >
            {downloadingReceipt ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <FileDown className="w-4 h-4 mr-2" />
            )}
            Download Receipt
          </Button>
        )}
      </div>

      <div>
        <h1 className="text-3xl font-bold mb-2">Order #{order.orderNumber}</h1>
        <p className="text-muted-foreground">
          Placed on {new Date(order.createdAt).toLocaleDateString('en-BD', {
            day: 'numeric', month: 'long', year: 'numeric'
          })}
        </p>
      </div>

      {/* Payment Status Banner */}
      <div className={`p-4 rounded-lg flex items-center gap-3 ${
        order.paymentStatus === 'paid' 
          ? 'bg-green-50 border border-green-200' 
          : 'bg-yellow-50 border border-yellow-200'
      }`}>
        <CreditCard className={`w-6 h-6 ${order.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'}`} />
        <div>
          <p className={`font-semibold ${order.paymentStatus === 'paid' ? 'text-green-700' : 'text-yellow-700'}`}>
            {order.paymentStatus === 'paid' ? '✓ Payment Confirmed' : '⏳ Payment Pending'}
          </p>
          <p className="text-sm text-muted-foreground">
            {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
            {order.paymentStatus === 'paid' && ' - Receipt available for download'}
          </p>
        </div>
      </div>

      {/* Order Status Timeline */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Order Status</h2>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-8">
            {statusSteps.map((step, index) => (
              <div key={step} className="flex-1 relative">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    index <= currentStepIndex ? 'bg-blue-600 text-white' : 'bg-gray-200'
                  }`}>
                    {index < currentStepIndex ? <CheckCircle className="w-6 h-6" /> : index + 1}
                  </div>
                  <p className="text-xs mt-2 capitalize">{step}</p>
                </div>
                {index < statusSteps.length - 1 && (
                  <div className={`absolute top-5 left-1/2 w-full h-0.5 ${
                    index < currentStepIndex ? 'bg-blue-600' : 'bg-gray-200'
                  }`} style={{ zIndex: -1 }} />
                )}
              </div>
            ))}
          </div>

          {order.trackingNumber && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Tracking Number</p>
              <p className="font-mono font-semibold">{order.trackingNumber}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Items */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Order Items</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          {order.items.map((item: any) => {
            const images = typeof item.product.images === 'string' 
              ? JSON.parse(item.product.images) 
              : item.product.images
            const imageUrl = images?.[0] || '/placeholder.png'
            
            return (
              <div key={item.id} className="flex gap-4 pb-4 border-b last:border-0">
                <div className="relative w-20 h-20 bg-gray-100 rounded overflow-hidden">
                  <Image
                    src={imageUrl}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                    unoptimized={imageUrl.includes('picsum.photos')}
                  />
                </div>
                <div className="flex-1">
                  <Link href={`/product/${item.product.slug}`} className="font-semibold hover:text-blue-600">
                    {item.product.name}
                  </Link>
                  <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                  {item.variantInfo && (
                    <p className="text-sm text-muted-foreground">
                      {(() => {
                        try {
                          const v = JSON.parse(item.variantInfo)
                          return `${v.size || ''} ${v.color ? '- ' + v.color : ''}`
                        } catch { return '' }
                      })()}
                    </p>
                  )}
                  {/* Warranty Badge */}
                  {item.product.hasWarranty && (
                    <div className="flex items-center gap-1 mt-1 text-green-600 text-sm">
                      <Shield className="w-4 h-4" />
                      <span>{item.product.warrantyPeriod || 'Warranty Included'}</span>
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatPrice(item.price)}</p>
                  <p className="text-sm text-muted-foreground">×{item.quantity}</p>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Shipping Address */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Shipping Address
          </h2>
        </CardHeader>
        <CardContent>
          <p className="font-semibold">{order.address.name}</p>
          <p>{order.address.phone}</p>
          <p className="text-muted-foreground mt-2">
            {order.address.address}, {order.address.city}
            <br />
            {order.address.district}{order.address.postalCode && `, ${order.address.postalCode}`}
          </p>
        </CardContent>
      </Card>

      {/* Order Summary */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Order Summary</h2>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatPrice(order.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>{formatPrice(order.shippingCost)}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Discount{order.couponCode && ` (${order.couponCode})`}</span>
              <span>-{formatPrice(order.discount)}</span>
            </div>
          )}
          <div className="flex justify-between text-lg font-bold pt-2 border-t">
            <span>Total</span>
            <span className="text-blue-600">{formatPrice(order.total)}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

