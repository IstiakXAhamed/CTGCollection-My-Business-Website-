import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET /api/admin/refunds?status=...
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    
    // Auth check (simplified, middleware should handle)
    // ...

    const where: any = {}
    if (status && status !== 'all') where.status = status

    const refunds = await prisma.refundRequest.findMany({
      where,
      include: {
        user: { select: { name: true, email: true } },
        order: { select: { orderNumber: true, total: true, paymentMethod: true } }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ refunds })

  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

// PUT /api/admin/refunds
// Approve/Reject
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, action, note } = body // action: approve, reject, refund_processed

    if (!id || !action) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    
    // Get Current Admin ID
    const authRes = await fetch(new URL('/api/auth/me', req.url), { headers: req.headers })
    const authData = await authRes.json()
    const adminId = authData.user?.id

    let newStatus = 'pending'
    if (action === 'approve') newStatus = 'approved' // Approved but money not sent yet
    if (action === 'reject') newStatus = 'rejected'
    if (action === 'refund_processed') newStatus = 'refunded' // Money sent

    const updated = await prisma.refundRequest.update({
      where: { id },
      data: {
        status: newStatus,
        adminNote: note,
        processedAt: new Date(),
        processedBy: adminId
      }
    })
    
    // Send Email Notification
    if (updated.user?.email && newStatus !== 'pending') {
      import('@/lib/email').then(({ sendRefundStatusEmail }) => {
        sendRefundStatusEmail(updated.user.email, updated.order.orderNumber, newStatus, note).catch(console.error)
      })
    }

    return NextResponse.json({ success: true, refund: updated })

  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
