import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmailWithAttachments } from '@/lib/email'

// Generate 6-digit code
function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// POST - Request password reset code or verify code
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, code } = body
    const email = body.email?.toLowerCase().trim()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Action: Request verification code
    if (action === 'request_code' || !action) {
      const user = await prisma.user.findUnique({ where: { email } })
      
      // Always return success to prevent email enumeration
      if (!user) {
        return NextResponse.json({ 
          success: true, 
          message: 'If that email exists, a verification code will be sent.' 
        })
      }

      // Delete any existing codes for this email
      await prisma.verificationCode.deleteMany({
        where: { email, type: 'password_reset' }
      })

      // Generate new 6-digit code
      const verificationCode = generateCode()
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes

      // Save code to database
      await prisma.verificationCode.create({
        data: {
          code: verificationCode,
          type: 'password_reset',
          email,
          userId: user.id,
          expiresAt
        }
      })

      // Send email with verification code
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 0; background: #f4f4f4; }
            .container { max-width: 600px; margin: 0 auto; background: white; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; color: white; }
            .content { padding: 40px; text-align: center; }
            .code { font-size: 48px; font-weight: bold; letter-spacing: 8px; color: #667eea; background: #f0f4ff; padding: 20px 30px; border-radius: 12px; display: inline-block; margin: 20px 0; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px; }
            .warning { background: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 8px; margin: 20px 0; color: #856404; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 28px;">🔐 Password Reset Code</h1>
            </div>
            <div class="content">
              <p style="font-size: 18px; color: #333;">Hi ${user.name},</p>
              <p style="color: #666;">Use the following code to reset your password:</p>
              
              <div class="code">${verificationCode}</div>
              
              <div class="warning">
                <p style="margin: 0;">⏰ This code expires in 5 minutes</p>
              </div>
              
              <p style="color: #888; font-size: 14px;">If you didn't request this, please ignore this email.</p>
            </div>
            <div class="footer">
              <p>CTG Collection - Premium E-Commerce Store</p>
            </div>
          </div>
        </body>
        </html>
      `

      try {
        await sendEmailWithAttachments({
          to: email,
          subject: `🔐 Your Password Reset Code: ${verificationCode}`,
          html
        })
      } catch (emailError) {
        console.error('Email send error:', emailError)
        // Still return success even if email fails - don't expose email issues
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Verification code sent! Check your email.' 
      })
    }

    // Action: Verify code
    if (action === 'verify_code') {
      if (!code) {
        return NextResponse.json({ error: 'Verification code is required' }, { status: 400 })
      }

      const verification = await prisma.verificationCode.findFirst({
        where: {
          email,
          code,
          type: 'password_reset',
          expiresAt: { gt: new Date() }
        }
      })

      if (!verification) {
        return NextResponse.json({ error: 'Invalid or expired code' }, { status: 400 })
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Code verified! You can now set a new password.',
        verified: true
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error: any) {
    console.error('Forgot password error:', error)
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 })
  }
}
