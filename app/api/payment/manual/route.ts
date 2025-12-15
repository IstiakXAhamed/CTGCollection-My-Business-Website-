import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST - Submit manual payment for verification
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId, paymentMethod, transactionId } = body

    if (!orderId || !paymentMethod || !transactionId) {
      return NextResponse.json({ 
        error: 'Order ID, payment method, and transaction ID required' 
      }, { status: 400 })
    }

    // Verify order exists
    const order = await (prisma.order.findUnique as any)({
      where: { id: orderId }
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Update order with payment info
    await (prisma.order.update as any)({
      where: { id: orderId },
      data: {
        paymentMethod: paymentMethod,
        transactionId: transactionId,
        paymentStatus: 'pending_verification',
        status: 'payment_submitted'
      }
    })

    // Create payment verification record
    await (prisma.paymentVerification.create as any)({
      data: {
        orderId: orderId,
        method: paymentMethod,
        transactionId: transactionId,
        amount: order.total,
        status: 'pending',
        submittedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Payment submitted for verification',
      orderId: orderId,
      transactionId: transactionId
    })
  } catch (error: any) {
    console.error('Manual payment error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// GET - Get pending payment verifications (admin)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'pending'

    const verifications = await (prisma.paymentVerification.findMany as any)({
      where: { status },
      include: {
        order: {
          include: {
            address: true,
            items: { include: { product: true } }
          }
        }
      },
      orderBy: { submittedAt: 'desc' }
    })

    return NextResponse.json({ verifications })
  } catch (error: any) {
    console.error('Get verifications error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT - Verify or reject payment (admin)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { verificationId, action, notes } = body

    if (!verificationId || !action) {
      return NextResponse.json({ 
        error: 'Verification ID and action required' 
      }, { status: 400 })
    }

    const verification = await (prisma.paymentVerification.findUnique as any)({
      where: { id: verificationId },
      include: { order: true }
    })

    if (!verification) {
      return NextResponse.json({ error: 'Verification not found' }, { status: 404 })
    }

    if (action === 'approve') {
      // Approve payment
      await (prisma.paymentVerification.update as any)({
        where: { id: verificationId },
        data: {
          status: 'approved',
          verifiedAt: new Date(),
          notes
        }
      })

      // Update order
      await (prisma.order.update as any)({
        where: { id: verification.orderId },
        data: {
          paymentStatus: 'paid',
          status: 'confirmed'
        }
      })

      return NextResponse.json({
        success: true,
        message: 'Payment approved and order confirmed'
      })
    } else if (action === 'reject') {
      // Reject payment
      await (prisma.paymentVerification.update as any)({
        where: { id: verificationId },
        data: {
          status: 'rejected',
          verifiedAt: new Date(),
          notes
        }
      })

      await (prisma.order.update as any)({
        where: { id: verification.orderId },
        data: {
          paymentStatus: 'failed',
          status: 'payment_failed'
        }
      })

      return NextResponse.json({
        success: true,
        message: 'Payment rejected'
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error: any) {
    console.error('Verify payment error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
