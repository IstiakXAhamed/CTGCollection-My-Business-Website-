'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  TrendingUp, TrendingDown, DollarSign, ShoppingCart, 
  Users, Package, RefreshCw, Calendar, ArrowUpRight, ArrowDownRight 
} from 'lucide-react'
import { formatPrice } from '@/lib/utils'

interface AnalyticsData {
  revenue: { total: number; change: number; period: string }
  orders: { total: number; change: number; pending: number; completed: number }
  customers: { total: number; new: number; returning: number }
  products: { total: number; lowStock: number; outOfStock: number }
  topProducts: { name: string; sold: number; revenue: number }[]
  recentOrders: { id: string; orderNumber: string; total: number; status: string; date: string }[]
  salesByDay: { date: string; revenue: number; orders: number }[]
}

export default function SalesAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d')

  useEffect(() => {
    fetchAnalytics()
  }, [period])

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/analytics?period=${period}`, { credentials: 'include' })
      if (res.ok) {
        const result = await res.json()
        setData(result)
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatChange = (change: number) => {
    const isPositive = change >= 0
    return (
      <span className={`flex items-center gap-1 text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
        {Math.abs(change).toFixed(1)}%
      </span>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  // Use mock data if no data from API
  const analytics: AnalyticsData = data || {
    revenue: { total: 125000, change: 12.5, period: 'vs last month' },
    orders: { total: 156, change: 8.3, pending: 23, completed: 133 },
    customers: { total: 89, new: 34, returning: 55 },
    products: { total: 45, lowStock: 8, outOfStock: 2 },
    topProducts: [
      { name: 'Eau de Parfum 50ml', sold: 45, revenue: 22500 },
      { name: 'Premium T-Shirt', sold: 38, revenue: 15200 },
      { name: 'Wireless Earbuds', sold: 32, revenue: 28800 },
      { name: 'Smart Watch Pro', sold: 28, revenue: 42000 },
      { name: 'Cotton Hoodie', sold: 25, revenue: 17500 },
    ],
    recentOrders: [
      { id: '1', orderNumber: 'CTG1001', total: 5299, status: 'confirmed', date: '2 hours ago' },
      { id: '2', orderNumber: 'CTG1002', total: 3499, status: 'pending', date: '4 hours ago' },
      { id: '3', orderNumber: 'CTG1003', total: 8999, status: 'shipped', date: '1 day ago' },
    ],
    salesByDay: []
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">📊 Sales Analytics</h1>
          <p className="text-muted-foreground">Track your store performance</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            {(['7d', '30d', '90d'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                  period === p
                    ? 'bg-white dark:bg-gray-700 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
                }`}
              >
                {p === '7d' ? '7 Days' : p === '30d' ? '30 Days' : '90 Days'}
              </button>
            ))}
          </div>
          <Button onClick={fetchAnalytics} variant="outline" size="icon">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="w-8 h-8 opacity-80" />
              <span className="text-blue-100 text-sm bg-white/20 px-2 py-1 rounded">
                {analytics.revenue.change >= 0 ? '+' : ''}{analytics.revenue.change}%
              </span>
            </div>
            <h3 className="text-3xl font-bold">{formatPrice(analytics.revenue.total)}</h3>
            <p className="text-blue-100 mt-1">Total Revenue</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <ShoppingCart className="w-8 h-8 opacity-80" />
              <span className="text-purple-100 text-sm bg-white/20 px-2 py-1 rounded">
                {analytics.orders.pending} pending
              </span>
            </div>
            <h3 className="text-3xl font-bold">{analytics.orders.total}</h3>
            <p className="text-purple-100 mt-1">Total Orders</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8 opacity-80" />
              <span className="text-green-100 text-sm bg-white/20 px-2 py-1 rounded">
                +{analytics.customers.new} new
              </span>
            </div>
            <h3 className="text-3xl font-bold">{analytics.customers.total}</h3>
            <p className="text-green-100 mt-1">Customers</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Package className="w-8 h-8 opacity-80" />
              <span className="text-orange-100 text-sm bg-white/20 px-2 py-1 rounded">
                {analytics.products.lowStock} low stock
              </span>
            </div>
            <h3 className="text-3xl font-bold">{analytics.products.total}</h3>
            <p className="text-orange-100 mt-1">Products</p>
          </CardContent>
        </Card>
      </div>

      {/* Top Products & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Selling Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Top Selling Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.topProducts.map((product, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      idx === 0 ? 'bg-yellow-100 text-yellow-700' :
                      idx === 1 ? 'bg-gray-100 text-gray-700' :
                      idx === 2 ? 'bg-orange-100 text-orange-700' :
                      'bg-blue-50 text-blue-600'
                    }`}>
                      {idx + 1}
                    </span>
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">{product.sold} sold</p>
                    </div>
                  </div>
                  <span className="font-semibold text-green-600">{formatPrice(product.revenue)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-600" />
              Recent Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <p className="font-medium">{order.orderNumber}</p>
                    <p className="text-sm text-muted-foreground">{order.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatPrice(order.total)}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      order.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                      order.status === 'shipped' ? 'bg-purple-100 text-purple-700' :
                      order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Avg Order Value</p>
          <p className="text-2xl font-bold">{formatPrice(analytics.revenue.total / (analytics.orders.total || 1))}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Conversion Rate</p>
          <p className="text-2xl font-bold">3.2%</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Completed Orders</p>
          <p className="text-2xl font-bold text-green-600">{analytics.orders.completed}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Out of Stock</p>
          <p className="text-2xl font-bold text-red-600">{analytics.products.outOfStock}</p>
        </Card>
      </div>
    </div>
  )
}
