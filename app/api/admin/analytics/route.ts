import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user || (user.role !== 'admin' && user.role !== 'superadmin' && user.role !== 'seller')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30d'

    // Calculate date range
    const days = period === '7d' ? 7 : period === '90d' ? 90 : 30
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const previousStartDate = new Date()
    previousStartDate.setDate(previousStartDate.getDate() - (days * 2))
    const previousEndDate = new Date()
    previousEndDate.setDate(previousEndDate.getDate() - days)

    // Get current period orders
    const currentOrders = await (prisma.order.findMany as any)({
      where: {
        createdAt: { gte: startDate },
        paymentStatus: 'paid'
      },
      include: {
        items: true
      }
    })

    // Get previous period orders for comparison
    const previousOrders = await (prisma.order.findMany as any)({
      where: {
        createdAt: { gte: previousStartDate, lt: previousEndDate },
        paymentStatus: 'paid'
      }
    })

    // Calculate revenue
    const currentRevenue = currentOrders.reduce((sum: number, o: any) => sum + o.total, 0)
    const previousRevenue = previousOrders.reduce((sum: number, o: any) => sum + o.total, 0)
    const revenueChange = previousRevenue > 0 
      ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 
      : 100

    // Get customers
    const totalCustomers = await (prisma.user.count as any)({
      where: { role: 'customer' }
    })

    const newCustomers = await (prisma.user.count as any)({
      where: {
        role: 'customer',
        createdAt: { gte: startDate }
      }
    })

    // Get products
    const totalProducts = await prisma.product.count()
    
    const lowStockProducts = await (prisma.variant.count as any)({
      where: { stock: { lte: 5, gt: 0 } }
    })

    const outOfStockProducts = await (prisma.variant.count as any)({
      where: { stock: 0 }
    })

    // Get top products
    const allItems = currentOrders.flatMap((o: any) => o.items || [])
    const productSales: Record<string, { name: string; sold: number; revenue: number }> = {}
    
    for (const item of allItems) {
      if (!productSales[item.productId]) {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: { name: true }
        })
        productSales[item.productId] = {
          name: product?.name || 'Unknown',
          sold: 0,
          revenue: 0
        }
      }
      productSales[item.productId].sold += item.quantity
      productSales[item.productId].revenue += item.price * item.quantity
    }

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)

    // Get recent orders
    const recentOrders = await (prisma.order.findMany as any)({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        orderNumber: true,
        total: true,
        status: true,
        createdAt: true
      }
    })

    // Format time ago
    const formatTimeAgo = (date: Date) => {
      const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000)
      if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`
      if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`
      return `${Math.floor(seconds / 86400)} days ago`
    }

    // Pending orders
    const pendingOrders = await (prisma.order.count as any)({
      where: {
        status: 'pending',
        createdAt: { gte: startDate }
      }
    })

    return NextResponse.json({
      revenue: {
        total: currentRevenue,
        change: parseFloat(revenueChange.toFixed(1)),
        period: `vs previous ${days} days`
      },
      orders: {
        total: currentOrders.length,
        change: previousOrders.length > 0 
          ? ((currentOrders.length - previousOrders.length) / previousOrders.length) * 100 
          : 100,
        pending: pendingOrders,
        completed: currentOrders.length - pendingOrders
      },
      customers: {
        total: totalCustomers,
        new: newCustomers,
        returning: totalCustomers - newCustomers
      },
      products: {
        total: totalProducts,
        lowStock: lowStockProducts,
        outOfStock: outOfStockProducts
      },
      topProducts,
      recentOrders: recentOrders.map((o: any) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        total: o.total,
        status: o.status,
        date: formatTimeAgo(o.createdAt)
      }))
    })
  } catch (error: any) {
    console.error('Analytics error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
