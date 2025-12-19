import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Type cast for new Shop model
const db = prisma as any

export const dynamic = 'force-dynamic'

// GET - Public shop page data
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    // Check if multi-vendor is enabled
    const settings = await db.siteSettings.findUnique({
      where: { id: 'main' },
      select: { multiVendorEnabled: true, storeName: true }
    })

    if (!settings?.multiVendorEnabled) {
      return NextResponse.json({ 
        error: 'Shop pages are not available in single-vendor mode' 
      }, { status: 404 })
    }

    const shop = await db.shop.findUnique({
      where: { slug, isActive: true },
      include: {
        owner: {
          select: { id: true, name: true }
        },
        products: {
          where: { isActive: true },
          take: 20,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            name: true,
            slug: true,
            basePrice: true,
            salePrice: true,
            images: true,
            isFeatured: true,
            isBestseller: true
          }
        },
        _count: {
          select: { products: true }
        }
      }
    })

    if (!shop) {
      return NextResponse.json({ error: 'Shop not found' }, { status: 404 })
    }

    return NextResponse.json({ shop })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
