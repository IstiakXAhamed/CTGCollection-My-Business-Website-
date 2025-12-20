import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// PUT - Update a review (owner only or admin)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const reviewId = params.id
    const body = await request.json()
    const { rating, comment } = body

    // Find the review
    const existing = await prisma.review.findUnique({
      where: { id: reviewId }
    })

    if (!existing) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 })
    }

    // Only owner or admin can update
    const isAdmin = user.role === 'admin' || user.role === 'superadmin' || user.role === 'seller'
    if (existing.userId !== user.id && !isAdmin) {
      return NextResponse.json({ error: 'Not authorized to update this review' }, { status: 403 })
    }

    const review = await prisma.review.update({
      where: { id: reviewId },
      data: {
        rating: rating || existing.rating,
        comment: comment !== undefined ? comment : existing.comment
      },
      include: {
        user: { select: { id: true, name: true } }
      }
    })

    return NextResponse.json({ review })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE - Delete a review (owner only or admin)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const reviewId = params.id

    // Find the review
    const existing = await prisma.review.findUnique({
      where: { id: reviewId }
    })

    if (!existing) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 })
    }

    // Only owner or admin can delete
    const isAdmin = user.role === 'admin' || user.role === 'superadmin' || user.role === 'seller'
    if (existing.userId !== user.id && !isAdmin) {
      return NextResponse.json({ error: 'Not authorized to delete this review' }, { status: 403 })
    }

    await prisma.review.delete({
      where: { id: reviewId }
    })

    return NextResponse.json({ success: true, message: 'Review deleted' })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
