'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Eye, Package, RefreshCw, ChevronDown, CheckCircle, Clock, CreditCard, FileText, Mail, Loader2, Download } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { useToast } from '@/components/ui/use-toast'
import { useAutoRefresh } from '@/hooks/useAutoRefresh'

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  processing: 'bg-purple-100 text-purple-800',
  shipped: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800'
}

const paymentStatusColors: Record<string, string> = {
  pending: 'bg-orange-100 text-orange-800',
  paid: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800'
}

const statusOptions = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 })
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [updating, setUpdating] = useState<string | null>(null)
  const [confirmingPayment, setConfirmingPayment] = useState<string | null>(null)
  const [sendingReceipt, setSendingReceipt] = useState<string | null>(null)
  const { toast } = useToast()

  // Auto-refresh every 30 seconds
  useAutoRefresh(useCallback(() => fetchOrders(), [pagination.page, pagination.limit]))

  useEffect(() => {
    fetchOrders()
  }, [pagination.page, pagination.limit])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const queryParams = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        search: searchQuery // Pass search query if needed by backend (backend needs update for search but pagination is key here)
      })
      const res = await fetch(`/api/admin/orders?${queryParams}`, { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setOrders(data.orders || [])
        if (data.pagination) {
          setPagination(prev => ({ ...prev, ...data.pagination }))
        }
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (orderId: string, newStatus: string) => {
    setUpdating(orderId)
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus })
      })
      if (res.ok) {
        setOrders(orders.map(o => 
          o.id === orderId ? { ...o, status: newStatus } : o
        ))
      }
    } catch (error) {
      console.error('Failed to update status:', error)
    } finally {
      setUpdating(null)
    }
  }

  const confirmPayment = async (orderId: string) => {
    if (!confirm('Confirm payment received? This will generate a receipt and send email to customer.')) return
    
    setConfirmingPayment(orderId)
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
        setOrders(orders.map(o => 
          o.id === orderId ? { ...o, paymentStatus: 'paid', status: 'confirmed' } : o
        ))
        alert(data.message || 'Payment confirmed! Receipt sent to customer.')
      } else {
        alert(data.error || 'Failed to confirm payment')
      }
    } catch (error) {
      console.error('Failed to confirm payment:', error)
      alert('Failed to confirm payment')
    } finally {
      setConfirmingPayment(null)
    }
  }

  const sendReceipt = async (orderId: string) => {
    setSendingReceipt(orderId)
    try {
      const res = await fetch(`/api/orders/${orderId}/receipt`, {
        method: 'POST',
        credentials: 'include'
      })
      const data = await res.json()
      if (res.ok) {
        toast({
          title: '✅ Receipt Sent!',
          description: data.message || 'Receipt with attachment sent to customer email.',
        })
      } else {
        toast({
          title: '❌ Failed to Send',
          description: data.error || 'Failed to send receipt',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: '❌ Error',
        description: 'Failed to send receipt. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setSendingReceipt(null)
    }
  }

  const filteredOrders = orders.filter(o =>
    (o.orderNumber || o.id).toLowerCase().includes(searchQuery.toLowerCase()) ||
    (o.user?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (o.user?.email || o.guestEmail || '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1">Orders</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">{orders.length} total orders</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.open('/api/admin/orders/export', '_blank')}
          >
            <Download className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Export</span>
          </Button>
          <Button onClick={fetchOrders} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="p-3 sm:p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
            <Input
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 sm:pl-10 h-10 text-sm"
            />
          </div>
        </CardHeader>
        <CardContent className="p-2 sm:p-4">
          {orders.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">No orders yet</p>
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="lg:hidden space-y-3">
                {filteredOrders.map((order) => (
                  <div key={order.id} className="border rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs sm:text-sm font-semibold text-blue-600">
                        {order.orderNumber || `#${order.id.slice(0, 8)}`}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold ${statusColors[order.status] || 'bg-gray-100'}`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="text-muted-foreground truncate max-w-[120px]">
                        {order.user?.name || 'Guest'}
                      </span>
                      <span className="font-semibold">{formatPrice(order.total)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] ${paymentStatusColors[order.paymentStatus] || 'bg-gray-100'}`}>
                          {order.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <Link href={`/admin/orders/${order.id}`}>
                        <Button size="sm" variant="outline" className="h-7 text-xs px-2">
                          <Eye className="w-3 h-3 mr-1" /> View
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Order #</th>
                    <th className="text-left py-3 px-4">Customer</th>
                    <th className="text-left py-3 px-4">Total</th>
                    <th className="text-left py-3 px-4">Payment</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">Date</th>
                    <th className="text-right py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="border-b hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <span className="font-mono font-semibold text-blue-600">
                          {order.orderNumber || `#${order.id.slice(0, 8)}`}
                        </span>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {order.paymentMethod === 'cod' ? '💵 COD' : '💳 Online'}
                        </p>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium">{order.user?.name || order.address?.name || 'Guest'}</p>
                          <p className="text-sm text-muted-foreground">
                            {order.user?.email || order.guestEmail || '-'}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-semibold">{formatPrice(order.total)}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${paymentStatusColors[order.paymentStatus] || 'bg-gray-100'}`}>
                          {order.paymentStatus === 'paid' ? '✓ Paid' : order.paymentStatus === 'failed' ? '✗ Failed' : '⏳ Pending'}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="relative">
                          <select
                            value={order.status}
                            onChange={(e) => updateStatus(order.id, e.target.value)}
                            disabled={updating === order.id}
                            className={`appearance-none px-3 py-1 pr-8 rounded-full text-xs font-semibold cursor-pointer ${statusColors[order.status] || 'bg-gray-100'}`}
                          >
                            {statusOptions.map(s => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none" />
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex justify-end gap-2">
                          {/* Confirm Payment Button */}
                          {order.paymentStatus !== 'paid' && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="text-green-600 border-green-200 hover:bg-green-50"
                              onClick={() => confirmPayment(order.id)}
                              disabled={confirmingPayment === order.id}
                            >
                              {confirmingPayment === order.id ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                              ) : (
                                <>
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Confirm Pay
                                </>
                              )}
                            </Button>
                          )}
                          
                          {/* Send Receipt Button */}
                          {order.paymentStatus === 'paid' && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="text-blue-600"
                              onClick={() => sendReceipt(order.id)}
                              disabled={sendingReceipt === order.id}
                            >
                              {sendingReceipt === order.id ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                                  Sending...
                                </>
                              ) : (
                                <>
                                  <Mail className="w-4 h-4 mr-1" />
                                  Receipt
                                </>
                              )}
                            </Button>
                          )}
                          
                          <Link href={`/admin/orders/${order.id}`}>
                            <Button size="sm" variant="outline">
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Pagination Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 pb-8">
        <div className="text-xs sm:text-sm text-gray-500 text-center sm:text-left">
          Showing {(pagination.page - 1) * pagination.limit + 1}-{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
            disabled={pagination.page <= 1 || loading}
          >
            Prev
          </Button>
          <span className="text-xs sm:text-sm font-medium flex items-center px-2">
            {pagination.page}/{pagination.totalPages || 1}
          </span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.totalPages || 1, prev.page + 1) }))}
            disabled={pagination.page >= (pagination.totalPages || 1) || loading}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
