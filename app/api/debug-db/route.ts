import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const productsCount = await prisma.product.count()
    const activeProductsCount = await prisma.product.count({ where: { isActive: true } })
    const featuredProductsCount = await prisma.product.count({ where: { isFeatured: true } })
    const categoriesCount = await prisma.category.count()
    const siteSettings = await (prisma as any).siteSettings.findFirst()
    
    return NextResponse.json({
      success: true,
      data: {
        products: {
          total: productsCount,
          active: activeProductsCount,
          featured: featuredProductsCount
        },
        categories: {
          total: categoriesCount
        },
        settings: {
          exists: !!siteSettings,
          multiVendor: siteSettings?.multiVendorEnabled
        }
      }
    })
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}
