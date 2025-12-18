import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'

// POST - Add admin reply to a review
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only admin/seller can reply
    const isAdmin = user.role === 'admin' || user.role === 'superadmin' || user.role === 'seller'
    if (!isAdmin) {
      return NextResponse.json({ error: 'Only admins can reply to reviews' }, { status: 403 })
    }

    const reviewId = params.id
    const body = await request.json()
    const { reply } = body

    if (!reply || reply.trim() === '') {
      return NextResponse.json({ error: 'Reply cannot be empty' }, { status: 400 })
    }

    // Find the review
    const existing = await prisma.review.findUnique({
      where: { id: reviewId }
    })

    if (!existing) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 })
    }

    // Update with admin reply
    const review = await prisma.review.update({
      where: { id: reviewId },
      data: {
        adminReply: reply.trim(),
        adminReplyAt: new Date(),
        adminReplyBy: user.id
      },
      include: {
        user: { select: { id: true, name: true } }
      }
    })

    return NextResponse.json({ success: true, review })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE - Remove admin reply from a review
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only admin/seller can delete reply
    const isAdmin = user.role === 'admin' || user.role === 'superadmin' || user.role === 'seller'
    if (!isAdmin) {
      return NextResponse.json({ error: 'Only admins can delete replies' }, { status: 403 })
    }

    const reviewId = params.id

    // Update to remove admin reply
    const review = await prisma.review.update({
      where: { id: reviewId },
      data: {
        adminReply: null,
        adminReplyAt: null,
        adminReplyBy: null
      }
    })

    return NextResponse.json({ success: true, message: 'Reply deleted' })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
