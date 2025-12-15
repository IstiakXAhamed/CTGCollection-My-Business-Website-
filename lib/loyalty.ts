import { prisma } from '@/lib/prisma'

// Award loyalty points after order completion
export async function awardLoyaltyPoints(
  userId: string, 
  orderTotal: number, 
  orderId: string
): Promise<{ pointsEarned: number; newTier?: string } | null> {
  try {
    // Check if loyalty is enabled
    const settings = await prisma.loyaltySettings.findFirst()
    if (!settings?.isEnabled) return null

    // Get or create user's loyalty record
    let loyalty = await prisma.loyaltyPoints.findUnique({
      where: { userId },
      include: { tier: true }
    })

    if (!loyalty) {
      const defaultTier = await prisma.loyaltyTier.findFirst({
        where: { isActive: true },
        orderBy: { minSpending: 'asc' }
      })

      loyalty = await prisma.loyaltyPoints.create({
        data: {
          userId,
          tierId: defaultTier?.id || null,
          totalPoints: 0,
          lifetimePoints: 0,
          lifetimeSpent: 0
        },
        include: { tier: true }
      })
    }

    // Calculate points based on tier multiplier
    const multiplier = loyalty.tier?.pointsMultiplier || 1
    const basePoints = Math.floor(orderTotal * settings.pointsPerTaka)
    const pointsEarned = Math.floor(basePoints * multiplier)

    // Update loyalty stats
    const newLifetimeSpent = loyalty.lifetimeSpent + orderTotal

    // Check for tier upgrade
    const allTiers = await prisma.loyaltyTier.findMany({
      where: { isActive: true },
      orderBy: { minSpending: 'desc' }
    })

    const newTier = allTiers.find(t => newLifetimeSpent >= t.minSpending)
    const tierUpgraded = newTier && newTier.id !== loyalty.tierId

    // Create transaction and update balance
    await prisma.$transaction([
      prisma.pointsTransaction.create({
        data: {
          userId,
          loyaltyId: loyalty.id,
          type: 'earn',
          points: pointsEarned,
          description: `Order completed - ${multiplier}x points`,
          orderId
        }
      }),
      prisma.loyaltyPoints.update({
        where: { id: loyalty.id },
        data: {
          totalPoints: { increment: pointsEarned },
          lifetimePoints: { increment: pointsEarned },
          lifetimeSpent: newLifetimeSpent,
          tierId: newTier?.id || loyalty.tierId,
          tierUpdatedAt: tierUpgraded ? new Date() : loyalty.tierUpdatedAt
        }
      }),
      // Update order with points earned
      prisma.order.update({
        where: { id: orderId },
        data: { pointsEarned }
      })
    ])

    return {
      pointsEarned,
      newTier: tierUpgraded ? newTier?.displayName : undefined
    }
  } catch (error) {
    console.error('Failed to award loyalty points:', error)
    return null
  }
}

// Process referral when new user places first order
export async function processReferralBonus(
  referredUserId: string,
  orderId: string
): Promise<boolean> {
  try {
    const settings = await prisma.loyaltySettings.findFirst()
    if (!settings?.isEnabled) return false

    // Find pending referral
    const referral = await prisma.referral.findUnique({
      where: { referredId: referredUserId },
      include: { referrer: true }
    })

    if (!referral || referral.status !== 'pending') return false

    // Get or create loyalty records for both users
    const [referrerLoyalty, referredLoyalty] = await Promise.all([
      getOrCreateLoyalty(referral.referrerId),
      getOrCreateLoyalty(referredUserId)
    ])

    // Award bonus points to both
    await prisma.$transaction([
      // Referrer bonus
      prisma.pointsTransaction.create({
        data: {
          userId: referral.referrerId,
          loyaltyId: referrerLoyalty.id,
          type: 'referral',
          points: settings.referralBonusReferrer,
          description: `Referral bonus - friend made first order`
        }
      }),
      prisma.loyaltyPoints.update({
        where: { id: referrerLoyalty.id },
        data: {
          totalPoints: { increment: settings.referralBonusReferrer },
          lifetimePoints: { increment: settings.referralBonusReferrer }
        }
      }),
      // Referred bonus
      prisma.pointsTransaction.create({
        data: {
          userId: referredUserId,
          loyaltyId: referredLoyalty.id,
          type: 'referral',
          points: settings.referralBonusReferred,
          description: `Welcome bonus - used referral code`
        }
      }),
      prisma.loyaltyPoints.update({
        where: { id: referredLoyalty.id },
        data: {
          totalPoints: { increment: settings.referralBonusReferred },
          lifetimePoints: { increment: settings.referralBonusReferred }
        }
      }),
      // Mark referral as completed
      prisma.referral.update({
        where: { id: referral.id },
        data: {
          status: 'completed',
          completedAt: new Date(),
          referrerBonus: settings.referralBonusReferrer,
          referredBonus: settings.referralBonusReferred
        }
      })
    ])

    return true
  } catch (error) {
    console.error('Failed to process referral:', error)
    return false
  }
}

// Helper to get or create loyalty record
async function getOrCreateLoyalty(userId: string) {
  let loyalty = await prisma.loyaltyPoints.findUnique({
    where: { userId }
  })

  if (!loyalty) {
    const defaultTier = await prisma.loyaltyTier.findFirst({
      where: { isActive: true },
      orderBy: { minSpending: 'asc' }
    })

    loyalty = await prisma.loyaltyPoints.create({
      data: {
        userId,
        tierId: defaultTier?.id || null
      }
    })
  }

  return loyalty
}

// Get tier discount for checkout
export async function getTierDiscount(userId: string): Promise<{
  discountPercent: number
  freeShipping: boolean
  freeShippingMin: number | null
  tierName: string | null
}> {
  try {
    const loyalty = await prisma.loyaltyPoints.findUnique({
      where: { userId },
      include: { tier: true }
    })

    if (!loyalty?.tier) {
      return { discountPercent: 0, freeShipping: false, freeShippingMin: null, tierName: null }
    }

    return {
      discountPercent: loyalty.tier.discountPercent,
      freeShipping: loyalty.tier.freeShipping,
      freeShippingMin: loyalty.tier.freeShippingMin,
      tierName: loyalty.tier.displayName
    }
  } catch (error) {
    return { discountPercent: 0, freeShipping: false, freeShippingMin: null, tierName: null }
  }
}
