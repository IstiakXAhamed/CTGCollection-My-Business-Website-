import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// POST - Reset password with token
export async function POST(request: NextRequest) {
  try {
    const { email, token, newPassword } = await request.json()

    if (!email || !token || !newPassword) {
      return NextResponse.json({ error: 'Email, token, and new password are required' }, { status: 400 })
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
    }

    // Find valid reset token
    const verificationCode = await prisma.verificationCode.findFirst({
      where: {
        email,
        code: token,
        type: 'password_reset',
        used: false,
        expiresAt: { gt: new Date() }
      }
    })

    if (!verificationCode) {
      return NextResponse.json({ 
        error: 'Invalid or expired reset link. Please request a new one.' 
      }, { status: 400 })
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Update user password
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword }
    })

    // Mark token as used
    await prisma.verificationCode.update({
      where: { id: verificationCode.id },
      data: { used: true }
    })

    // Delete all reset tokens for this email (cleanup)
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
