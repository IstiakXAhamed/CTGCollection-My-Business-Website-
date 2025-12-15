import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// SSL Commerz configuration
const SSLCOMMERZ_CONFIG = {
  storeId: process.env.SSLCOMMERZ_STORE_ID || 'test_store',
  storePassword: process.env.SSLCOMMERZ_STORE_PASSWORD || 'test_password',
  isLive: process.env.SSLCOMMERZ_IS_LIVE === 'true',
  apiUrl: process.env.SSLCOMMERZ_IS_LIVE === 'true' 
    ? 'https://securepay.sslcommerz.com'
    : 'https://sandbox.sslcommerz.com',
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId, amount, customerInfo } = body

    if (!orderId || !amount) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get order details
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { address: true },
    })

    if (!order) {
      return NextResponse.json(
        { message: 'Order not found' },
        { status: 404 }
      )
    }

    // Generate transaction ID
    const tranId = `TXN${Date.now()}`

    // Prepare SSL Commerz payload with fallbacks for required fields
    const sslCommerzPayload = {
      store_id: SSLCOMMERZ_CONFIG.storeId,
      store_passwd: SSLCOMMERZ_CONFIG.storePassword,
      total_amount: amount,
      currency: 'BDT',
      tran_id: tranId,
      success_url: `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/api/payment/success`,
      fail_url: `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/api/payment/fail`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/api/payment/cancel`,
      ipn_url: `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/api/payment/ipn`,
      
      // Customer info - with fallbacks to prevent SSLCommerz validation errors
      cus_name: customerInfo?.name || order.address?.name || 'Customer',
      cus_email: customerInfo?.email || 'customer@example.com',
      cus_add1: order.address?.address || 'N/A',
      cus_city: order.address?.city || 'Dhaka',
      cus_state: order.address?.district || 'Dhaka',
      cus_postcode: order.address?.postalCode || '1000',
      cus_country: 'Bangladesh',
      cus_phone: order.address?.phone || customerInfo?.phone || '01700000000',
      
      // Shipping info
      shipping_method: 'Courier',
      ship_name: customerInfo?.name || order.address?.name || 'Customer',
      ship_add1: order.address?.address || 'N/A',
      ship_city: order.address?.city || 'Dhaka',
      ship_state: order.address?.district || 'Dhaka',
      ship_postcode: order.address?.postalCode || '1000',
      ship_country: 'Bangladesh',
      product_name: 'Order Items',
      product_category: 'General',
      product_profile: 'general',
    }

    // Call SSL Commerz API
    const response = await fetch(`${SSLCOMMERZ_CONFIG.apiUrl}/gwprocess/v4/api.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(sslCommerzPayload as any).toString(),
    })

    const data = await response.json()

    if (data.status === 'SUCCESS') {
      // Update payment record with transaction ID
      await prisma.payment.updateMany({
        where: { orderId },
        data: {
          transactionId: tranId,
          gatewayResponse: JSON.stringify(data),
        },
      })

      return NextResponse.json({
        success: true,
        GatewayPageURL: data.GatewayPageURL,
        sessionKey: data.sessionkey,
        tranId,
      })
    } else {
      throw new Error(data.failedreason || 'Payment initialization failed')
    }
  } catch (error: any) {
    console.error('Payment initialization error:', error)
    return NextResponse.json(
      { message: error.message || 'Failed to initialize payment' },
      { status: 500 }
    )
  }
}
