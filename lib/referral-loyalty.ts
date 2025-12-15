// Referral and Loyalty Program Services

import { prisma } from './prisma'
import crypto from 'crypto'
import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
})

// Referral Program Configuration
const REFERRAL_CONFIG = {
  referrerReward: 100,      // BDT credit for referrer
  refereeDiscount: 50,      // BDT discount for new user
  minOrderForReferralReward: 500  // Minimum order to activate reward
}

// Loyalty Points Configuration  
const LOYALTY_CONFIG = {
  pointsPerBDT: 1,          // Points earned per 1 BDT spent
  pointValue: 0.1,          // 1 point = 0.1 BDT (10 points = 1 BDT)
  minPointsToRedeem: 100,   // Minimum points needed to redeem
  maxRedemptionPercent: 20  // Max 20% of order can be paid with points
}

// Generate unique referral code
export function generateReferralCode(userId: string): string {
  const hash = crypto.createHash('md5').update(userId + Date.now().toString()).digest('hex')
  return `CTG${hash.slice(0, 6).toUpperCase()}`
}

// Get or create referral code for user
export async function getUserReferralCode(userId: string): Promise<string> {
  // Check if user already has a referral code
  const user = await (prisma.user.findUnique as any)({
    where: { id: userId },
    select: { referralCode: true }
  })

  if (user?.referralCode) {
    return user.referralCode
  }

  // Generate new code
  const code = generateReferralCode(userId)
  
  await (prisma.user.update as any)({
    where: { id: userId },
    data: { referralCode: code }
  })

  return code
}

// Apply referral code during signup
export async function applyReferralCode(newUserId: string, referralCode: string): Promise<{ success: boolean; message: string }> {
  try {
    // Find referrer
    const referrer = await (prisma.user.findFirst as any)({
      where: { referralCode: referralCode }
    })

    if (!referrer) {
      return { success: false, message: 'Invalid referral code' }
    }

    if (referrer.id === newUserId) {
      return { success: false, message: 'Cannot use your own referral code' }
    }

    // Link new user to referrer
    await (prisma.user.update as any)({
      where: { id: newUserId },
      data: { 
        referredById: referrer.id,
        walletBalance: REFERRAL_CONFIG.refereeDiscount  // Give discount credit
      }
    })

    // Create referral record
    await (prisma.referral.create as any)({
      data: {
        referrerId: referrer.id,
        refereeId: newUserId,
        status: 'pending',  // Will activate after first order
        rewardAmount: REFERRAL_CONFIG.referrerReward
      }
    })

    return { 
      success: true, 
      message: `Welcome! You've received ৳${REFERRAL_CONFIG.refereeDiscount} credit!` 
    }
  } catch (error) {
    console.error('Referral error:', error)
    return { success: false, message: 'Failed to apply referral code' }
  }
}

// Activate referral reward after first order
export async function activateReferralReward(refereeId: string, orderTotal: number): Promise<void> {
  if (orderTotal < REFERRAL_CONFIG.minOrderForReferralReward) return

  try {
    // Find pending referral
    const referral = await (prisma.referral.findFirst as any)({
      where: {
        refereeId: refereeId,
        status: 'pending'
      },
      include: {
        referrer: true
      }
    })

    if (!referral) return

    // Update referral status
    await (prisma.referral.update as any)({
      where: { id: referral.id },
      data: { 
        status: 'completed',
        completedAt: new Date()
      }
    })

    // Credit referrer wallet
    await (prisma.user.update as any)({
      where: { id: referral.referrerId },
      data: {
        walletBalance: { increment: REFERRAL_CONFIG.referrerReward }
      }
    })

    // Notify referrer
    if (referral.referrer?.email) {
      await sendReferralRewardEmail(
        referral.referrer.email,
        referral.referrer.name,
        REFERRAL_CONFIG.referrerReward
      )
    }
  } catch (error) {
    console.error('Activate referral error:', error)
  }
}

// Calculate loyalty points for an order
export function calculateLoyaltyPoints(orderTotal: number): number {
  return Math.floor(orderTotal * LOYALTY_CONFIG.pointsPerBDT)
}

// Credit loyalty points after order
export async function creditLoyaltyPoints(userId: string, orderTotal: number, orderId: string): Promise<number> {
  const points = calculateLoyaltyPoints(orderTotal)

  if (points <= 0) return 0

  try {
    // Update user points
    await (prisma.user.update as any)({
      where: { id: userId },
      data: {
        loyaltyPoints: { increment: points }
      }
    })

    // Log transaction
    await (prisma.loyaltyTransaction.create as any)({
      data: {
        userId,
        orderId,
        points,
        type: 'earned',
        description: `Earned from order`
      }
    })

    return points
  } catch (error) {
    console.error('Credit points error:', error)
    return 0
  }
}

// Redeem loyalty points
export async function redeemLoyaltyPoints(
  userId: string, 
  pointsToRedeem: number,
  orderTotal: number
): Promise<{ success: boolean; discount: number; message: string }> {
  try {
    const user = await (prisma.user.findUnique as any)({
      where: { id: userId },
      select: { loyaltyPoints: true }
    })

    if (!user) {
      return { success: false, discount: 0, message: 'User not found' }
    }

    if (user.loyaltyPoints < LOYALTY_CONFIG.minPointsToRedeem) {
      return { 
        success: false, 
        discount: 0, 
        message: `Minimum ${LOYALTY_CONFIG.minPointsToRedeem} points required` 
      }
    }

    if (pointsToRedeem > user.loyaltyPoints) {
      return { success: false, discount: 0, message: 'Insufficient points' }
    }

    // Calculate max discount allowed
    const maxDiscount = orderTotal * (LOYALTY_CONFIG.maxRedemptionPercent / 100)
    const discount = Math.min(
      pointsToRedeem * LOYALTY_CONFIG.pointValue,
      maxDiscount
    )
    const actualPointsUsed = Math.ceil(discount / LOYALTY_CONFIG.pointValue)

    // Deduct points
    await (prisma.user.update as any)({
      where: { id: userId },
      data: {
        loyaltyPoints: { decrement: actualPointsUsed }
      }
    })

    return {
      success: true,
      discount,
      message: `Redeemed ${actualPointsUsed} points for ৳${discount.toFixed(0)} discount!`
    }
  } catch (error) {
    console.error('Redeem points error:', error)
    return { success: false, discount: 0, message: 'Failed to redeem points' }
  }
}

// Get user's loyalty summary
export async function getLoyaltySummary(userId: string) {
  const user = await (prisma.user.findUnique as any)({
    where: { id: userId },
    select: {
      loyaltyPoints: true,
      walletBalance: true,
      referralCode: true
    }
  })

  const referralCount = await (prisma.referral.count as any)({
    where: { 
      referrerId: userId,
      status: 'completed'
    }
  })

  return {
    points: user?.loyaltyPoints || 0,
    pointsValue: (user?.loyaltyPoints || 0) * LOYALTY_CONFIG.pointValue,
    walletBalance: user?.walletBalance || 0,
    referralCode: user?.referralCode || null,
    referralsCompleted: referralCount,
    canRedeem: (user?.loyaltyPoints || 0) >= LOYALTY_CONFIG.minPointsToRedeem
  }
}

// Send referral reward email
async function sendReferralRewardEmail(to: string, name: string, amount: number) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #fff; padding: 30px; border: 1px solid #eee; text-align: center; }
        .amount { font-size: 48px; font-weight: bold; color: #10b981; margin: 20px 0; }
        .button { display: inline-block; background: #10b981; color: white; padding: 15px 40px; text-decoration: none; border-radius: 30px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0;">🎉 Referral Reward!</h1>
        </div>
        
        <div class="content">
          <p>Hi ${name},</p>
          <p>Great news! Your friend just made their first purchase using your referral code.</p>
          
          <div class="amount">৳${amount}</div>
          <p>has been added to your wallet!</p>
          
          <a href="${process.env.NEXT_PUBLIC_URL}/dashboard/wallet" class="button">
            View Your Wallet →
          </a>
          
          <p style="margin-top: 30px; color: #666; font-size: 14px;">
            Keep sharing your referral code to earn more rewards!
          </p>
        </div>
      </div>
    </body>
    </html>
  `

  await transporter.sendMail({
    from: `"CTG Collection" <${process.env.SMTP_USER}>`,
    to,
    subject: `🎉 You earned ৳${amount} referral reward!`,
    html
  })
}
