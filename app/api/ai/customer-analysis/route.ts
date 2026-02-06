
import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateCustomerPersona } from '@/lib/gemini-ai'

export const dynamic = 'force-dynamic'

async function checkAdmin(request: NextRequest) {
  const user = await verifyAuth(request)
  if (!user || (user.role !== 'admin' && user.role !== 'superadmin' && user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
    return null
  }
  return user
}

export async function POST(request: NextRequest) {
  try {
    const admin = await checkAdmin(request)
    if (!admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 401 })
    }

    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Fetch user order stats
    const orders = await prisma.order.findMany({
      where: { userId },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
      take: 50
    })

    if (orders.length === 0) {
      return NextResponse.json({ 
        success: false, 
        message: 'No orders found for this user',
        analysis: null 
      })
    }

    const totalOrders = orders.length
    const totalSpent = orders.reduce((sum: number, order: any) => sum + order.total, 0)
    const avgOrderValue = totalSpent / totalOrders
    
    // Calculate top categories
    const categoryCounts: Record<string, number> = {}
    orders.forEach((order: any) => {
      order.items.forEach((item: any) => {
        if (item.product?.category) {
          categoryCounts[item.product.category] = (categoryCounts[item.product.category] || 0) + 1
        }
      })
    })

    const topCategories = Object.entries(categoryCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([cat]) => cat)

    const lastOrderDate = orders[0].createdAt.toISOString().split('T')[0]

    // AI Analysis
    const aiResponse = await generateCustomerPersona({
      totalOrders,
      avgOrderValue,
      topCategories,
      lastOrderDate
    })

    if (!aiResponse.success) {
      return NextResponse.json({ error: aiResponse.error }, { status: 500 })
    }

    return NextResponse.json({ success: true, analysis: aiResponse.result })
  } catch (error: any) {
    console.error('Customer analysis error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
