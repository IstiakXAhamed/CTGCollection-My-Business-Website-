import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const tranId = formData.get('tran_id') as string
    const valId = formData.get('val_id') as string
    const status = formData.get('status') as string

    if (status === 'VALID' || status === 'VALIDATED') {
      // Find payment by transaction ID
      const payment = await prisma.payment.findFirst({
        where: { transactionId: tranId },
        include: { order: true },
      })

      if (payment) {
        // Update payment status
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: 'success',
            gatewayResponse: JSON.stringify(Object.fromEntries(formData)),
          },
        })

        // Update order status
        await prisma.order.update({
          where: { id: payment.orderId },
          data: {
            paymentStatus: 'paid',
            status: 'confirmed',
          },
        })

        // Redirect to success page
        return NextResponse.redirect(
          new URL(`/order/success?orderId=${payment.orderId}`, request.url)
        )
      }
    }

    // If validation fails, redirect to failure page
    return NextResponse.redirect(new URL('/order/failed', request.url))
  } catch (error) {
    console.error('Payment success handler error:', error)
    return NextResponse.redirect(new URL('/order/failed', request.url))
  }
}

export async function GET(request: NextRequest) {
  // Handle GET request for success callback
  return POST(request)
}
