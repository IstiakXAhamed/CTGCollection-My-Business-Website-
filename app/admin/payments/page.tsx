'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Check, X, Clock, Search, RefreshCw, 
  Smartphone, AlertCircle, Eye 
} from 'lucide-react'
import { formatPrice } from '@/lib/utils'

interface Verification {
  id: string
  orderId: string
  method: string
  transactionId: string
  amount: number
  status: string
  submittedAt: string
  order: {
    orderNumber: string
    address: { name: string; phone: string }
    items: { product: { name: string }; quantity: number }[]
  }
}

export default function PaymentVerificationPage() {
  const [verifications, setVerifications] = useState<Verification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected'>('pending')
  const [search, setSearch] = useState('')
  const [processing, setProcessing] = useState<string | null>(null)

  useEffect(() => {
    fetchVerifications()
  }, [filter])

  const fetchVerifications = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/payment/manual?status=${filter}`, { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setVerifications(data.verifications || [])
      }
    } catch (error) {
      console.error('Failed to fetch:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (id: string, action: 'approve' | 'reject') => {
    setProcessing(id)
    try {
      const res = await fetch('/api/payment/manual', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ verificationId: id, action })
      })

      if (res.ok) {
        setVerifications(prev => prev.filter(v => v.id !== id))
      }
    } catch (error) {
      console.error('Verify error:', error)
    } finally {
      setProcessing(null)
    }
  }

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'bkash': return 'bg-pink-100 text-pink-700 border-pink-300'
      case 'nagad': return 'bg-orange-100 text-orange-700 border-orange-300'
      case 'rocket': return 'bg-purple-100 text-purple-700 border-purple-300'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const filteredVerifications = verifications.filter(v =>
    v.transactionId.toLowerCase().includes(search.toLowerCase()) ||
    v.order?.orderNumber?.toLowerCase().includes(search.toLowerCase()) ||
    v.order?.address?.name?.toLowerCase().includes(search.toLowerCase())
  )

  // Demo data if none from API
  const displayVerifications = filteredVerifications.length > 0 ? filteredVerifications : (filter === 'pending' ? [
    {
      id: '1',
      orderId: 'demo1',
      method: 'bkash',
      transactionId: 'ABC123XYZ',
      amount: 5079,
      status: 'pending',
      submittedAt: '10 minutes ago',
      order: {
        orderNumber: 'CTG1765730000',
        address: { name: 'Test User', phone: '01991523289' },
        items: [{ product: { name: 'Eau de Parfum' }, quantity: 1 }]
      }
    },
    {
      id: '2',
      orderId: 'demo2',
      method: 'nagad',
      transactionId: 'NGD456789',
      amount: 3499,
      status: 'pending',
      submittedAt: '25 minutes ago',
      order: {
        orderNumber: 'CTG1765730001',
        address: { name: 'Another User', phone: '01712345678' },
        items: [{ product: { name: 'Premium T-Shirt' }, quantity: 2 }]
      }
    }
  ] : [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">💳 Payment Verification</h1>
          <p className="text-muted-foreground">Verify manual bKash/Nagad/Rocket payments</p>
        </div>
        <Button onClick={fetchVerifications} variant="outline" size="icon">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          {(['pending', 'approved', 'rejected'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition capitalize ${
                filter === status
                  ? 'bg-white dark:bg-gray-700 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
              }`}
            >
              {status === 'pending' && <Clock className="w-4 h-4 inline mr-1" />}
              {status === 'approved' && <Check className="w-4 h-4 inline mr-1 text-green-600" />}
              {status === 'rejected' && <X className="w-4 h-4 inline mr-1 text-red-600" />}
              {status}
            </button>
          ))}
        </div>

        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search by TrxID, order, or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Verifications List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : displayVerifications.length === 0 ? (
        <Card className="p-12 text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <h3 className="text-xl font-semibold mb-2">No {filter} payments</h3>
          <p className="text-muted-foreground">
            {filter === 'pending' 
              ? 'All payments have been verified!' 
              : `No ${filter} payments to show.`}
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {displayVerifications.map((v) => (
            <Card key={v.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                  {/* Payment Info */}
                  <div className="flex-1 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${getMethodColor(v.method)}`}>
                          <Smartphone className="w-4 h-4" />
                          {v.method.toUpperCase()}
                        </span>
                        <h3 className="text-xl font-bold mt-2">{formatPrice(v.amount)}</h3>
                      </div>
                      <span className="text-sm text-muted-foreground">{v.submittedAt}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Transaction ID</p>
                        <p className="font-mono font-bold text-lg">{v.transactionId}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Order</p>
                        <p className="font-semibold">{v.order?.orderNumber}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Customer</p>
                        <p className="font-medium">{v.order?.address?.name}</p>
                        <p className="text-gray-500">{v.order?.address?.phone}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Items</p>
                        {v.order?.items?.slice(0, 2).map((item, idx) => (
                          <p key={idx} className="text-gray-600">
                            {item.quantity}x {item.product?.name}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  {filter === 'pending' && (
                    <div className="flex md:flex-col gap-2 p-4 bg-gray-50 dark:bg-gray-800 md:w-48">
                      <Button
                        onClick={() => handleVerify(v.id, 'approve')}
                        disabled={processing === v.id}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        onClick={() => handleVerify(v.id, 'reject')}
                        disabled={processing === v.id}
                        variant="destructive"
                        className="flex-1"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => window.open(`https://trx.bkash.com/?trxId=${v.transactionId}`, '_blank')}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Verify TrxID
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
