import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// Admin-only middleware check
async function checkAdmin(request: NextRequest) {
  const user = await verifyAuth(request)
  // Allow both admin and superadmin roles
  if (!user || (user.role !== 'admin' && user.role !== 'superadmin' && user.role !== 'seller')) {
    return null
  }
  return user
}

// GET Products (with seller filtering)
export async function GET(request: NextRequest) {
  try {
    const admin = await checkAdmin(request)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    // Sellers only see their own products, admins see all
    const whereClause = admin.role === 'seller' 
      ? { sellerId: admin.id }
      : {}

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: whereClause,
        include: {
          category: true,
          variants: true,
          seller: { select: { id: true, name: true, email: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.product.count({ where: whereClause })
    ])

    // Parse images JSON for each product
    const productsWithParsedImages = products.map((p: any) => {
      let images: string[] = []
      try {
        const imageStr = p.images as string || '[]'
        const cleanStr = imageStr.replace(/\\"/g, '"')
        images = JSON.parse(cleanStr)
      } catch (error) {
        console.error('Image parse error:', error)
        images = []
      }
      return { ...p, images }
    })

    return NextResponse.json({
      products: productsWithParsedImages,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error: any) {
    console.error('Get products error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
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
      variants,
      // New Fields
      productType,
      metaTitle,
      metaDescription,
      metaKeywords
    } = body

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        categoryId,
        sellerId: admin.id, // Set seller to the logged-in user
        basePrice: parseFloat(basePrice),
        salePrice: (salePrice !== undefined && salePrice !== null && salePrice !== '') ? parseFloat(salePrice) : null,
        images: JSON.stringify(images),
        isFeatured: isFeatured || false,
        isBestseller: isBestseller || false,
        isActive: isActive !== false,
        // Smart Fields
        productType: productType || 'clothing',
        metaTitle,
        metaDescription,
        metaKeywords,
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
        variants: true,
        seller: { select: { id: true, name: true, email: true } }
      }
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error: any) {
    console.error('Create product error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

