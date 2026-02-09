import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, createToken, setAuthCookie } from '@/lib/auth'
import { registerSchema } from '@/lib/validations'
import { createVerificationCode, sendVerificationEmail } from '@/lib/verification'
import { notifyWelcome, notifyNewRegistration } from '@/lib/notifications'
import { sendLoyaltyUpdateEmail } from '@/lib/email'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { referralCode } = body
    
    // Validate input
    const validatedData = registerSchema.parse(body)
    const normalizedEmail = validatedData.email.toLowerCase().trim()
    
    // Check if user already exists (case-insensitive)
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    })
    
    if (existingUser) {
      return NextResponse.json(
        { message: 'Email already registered' },
        { status: 400 }
      )
    }
    
    // Check if this is the first user (make them superadmin)
    const userCount = await prisma.user.count()
    const isFirstUser = userCount === 0
    
    // Hash password
    const hashedPassword = await hashPassword(validatedData.password)

    // Generate own referral code
    const ownReferralCode = crypto.randomBytes(4).toString('hex').toUpperCase()

    // For first user, create immediately (auto-verified)
    if (isFirstUser) {
      const user = await prisma.user.create({
        data: {
          name: validatedData.name,
          email: normalizedEmail,
          password: hashedPassword,
          phone: validatedData.phone || null,
          role: 'superadmin',
          emailVerified: true,
          referralCode: ownReferralCode,
        },
        select: { id: true, name: true, email: true, role: true, emailVerified: true }
      })

      // Send welcome notification
      try {
        await notifyWelcome(user.id, user.name)
        await notifyNewRegistration(user.name, user.email)
      } catch (e) {}

      return NextResponse.json({ 
        message: 'Superadmin account created successfully! You are the main administrator.',
        user,
        isFirstUser: true,
        requiresVerification: false
      }, { status: 201 })
    }

    // For regular users, don't create User record yet.
    // Store data in verification payload.
    const payload = {
      name: validatedData.name,
      email: normalizedEmail,
      password: hashedPassword,
      phone: validatedData.phone || null,
      referralCode: referralCode?.toString() || null,
      ownReferralCode
    }

    const code = await createVerificationCode(normalizedEmail, 'email_verify', undefined, payload)
    await sendVerificationEmail(normalizedEmail, code, 'email_verify')

    return NextResponse.json({ 
      message: 'Registration successful! Please check your email for verification code.',
      requiresVerification: true,
      email: normalizedEmail
    }, { status: 201 })

  } catch (error: any) {
    console.error('Registration error:', error)
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { message: 'Invalid input data', errors: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { message: 'Registration failed' },
      { status: 500 }
    )
  }
}
