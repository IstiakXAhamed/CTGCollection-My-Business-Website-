import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createBkashPayment, executeBkashPayment } from '@/lib/bkash'

// POST - Create bKash payment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId, amount, phone } = body

    if (!orderId || !amount) {
      return NextResponse.json({ error: 'Order ID and amount required' }, { status: 400 })
    }

    // Verify order exists
    const order = await (prisma.order.findUnique as any)({
      where: { id: orderId }
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Create bKash payment
    const callbackURL = `${process.env.NEXT_PUBLIC_URL}/api/payment/bkash/callback`
    
    const result = await createBkashPayment({
      orderId,
      amount: parseFloat(amount),
      payerReference: phone || '01991523289',
      callbackURL
    })

    if (result.success) {
      // Save payment ID to order
      await (prisma.order.update as any)({
        where: { id: orderId },
        data: { 
          paymentId: result.paymentID,
          paymentMethod: 'bkash'
        }
      })

      return NextResponse.json({
        success: true,
        paymentID: result.paymentID,
        bkashURL: result.bkashURL,
        message: 'Redirect customer to bKash'
      })
    }

    return NextResponse.json({ 
      success: false, 
      error: result.message 
    }, { status: 400 })
  } catch (error: any) {
    console.error('bKash payment error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
