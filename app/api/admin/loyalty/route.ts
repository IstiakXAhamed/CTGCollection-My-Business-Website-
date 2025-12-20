import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// Check admin access
async function checkAdmin(request: NextRequest) {
  const user = await verifyAuth(request)
  if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
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

    // Premium tier presets - 10 tiers with CUSTOM values from local PostgreSQL
    const premiumTiers = [
      { name: 'bronze', displayName: 'Bronze', color: '#CD7F32', icon: 'bronze', minSpending: 5000, discountPercent: 1, pointsMultiplier: 1.5, birthdayBonus: 100, freeShipping: false, freeShippingMin: 3000, prioritySupport: false, earlyAccess: true, exclusiveDeals: false, sortOrder: 1 },
      { name: 'silver', displayName: 'Silver', color: '#C0C0C0', icon: 'silver', minSpending: 15000, discountPercent: 2, pointsMultiplier: 2, birthdayBonus: 300, freeShipping: true, freeShippingMin: 1998, prioritySupport: false, earlyAccess: true, exclusiveDeals: false, sortOrder: 2 },
      { name: 'gold', displayName: 'Gold', color: '#FFD700', icon: 'gold', minSpending: 40000, discountPercent: 4, pointsMultiplier: 2.5, birthdayBonus: 400, freeShipping: true, freeShippingMin: 1499, prioritySupport: true, earlyAccess: true, exclusiveDeals: false, sortOrder: 3 },
      { name: 'platinum', displayName: 'Platinum', color: '#8C8C8C', icon: 'platinum', minSpending: 60000, discountPercent: 7, pointsMultiplier: 3, birthdayBonus: 500, freeShipping: true, freeShippingMin: 1199, prioritySupport: true, earlyAccess: true, exclusiveDeals: true, sortOrder: 4 },
      { name: 'diamond', displayName: 'Diamond', color: '#B9F2FF', icon: 'diamond', minSpending: 100000, discountPercent: 9, pointsMultiplier: 5, birthdayBonus: 1000, freeShipping: true, freeShippingMin: 1000, prioritySupport: true, earlyAccess: true, exclusiveDeals: true, sortOrder: 5 },
      { name: 'emerald', displayName: 'Emerald', color: '#50C878', icon: 'emerald', minSpending: 120000, discountPercent: 10, pointsMultiplier: 6, birthdayBonus: 750, freeShipping: true, freeShippingMin: 1000, prioritySupport: true, earlyAccess: true, exclusiveDeals: true, sortOrder: 6 },
      { name: 'ruby', displayName: 'Ruby', color: '#E0115F', icon: 'ruby', minSpending: 150000, discountPercent: 11, pointsMultiplier: 7, birthdayBonus: 1000, freeShipping: true, freeShippingMin: 800, prioritySupport: true, earlyAccess: true, exclusiveDeals: true, sortOrder: 7 },
      { name: 'sapphire', displayName: 'Sapphire', color: '#0F52BA', icon: 'sapphire', minSpending: 250000, discountPercent: 11, pointsMultiplier: 8, birthdayBonus: 1500, freeShipping: true, freeShippingMin: 800, prioritySupport: true, earlyAccess: true, exclusiveDeals: true, sortOrder: 8 },
      { name: 'obsidian', displayName: 'Obsidian', color: '#1C1C1C', icon: 'obsidian', minSpending: 400000, discountPercent: 13, pointsMultiplier: 10, birthdayBonus: 2000, freeShipping: true, freeShippingMin: 700, prioritySupport: true, earlyAccess: true, exclusiveDeals: true, sortOrder: 9 },
      { name: 'legendary', displayName: 'Legendary', color: '#FFD700', icon: 'legendary', minSpending: 600000, discountPercent: 15, pointsMultiplier: 15, birthdayBonus: 5000, freeShipping: true, freeShippingMin: null, prioritySupport: true, earlyAccess: true, exclusiveDeals: true, sortOrder: 10 }
    ]

    if (action === 'seed_tiers') {
      // Check if tiers exist
      const existingTiers = await prisma.loyaltyTier.count()
      if (existingTiers > 0) {
        return NextResponse.json({ error: 'Tiers already exist. Use reset_tiers to recreate them.' }, { status: 400 })
      }

      await prisma.loyaltyTier.createMany({ data: premiumTiers })

      const tiers = await prisma.loyaltyTier.findMany({ orderBy: { sortOrder: 'asc' } })
      return NextResponse.json({ success: true, message: 'Premium tiers created', tiers })
    }

    if (action === 'reset_tiers') {
      // Delete all existing tiers (this will fail if users have tier assignments)
      // First, remove all tier assignments from loyalty points
      await prisma.loyaltyPoints.updateMany({ data: { tierId: null } })
      
      // Delete all tiers
      await prisma.loyaltyTier.deleteMany({})
      
      // Create premium tiers
      await prisma.loyaltyTier.createMany({ data: premiumTiers })

      const tiers = await prisma.loyaltyTier.findMany({ orderBy: { sortOrder: 'asc' } })
      return NextResponse.json({ success: true, message: 'Tiers reset to premium defaults', tiers })
    }

    // FIX ONLY minSpending values - keeps all other settings and assignments!
    if (action === 'fix_tier_values') {
      const correctValues: Record<string, number> = {
        'bronze': 0,
        'silver': 5000,
        'gold': 15000,
        'platinum': 35000,
        'diamond': 60000,
        'emerald': 100000,
        'ruby': 150000,
        'sapphire': 250000,
        'obsidian': 400000,
        'legendary': 750000
      }

      const updates = []
      for (const [name, minSpending] of Object.entries(correctValues)) {
        updates.push(
          prisma.loyaltyTier.updateMany({
            where: { name },
            data: { minSpending }
          })
        )
      }
      
      await Promise.all(updates)

      const tiers = await prisma.loyaltyTier.findMany({ orderBy: { sortOrder: 'asc' } })
      return NextResponse.json({ success: true, message: 'Tier minSpending values fixed!', tiers })
    }

    // FIX sortOrder to ensure sequential logical order based on Price
    if (action === 'fix_tier_order') {
      // Get all tiers
      const allTiers = await prisma.loyaltyTier.findMany()

      // Sort in memory by minSpending (Lowest Price -> Highest Price)
      // This guarantees: Bronze (5000) -> Silver (15000) -> Gold (40000)
      allTiers.sort((a, b) => a.minSpending - b.minSpending)

      const updates = []
      
      // Assign sortOrder 1, 2, 3... based on price rank
      for (let i = 0; i < allTiers.length; i++) {
        const tier = allTiers[i]
        updates.push(
          prisma.loyaltyTier.update({
            where: { id: tier.id },
            data: { sortOrder: i + 1 }
          })
        )
      }
      
      if (updates.length > 0) {
        await prisma.$transaction(updates)
      }

      const tiers = await prisma.loyaltyTier.findMany({ 
        orderBy: [
          { sortOrder: 'asc' },
          { minSpending: 'asc' }
        ] 
      })
      return NextResponse.json({ success: true, message: 'Tier order fixed by price!', tiers })
    }

    // FIX Mismatched Names (e.g. Name is 'silver' but DisplayName is 'Bronze')
    if (action === 'fix_tier_names') {
      const allTiers = await prisma.loyaltyTier.findMany()

      const correctMetadata: Record<string, { displayName: string, color: string, icon: string }> = {
        'bronze': { displayName: 'Bronze', color: '#CD7F32', icon: 'bronze' },
        'silver': { displayName: 'Silver', color: '#C0C0C0', icon: 'silver' },
        'gold': { displayName: 'Gold', color: '#FFD700', icon: 'gold' },
        'platinum': { displayName: 'Platinum', color: '#8C8C8C', icon: 'platinum' },
        'diamond': { displayName: 'Diamond', color: '#B9F2FF', icon: 'diamond' },
        'emerald': { displayName: 'Emerald', color: '#50C878', icon: 'emerald' },
        'ruby': { displayName: 'Ruby', color: '#E0115F', icon: 'ruby' },
        'sapphire': { displayName: 'Sapphire', color: '#0F52BA', icon: 'sapphire' },
        'obsidian': { displayName: 'Obsidian', color: '#1C1C1C', icon: 'obsidian' },
        'legendary': { displayName: 'Legendary', color: '#FFD700', icon: 'legendary' },
        'crown': { displayName: 'Legendary', color: '#FFD700', icon: 'legendary' }
      }

      const updates = []
      
      for (const tier of allTiers) {
        // Normalize name to lowercase for lookup (e.g. "Bronze" -> "bronze")
        const normalizedName = tier.name.toLowerCase()
        const meta = correctMetadata[normalizedName]
        
        if (meta) {
          updates.push(
            prisma.loyaltyTier.update({
              where: { id: tier.id },
              data: { 
                displayName: meta.displayName,
                color: meta.color,
                icon: meta.icon,
                // OPTIONAL: Standardize the internal name to lowercase too? 
                // Let's do it to prevent future case-sensitivity issues
                name: normalizedName 
              }
            })
          )
        }
      }
      
      if (updates.length > 0) {
        await prisma.$transaction(updates)
      }

      const tiers = await prisma.loyaltyTier.findMany({ orderBy: { sortOrder: 'asc' } })
      return NextResponse.json({ success: true, message: 'Tier names and badges synced (Case Insensitive)!', tiers })
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
          icon: tier.icon || 'medal',
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
