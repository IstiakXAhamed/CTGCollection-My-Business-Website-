import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user || !['admin', 'superadmin', 'seller'].includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')?.toUpperCase().trim()

    if (!code) {
      return NextResponse.json({ error: 'Verification code is required' }, { status: 400 })
    }

    const order = await prisma.order.findUnique({
      where: { verificationCode: code },
      include: {
        address: true,
        user: { select: { name: true, email: true } },
        items: {
          include: {
            product: {
              select: { name: true, images: true, hasWarranty: true, warrantyPeriod: true }
            }
          }
        }
      }
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json({ order })
  } catch (error: any) {
    console.error('Receipt lookup error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
