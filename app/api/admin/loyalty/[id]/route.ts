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

// PUT - Update a tier
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await checkAdmin(request)
    if (!admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 401 })
    }

    const { id } = params
    const body = await request.json()
    
    const tier = await prisma.loyaltyTier.findUnique({ where: { id } })
    if (!tier) {
      return NextResponse.json({ error: 'Tier not found' }, { status: 404 })
    }

    const updatedTier = await prisma.loyaltyTier.update({
      where: { id },
      data: {
        displayName: body.displayName ?? tier.displayName,
        minSpending: body.minSpending ?? tier.minSpending,
        discountPercent: body.discountPercent ?? tier.discountPercent,
        freeShipping: body.freeShipping ?? tier.freeShipping,
        freeShippingMin: body.freeShippingMin !== undefined ? body.freeShippingMin : tier.freeShippingMin,
        pointsMultiplier: body.pointsMultiplier ?? tier.pointsMultiplier,
        prioritySupport: body.prioritySupport ?? tier.prioritySupport,
        earlyAccess: body.earlyAccess ?? tier.earlyAccess,
        exclusiveDeals: body.exclusiveDeals ?? tier.exclusiveDeals,
        birthdayBonus: body.birthdayBonus ?? tier.birthdayBonus,
        color: body.color ?? tier.color,
        isActive: body.isActive ?? tier.isActive
      }
    })

    return NextResponse.json({ success: true, tier: updatedTier })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE - Delete a tier
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await checkAdmin(request)
    if (!admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 401 })
    }

    const { id } = params

    // Check if tier has members
    const tier = await prisma.loyaltyTier.findUnique({
      where: { id },
      include: { _count: { select: { members: true } } }
    })

    if (!tier) {
      return NextResponse.json({ error: 'Tier not found' }, { status: 404 })
    }

    if (tier._count.members > 0) {
      return NextResponse.json({ 
        error: `Cannot delete tier with ${tier._count.members} members. Move them first.` 
      }, { status: 400 })
    }

    await prisma.loyaltyTier.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
