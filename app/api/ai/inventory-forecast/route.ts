
import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth'
import { predictInventoryNeeds } from '@/lib/gemini-ai'

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

    const { productData, salesHistory } = await request.json()

    if (!productData) {
      return NextResponse.json({ error: 'Product data is required' }, { status: 400 })
    }

    const aiResponse = await predictInventoryNeeds({
      ...productData,
      salesLast30Days: salesHistory?.last30Days || 0,
      salesLast7Days: salesHistory?.last7Days || 0
    })

    if (!aiResponse.success) {
        return NextResponse.json({ error: aiResponse.error }, { status: 500 })
    }

    return NextResponse.json({ success: true, forecast: aiResponse.result })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
