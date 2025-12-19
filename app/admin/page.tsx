'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Package, ShoppingCart, Users, DollarSign, TrendingUp, AlertCircle, RefreshCw } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useAutoRefresh } from '@/hooks/useAutoRefresh'
import { InternalChat } from '@/components/admin/InternalChat'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
    pendingOrders: 0
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

  // Auto-refresh every 30 seconds and on tab focus
  useAutoRefresh(fetchAllData, { interval: 30000 })

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRecentOrders = async () => {
    try {
      const res = await fetch('/api/admin/orders?limit=5', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setRecentOrders(data.orders?.slice(0, 5) || [])
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error)
    }
  }

  const fetchLowStockProducts = async () => {
    try {
      const res = await fetch('/api/products?limit=50', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        // Filter products with low total stock
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

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    processing: 'bg-purple-100 text-purple-800',
    shipped: 'bg-indigo-100 text-indigo-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  }

  const statCards = [
    {
      title: 'Total Revenue',
      value: formatPrice(stats.totalRevenue),
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      href: '/admin/orders'
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      href: '/admin/orders'
    },
    {
      title: 'Pending Orders',
      value: stats.pendingOrders,
      icon: AlertCircle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      href: '/admin/orders?status=pending'
    },
    {
      title: 'Customers',
      value: stats.totalCustomers,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      href: '/admin/customers'
    },
    {
      title: 'Products',
      value: stats.totalProducts,
      icon: Package,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
      href: '/admin/products'
    }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Header - stacks on mobile */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1">Dashboard</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">Welcome back! Here's what's happening.</p>
        </div>
        <Button onClick={() => { fetchStats(); fetchRecentOrders(); fetchLowStockProducts(); }} variant="outline" size="sm" className="self-start sm:self-auto">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Grid - 2 cols on mobile, 3 on sm, 5 on lg */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 lg:gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Link href={stat.href} key={stat.title}>
              <Card className="hover:shadow-lg transition cursor-pointer h-full">
                <CardContent className="p-3 sm:p-4 lg:p-6">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] sm:text-xs text-muted-foreground mb-0.5 sm:mb-1 truncate">{stat.title}</p>
                      <p className="text-base sm:text-lg lg:text-2xl font-bold truncate">{stat.value}</p>
                    </div>
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full ${stat.bgColor} flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
        {/* Recent Orders */}
        <Card>
          <CardHeader className="p-3 sm:p-4 lg:p-6 flex flex-row items-center justify-between">
            <h2 className="text-sm sm:text-base lg:text-xl font-semibold">Recent Orders</h2>
            <Link href="/admin/orders" className="text-xs sm:text-sm text-blue-600 hover:underline">View All</Link>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 lg:p-6 pt-0">
            {recentOrders.length === 0 ? (
              <p className="text-muted-foreground text-center py-4 text-sm">No orders yet</p>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between pb-3 border-b last:border-0 last:pb-0">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-xs sm:text-sm truncate">{order.orderNumber || `#${order.id.slice(0, 8)}`}</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{order.user?.name || 'Guest'}</p>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <p className="font-semibold text-xs sm:text-sm">{formatPrice(order.total)}</p>
                      <span className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full ${statusColors[order.status] || 'bg-gray-100'}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Low Stock Products */}
        <Card>
          <CardHeader className="p-3 sm:p-4 lg:p-6 flex flex-row items-center justify-between">
            <h2 className="text-sm sm:text-base lg:text-xl font-semibold flex items-center gap-1 sm:gap-2">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
              Low Stock
            </h2>
            <Link href="/admin/products" className="text-xs sm:text-sm text-blue-600 hover:underline">View All</Link>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 lg:p-6 pt-0">
            {lowStockProducts.length === 0 ? (
              <p className="text-muted-foreground text-center py-4 text-sm">All products are well stocked!</p>
            ) : (
              <div className="space-y-3">
                {lowStockProducts.map((product) => {
                  const totalStock = product.variants?.reduce((sum: number, v: any) => sum + (v.stock || 0), 0) || 0
                  return (
                    <div key={product.id} className="flex items-center justify-between pb-3 border-b last:border-0 last:pb-0">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-xs sm:text-sm truncate">{product.name}</p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{product.category?.name || 'Uncategorized'}</p>
                      </div>
                      <div className="text-right flex-shrink-0 ml-2">
                        <p className={`text-xs sm:text-sm font-semibold ${totalStock < 5 ? 'text-red-600' : 'text-orange-600'}`}>
                          {totalStock} left
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader className="p-3 sm:p-4 lg:p-6">
          <h2 className="text-base sm:text-lg lg:text-xl font-semibold">Quick Actions</h2>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 lg:p-6 pt-0">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
            <Link href="/admin/products/new" className="p-3 sm:p-4 border-2 border-dashed rounded-lg text-center hover:border-blue-600 hover:bg-blue-50 transition">
              <Package className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-1 sm:mb-2 text-blue-600" />
              <p className="text-xs sm:text-sm font-semibold">Add Product</p>
            </Link>
            <Link href="/admin/orders" className="p-3 sm:p-4 border-2 border-dashed rounded-lg text-center hover:border-blue-600 hover:bg-blue-50 transition">
              <ShoppingCart className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-1 sm:mb-2 text-blue-600" />
              <p className="text-xs sm:text-sm font-semibold">View Orders</p>
            </Link>
            <Link href="/admin/customers" className="p-3 sm:p-4 border-2 border-dashed rounded-lg text-center hover:border-blue-600 hover:bg-blue-50 transition">
              <Users className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-1 sm:mb-2 text-blue-600" />
              <p className="text-xs sm:text-sm font-semibold">Manage Users</p>
            </Link>
            <Link href="/admin/coupons" className="p-3 sm:p-4 border-2 border-dashed rounded-lg text-center hover:border-blue-600 hover:bg-blue-50 transition">
              <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-1 sm:mb-2 text-blue-600" />
              <p className="text-xs sm:text-sm font-semibold">Create Coupon</p>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Internal Chat System */}
      <div className="pt-4">
        <h2 className="text-xl font-bold mb-4">Internal Team Chat</h2>
        <InternalChat />
      </div>
    </div>
  )
}
