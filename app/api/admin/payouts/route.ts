import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET /api/admin/payouts?status=...
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')

    const where: any = {}
    if (status && status !== 'all') where.status = status

    const payouts = await (prisma as any).payoutRequest.findMany({
      where,
      include: {
        user: { select: { name: true, email: true, shop: { select: { name: true } } } }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ payouts })

  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

// PUT /api/admin/payouts
// Approve/Reject
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, action, note } = body // action: approve, reject, mark_paid

    if (!id || !action) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

    let newStatus = 'pending'
    if (action === 'approve') newStatus = 'approved'
    if (action === 'reject') newStatus = 'rejected'
    if (action === 'mark_paid') newStatus = 'paid'

    const updated = await (prisma as any).payoutRequest.update({
      where: { id },
      data: {
        status: newStatus,
        adminNote: note,
        processedAt: new Date()
      }
    })
    
    // Send Email Notification
    if (updated.user?.email && newStatus !== 'pending') {
      import('@/lib/email').then(({ sendPayoutStatusEmail }) => {
        sendPayoutStatusEmail(updated.user.email, updated.amount, newStatus, action === 'mark_paid' ? note : adminNote).catch(console.error)
      })
    }

    return NextResponse.json({ success: true, payout: updated })

  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
