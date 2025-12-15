import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const tranId = formData.get('tran_id') as string

    const payment = await prisma.payment.findFirst({
      where: { transactionId: tranId },
    })

    if (payment) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'cancelled' },
      })

      await prisma.order.update({
        where: { id: payment.orderId },
        data: { status: 'cancelled' },
      })
    }

    return NextResponse.redirect(new URL('/cart', request.url))
  } catch (error) {
    console.error('Payment cancel handler error:', error)
    return NextResponse.redirect(new URL('/cart', request.url))
  }
}

export async function GET(request: NextRequest) {
  return POST(request)
}
