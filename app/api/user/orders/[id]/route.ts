import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const order = await prisma.order.findFirst({
      where: { id: params.id, userId: user.id },
      include: {
        items: {
          include: {
            product: {
              select: { name: true, slug: true, images: true }
            }
          }
        },
        address: true,
        payment: true
      }
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const orderWithImages = {
      ...order,
      items: order.items.map(item => ({
        ...item,
        product: {
          ...item.product,
          images: JSON.parse(item.product.images as string)
        }
      }))
    }

    return NextResponse.json(orderWithImages)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
