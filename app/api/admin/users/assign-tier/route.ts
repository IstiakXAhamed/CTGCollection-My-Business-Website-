import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'

// POST - Assign tier to user (Superadmin only)
export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    
    if (!user || user.role !== 'superadmin') {
      return NextResponse.json({ error: 'Unauthorized - Superadmin access required' }, { status: 403 })
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
        }
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
