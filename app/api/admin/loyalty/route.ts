import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'

// Check admin access
async function checkAdmin(request: NextRequest) {
  const user = await verifyAuth(request)
  if (!user || (user.role !== 'admin' && user.role !== 'superadmin' && user.role !== 'seller')) {
    return null
  }
  return user
}

// GET - Fetch loyalty settings and tiers
export async function GET(request: NextRequest) {
  try {
    const admin = await checkAdmin(request)
    if (!admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 401 })
    }

    // Get or create default settings
    let settings = await prisma.loyaltySettings.findFirst()
    if (!settings) {
      settings = await prisma.loyaltySettings.create({
        data: {
          isEnabled: true,
          pointsPerTaka: 0.1,
          pointsToTakaRatio: 10,
          referralBonusReferrer: 100,
          referralBonusReferred: 50,
          minimumRedeemPoints: 100
        }
      })
    }

    // Get all tiers
    const tiers = await prisma.loyaltyTier.findMany({
      orderBy: { minSpending: 'asc' },
      include: {
        _count: { select: { members: true } }
      }
    })

    // Get stats
    const stats = await prisma.loyaltyPoints.aggregate({
      _sum: { totalPoints: true, lifetimePoints: true, lifetimeSpent: true },
      _count: true
    })

    const referralStats = await prisma.referral.groupBy({
      by: ['status'],
      _count: true
    })

    return NextResponse.json({
      settings,
      tiers,
      stats: {
        totalMembers: stats._count,
        totalPointsActive: stats._sum.totalPoints || 0,
        totalPointsEarned: stats._sum.lifetimePoints || 0,
        totalSpending: stats._sum.lifetimeSpent || 0,
        referrals: referralStats
      }
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT - Update loyalty settings
export async function PUT(request: NextRequest) {
  try {
    const admin = await checkAdmin(request)
    if (!admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      isEnabled, 
      pointsPerTaka, 
      pointsToTakaRatio, 
      referralBonusReferrer, 
      referralBonusReferred,
      minimumRedeemPoints
    } = body

    // Get existing settings
    let settings = await prisma.loyaltySettings.findFirst()
    
    if (settings) {
      settings = await prisma.loyaltySettings.update({
        where: { id: settings.id },
        data: {
          isEnabled: isEnabled ?? settings.isEnabled,
          pointsPerTaka: pointsPerTaka ?? settings.pointsPerTaka,
          pointsToTakaRatio: pointsToTakaRatio ?? settings.pointsToTakaRatio,
          referralBonusReferrer: referralBonusReferrer ?? settings.referralBonusReferrer,
          referralBonusReferred: referralBonusReferred ?? settings.referralBonusReferred,
          minimumRedeemPoints: minimumRedeemPoints ?? settings.minimumRedeemPoints
        }
      })
    } else {
      settings = await prisma.loyaltySettings.create({
        data: {
          isEnabled: isEnabled ?? true,
          pointsPerTaka: pointsPerTaka ?? 0.1,
          pointsToTakaRatio: pointsToTakaRatio ?? 10,
          referralBonusReferrer: referralBonusReferrer ?? 100,
          referralBonusReferred: referralBonusReferred ?? 50,
          minimumRedeemPoints: minimumRedeemPoints ?? 100
        }
      })
    }

    return NextResponse.json({ success: true, settings })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST - Create default tiers (seed)
export async function POST(request: NextRequest) {
  try {
    const admin = await checkAdmin(request)
    if (!admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 401 })
    }

    const body = await request.json()
    const { action } = body

    if (action === 'seed_tiers') {
      // Check if tiers exist
      const existingTiers = await prisma.loyaltyTier.count()
      if (existingTiers > 0) {
        return NextResponse.json({ error: 'Tiers already exist. Delete them first.' }, { status: 400 })
      }

      // Create default tiers
      const defaultTiers = [
        {
          name: 'bronze',
          displayName: 'Bronze',
          minSpending: 0,
          discountPercent: 0,
          freeShipping: false,
          freeShippingMin: 2000,
          pointsMultiplier: 1,
          prioritySupport: false,
          earlyAccess: false,
          exclusiveDeals: false,
          birthdayBonus: 50,
          color: '#CD7F32',
          sortOrder: 1
        },
        {
          name: 'silver',
          displayName: 'Silver',
          minSpending: 5000,
          discountPercent: 3,
          freeShipping: false,
          freeShippingMin: 1500,
          pointsMultiplier: 1.5,
          prioritySupport: false,
          earlyAccess: false,
          exclusiveDeals: false,
          birthdayBonus: 100,
          color: '#C0C0C0',
          sortOrder: 2
        },
        {
          name: 'gold',
          displayName: 'Gold',
          minSpending: 15000,
          discountPercent: 5,
          freeShipping: true,
          freeShippingMin: 1000,
          pointsMultiplier: 2,
          prioritySupport: true,
          earlyAccess: true,
          exclusiveDeals: false,
          birthdayBonus: 200,
          color: '#FFD700',
          sortOrder: 3
        },
        {
          name: 'platinum',
          displayName: 'Platinum',
          minSpending: 50000,
          discountPercent: 10,
          freeShipping: true,
          freeShippingMin: null, // Always free
          pointsMultiplier: 3,
          prioritySupport: true,
          earlyAccess: true,
          exclusiveDeals: true,
          birthdayBonus: 500,
          color: '#E5E4E2',
          sortOrder: 4
        }
      ]

      await prisma.loyaltyTier.createMany({ data: defaultTiers })

      const tiers = await prisma.loyaltyTier.findMany({ orderBy: { sortOrder: 'asc' } })
      return NextResponse.json({ success: true, message: 'Default tiers created', tiers })
    }

    if (action === 'create_tier') {
      const { tier } = body
      if (!tier || !tier.name || !tier.displayName) {
        return NextResponse.json({ error: 'Name and displayName are required' }, { status: 400 })
      }

      // Check if name already exists
      const existing = await prisma.loyaltyTier.findUnique({ where: { name: tier.name } })
      if (existing) {
        return NextResponse.json({ error: 'A tier with this name already exists' }, { status: 400 })
      }

      // Get max sort order
      const maxOrder = await prisma.loyaltyTier.aggregate({ _max: { sortOrder: true } })
      const sortOrder = (maxOrder._max.sortOrder || 0) + 1

      const newTier = await prisma.loyaltyTier.create({
        data: {
          name: tier.name,
          displayName: tier.displayName,
          minSpending: tier.minSpending || 0,
          discountPercent: tier.discountPercent || 0,
          freeShipping: tier.freeShipping || false,
          freeShippingMin: tier.freeShippingMin,
          pointsMultiplier: tier.pointsMultiplier || 1,
          prioritySupport: tier.prioritySupport || false,
          earlyAccess: tier.earlyAccess || false,
          exclusiveDeals: tier.exclusiveDeals || false,
          birthdayBonus: tier.birthdayBonus || 0,
          color: tier.color || '#CD7F32',
          isActive: tier.isActive ?? true,
          sortOrder
        }
      })

      return NextResponse.json({ success: true, tier: newTier })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
