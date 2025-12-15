import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'
import { sendTierUpdateEmail } from '@/lib/email'
import { notifyTierChange } from '@/lib/notifications'

// POST - Assign tier to user (Superadmin and Admin only)
export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    
    if (!user || (user.role !== 'superadmin' && user.role !== 'admin')) {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 403 })
    }

    const { userId, tierId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Check if target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { loyaltyPoints: true }
    })

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // If tierId is provided, verify it exists
    if (tierId) {
      const tier = await prisma.loyaltyTier.findUnique({ where: { id: tierId } })
      if (!tier) {
        return NextResponse.json({ error: 'Tier not found' }, { status: 404 })
      }
    }

    // Update or create loyalty points record
    if (targetUser.loyaltyPoints) {
      // Update existing
      await prisma.loyaltyPoints.update({
        where: { userId },
        data: { 
          tierId: tierId || null,
          tierUpdatedAt: new Date()
        } as any
      })
    } else {
      // Create new loyalty points record with tier
      await prisma.loyaltyPoints.create({
        data: {
          userId,
          tierId: tierId || null,
          totalPoints: 0,
          lifetimePoints: 0,
          lifetimeSpent: 0,
          redeemedPoints: 0,
          tierUpdatedAt: new Date()
        }
      })
    }

    // Get updated user with tier info
    const updatedUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        loyaltyPoints: {
          include: { tier: true }
        }
      }
    })

    // Send email notification
    if (updatedUser && tierId) {
      // Find tier name
      const tier = updatedUser.loyaltyPoints?.tier
      if (tier && updatedUser.email) {
        // We can define standard benefits or fetch from DB if available
        // For now using generic placeholder or based on tier name
        const standardBenefits: Record<string, string[]> = {
          'Bronze': ['Earn 1 point per $1', 'Birthday Bonus'],
          'Silver': ['Earn 1.5 points per $1', 'Birthday Bonus', 'Free Shipping'],
          'Gold': ['Earn 2 points per $1', 'Priority Support', 'Free Shipping', 'Exclusive Deals'],
          'Platinum': ['Earn 3 points per $1', 'Dedicated Manager', 'Free Shipping', 'VIP Access']
        }
        
        await sendTierUpdateEmail(updatedUser.email, {
          customerName: updatedUser.name,
          tierName: tier.name,
          benefits: standardBenefits[tier.name] || ['Exclusive member perks']
        })
        
        // Also send in-app notification
        await notifyTierChange(userId, tier.displayName || tier.name)
      }
    }

    return NextResponse.json({
      success: true,
      message: tierId ? 'Tier assigned successfully' : 'Tier removed successfully',
      user: updatedUser
    })
  } catch (error: any) {
    console.error('Assign tier error:', error)
    return NextResponse.json({ error: 'Failed to assign tier' }, { status: 500 })
  }
}
