import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// Helper to check if user matches target audience
async function checkUserAudience(userId: string | null, targetAudience: string): Promise<boolean> {
  if (targetAudience === 'all') return true
  if (!userId) return targetAudience === 'all' // Guests only see 'all' coupons
  
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        orders: { select: { id: true } },
        loyaltyPoints: { include: { tier: true } }
      }
    })
    
    if (!user) return false
    
    const orderCount = user.orders?.length || 0
    
    switch (targetAudience) {
      case 'new_customers':
        return orderCount === 0
      case 'returning':
        return orderCount > 0
      case 'vip':
        return orderCount >= 5
      case 'loyalty_bronze':
        return user.loyaltyPoints?.tier?.name?.toLowerCase() === 'bronze'
      case 'loyalty_silver':
        return user.loyaltyPoints?.tier?.name?.toLowerCase() === 'silver'
      case 'loyalty_gold':
        return user.loyaltyPoints?.tier?.name?.toLowerCase() === 'gold'
      case 'loyalty_platinum':
        return user.loyaltyPoints?.tier?.name?.toLowerCase() === 'platinum'
      default:
        return true
    }
  } catch (error) {
    console.error('Error checking user audience:', error)
    return false
  }
}

// GET - Find the best applicable coupon for a cart total
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const totalStr = searchParams.get('total')
    const shippingCostStr = searchParams.get('shippingCost') || '0'
    
    if (!totalStr) {
      return NextResponse.json({ error: 'Total amount required' }, { status: 400 })
    }
    
    const total = parseFloat(totalStr)
    const shippingCost = parseFloat(shippingCostStr)
    const now = new Date()

    // Get current user (optional - for targeting)
    const user = await verifyAuth(request)
    const userId = user?.userId || null

    // Find all valid coupons that have autoApply enabled
    const coupons = await (prisma.coupon.findMany as any)({
      where: {
        isActive: true,
        autoApply: true,
        validFrom: { lte: now },
        validUntil: { gte: now },
        OR: [
          { minOrderValue: null },
          { minOrderValue: { lte: total } }
        ]
      },
      orderBy: { discountValue: 'desc' }
    })

    if (coupons.length === 0) {
      return NextResponse.json({ 
        found: false, 
        message: 'No applicable coupons available' 
      })
    }

    // Calculate discount for each coupon and find the best one
    let bestCoupon = null
    let bestDiscount = 0
    let bestSavings = 0
    let isFreeShipping = false

    for (const coupon of coupons) {
      // Check usage limit
      if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
        continue
      }

      // Check target audience
      const matchesAudience = await checkUserAudience(userId, coupon.targetAudience || 'all')
      if (!matchesAudience) {
        continue
      }

      let discount = 0
      let isShippingCoupon = false
      
      if (coupon.discountType === 'free_shipping') {
        // Free shipping coupon - discount is the shipping cost
        discount = shippingCost
        isShippingCoupon = true
      } else if (coupon.discountType === 'percentage') {
        discount = (total * coupon.discountValue) / 100
        if (coupon.maxDiscount && discount > coupon.maxDiscount) {
          discount = coupon.maxDiscount
        }
      } else {
        discount = coupon.discountValue
      }

      if (discount > bestDiscount) {
        bestDiscount = discount
        bestCoupon = coupon
        bestSavings = discount
        isFreeShipping = isShippingCoupon
      }
    }

    if (!bestCoupon) {
      return NextResponse.json({ 
        found: false, 
        message: 'No applicable coupons available' 
      })
    }

    return NextResponse.json({
      found: true,
      coupon: {
        code: bestCoupon.code,
        description: bestCoupon.description,
        discountType: bestCoupon.discountType,
        discountValue: bestCoupon.discountValue,
        maxDiscount: bestCoupon.maxDiscount,
        minOrderValue: bestCoupon.minOrderValue,
        isFreeShipping
      },
      savings: bestSavings,
      newTotal: isFreeShipping ? total : total - bestSavings,
      message: isFreeShipping 
        ? `🚚 Free shipping applied!`
        : `🎉 Best coupon auto-applied! You save ৳${bestSavings.toFixed(0)}`
    })
  } catch (error: any) {
    console.error('Error finding best coupon:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
