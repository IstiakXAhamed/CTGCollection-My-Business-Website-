import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// Debug endpoint - check raw products in database
export async function GET() {
  try {
    // Simple query without any complex filters or includes
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        isActive: true,
        categoryId: true,
        basePrice: true
      },
      take: 20
    })

    const count = await prisma.product.count()
    const activeCount = await prisma.product.count({ where: { isActive: true } })

    return NextResponse.json({
      message: 'Debug: Raw products from database',
      totalProducts: count,
      activeProducts: activeCount,
      products: products
    })
  } catch (error: any) {
    console.error('Debug error:', error)
    return NextResponse.json({
      error: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}
