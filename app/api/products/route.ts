import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// Type cast for shop relation until prisma types regenerated
const db = prisma as any

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

    // Build where clause - simplified to fix display issue
    const where: any = { 
      isActive: true
    }

    // If slug is provided, fetch only that specific product
    if (slug) {
      where.slug = slug
    }

    if (category && category !== 'All') {
      where.OR = [
        { category: { slug: category } },
        { category: { name: { contains: category, mode: 'insensitive' } } }
      ]
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (minPrice || maxPrice) {
      where.basePrice = {}
      if (minPrice) where.basePrice.gte = parseFloat(minPrice)
      if (maxPrice) where.basePrice.lte = parseFloat(maxPrice)
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

    // Fetch products with count - with extra safety for cPanel environment
    console.log('Fetching products with where:', JSON.stringify(where))
    
    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          shop: { select: { id: true, name: true, slug: true, logo: true } },
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
      db.product.count({ where })
    ]).catch(err => {
      console.error('Database query failed:', err)
      return [[], 0]
    })
    
    console.log(`Found ${products.length} products (total: ${total})`)

    // Fetch settings for multi-vendor check safely
    let isMultiVendor = true
    try {
      const settings = await db.siteSettings.findFirst()
      if (settings) isMultiVendor = settings.multiVendorEnabled
    } catch (e) {
      console.error('Settings fetch failed, defaulting to multi-vendor true')
    }

    // Parse images JSON safely and handle Multi-Vendor logic
    const productsWithImages = (products || []).map((p: any) => {
      let images: string[] = []
      try {
        if (Array.isArray(p.images)) {
          images = p.images
        } else {
          const imageStr = p.images as string || '[]'
          const cleanStr = imageStr.replace(/\\"/g, '"')
          images = JSON.parse(cleanStr)
        }
      } catch (error) {
        console.error('Image parse error for product:', p.id, error)
        images = []
      }

      // If Multi-Vendor is disabled, hide shop info (appear as "Platform" products)
      const shopInfo = isMultiVendor ? p.shop : null

      return { ...p, images, shop: shopInfo }
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
