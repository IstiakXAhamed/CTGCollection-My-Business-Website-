import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyCode } from '@/lib/verification'

export const dynamic = 'force-dynamic'

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

    // Mark user as verified or create user if payload exists
    let user: any = null

    if (result.payload) {
      const p = result.payload as any
      // Create the user now that they are verified
      user = await prisma.user.create({
        data: {
          name: p.name,
          email: email,
          password: p.password,
          phone: p.phone,
          role: 'customer',
          emailVerified: true,
          referralCode: p.ownReferralCode
        }
      })

      // Send notifications for new registration
      try {
        const { notifyWelcome, notifyNewRegistration } = await import('@/lib/notifications')
        await notifyWelcome(user.id, user.name)
        await notifyNewRegistration(user.name, user.email)
      } catch (e) {}

      // Handle Referral Logic if referralCode was provided
      if (p.referralCode) {
        try {
          const referrer = await prisma.user.findUnique({
            where: { referralCode: p.referralCode }
          })
          
          if (referrer) {
            const settings = await prisma.loyaltySettings.findFirst() as any
            const referredBonus = settings?.isEnabled ? settings.referralBonusReferred : 0
            const referrerBonus = settings?.isEnabled ? settings.referralBonusReferrer : 0

            if (referredBonus > 0 || referrerBonus > 0) {
              await prisma.referral.create({
                data: {
                  referrerId: referrer.id,
                  referredId: user.id,
                  referralCode: p.referralCode,
                  status: 'completed',
                  referrerBonus,
                  referredBonus
                } as any
              })

              if (referredBonus > 0) {
                await prisma.loyaltyPoints.upsert({
                  where: { userId: user.id },
                  create: { userId: user.id, totalPoints: referredBonus, lifetimePoints: referredBonus } as any,
                  update: { totalPoints: { increment: referredBonus }, lifetimePoints: { increment: referredBonus } } as any
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
              }

              if (referrerBonus > 0) {
                await prisma.loyaltyPoints.upsert({
                  where: { userId: referrer.id },
                  create: { userId: referrer.id, totalPoints: referrerBonus, lifetimePoints: referrerBonus } as any,
                  update: { totalPoints: { increment: referrerBonus }, lifetimePoints: { increment: referrerBonus } } as any
                })
              }
            }
          }
        } catch (e) {
          console.error('Verify referral error:', e)
        }
      }
    } else {
      // Normal verification for existing user
      user = await prisma.user.update({
        where: { email },
        data: { 
          emailVerified: true,
          verificationToken: null,
          verificationExpiry: null
        }
      })
    }

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
