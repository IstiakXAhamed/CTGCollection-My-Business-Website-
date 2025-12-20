import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code, cartTotal } = body

    if (!code) {
      return NextResponse.json({ error: 'Coupon code required' }, { status: 400 })
    }

    // Check if this is the promo banner coupon and if it has expired
    try {
      const settings = await (prisma as any).siteSettings.findUnique({
        where: { id: 'default' }
      })
      
      if (settings && settings.promoCode === code.toUpperCase()) {
        // This is the promo banner coupon - check if promo has expired
        if (settings.promoEndTime && new Date(settings.promoEndTime) < new Date()) {
          return NextResponse.json({ error: 'This promotion has expired' }, { status: 400 })
        }
        if (!settings.promoEnabled) {
          return NextResponse.json({ error: 'This promotion is currently disabled' }, { status: 400 })
        }
      }
    } catch (e) {
      // Settings check failed, continue with normal validation
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() }
    })

    if (!coupon) {
      return NextResponse.json({ error: 'Invalid coupon code' }, { status: 404 })
    }

    // Check if active
    if (!coupon.isActive) {
      return NextResponse.json({ error: 'Coupon is inactive' }, { status: 400 })
    }

    // Check validity dates
    const now = new Date()
    if (now < coupon.validFrom || now > coupon.validUntil) {
      return NextResponse.json({ error: 'Coupon has expired' }, { status: 400 })
    }

    // Check usage limit
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return NextResponse.json({ error: 'Coupon usage limit reached' }, { status: 400 })
    }

    // Check minimum order value
    if (coupon.minOrderValue && cartTotal < coupon.minOrderValue) {
      return NextResponse.json({ 
        error: `Minimum order value of ৳${coupon.minOrderValue} required` 
      }, { status: 400 })
    }

    // Calculate discount
    let discountAmount = 0
    if (coupon.discountType === 'percentage') {
      discountAmount = (cartTotal * coupon.discountValue) / 100
      if (coupon.maxDiscount) {
        discountAmount = Math.min(discountAmount, coupon.maxDiscount)
      }
    } else {
      discountAmount = coupon.discountValue
    }

    return NextResponse.json({
      valid: true,
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount: Math.round(discountAmount)
      }
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
