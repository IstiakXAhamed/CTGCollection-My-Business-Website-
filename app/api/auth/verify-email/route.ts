import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyCode } from '@/lib/verification'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const email = body.email?.toLowerCase().trim()
    const code = body.code

    if (!email || !code) {
      return NextResponse.json(
        { message: 'Email and verification code are required' },
        { status: 400 }
      )
    }

    // Verify the code
    const result = await verifyCode(email, code, 'email_verify')

    if (!result.success) {
      return NextResponse.json(
        { message: result.message },
        { status: 400 }
      )
    }

    // Mark user as verified
    const user = await prisma.user.update({
      where: { email },
      data: { 
        emailVerified: true,
        verificationToken: null,
        verificationExpiry: null
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully! You can now log in.',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        emailVerified: user.emailVerified
      }
    })
  } catch (error) {
    console.error('Email verification error:', error)
    return NextResponse.json(
      { message: 'Failed to verify email' },
      { status: 500 }
    )
  }
}
