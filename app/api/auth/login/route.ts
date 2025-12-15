import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPassword, createToken, setAuthCookie } from '@/lib/auth'
import { loginSchema } from '@/lib/validations'
import { createVerificationCode, verifyCode, sendVerificationEmail } from '@/lib/verification'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Check if this is a 2FA verification request
    if (body.verify2FA && body.email && body.code) {
      return handle2FAVerification(body.email, body.code)
    }
    
    // Validate input
    const validatedData = loginSchema.parse(body)
    
    // Find user
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email }
    })
    
    if (!user) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Check if user has a password (OAuth users don't)
    if (!user.password) {
      return NextResponse.json(
        { message: 'This account uses social login. Please sign in with Google.' },
        { status: 401 }
      )
    }
    
    // Verify password
    const isValidPassword = await verifyPassword(validatedData.password, user.password)
    
    if (!isValidPassword) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      )
    }
    
    // Check if email is verified (required for non-admin users)
    if (!user.emailVerified && user.role === 'customer') {
      return NextResponse.json(
        { 
          message: 'Please verify your email before logging in',
          requiresVerification: true,
          email: user.email
        },
        { status: 403 }
      )
    }
    
    // Check if 2FA is enabled
    if (user.twoFactorEnabled) {
      // Send 2FA code
      const code = await createVerificationCode(user.email, 'login_2fa', user.id)
      await sendVerificationEmail(user.email, code, 'login_2fa')
      
      return NextResponse.json({
        message: 'Two-factor authentication required',
        requires2FA: true,
        email: user.email
      })
    }
    
    // Create JWT token (no 2FA required)
    const token = await createToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    })
    
    // Create response with user data
    const response = NextResponse.json({
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    })

    // Set HTTP-only cookie
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })
    
    return response
  } catch (error: any) {
    console.error('Login error:', error)
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { message: 'Invalid input data', errors: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { message: 'Login failed' },
      { status: 500 }
    )
  }
}

// Handle 2FA verification
async function handle2FAVerification(email: string, code: string) {
  try {
    // Verify the 2FA code
    const verification = await verifyCode(email, code, 'login_2fa')
    
    if (!verification.success) {
      return NextResponse.json(
        { message: verification.message },
        { status: 400 }
      )
    }
    
    // Get user
    const user = await prisma.user.findUnique({
      where: { email }
    })
    
    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      )
    }
    
    // Create JWT token
    const token = await createToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    })
    
    // Create response with user data
    const response = NextResponse.json({
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    })

    // Set HTTP-only cookie
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })
    
    return response
  } catch (error) {
    console.error('2FA verification error:', error)
    return NextResponse.json(
      { message: 'Verification failed' },
      { status: 500 }
    )
  }
}

