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
    
    // Check referral code if provided
    let referrerId = null
    let referredBonus = 0
    let referrerBonus = 0

    if (referralCode && !isFirstUser) {
      const referrer = await prisma.user.findUnique({
        where: { referralCode: referralCode.toString() }
      })
      
      if (referrer) {
        referrerId = referrer.id
        // Fetch loyalty settings
        const settings = await prisma.loyaltySettings.findFirst() as any
        if (settings && settings.isEnabled) {
          referredBonus = settings.referralBonusReferred
          referrerBonus = settings.referralBonusReferrer
        }
      }
    }
    
    // Create user with emailVerified = false (except for first user/superadmin)
    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: normalizedEmail, // Store lowercase email
        password: hashedPassword,
        phone: validatedData.phone || null,
        role: isFirstUser ? 'superadmin' : 'customer',
        emailVerified: isFirstUser, // First user (superadmin) is auto-verified
        referralCode: ownReferralCode,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        emailVerified: true,
      }
    })

    // Handle Referral Logic
    if (referrerId && (referredBonus > 0 || referrerBonus > 0)) {
       try {
         // Create Referral Record
         const referral = await prisma.referral.create({
           data: {
             referrerId,
             referredId: user.id,
             referralCode: referralCode.toString(),
             status: 'completed', // Instant bonus
             referrerBonus,
             referredBonus
           } as any
         })

         // Credit new user (Referred)
         if (referredBonus > 0) {
           await prisma.loyaltyPoints.upsert({
             where: { userId: user.id },
             create: {
               userId: user.id,
               totalPoints: referredBonus,
               lifetimePoints: referredBonus,
             } as any,
             update: {
               totalPoints: { increment: referredBonus },
               lifetimePoints: { increment: referredBonus }
             } as any
           })

           // Transaction Record
           await prisma.pointsTransaction.create({
             data: {
               userId: user.id,
               loyaltyId: (await prisma.loyaltyPoints.findUnique({ where: { userId: user.id } }))!.id,
               type: 'referral',
               points: referredBonus,
               description: 'Welcome bonus for using referral code'
             } as any
           })

           // Email New User
           await sendLoyaltyUpdateEmail(user.email, {
             customerName: user.name,
             type: 'Referral Bonus',
             points: referredBonus,
             message: 'Welcome bonus added to your wallet!'
           })
         }
         
         // Note: Referrer bonus might be delayed or instant. For now, we skip crediting referrer to avoid exploitation without purchase. 
         // Or if 'status' is completed, maybe we should? User said "Instant". 
         // Let's credit referrer too for "Instant" satisfaction as per request.
         
         if (referrerBonus > 0) {
            // Credit Referrer
            await prisma.loyaltyPoints.upsert({
             where: { userId: referrerId },
             create: {
               userId: referrerId,
               totalPoints: referrerBonus,
               lifetimePoints: referrerBonus,
             },
             update: {
               totalPoints: { increment: referrerBonus },
               lifetimePoints: { increment: referrerBonus }
             }
           })
           
           // Transaction for Referrer
           const referrerLoyalty = await prisma.loyaltyPoints.findUnique({ where: { userId: referrerId } })
           if (referrerLoyalty) {
              await prisma.pointsTransaction.create({
                data: {
                  userId: referrerId,
                  loyaltyId: referrerLoyalty.id,
                  type: 'referral',
                  points: referrerBonus,
                  description: `Bonus for referring ${user.name}`
                }
              })
              
              // Email Referrer
              const referrer = await prisma.user.findUnique({ where: { id: referrerId } })
              if (referrer) {
                await sendLoyaltyUpdateEmail(referrer.email, {
                  customerName: referrer.name,
                  type: 'Referral Bonus',
                  points: referrerBonus,
                  message: `You referred ${user.name}!`
                })
              }
           }
         }

       } catch (refError) {
         console.error('Referral processing error:', refError)
       }
    }
    
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

