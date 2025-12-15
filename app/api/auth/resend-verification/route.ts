import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createVerificationCode, sendVerificationEmail } from '@/lib/verification'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { message: 'Email is required' },
        { status: 400 }
      )
    }

    // Check if user exists and is not verified
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, emailVerified: true, name: true }
    })

    if (!user) {
      return NextResponse.json(
        { message: 'No account found with this email' },
        { status: 404 }
      )
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { message: 'Email is already verified' },
        { status: 400 }
      )
    }

    // Generate and send new verification code
    const code = await createVerificationCode(email, 'email_verify', user.id)
    const sent = await sendVerificationEmail(email, code, 'email_verify')

    if (!sent) {
      return NextResponse.json(
        { message: 'Failed to send verification email. Please try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Verification code sent to your email'
    })
  } catch (error) {
    console.error('Resend verification error:', error)
    return NextResponse.json(
      { message: 'Failed to resend verification code' },
      { status: 500 }
    )
  }
}
