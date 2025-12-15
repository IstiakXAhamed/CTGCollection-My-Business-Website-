// Nagad Payment Gateway Integration
// Documentation: https://nagad.com.bd/developer

import crypto from 'crypto'

const NAGAD_BASE_URL = process.env.NAGAD_IS_SANDBOX === 'true'
  ? 'http://sandbox.mynagad.com:10080/remote-payment-gateway-1.0/api/dfs'
  : 'https://api.mynagad.com/api/dfs'

// Generate timestamp in Nagad format
function getTimestamp(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')
  return `${year}${month}${day}${hours}${minutes}${seconds}`
}

// Generate random string
function generateRandomString(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex').slice(0, length)
}

// Encrypt data with public key
function encryptWithPublicKey(data: string): string {
  const publicKey = process.env.NAGAD_PG_PUBLIC_KEY || ''
  const buffer = Buffer.from(data)
  const encrypted = crypto.publicEncrypt(
    {
      key: publicKey,
      padding: crypto.constants.RSA_PKCS1_PADDING
    },
    buffer
  )
  return encrypted.toString('base64')
}

// Sign data with private key
function signWithPrivateKey(data: string): string {
  const privateKey = process.env.NAGAD_MERCHANT_PRIVATE_KEY || ''
  const sign = crypto.createSign('SHA256')
  sign.update(data)
  return sign.sign(privateKey, 'base64')
}

interface NagadPaymentData {
  orderId: string
  amount: number
  customerPhone: string
  callbackURL: string
}

// Initialize Nagad payment
export async function initializeNagadPayment(data: NagadPaymentData) {
  try {
    const merchantId = process.env.NAGAD_MERCHANT_ID || ''
    const timestamp = getTimestamp()
    const challenge = generateRandomString()

    // Prepare sensitive data
    const sensitiveData = {
      merchantId,
      datetime: timestamp,
      orderId: data.orderId,
      challenge
    }

    const encryptedData = encryptWithPublicKey(JSON.stringify(sensitiveData))
    const signature = signWithPrivateKey(JSON.stringify(sensitiveData))

    // Check out initialize
    const response = await fetch(`${NAGAD_BASE_URL}/check-out/initialize/${merchantId}/${data.orderId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-KM-Api-Version': 'v-0.2.0',
        'X-KM-IP-V4': '127.0.0.1',
        'X-KM-Client-Type': 'PC_WEB'
      },
      body: JSON.stringify({
        accountNumber: process.env.NAGAD_MERCHANT_PHONE || '01991523289',
        dateTime: timestamp,
        sensitiveData: encryptedData,
        signature
      })
    })

    const result = await response.json()

    if (result.sensitiveData && result.signature) {
      // Decrypt response
      // Complete payment will need the paymentReferenceId from this response
      return {
        success: true,
        paymentReferenceId: result.paymentReferenceId,
        challenge: result.challenge
      }
    }

    return {
      success: false,
      message: result.message || 'Nagad initialization failed'
    }
  } catch (error: any) {
    console.error('Nagad initialize error:', error)
    return { success: false, message: error.message }
  }
}

// Complete Nagad payment
export async function completeNagadPayment(data: {
  orderId: string
  amount: number
  paymentReferenceId: string
  challenge: string
  callbackURL: string
}) {
  try {
    const merchantId = process.env.NAGAD_MERCHANT_ID || ''
    const timestamp = getTimestamp()

    const sensitiveData = {
      merchantId,
      orderId: data.orderId,
      currencyCode: '050',
      amount: data.amount.toString(),
      challenge: data.challenge
    }

    const encryptedData = encryptWithPublicKey(JSON.stringify(sensitiveData))
    const signature = signWithPrivateKey(JSON.stringify(sensitiveData))

    const response = await fetch(`${NAGAD_BASE_URL}/check-out/complete/${data.paymentReferenceId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-KM-Api-Version': 'v-0.2.0',
        'X-KM-IP-V4': '127.0.0.1',
        'X-KM-Client-Type': 'PC_WEB'
      },
      body: JSON.stringify({
        sensitiveData: encryptedData,
        signature,
        merchantCallbackURL: data.callbackURL
      })
    })

    const result = await response.json()

    if (result.callBackUrl) {
      return {
        success: true,
        redirectURL: result.callBackUrl,
        paymentReferenceId: data.paymentReferenceId
      }
    }

    return {
      success: false,
      message: result.message || 'Nagad payment failed'
    }
  } catch (error: any) {
    console.error('Nagad complete error:', error)
    return { success: false, message: error.message }
  }
}

// Verify Nagad payment
export async function verifyNagadPayment(paymentReferenceId: string) {
  try {
    const response = await fetch(`${NAGAD_BASE_URL}/verify/payment/${paymentReferenceId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-KM-Api-Version': 'v-0.2.0',
        'X-KM-IP-V4': '127.0.0.1',
        'X-KM-Client-Type': 'PC_WEB'
      }
    })

    const result = await response.json()

    if (result.status === 'Success') {
      return {
        success: true,
        orderId: result.orderId,
        amount: result.amount,
        transactionId: result.issuerPaymentRefNo || result.paymentRefId
      }
    }

    return {
      success: false,
      status: result.status,
      message: result.message
    }
  } catch (error: any) {
    console.error('Nagad verify error:', error)
    return { success: false, message: error.message }
  }
}
