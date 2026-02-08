import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth'
import { predictInventoryNeeds } from '@/lib/gemini-ai'
import { prisma } from '@/lib/prisma'

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

    const { productData } = await request.json()

    if (!productData || !productData.id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
    }

    const productId = productData.id
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    // Calculate real sales velocity from OrderItems
    // Note: We only count orders that are not 'cancelled'
    const orderItems = await prisma.orderItem.findMany({
      where: {
        productId: productId,
        createdAt: { gte: thirtyDaysAgo },
        order: {
          status: { notIn: ['cancelled'] }
        }
      },
      select: {
        quantity: true,
        createdAt: true
      }
    })

    const salesLast30Days = orderItems.reduce((sum, item) => sum + item.quantity, 0)
    const salesLast7Days = orderItems
      .filter(item => item.createdAt >= sevenDaysAgo)
      .reduce((sum, item) => sum + item.quantity, 0)

    console.log(`[AI Forecast] Real data for ${productData.name}: 30d=${salesLast30Days}, 7d=${salesLast7Days}`)

    const aiResponse = await predictInventoryNeeds({
      ...productData,
      salesLast30Days,
      salesLast7Days
    })

    if (!aiResponse.success) {
      return NextResponse.json({ error: aiResponse.error }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      forecast: aiResponse.result,
      actualSales: { thirtyDays: salesLast30Days, sevenDays: salesLast7Days }
    })
  } catch (error: any) {
    console.error('Inventory Forecast Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
