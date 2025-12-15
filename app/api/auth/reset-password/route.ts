import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// POST - Reset password with verification code
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code, token, newPassword } = body
    const email = body.email?.toLowerCase().trim()
    const resetCode = code || token // Support both code and token

    if (!email || !resetCode || !newPassword) {
      return NextResponse.json({ error: 'Email, verification code, and new password are required' }, { status: 400 })
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
    }

    // Find valid reset code
    const verification = await prisma.verificationCode.findFirst({
      where: {
        email,
        code: resetCode,
        type: 'password_reset',
        expiresAt: { gt: new Date() }
      }
    })

    if (!verification) {
      return NextResponse.json({ 
        error: 'Invalid or expired verification code. Please request a new one.' 
      }, { status: 400 })
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Update user password
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword }
    })

    // Delete all reset codes for this email (cleanup)
    await prisma.verificationCode.deleteMany({
      where: { email, type: 'password_reset' }
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Password reset successfully! You can now log in.' 
    })
  } catch (error: any) {
    console.error('Reset password error:', error)
    return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 })
  }
}
