import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

async function checkAdmin(request: NextRequest) {
  const user = await verifyAuth(request)
  if (!user || (user.role !== 'admin' && user.role !== 'superadmin' && user.role !== 'seller')) {
    return null
  }
  return user
}

// Check if user can access this product
async function checkProductAccess(productId: string, user: any) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true, sellerId: true }
  })
  
  if (!product) return { product: null, hasAccess: false }
  
  // Admins and superadmins can access all products
  if (user.role === 'admin' || user.role === 'superadmin') {
    return { product, hasAccess: true }
  }
  
  // Sellers can only access their own products
  return { product, hasAccess: product.sellerId === user.id }
}

// GET single product by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await checkAdmin(request)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { hasAccess } = await checkProductAccess(params.id, admin)
    if (!hasAccess && admin.role === 'seller') {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        category: true,
        variants: true,
        seller: { select: { id: true, name: true, email: true } }
      }
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json({ product })
  } catch (error: any) {
    console.error('Get product error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}


// UPDATE Product
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await checkAdmin(request)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check ownership for sellers
    const { hasAccess } = await checkProductAccess(params.id, admin)
    if (!hasAccess) {
      return NextResponse.json({ error: 'Not authorized to modify this product' }, { status: 403 })
    }

    const body = await request.json()
    const {
      name,
      description,
      categoryId,
      basePrice,
      salePrice,
      images,
      isFeatured,
      isBestseller,
      isActive
    } = body

    const product = await prisma.product.update({
      where: { id: params.id },
      data: {
        name,
        description,
        categoryId,
        basePrice: parseFloat(basePrice),
        salePrice: salePrice ? parseFloat(salePrice) : null,
        images: JSON.stringify(images),
        isFeatured,
        isBestseller,
        isActive
      },
      include: {
        category: true,
        variants: true,
        seller: { select: { id: true, name: true, email: true } }
      }
    })

    return NextResponse.json(product)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE Product
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await checkAdmin(request)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check ownership for sellers
    const { hasAccess } = await checkProductAccess(params.id, admin)
    if (!hasAccess) {
      return NextResponse.json({ error: 'Not authorized to delete this product' }, { status: 403 })
    }

    // Delete variants first
    await prisma.productVariant.deleteMany({
      where: { productId: params.id }
    })

    // Delete product
    await prisma.product.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

