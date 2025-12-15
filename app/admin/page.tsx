'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Package, ShoppingCart, Users, DollarSign, TrendingUp, AlertCircle, RefreshCw } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { Button } from '@/components/ui/button'

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

  useEffect(() => {
    fetchStats()
    fetchRecentOrders()
    fetchLowStockProducts()
  }, [])

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
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's what's happening with your store.</p>
        </div>
        <Button onClick={() => { fetchStats(); fetchRecentOrders(); fetchLowStockProducts(); }} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Link href={stat.href} key={stat.title}>
              <Card className="hover:shadow-lg transition cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                    <div className={`w-12 h-12 rounded-full ${stat.bgColor} flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <h2 className="text-xl font-semibold">Recent Orders</h2>
            <Link href="/admin/orders" className="text-sm text-blue-600 hover:underline">View All</Link>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No orders yet</p>
            ) : (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between pb-4 border-b last:border-0">
                    <div>
                      <p className="font-semibold">{order.orderNumber || `#${order.id.slice(0, 8)}`}</p>
                      <p className="text-sm text-muted-foreground">{order.user?.name || 'Guest'}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatPrice(order.total)}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${statusColors[order.status] || 'bg-gray-100'}`}>
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
          <CardHeader className="flex flex-row items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              Low Stock Alert
            </h2>
            <Link href="/admin/products" className="text-sm text-blue-600 hover:underline">View All</Link>
          </CardHeader>
          <CardContent>
            {lowStockProducts.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">All products are well stocked!</p>
            ) : (
              <div className="space-y-4">
                {lowStockProducts.map((product) => {
                  const totalStock = product.variants?.reduce((sum: number, v: any) => sum + (v.stock || 0), 0) || 0
                  return (
                    <div key={product.id} className="flex items-center justify-between pb-4 border-b last:border-0">
                      <div>
                        <p className="font-semibold">{product.name}</p>
                        <p className="text-sm text-muted-foreground">{product.category?.name || 'Uncategorized'}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-semibold ${totalStock < 5 ? 'text-red-600' : 'text-orange-600'}`}>
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
        <CardHeader>
          <h2 className="text-xl font-semibold">Quick Actions</h2>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/admin/products/new" className="p-4 border-2 border-dashed rounded-lg text-center hover:border-blue-600 hover:bg-blue-50 transition">
              <Package className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <p className="font-semibold">Add Product</p>
            </Link>
            <Link href="/admin/orders" className="p-4 border-2 border-dashed rounded-lg text-center hover:border-blue-600 hover:bg-blue-50 transition">
              <ShoppingCart className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <p className="font-semibold">View Orders</p>
            </Link>
            <Link href="/admin/customers" className="p-4 border-2 border-dashed rounded-lg text-center hover:border-blue-600 hover:bg-blue-50 transition">
              <Users className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <p className="font-semibold">Manage Users</p>
            </Link>
            <Link href="/admin/coupons" className="p-4 border-2 border-dashed rounded-lg text-center hover:border-blue-600 hover:bg-blue-50 transition">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <p className="font-semibold">Create Coupon</p>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
