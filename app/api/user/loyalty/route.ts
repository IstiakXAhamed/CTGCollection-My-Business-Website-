import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'
import crypto from 'crypto'

// GET - Get user's loyalty status
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get loyalty settings
    const settings = await prisma.loyaltySettings.findFirst()
    if (!settings?.isEnabled) {
      return NextResponse.json({ 
        enabled: false,
        message: 'Loyalty program is currently disabled'
      })
    }

    // Get or create user's loyalty record
    let loyalty = await prisma.loyaltyPoints.findUnique({
      where: { userId: user.id },
      include: {
        tier: true,
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    })

    if (!loyalty) {
      // Get user's total spending from orders to determine initial tier
      const orderTotal = await prisma.order.aggregate({
        where: { 
          userId: user.id,
          status: 'delivered'
        },
        _sum: { total: true }
      })
      const totalSpent = orderTotal._sum.total || 0

      // Find appropriate tier based on spending (lowest tier they qualify for or default)
      const tiers = await prisma.loyaltyTier.findMany({
        where: { isActive: true },
        orderBy: { minSpending: 'desc' }
      })
      
      // Find highest tier user qualifies for
      let assignedTier = null
      for (const tier of tiers) {
        if (totalSpent >= tier.minSpending) {
          assignedTier = tier
          break
        }
      }
      
      // If no tier qualifies, get the lowest tier (Bronze)
      if (!assignedTier) {
        assignedTier = await prisma.loyaltyTier.findFirst({
          where: { isActive: true },
          orderBy: { minSpending: 'asc' }
        })
      }

      loyalty = await prisma.loyaltyPoints.create({
        data: {
          userId: user.id,
          tierId: assignedTier?.id || null,
          totalPoints: 0,
          lifetimePoints: 0,
          lifetimeSpent: totalSpent,
          redeemedPoints: 0
        },
        include: {
          tier: true,
          transactions: { take: 10, orderBy: { createdAt: 'desc' } }
        }
      })
    }

    // Get all tiers for progress display
    const allTiers = await prisma.loyaltyTier.findMany({
      where: { isActive: true },
      orderBy: { minSpending: 'asc' }
    })

    // Get next tier
    const currentTierIndex = allTiers.findIndex(t => t.id === loyalty?.tierId)
    const nextTier = currentTierIndex < allTiers.length - 1 ? allTiers[currentTierIndex + 1] : null

    // Get user's referral code (generate if doesn't exist)
    let referralCode = (user as any).referralCode
    if (!referralCode) {
      referralCode = `CTG${crypto.randomBytes(4).toString('hex').toUpperCase()}`
      await prisma.user.update({
        where: { id: user.id },
        data: { referralCode }
      })
    }

    // Get referral stats
    const referralStats = await prisma.referral.aggregate({
      where: { referrerId: user.id },
      _count: true
    })

    const completedReferrals = await prisma.referral.count({
      where: { referrerId: user.id, status: 'completed' }
    })

    return NextResponse.json({
      enabled: true,
      loyalty: {
        totalPoints: loyalty.totalPoints,
        lifetimePoints: loyalty.lifetimePoints,
        lifetimeSpent: loyalty.lifetimeSpent,
        redeemedPoints: loyalty.redeemedPoints
      },
      currentTier: loyalty.tier,
      nextTier,
      allTiers,
      tier: loyalty.tier,
      progress: nextTier 
        ? Math.min(100, (loyalty.lifetimeSpent / nextTier.minSpending) * 100) 
        : 100,
      amountToNextTier: nextTier 
        ? Math.max(0, nextTier.minSpending - loyalty.lifetimeSpent) 
        : 0,
      transactions: loyalty.transactions,
      referral: {
        code: referralCode,
        link: `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/register?ref=${referralCode}`,
        totalReferrals: referralStats._count || 0,
        completedReferrals,
        bonusPerReferral: settings.referralBonusReferrer
      },
      settings: {
        pointsPerTaka: settings.pointsPerTaka,
        pointsToTakaRatio: settings.pointsToTakaRatio,
        minimumRedeemPoints: settings.minimumRedeemPoints
      }
    })
  } catch (error: any) {
    console.error('Loyalty fetch error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST - Redeem points
export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, points } = body

    if (action === 'redeem') {
      const settings = await prisma.loyaltySettings.findFirst()
      if (!settings?.isEnabled) {
        return NextResponse.json({ error: 'Loyalty program is disabled' }, { status: 400 })
      }

      const loyalty = await prisma.loyaltyPoints.findUnique({
        where: { userId: user.id }
      })

      if (!loyalty) {
        return NextResponse.json({ error: 'No loyalty account found' }, { status: 404 })
      }

      if (points < settings.minimumRedeemPoints) {
        return NextResponse.json({ 
          error: `Minimum ${settings.minimumRedeemPoints} points required to redeem` 
        }, { status: 400 })
      }

      if (points > loyalty.totalPoints) {
        return NextResponse.json({ error: 'Insufficient points' }, { status: 400 })
      }

      const discountValue = points / settings.pointsToTakaRatio

      // Create transaction and update balance
      await prisma.$transaction([
        prisma.pointsTransaction.create({
          data: {
            userId: user.id,
            loyaltyId: loyalty.id,
            type: 'redeem',
            points: -points,
            description: `Redeemed ${points} points for ৳${discountValue} discount`
          }
        }),
        prisma.loyaltyPoints.update({
          where: { id: loyalty.id },
          data: {
            totalPoints: { decrement: points },
            redeemedPoints: { increment: points }
          }
        })
      ])

      return NextResponse.json({
        success: true,
        discountValue,
        remainingPoints: loyalty.totalPoints - points,
        message: `Redeemed ${points} points for ৳${discountValue} discount!`
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
