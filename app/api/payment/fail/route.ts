import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const tranId = formData.get('tran_id') as string

    // Find and update payment
    const payment = await prisma.payment.findFirst({
      where: { transactionId: tranId },
    })

    if (payment) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'failed',
          gatewayResponse: JSON.stringify(Object.fromEntries(formData)),
        },
      })

      await prisma.order.update({
        where: { id: payment.orderId },
        data: { paymentStatus: 'failed' },
      })
    }

    return NextResponse.redirect(new URL('/order/failed', request.url))
  } catch (error) {
    console.error('Payment fail handler error:', error)
    return NextResponse.redirect(new URL('/order/failed', request.url))
  }
}

export async function GET(request: NextRequest) {
  return POST(request)
}
