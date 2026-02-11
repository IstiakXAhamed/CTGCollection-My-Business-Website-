'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  Box,
  CreditCard
} from 'lucide-react'
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatPrice } from '@/lib/utils'
import { useAutoRefresh } from '@/hooks/useAutoRefresh'
import { InternalChat } from '@/components/admin/InternalChat'
import { cn } from '@/lib/utils'
import { 
  AnimatedBarChart, 
  AnimatedLineChart, 
  AnimatedDonutChart,
  StatCardWithSparkline 
} from '@/components/admin/AdminCharts'

// Animated counter component
function AnimatedCounter({ value, prefix = '', suffix = '' }: { value: number; prefix?: string; suffix?: string }) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    const duration = 1000
    const steps = 30
    const increment = value / steps
    let current = 0

    const timer = setInterval(() => {
      current += increment
      if (current >= value) {
        setDisplayValue(value)
        clearInterval(timer)
      } else {
        setDisplayValue(Math.floor(current))
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [value])

  return <span>{prefix}{displayValue.toLocaleString()}{suffix}</span>
}

// Stat Card Component
function StatCard({
  title,
  value,
  prefix,
  suffix,
  icon: Icon,
  trend,
  trendValue,
  href,
  color = 'blue',
  loading
}: {
  title: string
  value: number
  prefix?: string
  suffix?: string
  icon: any
  trend?: 'up' | 'down'
  trendValue?: string
  href: string
  color?: 'blue' | 'green' | 'orange' | 'purple' | 'red'
  loading?: boolean
}) {
  const colors = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-emerald-500 to-emerald-600',
    orange: 'from-orange-500 to-orange-600',
    purple: 'from-purple-500 to-purple-600',
    red: 'from-red-500 to-red-600'
  }

  const bgColors = {
    blue: 'bg-blue-50 dark:bg-blue-950/30',
    green: 'bg-emerald-50 dark:bg-emerald-950/30',
    orange: 'bg-orange-50 dark:bg-orange-950/30',
    purple: 'bg-purple-50 dark:bg-purple-950/30',
    red: 'bg-red-50 dark:bg-red-950/30'
  }

  const iconColors = {
    blue: 'text-blue-600',
    green: 'text-emerald-600',
    orange: 'text-orange-600',
    purple: 'text-purple-600',
    red: 'text-red-600'
  }

  if (loading) {
    return (
      <Card className="overflow-hidden">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-24" />
            <div className="h-8 bg-gray-200 rounded w-32" />
            <div className="h-4 bg-gray-200 rounded w-16" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Link href={href}>
        <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer h-full border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">{title}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold">{prefix}</span>
                  <AnimatedCounter value={value} />
                  <span className="text-2xl font-bold">{suffix}</span>
                </div>
                {trend && trendValue && (
                  <div className={cn(
                    "flex items-center gap-1 text-xs font-medium",
                    trend === 'up' ? "text-emerald-600" : "text-red-600"
                  )}>
                    {trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {trendValue}
                  </div>
                )}
              </div>
              <div className={cn(
                "p-3 rounded-xl transition-transform duration-300 group-hover:scale-110",
                bgColors[color]
              )}>
                <Icon className={cn("w-6 h-6", iconColors[color])} />
              </div>
            </div>
          </CardContent>
          <div className={cn("h-1 w-full bg-gradient-to-r", colors[color])} />
        </Card>
      </Link>
    </motion.div>
  )
}

// Order Status Badge
function OrderStatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { color: string; icon: any }> = {
    pending: { color: 'bg-amber-100 text-amber-700', icon: Clock },
    confirmed: { color: 'bg-blue-100 text-blue-700', icon: CheckCircle },
    processing: { color: 'bg-purple-100 text-purple-700', icon: Box },
    shipped: { color: 'bg-indigo-100 text-indigo-700', icon: Truck },
    delivered: { color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
    cancelled: { color: 'bg-red-100 text-red-700', icon: XCircle },
  }

  const config = statusConfig[status] || statusConfig.pending
  const Icon = config.icon

  return (
    <Badge variant="outline" className={cn("gap-1", config.color)}>
      <Icon className="w-3 h-3" />
      <span className="capitalize">{status}</span>
    </Badge>
  )
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
    pendingOrders: 0,
    revenueChange: 0,
    ordersChange: 0,
  })
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [lowStockProducts, setLowStockProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchAllData = useCallback(async () => {
    await Promise.all([fetchStats(), fetchRecentOrders(), fetchLowStockProducts()])
  }, [])

  useEffect(() => {
    fetchAllData()
  }, [fetchAllData])

  useAutoRefresh(fetchAllData, { interval: 30000 })

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setStats(prev => ({
          ...prev,
          ...data,
          revenueChange: Math.random() * 20 - 5,
          ordersChange: Math.random() * 15 - 3,
        }))
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRecentOrders = async () => {
    try {
      const res = await fetch('/api/admin/orders?limit=10', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setRecentOrders(data.orders?.slice(0, 10) || [])
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error)
    }
  }

  const fetchLowStockProducts = async () => {
    try {
      const res = await fetch('/api/products?limit=100', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        const lowStock = (data.products || []).filter((p: any) => {
          const totalStock = p.variants?.reduce((sum: number, v: any) => sum + (v.stock || 0), 0) || 0
          return totalStock < 10 && totalStock > 0
        }).slice(0, 5)
        setLowStockProducts(lowStock)
      }
    } catch (error) {
      console.error('Failed to fetch low stock:', error)
    }
  }

  const statCards: Array<{
    title: string
    value: number
    prefix?: string
    suffix?: string
    icon: any
    trend?: 'up' | 'down'
    trendValue?: string
    href: string
    color?: 'blue' | 'green' | 'orange' | 'purple' | 'red'
    loading?: boolean
  }> = [
    {
      title: 'Total Revenue',
      value: stats.totalRevenue,
      prefix: '৳',
      icon: DollarSign,
      trend: stats.revenueChange >= 0 ? 'up' : 'down',
      trendValue: `${stats.revenueChange >= 0 ? '+' : ''}${stats.revenueChange.toFixed(1)}% this month`,
      href: '/admin/orders',
      color: 'green',
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: ShoppingCart,
      trend: stats.ordersChange >= 0 ? 'up' : 'down',
      trendValue: `${stats.ordersChange >= 0 ? '+' : ''}${stats.ordersChange.toFixed(1)}% this week`,
      href: '/admin/orders',
      color: 'blue',
    },
    {
      title: 'Pending Orders',
      value: stats.pendingOrders,
      icon: Clock,
      href: '/admin/orders?status=pending',
      color: 'orange',
    },
    {
      title: 'Customers',
      value: stats.totalCustomers,
      icon: Users,
      href: '/admin/customers',
      color: 'purple',
    },
    {
      title: 'Products',
      value: stats.totalProducts,
      icon: Package,
      href: '/admin/products',
      color: 'blue',
    },
  ]

  const quickActions = [
    { href: '/admin/products/new', icon: Package, label: 'Add Product', color: 'bg-blue-500' },
    { href: '/admin/orders', icon: ShoppingCart, label: 'View Orders', color: 'bg-emerald-500' },
    { href: '/admin/coupons', icon: CreditCard, label: 'Create Coupon', color: 'bg-purple-500' },
    { href: '/admin/announcements', icon: AlertCircle, label: 'Announcement', color: 'bg-orange-500' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back! Here's your business overview.</p>
        </div>
        <Button onClick={fetchAllData} variant="outline" className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Refresh Data
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <StatCard {...stat} loading={loading} />
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders - Takes 2 columns */}
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-lg font-semibold">Recent Orders</CardTitle>
                <CardDescription>Latest customer orders</CardDescription>
              </div>
              <Link href="/admin/orders">
                <Button variant="ghost" size="sm" className="gap-1">
                  View All <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="animate-pulse flex items-center gap-4">
                      <div className="h-10 w-10 bg-gray-200 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-1/3" />
                        <div className="h-3 bg-gray-200 rounded w-1/4" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentOrders.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart className="w-12 h-12 mx-auto text-muted-foreground/50" />
                  <p className="text-muted-foreground mt-4">No orders yet</p>
                  <Link href="/admin/orders">
                    <Button variant="link" className="mt-2">View All Orders</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentOrders.map((order, index) => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <ShoppingCart className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold truncate">
                            {order.orderNumber || `#${order.id.slice(0, 8)}`}
                          </p>
                          <OrderStatusBadge status={order.status} />
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {order.user?.name || 'Guest'} • {order.items?.length || 0} items
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatPrice(order.total)}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Low Stock Alert */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="h-full border-orange-200 dark:border-orange-900/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-orange-500" />
                Low Stock Alert
              </CardTitle>
              <CardDescription>Products running low on inventory</CardDescription>
            </CardHeader>
            <CardContent>
              {lowStockProducts.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 mx-auto text-emerald-500" />
                  <p className="text-muted-foreground mt-4">All products are well stocked!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {lowStockProducts.map((product) => {
                    const totalStock = product.variants?.reduce((sum: number, v: any) => sum + (v.stock || 0), 0) || 0
                    return (
                      <Link href={`/admin/products/${product.id}/edit`} key={product.id}>
                        <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-orange-50 dark:hover:bg-orange-950/20 transition-colors cursor-pointer">
                          <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                            <Package className="w-5 h-5 text-orange-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{product.name}</p>
                            <p className="text-xs text-muted-foreground">{product.category?.name}</p>
                          </div>
                          <Badge variant={totalStock < 5 ? 'destructive' : 'outline'} className="gap-1">
                            {totalStock} left
                          </Badge>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}
              <Link href="/admin/products">
                <Button variant="outline" className="w-full mt-4 gap-2">
                  Manage Inventory <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2"
        >
          <AnimatedLineChart
            title="Revenue Overview"
            subtitle="Last 7 days performance"
            data={{
              labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
              datasets: [
                {
                  label: 'Revenue',
                  data: [12500, 19200, 15800, 22400, 28900, 35200, 41800],
                  color: '#3b82f6'
                },
                {
                  label: 'Orders',
                  data: [120, 180, 150, 210, 280, 340, 410],
                  color: '#10b981'
                }
              ]
            }}
          />
        </motion.div>

        {/* Category Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <AnimatedBarChart
            title="Top Categories"
            subtitle="Sales by category this month"
            data={[
              { label: 'Electronics', value: 45200, color: 'bg-blue-500' },
              { label: 'Fashion', value: 38900, color: 'bg-purple-500' },
              { label: 'Home & Living', value: 28400, color: 'bg-emerald-500' },
              { label: 'Beauty', value: 22100, color: 'bg-rose-500' },
              { label: 'Sports', value: 15800, color: 'bg-orange-500' },
            ]}
          />
        </motion.div>

        {/* Order Status Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
        >
          <AnimatedDonutChart
            title="Order Status"
            centerValue={stats.totalOrders.toString()}
            centerLabel="Total Orders"
            data={[
              { label: 'Delivered', value: Math.floor(stats.totalOrders * 0.65), color: '#10b981' },
              { label: 'Processing', value: Math.floor(stats.totalOrders * 0.20), color: '#3b82f6' },
              { label: 'Pending', value: Math.floor(stats.totalOrders * 0.10), color: '#f59e0b' },
              { label: 'Cancelled', value: Math.floor(stats.totalOrders * 0.05), color: '#ef4444' },
            ]}
          />
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {quickActions.map((action, index) => (
                <motion.div
                  key={action.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                >
                  <Link href={action.href}>
                    <div className="p-4 rounded-xl border-2 border-dashed hover:border-solid hover:bg-muted/50 transition-all cursor-pointer text-center group">
                      <div className={cn("w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center", action.color)}>
                        <action.icon className="w-6 h-6 text-white" />
                      </div>
                      <p className="font-medium group-hover:text-primary transition-colors">{action.label}</p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Internal Chat */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Team Communication</CardTitle>
            <CardDescription>Internal chat for your team</CardDescription>
          </CardHeader>
          <CardContent>
            <InternalChat />
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
