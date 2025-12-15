// bKash Payment Gateway Integration
// Documentation: https://developer.bka.sh/docs

const BKASH_BASE_URL = process.env.BKASH_IS_SANDBOX === 'true'
  ? 'https://tokenized.sandbox.bka.sh/v1.2.0-beta'
  : 'https://tokenized.pay.bka.sh/v1.2.0-beta'

interface BkashConfig {
  app_key: string
  app_secret: string
  username: string
  password: string
}

interface BkashPaymentData {
  orderId: string
  amount: number
  payerReference: string  // Customer phone or reference
  callbackURL: string
}

let tokenCache: { token: string; expiry: Date } | null = null

// Get access token from bKash
async function getAccessToken(): Promise<string> {
  // Return cached token if valid
  if (tokenCache && tokenCache.expiry > new Date()) {
    return tokenCache.token
  }

  const response = await fetch(`${BKASH_BASE_URL}/tokenized/checkout/token/grant`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'username': process.env.BKASH_USERNAME || '',
      'password': process.env.BKASH_PASSWORD || ''
    },
    body: JSON.stringify({
      app_key: process.env.BKASH_APP_KEY,
      app_secret: process.env.BKASH_APP_SECRET
    })
  })

  const data = await response.json()

  if (data.statusCode === '0000') {
    // Cache token for 55 minutes (token valid for 1 hour)
    const expiry = new Date()
    expiry.setMinutes(expiry.getMinutes() + 55)
    tokenCache = { token: data.id_token, expiry }
    return data.id_token
  }

  throw new Error(data.statusMessage || 'Failed to get bKash token')
}

// Create payment
export async function createBkashPayment(data: BkashPaymentData) {
  try {
    const token = await getAccessToken()

    const response = await fetch(`${BKASH_BASE_URL}/tokenized/checkout/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'authorization': token,
        'x-app-key': process.env.BKASH_APP_KEY || ''
      },
      body: JSON.stringify({
        mode: '0011',
        payerReference: data.payerReference,
        callbackURL: data.callbackURL,
        amount: data.amount.toString(),
        currency: 'BDT',
        intent: 'sale',
        merchantInvoiceNumber: data.orderId
      })
    })

    const result = await response.json()

    if (result.statusCode === '0000') {
      return {
        success: true,
        paymentID: result.paymentID,
        bkashURL: result.bkashURL,
        callbackURL: result.callbackURL,
        successCallbackURL: result.successCallbackURL,
        failureCallbackURL: result.failureCallbackURL,
        cancelledCallbackURL: result.cancelledCallbackURL
      }
    }

    return {
      success: false,
      message: result.statusMessage || 'Payment creation failed'
    }
  } catch (error: any) {
    console.error('bKash create payment error:', error)
    return {
      success: false,
      message: error.message || 'bKash payment error'
    }
  }
}

// Execute payment after customer approves
export async function executeBkashPayment(paymentID: string) {
  try {
    const token = await getAccessToken()

    const response = await fetch(`${BKASH_BASE_URL}/tokenized/checkout/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'authorization': token,
        'x-app-key': process.env.BKASH_APP_KEY || ''
      },
      body: JSON.stringify({ paymentID })
    })

    const result = await response.json()

    if (result.statusCode === '0000' && result.transactionStatus === 'Completed') {
      return {
        success: true,
        transactionId: result.trxID,
        amount: parseFloat(result.amount),
        paymentID: result.paymentID,
        payerReference: result.payerReference,
        customerMsisdn: result.customerMsisdn,
        merchantInvoiceNumber: result.merchantInvoiceNumber
      }
    }

    return {
      success: false,
      message: result.statusMessage || 'Payment execution failed'
    }
  } catch (error: any) {
    console.error('bKash execute payment error:', error)
    return {
      success: false,
      message: error.message || 'bKash execution error'
    }
  }
}

// Query payment status
export async function queryBkashPayment(paymentID: string) {
  try {
    const token = await getAccessToken()

    const response = await fetch(`${BKASH_BASE_URL}/tokenized/checkout/payment/status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'authorization': token,
        'x-app-key': process.env.BKASH_APP_KEY || ''
      },
      body: JSON.stringify({ paymentID })
    })

    const result = await response.json()
    return result
  } catch (error: any) {
    console.error('bKash query payment error:', error)
    return { success: false, error: error.message }
  }
}

// Refund payment
export async function refundBkashPayment(paymentID: string, trxID: string, amount: number, reason: string) {
  try {
    const token = await getAccessToken()

    const response = await fetch(`${BKASH_BASE_URL}/tokenized/checkout/payment/refund`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'authorization': token,
        'x-app-key': process.env.BKASH_APP_KEY || ''
      },
      body: JSON.stringify({
        paymentID,
        trxID,
        amount: amount.toString(),
        reason,
        sku: 'refund'
      })
    })

    const result = await response.json()

    if (result.statusCode === '0000') {
      return {
        success: true,
        refundTrxID: result.refundTrxID,
        amount: result.amount
      }
    }

    return {
      success: false,
      message: result.statusMessage || 'Refund failed'
    }
  } catch (error: any) {
    console.error('bKash refund error:', error)
    return { success: false, error: error.message }
  }
}
