import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// POST - Save spin wheel result
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, prizeId, prizeLabel, code } = body

    // Validation
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
    }

    // In production, save to database and create coupon if needed
    // Also subscribe email to newsletter
    
    console.log(`Spin wheel result: ${email} won ${prizeLabel} (code: ${code})`)

    // If there's a coupon code, create it for this email
    if (code) {
      // In production:
      // await prisma.coupon.create({
      //   data: {
      //     code: `${code}-${Date.now()}`,
      //     email,
      //     ...couponDetails
      //   }
      // })
    }

    return NextResponse.json({
      success: true,
      message: 'Prize recorded!'
    })
  } catch (error: any) {
    console.error('Spin wheel error:', error)
    return NextResponse.json({ error: error.message || 'Failed to save result' }, { status: 500 })
  }
}
