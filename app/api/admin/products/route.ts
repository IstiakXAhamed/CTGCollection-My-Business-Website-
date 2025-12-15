import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'

// Admin-only middleware check
async function checkAdmin(request: NextRequest) {
  const user = await verifyAuth(request)
  // Allow both admin and superadmin roles
  if (!user || (user.role !== 'admin' && user.role !== 'superadmin' && user.role !== 'seller')) {
    return null
  }
  return user
}

// CREATE Product
export async function POST(request: NextRequest) {
  try {
    const admin = await checkAdmin(request)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      slug,
      description,
      categoryId,
      basePrice,
      salePrice,
      images,
      isFeatured,
      isBestseller,
      isActive,
      variants
    } = body

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        categoryId,
        basePrice: parseFloat(basePrice),
        salePrice: salePrice ? parseFloat(salePrice) : null,
        images: JSON.stringify(images),
        isFeatured: isFeatured || false,
        isBestseller: isBestseller || false,
        isActive: isActive !== false,
        variants: {
          create: variants?.map((v: any) => ({
            size: v.size,
            color: v.color,
            sku: v.sku || `${slug}-${v.size}-${v.color}`,
            stock: parseInt(v.stock) || 0
          })) || []
        }
      },
      include: {
        category: true,
        variants: true
      }
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error: any) {
    console.error('Create product error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
