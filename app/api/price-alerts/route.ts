import { NextRequest, NextResponse } from 'next/server'

// POST - Subscribe to price drop alerts
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { productId, email, currentPrice } = body

    // Validation
    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
    }
    if (!currentPrice || currentPrice <= 0) {
      return NextResponse.json({ error: 'Current price is required' }, { status: 400 })
    }

    // In production, save to database
    // model PriceAlert {
    //   id           String   @id @default(cuid())
    //   productId    String
    //   email        String
    //   targetPrice  Float
    //   currentPrice Float
    //   notified     Boolean  @default(false)
    //   createdAt    DateTime @default(now())
    // }

    console.log(`Price alert subscription: ${email} for product ${productId} at ${currentPrice}`)

    return NextResponse.json({
      success: true,
      message: "You'll be notified when the price drops!"
    })
  } catch (error: any) {
    console.error('Price alert subscription error:', error)
    return NextResponse.json({ error: error.message || 'Failed to subscribe' }, { status: 500 })
  }
}

// GET - Get price alerts (admin)
export async function GET(request: NextRequest) {
  try {
    // In production, fetch from database
    return NextResponse.json({ alerts: [] })
  } catch (error: any) {
    console.error('Get price alerts error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
