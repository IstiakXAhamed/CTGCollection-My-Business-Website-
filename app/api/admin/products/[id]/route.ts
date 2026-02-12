import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'
import { notifyPriceDrop } from '@/lib/push-notifications'

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

    // Get existing product to detect price drop
    const existingProduct = await prisma.product.findUnique({
      where: { id: params.id },
      select: { basePrice: true, salePrice: true, name: true, slug: true },
    })

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
      isActive,
      variants,
      productType,
      metaTitle,
      metaDescription,
      metaKeywords,
      variantPricing
    } = body

    const product = await prisma.product.update({
      where: { id: params.id },
      data: {
        name,
        description,
        categoryId,
        basePrice: parseFloat(basePrice),
        salePrice: (salePrice !== undefined && salePrice !== null && salePrice !== '') ? parseFloat(salePrice) : null,
        images: JSON.stringify(images),
        isFeatured,
        isBestseller,
        isActive,
        productType: productType || 'clothing',
        metaTitle,
        metaDescription,
        metaKeywords,
        variantPricing: variantPricing || false,
        variants: {
          deleteMany: {}, // Delete existing variants
          create: variants?.map((v: any) => ({
            size: v.size,
            color: v.color,
            sku: v.sku || `${params.id.slice(0, 8)}-${v.size}-${v.color}-${Date.now()}`,
            stock: parseInt(v.stock) || 0,
            price: v.price ? parseFloat(v.price.toString()) : null,
            salePrice: v.salePrice ? parseFloat(v.salePrice.toString()) : null
          })) || []
        }
      },
      include: {
        category: true,
        variants: true,
        seller: { select: { id: true, name: true, email: true } }
      }
    })

    // Detect price drop and send push notifications
    if (existingProduct) {
      const oldEffectivePrice = existingProduct.salePrice ?? existingProduct.basePrice
      const newSalePrice = (salePrice !== undefined && salePrice !== null && salePrice !== '') ? parseFloat(salePrice) : null
      const newEffectivePrice = newSalePrice ?? parseFloat(basePrice)

      if (newEffectivePrice < oldEffectivePrice) {
        notifyPriceDrop(
          params.id,
          product.name,
          product.slug,
          oldEffectivePrice,
          newEffectivePrice
        ).catch(e => console.log('Price drop notification error (non-blocking):', e))
      }
    }

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

