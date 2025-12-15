'use client'

import { useState, useEffect } from 'react'
import { 
  Package, RefreshCw, Search, Filter, Calendar, ArrowUp, ArrowDown,
  Minus, Plus, RotateCcw, Truck, AlertTriangle
} from 'lucide-react'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatPrice } from '@/lib/utils'

interface InventoryLog {
  id: string
  productId: string
  variantId?: string
  previousStock: number
  newStock: number
  change: number
  reason: string
  orderId?: string
  userId: string
  notes?: string
  createdAt: string
  product?: { name: string; sku: string }
}

const reasonLabels: Record<string, { label: string; icon: any; color: string }> = {
  order: { label: 'Order', icon: Truck, color: 'bg-blue-100 text-blue-700' },
  restock: { label: 'Restock', icon: Plus, color: 'bg-green-100 text-green-700' },
  adjustment: { label: 'Adjustment', icon: Minus, color: 'bg-yellow-100 text-yellow-700' },
  return: { label: 'Return', icon: RotateCcw, color: 'bg-purple-100 text-purple-700' },
  damaged: { label: 'Damaged', icon: AlertTriangle, color: 'bg-red-100 text-red-700' }
}

export default function InventoryHistoryPage() {
  const [logs, setLogs] = useState<InventoryLog[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [reasonFilter, setReasonFilter] = useState('')
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    fetchLogs()
  }, [reasonFilter])

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (reasonFilter) params.set('reason', reasonFilter)
      if (search) params.set('search', search)
      
      const res = await fetch(`/api/admin/inventory-history?${params}`, { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setLogs(data.logs || [])
        setStats(data.stats)
      }
    } catch (err) {
      console.error('Failed to fetch inventory history:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchLogs()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Package className="w-8 h-8 text-blue-600" />
            Inventory History
          </h1>
          <p className="text-gray-600 mt-1">Track all stock changes across products</p>
        </div>
        <Button variant="outline" onClick={fetchLogs}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-blue-600">{stats.totalChanges || 0}</p>
              <p className="text-sm text-gray-500">Total Changes</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-green-600">+{stats.totalAdded || 0}</p>
              <p className="text-sm text-gray-500">Added</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-red-600">-{stats.totalRemoved || 0}</p>
              <p className="text-sm text-gray-500">Removed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-purple-600">{stats.ordersProcessed || 0}</p>
              <p className="text-sm text-gray-500">Orders</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-orange-600">{stats.restocks || 0}</p>
              <p className="text-sm text-gray-500">Restocks</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-[200px]">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by product name or SKU..."
                  className="pl-10"
                />
              </div>
              <Button type="submit">Search</Button>
            </form>
            
            <select
              value={reasonFilter}
              onChange={(e) => setReasonFilter(e.target.value)}
              className="px-3 py-2 border rounded-lg"
            >
              <option value="">All Reasons</option>
              <option value="order">Orders</option>
              <option value="restock">Restocks</option>
              <option value="adjustment">Adjustments</option>
              <option value="return">Returns</option>
              <option value="damaged">Damaged</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardContent className="p-0">
          {logs.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-600">No inventory changes recorded yet</p>
              <p className="text-sm text-gray-400">Stock changes will appear here as they happen</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Product</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Reason</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Previous</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Change</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">New</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {logs.map((log) => {
                    const reasonInfo = reasonLabels[log.reason] || reasonLabels.adjustment
                    const ReasonIcon = reasonInfo.icon
                    return (
                      <tr key={log.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm">
                          <div className="flex items-center gap-1 text-gray-500">
                            <Calendar className="w-3 h-3" />
                            {new Date(log.createdAt).toLocaleDateString()}
                          </div>
                          <p className="text-xs text-gray-400">
                            {new Date(log.createdAt).toLocaleTimeString()}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium">{log.product?.name || log.productId}</p>
                          {log.product?.sku && (
                            <p className="text-xs text-gray-500">SKU: {log.product.sku}</p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${reasonInfo.color}`}>
                            <ReasonIcon className="w-3 h-3" />
                            {reasonInfo.label}
                          </span>
                          {log.orderId && (
                            <p className="text-xs text-gray-400 mt-1">Order: {log.orderId.slice(0, 8)}...</p>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center font-mono">{log.previousStock}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`font-bold flex items-center justify-center gap-1 ${log.change > 0 ? 'text-green-600' : log.change < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                            {log.change > 0 ? <ArrowUp className="w-3 h-3" /> : log.change < 0 ? <ArrowDown className="w-3 h-3" /> : null}
                            {log.change > 0 ? '+' : ''}{log.change}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center font-mono font-bold">{log.newStock}</td>
                        <td className="px-4 py-3 text-sm text-gray-500 max-w-[200px] truncate">
                          {log.notes || '-'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
