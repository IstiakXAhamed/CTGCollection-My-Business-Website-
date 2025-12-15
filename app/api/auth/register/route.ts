import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, createToken, setAuthCookie } from '@/lib/auth'
import { registerSchema } from '@/lib/validations'
import { createVerificationCode, sendVerificationEmail } from '@/lib/verification'
import { notifyWelcome, notifyNewRegistration } from '@/lib/notifications'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
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
    
    // Create user with emailVerified = false (except for first user/superadmin)
    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: normalizedEmail, // Store lowercase email
        password: hashedPassword,
        phone: validatedData.phone || null,
        role: isFirstUser ? 'superadmin' : 'customer',
        emailVerified: isFirstUser, // First user (superadmin) is auto-verified
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        emailVerified: true,
      }
    })
    
    // Send verification email (unless first user/superadmin)
    if (!isFirstUser) {
      const code = await createVerificationCode(user.email, 'email_verify', user.id)
      await sendVerificationEmail(user.email, code, 'email_verify')
    }
    
    // Send notifications
    try {
      // Welcome notification for new user
      await notifyWelcome(user.id, user.name)
      // Notify admins about new registration
      await notifyNewRegistration(user.name, user.email)
    } catch (e) {
      console.log('Notification error (non-blocking):', e)
    }
    
    return NextResponse.json(
      { 
        message: isFirstUser 
          ? 'Superadmin account created successfully! You are the main administrator.'
          : 'Registration successful! Please check your email for verification code.',
        user,
        isFirstUser,
        requiresVerification: !isFirstUser
      },
      { status: 201 }
    )
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

