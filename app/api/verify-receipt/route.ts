import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { rateLimit } from '@/lib/rate-limit'
import { headers } from 'next/headers'

export const dynamic = 'force-dynamic'

const limiter = rateLimit({
  interval: 60 * 1000, // 60 seconds
  uniqueTokenPerInterval: 500,
})

export async function GET(request: NextRequest) {
  try {
    // Rate Limiting
    const headersList = headers()
    const ip = headersList.get('x-forwarded-for') || 'anonymous'
    try {
      await limiter.check(10, ip) // 10 requests per minute
    } catch {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const orderId = searchParams.get('orderId')

    if (!code || !orderId) {
      return NextResponse.json(
        { error: 'Verification code and Order ID are required' },
        { status: 400 }
      )
    }

    // Find order safely - limit check to Order Number matches
    // NOTE: Order Number is usually public (Invoice ID), verification code is the secret
    const order = await prisma.order.findFirst({
      where: {
        orderNumber: orderId,
        verificationCode: code
      },
      select: {
        id: true,
        orderNumber: true,
        createdAt: true,
        status: true,
        paymentStatus: true,
        total: true,
        user: {
          select: {
            name: true
          }
        },
        address: true,
        items: {
          select: {
            quantity: true,
            product: {
              select: {
                name: true
              }
            }
          }
        }
      }
    })

    if (!order) {
      return NextResponse.json(
        { valid: false, message: 'Invalid verification code or order ID' },
        { status: 404 }
      )
    }

    // Return limited public info
    const addressData = order.address as any
    const customerName = addressData?.name || order.user?.name || 'Customer'

    return NextResponse.json({
      valid: true,
      order: {
        orderNumber: order.orderNumber,
        date: order.createdAt,
        status: order.status,
        paymentStatus: order.paymentStatus,
        customerName: customerName,
        total: order.total,
        itemCount: order.items.length,
        items: order.items.map((i: any) => ({
          name: i.product.name,
          quantity: i.quantity
        }))
      }
    })

  } catch (error) {
    console.error('Verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
