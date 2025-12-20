import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { createVerificationCode, verifyCode, sendVerificationEmail } from '@/lib/verification'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    // Verify user is logged in
    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json(
        { message: 'Not authenticated' },
        { status: 401 }
      )
    }

    const payload = await verifyToken(token)
    if (!payload?.userId) {
      return NextResponse.json(
        { message: 'Invalid token' },
        { status: 401 }
      )
    }

    const { action, method, code } = await request.json()

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, phone: true, twoFactorEnabled: true, twoFactorMethod: true }
    })

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      )
    }

    switch (action) {
      case 'send-code': {
        // Send verification code to enable 2FA
        const verificationCode = await createVerificationCode(user.email, 'login_2fa', user.id)
        const sent = await sendVerificationEmail(user.email, verificationCode, 'login_2fa')
        
        if (!sent) {
          return NextResponse.json(
            { message: 'Failed to send verification code' },
            { status: 500 }
          )
        }

        return NextResponse.json({
          success: true,
          message: 'Verification code sent to your email'
        })
      }

      case 'enable': {
        // Verify code and enable 2FA
        if (!code) {
          return NextResponse.json(
            { message: 'Verification code is required' },
            { status: 400 }
          )
        }

        const verification = await verifyCode(user.email, code, 'login_2fa')
        if (!verification.success) {
          return NextResponse.json(
            { message: verification.message },
            { status: 400 }
          )
        }

        // Enable 2FA
        await prisma.user.update({
          where: { id: user.id },
          data: {
            twoFactorEnabled: true,
            twoFactorMethod: method || 'email'
          }
        })

        return NextResponse.json({
          success: true,
          message: 'Two-factor authentication enabled successfully'
        })
      }

      case 'disable': {
        // Disable 2FA (no code required for disable)
        await prisma.user.update({
          where: { id: user.id },
          data: {
            twoFactorEnabled: false,
            twoFactorMethod: null
          }
        })

        return NextResponse.json({
          success: true,
          message: 'Two-factor authentication disabled'
        })
      }

      case 'update-method': {
        // Update 2FA method
        if (method === 'sms' && !user.phone) {
          return NextResponse.json(
            { message: 'Please add a phone number first' },
            { status: 400 }
          )
        }

        await prisma.user.update({
          where: { id: user.id },
          data: { twoFactorMethod: method }
        })

        return NextResponse.json({
          success: true,
          message: `2FA method updated to ${method}`
        })
      }

      default:
        return NextResponse.json(
          { message: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('2FA settings error:', error)
    return NextResponse.json(
      { message: 'Failed to update 2FA settings' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify user is logged in
    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json(
        { message: 'Not authenticated' },
        { status: 401 }
      )
    }

    const payload = await verifyToken(token)
    if (!payload?.userId) {
      return NextResponse.json(
        { message: 'Invalid token' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { 
        twoFactorEnabled: true, 
        twoFactorMethod: true,
        emailVerified: true,
        phone: true
      }
    })

    return NextResponse.json({
      twoFactorEnabled: user?.twoFactorEnabled || false,
      twoFactorMethod: user?.twoFactorMethod || 'email',
      emailVerified: user?.emailVerified || false,
      hasPhone: !!user?.phone
    })
  } catch (error) {
    console.error('2FA settings error:', error)
    return NextResponse.json(
      { message: 'Failed to fetch 2FA settings' },
      { status: 500 }
    )
  }
}
