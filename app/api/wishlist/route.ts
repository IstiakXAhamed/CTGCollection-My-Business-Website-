import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const wishlist = await prisma.wishlist.findMany({
      where: { userId: user.id },
      include: {
        product: {
          include: {
            category: { select: { name: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    const wishlistWithImages = wishlist.map(item => ({
      ...item,
      product: {
        ...item.product,
        images: JSON.parse(item.product.images as string)
      }
    }))

    return NextResponse.json({ wishlist: wishlistWithImages })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { productId } = body

    // Check if already in wishlist
    const existing = await prisma.wishlist.findUnique({
      where: {
        userId_productId: {
          userId: user.id,
          productId
        }
      }
    })

    if (existing) {
      return NextResponse.json({ message: 'Already in wishlist' }, { status: 200 })
    }

    const wishlistItem = await prisma.wishlist.create({
      data: {
        userId: user.id,
        productId
      },
      include: {
        product: true
      }
    })

    return NextResponse.json(wishlistItem, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')

    if (!productId) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 })
    }

    await prisma.wishlist.delete({
      where: {
        userId_productId: {
          userId: user.id,
          productId
        }
      }
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
