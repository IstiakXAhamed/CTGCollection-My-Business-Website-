import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withCache, CacheTTL } from '@/lib/cache'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '8')

    // Cache key includes limit to handle different page sizes
    const cacheKey = `products:featured:${limit}`
    
    const featuredProducts = await withCache(
      cacheKey,
      CacheTTL.PRODUCTS_LIST,
      async () => {
        return await prisma.product.findMany({
          where: {
            isFeatured: true,
            isActive: true
          },
          include: {
            category: { select: { name: true, slug: true } }
          },
          orderBy: { createdAt: 'desc' },
          take: limit
        })
      }
    )

    const productsWithImages = featuredProducts.map(p => {
      let images: string[] = []
      try {
        if (Array.isArray(p.images)) {
          images = p.images
        } else {
          images = JSON.parse(p.images as string || '[]')
        }
      } catch (err) {
        console.warn(`Parse error for product ${p.id}:`, err)
      }
      return { ...p, images }
    })

    return NextResponse.json({ products: productsWithImages })
  } catch (error: any) {
    console.error('Featured products API error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch featured products' },
      { status: 500 }
    )
  }
}
