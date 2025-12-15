import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmailWithAttachments } from '@/lib/email'
import crypto from 'crypto'

// POST - Request password reset
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Check if user exists
    const user = await prisma.user.findUnique({ where: { email } })
    
    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({ 
        success: true, 
        message: 'If that email exists, a reset link will be sent.' 
      })
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetExpiry = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    // Save to VerificationCode table
    await prisma.verificationCode.create({
      data: {
        code: resetToken,
        type: 'password_reset',
        email,
        userId: user.id,
        expiresAt: resetExpiry
      }
    })

    // Send email with reset link
    const resetUrl = `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 0; background: #f4f4f4; }
          .container { max-width: 600px; margin: 0 auto; background: white; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; color: white; }
          .content { padding: 40px; text-align: center; }
          .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 16px 40px; text-decoration: none; border-radius: 30px; font-weight: bold; margin: 20px 0; font-size: 16px; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px; }
          .warning { background: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 8px; margin: 20px 0; color: #856404; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; font-size: 28px;">🔐 Password Reset</h1>
          </div>
          <div class="content">
            <p style="font-size: 18px; color: #333;">Hi ${user.name},</p>
            <p style="color: #666;">You requested to reset your password for your CTG Collection account.</p>
            
            <a href="${resetUrl}" class="button">Reset My Password</a>
            
            <div class="warning">
              <p style="margin: 0;">⏰ This link expires in 1 hour</p>
            </div>
            
            <p style="color: #888; font-size: 14px;">If you didn't request this, please ignore this email. Your password won't change.</p>
          </div>
          <div class="footer">
            <p>CTG Collection - Premium E-Commerce Store</p>
          </div>
        </div>
      </body>
      </html>
    `

    await sendEmailWithAttachments({
      to: email,
      subject: '🔐 Reset Your Password - CTG Collection',
      html
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Password reset link sent! Check your email.' 
    })
  } catch (error: any) {
    console.error('Forgot password error:', error)
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 })
  }
}
