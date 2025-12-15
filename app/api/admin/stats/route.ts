import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'

async function checkAdmin(request: NextRequest) {
  const user = await verifyAuth(request)
  // Allow both admin and superadmin roles
  if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
    return null
  }
  return user
}

export async function GET(request: NextRequest) {
  try {
    const admin = await checkAdmin(request)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get stats
    const [
      totalRevenue,
      totalOrders,
      pendingOrders,
      totalCustomers,
      totalProducts,
      recentOrders
    ] = await Promise.all([
      prisma.order.aggregate({
        where: { paymentStatus: 'paid' },
        _sum: { total: true }
      }),
      prisma.order.count(),
      prisma.order.count({ where: { status: 'pending' } }),
      prisma.user.count({ where: { role: 'customer' } }),
      prisma.product.count(),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true } }
        }
      })
    ])

    return NextResponse.json({
      totalRevenue: totalRevenue._sum.total || 0,
      totalOrders,
      pendingOrders,
      totalCustomers,
      totalProducts,
      recentOrders
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
