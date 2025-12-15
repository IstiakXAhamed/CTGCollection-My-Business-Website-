import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'

// GET - Fetch all loyalty tiers (Admin only)
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    
    if (!user || (user.role !== 'admin' && user.role !== 'superadmin' && user.role !== 'seller')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const tiers = await prisma.loyaltyTier.findMany({
      where: { isActive: true },
      orderBy: { minSpending: 'asc' },
      select: {
        id: true,
        name: true,
        displayName: true,
        color: true,
        minSpending: true,
        discountPercent: true,
        freeShipping: true,
        pointsMultiplier: true,
        prioritySupport: true,
        earlyAccess: true,
        exclusiveDeals: true,
        birthdayBonus: true,
        _count: {
          select: { members: true }
        }
      }
    })

    return NextResponse.json({ tiers })
  } catch (error: any) {
    console.error('Fetch tiers error:', error)
    return NextResponse.json({ error: 'Failed to fetch tiers' }, { status: 500 })
  }
}
