import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Get all active coupons (public - for countdown display)
export async function GET(request: NextRequest) {
  try {
    const now = new Date()

    const coupons = await prisma.coupon.findMany({
      where: {
        isActive: true,
        validFrom: { lte: now },
        validUntil: { gte: now }
      },
      select: {
        id: true,
        code: true,
        description: true,
        discountType: true,
        discountValue: true,
        minOrderValue: true,
        validUntil: true
      },
      orderBy: { validUntil: 'asc' } // Show soonest expiring first
    })

    return NextResponse.json({ coupons })
  } catch (error) {
    console.error('Error fetching active coupons:', error)
    return NextResponse.json({ coupons: [] })
  }
}
