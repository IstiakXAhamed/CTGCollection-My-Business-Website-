import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// POST - Approve a review
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await verifyAuth(request)
    if (!user || !['admin', 'superadmin', 'seller'].includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const reviewId = params.id

    const review = await prisma.review.update({
      where: { id: reviewId },
      data: { isApproved: true }
    })

    return NextResponse.json({ success: true, review })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
