import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// IPN (Instant Payment Notification) handler
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tran_id, status, val_id } = body

    if (status === 'VALID' || status === 'VALIDATED') {
      const payment = await prisma.payment.findFirst({
        where: { transactionId: tran_id },
      })

      if (payment && payment.status !== 'success') {
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: 'success',
            gatewayResponse: JSON.stringify(body),
          },
        })

        await prisma.order.update({
          where: { id: payment.orderId },
          data: {
            paymentStatus: 'paid',
            status: 'confirmed',
          },
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('IPN handler error:', error)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
