// Verification code utilities for email verification and 2FA
import { prisma } from '@/lib/prisma'
import { sendEmailWithAttachments } from '@/lib/email'

// Generate a 6-digit verification code
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Create and store a verification code
export async function createVerificationCode(
  email: string,
  type: 'email_verify' | 'login_2fa' | 'password_reset',
  userId?: string,
  payload?: any
): Promise<string> {
  // Delete any existing codes of same type for this email
  await prisma.verificationCode.deleteMany({
    where: { email, type }
  })

  const code = generateVerificationCode()
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

  await prisma.verificationCode.create({
    data: {
      code,
      type,
      email,
      userId,
      payload,
      expiresAt
    }
  })

  return code
}

// Verify a code
export async function verifyCode(
  email: string,
  code: string,
  type: 'email_verify' | 'login_2fa' | 'password_reset'
): Promise<{ success: boolean; message: string; userId?: string; payload?: any }> {
  const verificationCode = await prisma.verificationCode.findFirst({
    where: {
      email,
      type,
      used: false
    },
    orderBy: { createdAt: 'desc' }
  })

  if (!verificationCode) {
    return { success: false, message: 'No verification code found. Please request a new code.' }
  }

  // Check expiry
  if (new Date() > verificationCode.expiresAt) {
    await prisma.verificationCode.delete({ where: { id: verificationCode.id } })
    return { success: false, message: 'Verification code expired. Please request a new code.' }
  }

  // Check attempts (max 5)
  if (verificationCode.attempts >= 5) {
    await prisma.verificationCode.delete({ where: { id: verificationCode.id } })
    return { success: false, message: 'Too many failed attempts. Please request a new code.' }
  }

  // Check code
  if (verificationCode.code !== code) {
    await prisma.verificationCode.update({
      where: { id: verificationCode.id },
      data: { attempts: { increment: 1 } }
    })
    return { success: false, message: `Invalid code. ${4 - verificationCode.attempts} attempts remaining.` }
  }

  // Mark as used
  await prisma.verificationCode.update({
    where: { id: verificationCode.id },
    data: { used: true }
  })

  return { success: true, message: 'Code verified successfully', userId: verificationCode.userId || undefined, payload: verificationCode.payload }
}

// Send verification email
export async function sendVerificationEmail(email: string, code: string, type: 'email_verify' | 'login_2fa'): Promise<boolean> {
  const subject = type === 'email_verify' 
    ? 'Verify Your Email - Silk Mart'
    : 'Login Verification Code - Silk Mart'

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; }
        .container { max-width: 500px; margin: 0 auto; background: white; border-radius: 10px; padding: 40px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .logo { text-align: center; margin-bottom: 30px; }
        .logo h1 { color: #2563eb; margin: 0; }
        .code-box { background: #f0f9ff; border: 2px dashed #2563eb; border-radius: 10px; padding: 30px; text-align: center; margin: 30px 0; }
        .code { font-size: 36px; font-weight: bold; color: #2563eb; letter-spacing: 8px; font-family: monospace; }
        .message { color: #666; line-height: 1.6; }
        .footer { text-align: center; color: #999; font-size: 12px; margin-top: 30px; }
        .warning { background: #fef3c7; padding: 15px; border-radius: 8px; margin-top: 20px; color: #92400e; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">
          <h1>🛒 Silk Mart</h1>
        </div>
        
        <p class="message">
          ${type === 'email_verify' 
            ? 'Thank you for registering! Please use the code below to verify your email address:' 
            : 'You requested a login verification code. Enter this code to complete your sign in:'}
        </p>
        
        <div class="code-box">
          <div class="code">${code}</div>
        </div>
        
        <p class="message">
          This code will expire in <strong>10 minutes</strong>.
        </p>
        
        <div class="warning">
          ⚠️ If you didn't request this code, please ignore this email. Someone may have entered your email by mistake.
        </div>
        
        <div class="footer">
          <p>Silk Mart - Premium E-Commerce Store</p>
          <p>This is an automated message, please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
  `

  try {
    await sendEmailWithAttachments({
      to: email,
      subject,
      html
    })
    return true
  } catch (error) {
    console.error('Failed to send verification email:', error)
    return false
  }
}
