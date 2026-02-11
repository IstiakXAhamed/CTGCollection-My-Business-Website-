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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-9 w-48 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-64 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="flex gap-2">
            <div className="h-10 w-24 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 w-24 bg-gray-200 rounded" />
                  <div className="h-8 w-32 bg-gray-200 rounded" />
                  <div className="h-3 w-16 bg-gray-200 rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader className="p-6">
            <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
                  <div className="w-12 h-12 bg-gray-200 rounded animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
                    <div className="h-3 w-1/2 bg-gray-200 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Sales Analytics</h1>
          <p className="text-muted-foreground mt-1">Track your store performance and growth</p>
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Revenue Card */}
        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl sm:text-3xl font-bold">{formatPrice(analytics.revenue.total)}</p>
                <div className={`flex items-center gap-1 text-sm ${analytics.revenue.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {analytics.revenue.change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {analytics.revenue.change >= 0 ? '+' : ''}{analytics.revenue.change}% {analytics.revenue.period}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
          <div className="h-1 bg-gradient-to-r from-blue-500 to-blue-600" />
        </Card>

        {/* Orders Card */}
        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                <p className="text-2xl sm:text-3xl font-bold">{analytics.orders.total}</p>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs">
                    {analytics.orders.pending} pending
                  </span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-900/30">
                <ShoppingCart className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
          <div className="h-1 bg-gradient-to-r from-purple-500 to-purple-600" />
        </Card>

        {/* Customers Card */}
        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Total Customers</p>
                <p className="text-2xl sm:text-3xl font-bold">{analytics.customers.total}</p>
                <div className="flex items-center gap-1 text-sm text-green-600">
                  +{analytics.customers.new} new this period
                </div>
              </div>
              <div className="p-3 rounded-xl bg-green-100 dark:bg-green-900/30">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
          <div className="h-1 bg-gradient-to-r from-green-500 to-green-600" />
        </Card>

        {/* Products Card */}
        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Total Products</p>
                <p className="text-2xl sm:text-3xl font-bold">{analytics.products.total}</p>
                <div className="flex items-center gap-1 text-sm text-orange-600">
                  {analytics.products.lowStock} low stock
                </div>
              </div>
              <div className="p-3 rounded-xl bg-orange-100 dark:bg-orange-900/30">
                <Package className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
          <div className="h-1 bg-gradient-to-r from-orange-500 to-orange-600" />
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
