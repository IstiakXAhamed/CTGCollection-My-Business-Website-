import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'

// Check admin access
async function checkAdmin(request: NextRequest) {
  const user = await verifyAuth(request)
  if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
    return null
  }
  return user
}

// GET - Fetch inventory history logs
export async function GET(request: NextRequest) {
  try {
    const admin = await checkAdmin(request)
    if (!admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const reason = searchParams.get('reason')
    const search = searchParams.get('search')
    const productId = searchParams.get('productId')

    // Try to fetch logs - if model doesn't exist yet, return empty
    try {
      const logs = await (prisma as any).inventoryLog.findMany({
        where: {
          ...(reason ? { reason } : {}),
          ...(productId ? { productId } : {})
        },
        orderBy: { createdAt: 'desc' },
        take: 100
      })

      // Get stats
      const allLogs = await (prisma as any).inventoryLog.findMany()
      const stats = {
        totalChanges: allLogs.length,
        totalAdded: allLogs.filter((l: any) => l.change > 0).reduce((sum: number, l: any) => sum + l.change, 0),
        totalRemoved: Math.abs(allLogs.filter((l: any) => l.change < 0).reduce((sum: number, l: any) => sum + l.change, 0)),
        ordersProcessed: allLogs.filter((l: any) => l.reason === 'order').length,
        restocks: allLogs.filter((l: any) => l.reason === 'restock').length
      }

      return NextResponse.json({ logs, stats })
    } catch (e) {
      // Model doesn't exist yet
      return NextResponse.json({ 
        logs: [], 
        stats: { totalChanges: 0, totalAdded: 0, totalRemoved: 0, ordersProcessed: 0, restocks: 0 } 
      })
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST - Create inventory log entry
export async function POST(request: NextRequest) {
  try {
    const admin = await checkAdmin(request)
    if (!admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 401 })
    }

    const body = await request.json()
    const { productId, variantId, previousStock, newStock, reason, orderId, notes } = body

    if (!productId || previousStock === undefined || newStock === undefined || !reason) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const change = newStock - previousStock

    const log = await (prisma as any).inventoryLog.create({
      data: {
        productId,
        variantId,
        previousStock,
        newStock,
        change,
        reason,
        orderId,
        userId: admin.id,
        notes
      }
    })

    return NextResponse.json({ success: true, log })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// Utility function to log inventory changes (for use in other APIs)
export async function logInventoryChange(
  productId: string,
  previousStock: number,
  newStock: number,
  reason: string,
  userId: string,
  orderId?: string,
  variantId?: string,
  notes?: string
) {
  try {
    await (prisma as any).inventoryLog.create({
      data: {
        productId,
        variantId,
        previousStock,
        newStock,
        change: newStock - previousStock,
        reason,
        orderId,
        userId,
        notes
      }
    })
    return true
  } catch (error) {
    console.error('Failed to log inventory change:', error)
    return false
  }
}
