'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Package, User, MapPin, CreditCard, Loader2, RefreshCw, FileDown, CheckCircle, Shield, ShieldAlert, Sparkles } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  processing: 'bg-purple-100 text-purple-800',
  shipped: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800'
}

const statusOptions = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']

export default function AdminOrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const orderId = params.id as string
  
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [downloadingReceipt, setDownloadingReceipt] = useState(false)
  const [confirmingPayment, setConfirmingPayment] = useState(false)

  useEffect(() => {
    fetchOrder()
  }, [orderId])

  const fetchOrder = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setOrder(data.order)
      }
    } catch (error) {
      console.error('Failed to fetch order:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (newStatus: string) => {
    setUpdating(true)
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus })
      })
      if (res.ok) {
        setOrder((prev: any) => ({ ...prev, status: newStatus }))
      }
    } catch (error) {
      console.error('Failed to update status:', error)
    } finally {
      setUpdating(false)
    }
  }

  const confirmPayment = async () => {
    if (!confirm('Confirm payment received? This will generate a receipt and send email to customer.')) return
    
    setConfirmingPayment(true)
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          paymentStatus: 'paid',
          status: 'confirmed',
          sendEmail: true
        })
      })
      
      const data = await res.json()
      
      if (res.ok) {
        setOrder((prev: any) => ({ ...prev, paymentStatus: 'paid', status: 'confirmed' }))
        alert(data.message || 'Payment confirmed! Receipt sent to customer.')
      } else {
        alert(data.error || 'Failed to confirm payment')
      }
    } catch (error) {
      alert('Failed to confirm payment')
    } finally {
      setConfirmingPayment(false)
    }
  }

  const downloadReceipt = async () => {
    setDownloadingReceipt(true)
    try {
      // Fetch the HTML receipt from API
      const res = await fetch(`/api/orders/${orderId}/receipt?format=html`, { credentials: 'include' })
      const data = await res.json()
      
      if (res.ok && data.html) {
        // Dynamically import the PDF client utility
        const { downloadPDFFromHTML } = await import('@/lib/pdf-client')
        await downloadPDFFromHTML(data.html, `Receipt-${order.orderNumber || orderId.slice(0, 8)}.pdf`)
      } else {
        alert(data.error || 'Receipt not available. Confirm payment first.')
      }
    } catch (error) {
      console.error('Failed to generate receipt:', error)
      alert('Failed to generate receipt')
    } finally {
      setDownloadingReceipt(false)
    }
  }

  const downloadPremiumReceipt = async () => {
    setDownloadingReceipt(true)
    try {
      const res = await fetch(`/api/orders/${orderId}/receipt-premium`, { credentials: 'include' })
      const data = await res.json()
      
      if (res.ok && data.receiptUrl) {
        window.open(data.receiptUrl, '_blank')
      } else {
        alert(data.error || 'Premium receipt not available.')
      }
    } catch (error) {
      alert('Failed to download premium receipt')
    } finally {
      setDownloadingReceipt(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Order not found</p>
        <Link href="/admin/orders">
          <Button className="mt-4">Back to Orders</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/orders">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Order #{order.orderNumber || order.id.slice(0, 8)}</h1>
            <p className="text-muted-foreground">
              Placed on {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
            </p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          {/* Single glowing blue Download Receipt button */}
          <Button 
            onClick={downloadReceipt}
            disabled={downloadingReceipt}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all"
          >
            {downloadingReceipt ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <span className="mr-2">📄</span>
            )}
            Download Receipt
          </Button>
          
          <Button onClick={fetchOrder} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Items */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Order Items ({order.items?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items?.map((item: any) => (
                  <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
                      {item.product?.images ? (
                        <img
                          src={typeof item.product.images === 'string' ? JSON.parse(item.product.images)[0] : item.product.images[0]}
                          alt={item.product?.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Package className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{item.product?.name || 'Unknown Product'}</p>
                      {item.variantInfo && (
                        <p className="text-sm text-muted-foreground">{item.variantInfo}</p>
                      )}
                      <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                      {/* Warranty Badge */}
                      {item.product?.hasWarranty && (
                        <div className="flex items-center gap-1 mt-1 text-green-600 text-xs">
                          <Shield className="w-3 h-3" />
                          <span>{item.product.warrantyPeriod || 'Warranty'}</span>
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatPrice(item.price * item.quantity)}</p>
                      <p className="text-sm text-muted-foreground">{formatPrice(item.price)} each</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span>{formatPrice(order.shippingCost)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount</span>
                    <span>-{formatPrice(order.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>Total</span>
                  <span>{formatPrice(order.total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Details Sidebar */}
        <div className="space-y-4">
          {/* Status Card */}
          <Card>
            <CardHeader>
              <CardTitle>Order Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusColors[order.status] || 'bg-gray-100'}`}>
                  {order.status}
                </span>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Update Status</label>
                <select
                  value={order.status}
                  onChange={(e) => updateStatus(e.target.value)}
                  disabled={updating}
                  className="w-full p-2 border rounded-md"
                >
                  {statusOptions.map(s => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Payment Card - Enhanced */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Payment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Method</span>
                  <span className="font-medium">
                    {order.paymentMethod === 'cod' ? '💵 COD' : '💳 Online'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Status</span>
                  <span className={`font-semibold ${order.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                    {order.paymentStatus === 'paid' ? '✓ Paid' : '⏳ Pending'}
                  </span>
                </div>
                {order.couponCode && (
                  <div className="flex justify-between">
                    <span>Coupon</span>
                    <span className="font-medium text-blue-600">{order.couponCode}</span>
                  </div>
                )}
              </div>
              
              {/* Confirm Payment Button */}
              {order.paymentStatus !== 'paid' && (
                <Button 
                  onClick={confirmPayment}
                  disabled={confirmingPayment}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {confirmingPayment ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4 mr-2" />
                  )}
                  Confirm Payment
                </Button>
              )}
            </CardContent>
          </Card>

          {/* AI Fraud Analysis Card */}
          <AIFraudAnalysis order={order} />

          {/* AI Fraud Analysis Card */}
          <AIFraudAnalysis order={order} />

          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Customer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium">{order.user?.name || order.address?.name || 'Guest'}</p>
              <p className="text-sm text-muted-foreground">{order.user?.email || order.guestEmail}</p>
              {order.address?.phone && (
                <p className="text-sm text-muted-foreground">{order.address.phone}</p>
              )}
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              {order.address ? (
                <div className="text-sm space-y-1">
                  <p className="font-medium">{order.address.name}</p>
                  <p>{order.address.address}</p>
                  <p>{order.address.city}, {order.address.district}</p>
                  {order.address.postalCode && <p>{order.address.postalCode}</p>}
                  <p>{order.address.phone}</p>
                </div>
              ) : (
                <p className="text-muted-foreground">No address on file</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function AIFraudAnalysis({ order }: { order: any }) {
  const [analysis, setAnalysis] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const analyzeFraud = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/ai/order-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderValue: order.total,
          paymentMethod: order.paymentMethod,
          shippingAddress: order.address ? `${order.address.city}, ${order.address.district}` : 'Unknown',
          customerOrderCount: order.user?.orderCount || 1, // Fallback
          itemCount: order.items?.length || 0
        })
      })
      if (res.ok) {
        const data = await res.json()
        setAnalysis(data.analysis)
      }
    } catch (err) {
      console.error('Fraud analysis failed', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border-l-4 border-l-purple-500 shadow-sm mt-6">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-purple-700 text-lg">
          <ShieldAlert className="w-5 h-5" />
          AI Fraud Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!analysis ? (
          <div className="text-center py-4">
             <p className="text-sm text-gray-500 mb-3">Analyze this order for potential risks using AI.</p>
             <Button 
              variant="outline" 
              className="w-full border-purple-200 text-purple-700 hover:bg-purple-50"
              onClick={analyzeFraud}
              disabled={loading}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
              Check for Fraud
            </Button>
          </div>
        ) : (
          <div className="space-y-4 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Risk Score</span>
              <span className={`text-xl font-bold ${
                analysis.result.riskScore > 70 ? 'text-red-600' : 
                analysis.result.riskScore > 30 ? 'text-amber-600' : 'text-green-600'
              }`}>
                {analysis.result.riskScore}/100
              </span>
            </div>
            
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-1000 ${
                  analysis.result.riskScore > 70 ? 'bg-red-500' : 
                  analysis.result.riskScore > 30 ? 'bg-amber-500' : 'bg-green-500'
                }`}
                style={{ width: `${analysis.result.riskScore}%` }}
              />
            </div>

            <div className={`p-3 rounded-lg text-sm border ${
               analysis.result.riskScore > 70 ? 'bg-red-50 border-red-100 text-red-800' : 
               analysis.result.riskScore > 30 ? 'bg-amber-50 border-amber-100 text-amber-800' : 'bg-green-50 border-green-100 text-green-800'
            }`}>
              <span className="font-semibold">Risk Level: </span>
              {analysis.result.riskLevel?.toUpperCase()}
            </div>

            <div className="bg-gray-50 p-3 rounded-lg text-sm space-y-2 border">
              <p className="font-semibold text-gray-700 flex items-center gap-1">
                <Shield className="w-3 h-3" /> Analysis Report:
              </p>
              <ul className="list-disc pl-4 text-gray-600 space-y-1">
                {analysis.result.flags?.map((flag: string, i: number) => (
                  <li key={i}>{flag}</li>
                ))}
              </ul>
              <p className="mt-3 text-xs italic text-gray-500 border-t pt-2">Recommendation: {analysis.result.recommendation}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

