
import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth'
import { detectOrderFraud } from '@/lib/gemini-ai'

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

    const orderData = await request.json()

    if (!orderData) {
      return NextResponse.json({ error: 'Order data is required' }, { status: 400 })
    }

    const analysis = await detectOrderFraud(orderData)

    return NextResponse.json({ success: true, analysis })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
