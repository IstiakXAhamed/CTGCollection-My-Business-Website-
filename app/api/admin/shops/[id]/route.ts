import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'

// Type cast for new Shop model
const db = prisma as any

export const dynamic = 'force-dynamic'

// Check admin/superadmin access
async function checkAdmin(request: NextRequest) {
  const user = await verifyAuth(request)
  if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
    return null
  }
  return user
}

// GET - Get single shop
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await checkAdmin(request)
    if (!admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 401 })
    }

    const { id } = await params

    const shop = await db.shop.findUnique({
      where: { id },
      include: {
        owner: {
          select: { id: true, name: true, email: true, phone: true }
        },
        _count: {
          select: { products: true }
        }
      }
    })

    if (!shop) {
      return NextResponse.json({ error: 'Shop not found' }, { status: 404 })
    }

    return NextResponse.json({ shop })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT - Update shop
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await checkAdmin(request)
    if (!admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    // Check if shop exists
    const existingShop = await db.shop.findUnique({
      where: { id }
    })

    if (!existingShop) {
      return NextResponse.json({ error: 'Shop not found' }, { status: 404 })
    }

    // If slug is being changed, check if it's available
    if (body.slug && body.slug !== existingShop.slug) {
      const slugTaken = await db.shop.findUnique({
        where: { slug: body.slug }
      })
      if (slugTaken) {
        return NextResponse.json({ error: 'Shop slug already taken' }, { status: 400 })
      }
    }

    const shop = await db.shop.update({
      where: { id },
      data: {
        name: body.name,
        slug: body.slug?.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
        description: body.description,
        logo: body.logo,
        banner: body.banner,
        phone: body.phone,
        email: body.email,
        address: body.address,
        city: body.city,
        isVerified: body.isVerified,
        isActive: body.isActive
      }
    })

    return NextResponse.json({ success: true, shop })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE - Delete shop (superadmin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyAuth(request)
    if (!user || user.role !== 'superadmin') {
      return NextResponse.json({ error: 'Superadmin access required' }, { status: 401 })
    }

    const { id } = await params

    // Check if shop has products
    const shop = await db.shop.findUnique({
      where: { id },
      include: {
        _count: { select: { products: true } }
      }
    })

    if (!shop) {
      return NextResponse.json({ error: 'Shop not found' }, { status: 404 })
    }

    if (shop._count.products > 0) {
      return NextResponse.json({ 
        error: `Cannot delete shop with ${shop._count.products} products. Remove products first.` 
      }, { status: 400 })
    }

    await db.shop.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
