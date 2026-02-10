import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withCache, CacheKeys, CacheTTL } from '@/lib/cache'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Use cache to reduce database queries
    const categories = await withCache(
      CacheKeys.CATEGORIES_ACTIVE,
      CacheTTL.CATEGORIES,
      async () => {
        return await prisma.category.findMany({
          where: { isActive: true },
          include: {
            _count: {
              select: { products: true }
            }
          },
          orderBy: { name: 'asc' }
        })
      }
    )

    return NextResponse.json({ categories })
  } catch (error: any) {
    console.error('Categories API error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}
