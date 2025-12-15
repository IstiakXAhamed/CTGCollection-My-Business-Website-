const SSLCOMMERZ_API_URL = process.env.SSLCOMMERZ_IS_LIVE === 'true'
  ? 'https://securepay.sslcommerz.com'
  : 'https://sandbox.sslcommerz.com'

interface SSLCommerzPaymentData {
  orderId: string
  amount: number
  customerName: string
  customerEmail: string
  customerPhone: string
  customerAddress: string
}

export async function initiateSSLCommerzPayment(data: SSLCommerzPaymentData) {
  const {
    orderId,
    amount,
    customerName,
    customerEmail,
    customerPhone,
    customerAddress,
  } = data

  const paymentData = {
    store_id: process.env.SSLCOMMERZ_STORE_ID,
    store_passwd: process.env.SSLCOMMERZ_STORE_PASSWORD,
    total_amount: amount,
    currency: 'BDT',
    tran_id: orderId,
    success_url: `${process.env.NEXT_PUBLIC_URL}/api/payment/sslcommerz/success`,
    fail_url: `${process.env.NEXT_PUBLIC_URL}/api/payment/sslcommerz/fail`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/api/payment/sslcommerz/cancel`,
    ipn_url: `${process.env.NEXT_PUBLIC_URL}/api/payment/sslcommerz/ipn`,
    shipping_method: 'Courier',
    product_name: 'Order',
    product_category: 'General',
    product_profile: 'general',
    cus_name: customerName,
    cus_email: customerEmail,
    cus_add1: customerAddress,
    cus_city: 'Dhaka',
    cus_country: 'Bangladesh',
    cus_phone: customerPhone,
    ship_name: customerName,
    ship_add1: customerAddress,
    ship_city: 'Dhaka',
    ship_country: 'Bangladesh',
  }

  try {
    const response = await fetch(`${SSLCOMMERZ_API_URL}/gwprocess/v4/api.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(paymentData as any).toString(),
    })

    const result = await response.json()

    if (result.status === 'SUCCESS') {
      return {
        success: true,
        gatewayPageURL: result.GatewayPageURL,
        sessionKey: result.sessionkey,
      }
    } else {
      return {
        success: false,
        message: result.failedreason || 'Payment initiation failed',
      }
    }
  } catch (error) {
    console.error('SSLCommerz Error:', error)
    return {
      success: false,
      message: 'Payment gateway error',
    }
  }
}

export async function validateSSLCommerzPayment(
  transactionId: string,
  amount: number
) {
  const validationData = {
    val_id: transactionId,
    store_id: process.env.SSLCOMMERZ_STORE_ID,
    store_passwd: process.env.SSLCOMMERZ_STORE_PASSWORD,
    format: 'json',
  }

  try {
    const response = await fetch(
      `${SSLCOMMERZ_API_URL}/validator/api/validationserverAPI.php?${new URLSearchParams(
        validationData as any
      ).toString()}`,
      {
        method: 'GET',
      }
    )

    const result = await response.json()
    
    if (result.status === 'VALID' && parseFloat(result.amount) === amount) {
      return {
        valid: true,
        data: result,
      }
    } else {
      return {
        valid: false,
        message: 'Payment validation failed',
      }
    }
  } catch (error) {
    console.error('SSLCommerz Validation Error:', error)
    return {
      valid: false,
      message: 'Payment validation error',
    }
  }
}
