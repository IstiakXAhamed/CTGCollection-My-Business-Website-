import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

// GET user's loyalty points
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get or create loyalty points record
    let loyaltyPoints = await (prisma as any).loyaltyPoints.findUnique({
      where: { userId: payload.userId }
    })

    if (!loyaltyPoints) {
      loyaltyPoints = await (prisma as any).loyaltyPoints.create({
        data: {
          userId: payload.userId,
          points: 0,
          tier: 'bronze'
        }
      })
    }

    // Get recent transactions
    const transactions = await (prisma as any).pointsTransaction.findMany({
      where: { userId: payload.userId },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    // Calculate tier based on total earned
    const tier = calculateTier(loyaltyPoints.totalEarned)

    return NextResponse.json({
      points: loyaltyPoints.points,
      totalEarned: loyaltyPoints.totalEarned,
      totalRedeemed: loyaltyPoints.totalRedeemed,
      tier,
      transactions
    })
  } catch (error: any) {
    console.error('Loyalty points fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch loyalty points' }, { status: 500 })
  }
}

// POST - Redeem points
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { points, orderId } = body

    if (!points || points <= 0) {
      return NextResponse.json({ error: 'Invalid points amount' }, { status: 400 })
    }

    // Get settings for points value
    const settings = await (prisma as any).siteSettings.findUnique({
      where: { id: 'default' }
    })
    const pointsValue = settings?.pointsValue || 0.1

    // Check if user has enough points
    const loyaltyPoints = await (prisma as any).loyaltyPoints.findUnique({
      where: { userId: payload.userId }
    })

    if (!loyaltyPoints || loyaltyPoints.points < points) {
      return NextResponse.json({ error: 'Insufficient points' }, { status: 400 })
    }

    // Calculate discount amount
    const discountAmount = points * pointsValue

    // Deduct points
    await (prisma as any).loyaltyPoints.update({
      where: { userId: payload.userId },
      data: {
        points: { decrement: points },
        totalRedeemed: { increment: points }
      }
    })

    // Create transaction record
    await (prisma as any).pointsTransaction.create({
      data: {
        userId: payload.userId,
        points: -points,
        type: 'redeemed',
        orderId,
        description: `Redeemed ${points} points for ৳${discountAmount.toFixed(2)} discount`
      }
    })

    return NextResponse.json({
      success: true,
      discountAmount,
      message: `Redeemed ${points} points for ৳${discountAmount.toFixed(2)} discount`
    })
  } catch (error: any) {
    console.error('Points redemption error:', error)
    return NextResponse.json({ error: 'Failed to redeem points' }, { status: 500 })
  }
}

function calculateTier(totalEarned: number): string {
  if (totalEarned >= 10000) return 'platinum'
  if (totalEarned >= 5000) return 'gold'
  if (totalEarned >= 1000) return 'silver'
  return 'bronze'
}
