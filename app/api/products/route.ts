import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Pagination
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const skip = (page - 1) * limit

    // Filters
    const slug = searchParams.get('slug')
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const featured = searchParams.get('featured')
    const bestseller = searchParams.get('bestseller')
    
    // Sorting
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const order = searchParams.get('order') || 'desc'

    // Build where clause
    const where: any = { isActive: true }

    // If slug is provided, fetch only that specific product
    if (slug) {
      where.slug = slug
    }

    if (category && category !== 'All') {
      where.category = { name: category }
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (minPrice || maxPrice) {
      where.salePrice = {}
      if (minPrice) where.salePrice.gte = parseFloat(minPrice)
      if (maxPrice) where.salePrice.lte = parseFloat(maxPrice)
    }

    if (featured === 'true') where.isFeatured = true
    if (bestseller === 'true') where.isBestseller = true

    // Build orderBy
    const orderBy: any = {}
    if (sortBy === 'price') {
      orderBy.salePrice = order
    } else if (sortBy === 'name') {
      orderBy.name = order
    } else {
      orderBy.createdAt = order
    }

    // Fetch products with count
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: { select: { name: true, slug: true } },
          variants: { select: { id: true, size: true, color: true, stock: true, sku: true } },
          reviews: {
            where: { isApproved: true },
            include: { user: { select: { name: true } } },
            orderBy: { createdAt: 'desc' }
          }
        },
        orderBy,
        skip,
        take: limit
      }),
      prisma.product.count({ where })
    ])

    // Parse images JSON safely
    const productsWithImages = products.map(p => {
      let images: string[] = []
      try {
        // Handle both escaped and non-escaped JSON strings
        const imageStr = p.images as string || '[]'
        // Remove backslashes if present
        const cleanStr = imageStr.replace(/\\"/g, '"')
        images = JSON.parse(cleanStr)
      } catch (error) {
        console.error('Image parse error:', error)
        images = []
      }
      return { ...p, images }
    })

    return NextResponse.json({
      products: productsWithImages,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error: any) {
    console.error('Products API error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch products' },
      { status: 500 }
    )
  }
}
