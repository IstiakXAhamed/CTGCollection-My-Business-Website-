import { prisma } from './prisma'
import { notifyTierChange } from './notifications'
import { sendTierUpdateEmail } from './email'

/**
 * Automatically calculate and assign tier based on user's lifetime spending
 * @param userId - User ID to calculate tier for
 * @returns Updated tier info or null if no change
 */
export async function calculateTierForUser(userId: string) {
  try {
    // Get user's loyalty points data
    const loyaltyPoints = await prisma.loyaltyPoints.findUnique({
      where: { userId },
      include: { tier: true }
    })

    if (!loyaltyPoints) {
      console.log(`No loyalty points found for user ${userId}`)
      return null
    }

    const currentLifetimeSpent = loyaltyPoints.lifetimeSpent || 0

    // Get all tiers ordered by minSpend descending
    const tiers = await prisma.loyaltyTier.findMany({
      orderBy: { minSpend: 'desc' }
    })

    // Find the highest tier the user qualifies for
    let qualifiedTier = null
    for (const tier of tiers) {
      if (currentLifetimeSpent >= tier.minSpend) {
        qualifiedTier = tier
        break
      }
    }

    // If no tier qualifies, user stays at current tier or gets removed
    if (!qualifiedTier) {
      console.log(`User ${userId} doesn't qualify for any tier (spent: ${currentLifetimeSpent})`)
      return null
    }

    // Check if tier changed
    const currentTierId = loyaltyPoints.tierId
    if (currentTierId === qualifiedTier.id) {
      console.log(`User ${userId} already has correct tier: ${qualifiedTier.name}`)
      return null
    }

    // Update tier
    const updated = await prisma.loyaltyPoints.update({
      where: { userId },
      data: {
        tierId: qualifiedTier.id,
        tierUpdatedAt: new Date()
      },
      include: { tier: true }
    })

    console.log(`User ${userId} tier updated: ${loyaltyPoints.tier?.name || 'None'} → ${qualifiedTier.name}`)

    // Get user email for notifications
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true }
    })

    if (user?.email) {
      // Send in-app notification
      await notifyTierChange(userId, qualifiedTier.displayName || qualifiedTier.name)

      // Send email notification
      const tierBenefits: Record<string, string[]> = {
        'Bronze': ['Earn 1 point per $1', 'Birthday Bonus'],
        'Silver': ['Earn 1.5 points per $1', 'Birthday Bonus', 'Free Shipping'],
        'Gold': ['Earn 2 points per $1', 'Priority Support', 'Free Shipping', 'Exclusive Deals'],
        'Platinum': ['Earn 3 points per $1', 'Dedicated Manager', 'Free Shipping', 'VIP Access'],
        'Diamond': ['Earn 5 points per $1', 'Personal Shopper', 'Free Shipping', 'VIP Access', 'Early Access']
      }

      await sendTierUpdateEmail(user.email, {
        customerName: user.name,
        tierName: qualifiedTier.name,
        benefits: tierBenefits[qualifiedTier.name] || ['Exclusive member perks']
      })
    }

    return {
      oldTier: loyaltyPoints.tier?.name || 'None',
      newTier: qualifiedTier.name,
      lifetimeSpent: currentLifetimeSpent
    }
  } catch (error) {
    console.error('Error calculating tier for user:', error)
    return null
  }
}

/**
 * Sync tier for user and return result
 * @param userId - User ID
 * @returns Tier sync result
 */
export async function syncTierForUser(userId: string) {
  const result = await calculateTierForUser(userId)
  
  if (!result) {
    // Get current tier info
    const loyaltyPoints = await prisma.loyaltyPoints.findUnique({
      where: { userId },
      include: { tier: true }
    })
    
    return {
      changed: false,
      currentTier: loyaltyPoints?.tier?.name || 'None',
      lifetimeSpent: loyaltyPoints?.lifetimeSpent || 0
    }
  }

  return {
    changed: true,
    ...result
  }
}
