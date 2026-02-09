import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'
import { safeParallel } from '@/lib/concurrency'

export const dynamic = 'force-dynamic'

// Simple in-memory cache to prevent NPROC spikes on rapid refreshes
let cachedStats: any = null
let lastFetch = 0
const CACHE_TTL = 30 * 1000 // 30 seconds

async function checkAdmin(request: NextRequest) {
  const user = await verifyAuth(request)
  if (!user || (user.role !== 'admin' && user.role !== 'superadmin' && user.role !== 'seller')) {
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

    // Return cached stats if fresh to save Entry Processes
    const now = Date.now()
    if (cachedStats && (now - lastFetch < CACHE_TTL)) {
      return NextResponse.json(cachedStats)
    }

    // Define tasks for safeParallel (Limit 2 at a time for NPROC safety)
    const tasks = [
      () => prisma.order.aggregate({ where: { paymentStatus: 'paid' }, _sum: { total: true } }),
      () => prisma.order.count(),
      () => prisma.order.count({ where: { status: 'pending' } }),
      () => prisma.user.count({ where: { role: 'customer' } }),
      () => prisma.product.count(),
      () => prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true } } }
      })
    ]

    const results = await safeParallel<any>(tasks, 2)

    cachedStats = {
      totalRevenue: results[0]._sum.total || 0,
      totalOrders: results[1],
      pendingOrders: results[2],
      totalCustomers: results[3],
      totalProducts: results[4],
      recentOrders: results[5]
    }
    
    lastFetch = now
    return NextResponse.json(cachedStats)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
