import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'

// GET - Find the best applicable coupon for a cart total
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const totalStr = searchParams.get('total')
    
    if (!totalStr) {
      return NextResponse.json({ error: 'Total amount required' }, { status: 400 })
    }
    
    const total = parseFloat(totalStr)
    const now = new Date()

    // Find all valid coupons
    const coupons = await (prisma.coupon.findMany as any)({
      where: {
        isActive: true,
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

    for (const coupon of coupons) {
      // Check usage limit
      if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
        continue
      }

      let discount = 0
      if (coupon.discountType === 'percentage') {
        discount = (total * coupon.discountValue) / 100
        // Apply max discount if set
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
        minOrderValue: bestCoupon.minOrderValue
      },
      savings: bestSavings,
      newTotal: total - bestSavings,
      message: `🎉 Best coupon auto-applied! You save ৳${bestSavings.toFixed(0)}`
    })
  } catch (error: any) {
    console.error('Error finding best coupon:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
