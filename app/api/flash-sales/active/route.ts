import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET active flash sale
export async function GET() {
  try {
    const now = new Date()
    
    // Find active flash sale
    const flashSale = await (prisma as any).flashSale.findFirst({
      where: {
        isActive: true,
        startTime: { lte: now },
        endTime: { gt: now }
      },
      include: {
        products: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                basePrice: true,
                salePrice: true,
                images: true
              }
            }
          }
        }
      },
      orderBy: { endTime: 'asc' }
    })

    if (!flashSale) {
      return NextResponse.json({ flashSale: null })
    }

    return NextResponse.json({ flashSale })
  } catch (error: any) {
    console.error('Flash sale fetch error:', error)
    // Return null if table doesn't exist yet
    return NextResponse.json({ flashSale: null })
  }
}
