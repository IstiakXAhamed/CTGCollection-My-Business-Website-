import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// POST /api/refunds
// Customer requests a refund
export async function POST(req: NextRequest) {
  try {
    const authRes = await fetch(new URL('/api/auth/me', req.url), { headers: req.headers })
    const authData = await authRes.json()
    if (!authData.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const userId = authData.user.id

    const body = await req.json()
    const { orderId, reason, amount, images } = body

    if (!orderId || !reason || !amount) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId }
    })

    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    if (order.userId !== userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

    // Check if refund already exists
    const existing = await prisma.refundRequest.findFirst({
       where: { orderId, status: { not: 'rejected' } } 
    })
    if (existing) {
       return NextResponse.json({ error: 'Refund request already exists' }, { status: 400 })
    }

    const refund = await prisma.refundRequest.create({
      data: {
        userId,
        orderId,
        amount: parseFloat(amount),
        reason,
        images: JSON.stringify(images || []),
        status: 'pending'
      }
    })

    // Notify admins (Email to be implemented)

    return NextResponse.json({ success: true, refund })

  } catch (error) {
    console.error('Refund request error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

// GET /api/refunds?orderId=...
// Check refund status
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const orderId = searchParams.get('orderId')
        
        if(!orderId) return NextResponse.json({ error: 'Missing orderId' }, { status: 400 })
            
        const refund = await prisma.refundRequest.findFirst({
            where: { orderId }
        })
        
        return NextResponse.json({ refund })
    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 })
    }
}
