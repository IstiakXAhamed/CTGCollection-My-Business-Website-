'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Package, User, MapPin, CreditCard, Loader2, FileDown, CheckCircle, XCircle } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import Link from 'next/link'

export default function ReceiptLookupPage() {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [order, setOrder] = useState<any>(null)
  const [error, setError] = useState('')
  const [searched, setSearched] = useState(false)

  const searchOrder = async () => {
    if (!code.trim()) {
      setError('Please enter a verification code')
      return
    }

    setLoading(true)
    setError('')
    setOrder(null)
    setSearched(true)

    try {
      const res = await fetch(`/api/admin/receipt-lookup?code=${encodeURIComponent(code.trim().toUpperCase())}`, {
        credentials: 'include'
      })
      const data = await res.json()

      if (res.ok && data.order) {
        setOrder(data.order)
      } else {
        setError(data.error || 'Order not found')
      }
    } catch (err) {
      setError('Failed to search. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchOrder()
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Receipt Lookup</h1>
        <p className="text-muted-foreground mt-1">Search orders by verification code</p>
      </div>

      {/* Search Box */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Search by Verification Code
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Input
              placeholder="Enter verification code (e.g., A7B2X9)"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              onKeyPress={handleKeyPress}
              className="text-xl font-mono tracking-widest uppercase"
              maxLength={6}
            />
            <Button 
              onClick={searchOrder} 
              disabled={loading}
              className="px-8 bg-gradient-to-r from-blue-500 to-blue-600"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </>
              )}
            </Button>
          </div>
          
          {error && (
            <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg flex items-center gap-2">
              <XCircle className="w-5 h-5" />
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Results */}
      {order && (
        <div className="space-y-4">
          {/* Success Banner */}
          <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <div>
              <p className="font-semibold text-green-800">Order Found!</p>
              <p className="text-sm text-green-600">Verification code: <span className="font-mono font-bold">{order.verificationCode}</span></p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Order Details */}
            <div className="lg:col-span-2 space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Order #{order.orderNumber}
                  </CardTitle>
                  <Link href={`/admin/orders/${order.id}`}>
                    <Button variant="outline" size="sm">View Full Order</Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Order Info */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-xs text-gray-500 uppercase">Date</p>
                        <p className="font-medium">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase">Status</p>
                        <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${
                          order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                          order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>{order.status}</span>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase">Payment</p>
                        <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${
                          order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>{order.paymentStatus === 'paid' ? 'Paid' : 'Pending'}</span>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase">Total</p>
                        <p className="font-bold text-lg">{formatPrice(order.total)}</p>
                      </div>
                    </div>

                    {/* Items */}
                    <div>
                      <h4 className="font-semibold mb-3">Order Items ({order.items?.length || 0})</h4>
                      <div className="space-y-2">
                        {order.items?.map((item: any) => (
                          <div key={item.id} className="flex justify-between items-center p-3 bg-white border rounded-lg">
                            <div>
                              <p className="font-medium">{item.product?.name}</p>
                              {item.variantInfo && (
                                <p className="text-sm text-gray-500">
                                  {(() => {
                                    try {
                                      const v = JSON.parse(item.variantInfo)
                                      return `${v.size || ''} ${v.color || ''}`
                                    } catch { return '' }
                                  })()}
                                </p>
                              )}
                              <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                            </div>
                            <p className="font-semibold">{formatPrice(item.price * item.quantity)}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Receipt Download */}
                    {order.receiptUrl && (
                      <Button 
                        onClick={() => window.open(order.receiptUrl, '_blank')}
                        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30"
                      >
                        <FileDown className="w-4 h-4 mr-2" />
                        📄 Download Receipt
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Customer & Address */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <User className="w-4 h-4" />
                    Customer
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-medium">{order.address?.name || order.name || 'N/A'}</p>
                  <p className="text-sm text-gray-500">{order.user?.email || order.guestEmail || 'N/A'}</p>
                  <p className="text-sm text-gray-500">{order.address?.phone || order.phone || 'N/A'}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <MapPin className="w-4 h-4" />
                    Shipping Address
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                  <p className="font-medium">{order.address?.name}</p>
                  <p>{order.address?.address}</p>
                  <p>{order.address?.city}, {order.address?.district}</p>
                  <p>{order.address?.phone}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <CreditCard className="w-4 h-4" />
                    Payment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Method</span>
                      <span className="font-medium">{order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online'}</span>
                    </div>
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
          </div>
        </div>
      )}

      {/* No results */}
      {searched && !loading && !order && !error && (
        <div className="text-center py-12">
          <Package className="w-12 h-12 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No order found with this verification code</p>
        </div>
      )}
    </div>
  )
}
