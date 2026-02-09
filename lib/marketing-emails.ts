// Birthday Discount Service
// Automatically sends birthday discount coupons to users

import { prisma } from './prisma'
import { sendOrderConfirmation } from './email'
import { getTransporter } from './email'

// Check and send birthday discounts (run daily via cron)
export async function sendBirthdayDiscounts() {
  try {
    const today = new Date()
    const month = today.getMonth() + 1
    const day = today.getDate()

    // Find users with birthday today
    const users = await (prisma.user.findMany as any)({
      where: {
        birthday: {
          not: null
        }
      }
    })

    const birthdayUsers = users.filter((user: any) => {
      if (!user.birthday) return false
      const bday = new Date(user.birthday)
      return bday.getMonth() + 1 === month && bday.getDate() === day
    })

    console.log(`Found ${birthdayUsers.length} users with birthdays today`)

    for (const user of birthdayUsers) {
      // Create unique birthday coupon
      const couponCode = `BDAY${user.id.slice(0, 4).toUpperCase()}${today.getFullYear()}`
      
      // Check if coupon already exists
      const existingCoupon = await (prisma.coupon.findUnique as any)({
        where: { code: couponCode }
      })

      if (existingCoupon) {
        console.log(`Birthday coupon already exists for ${user.email}`)
        continue
      }

      // Create birthday coupon (15% off, valid for 7 days)
      const validUntil = new Date()
      validUntil.setDate(validUntil.getDate() + 7)

      await (prisma.coupon.create as any)({
        data: {
          code: couponCode,
          description: `🎂 Happy Birthday ${user.name}! Enjoy 15% off`,
          discountType: 'percentage',
          discountValue: 15,
          minOrderValue: 500,
          maxDiscount: 500,
          validFrom: today,
          validUntil: validUntil,
          usageLimit: 1,
          usageCount: 0,
          isActive: true
        }
      })

      // Send birthday email
      await sendBirthdayEmail(user.email, user.name, couponCode)
      console.log(`Birthday discount sent to ${user.email}`)
    }

    return { success: true, count: birthdayUsers.length }
  } catch (error) {
    console.error('Error sending birthday discounts:', error)
    return { success: false, error }
  }
}

async function sendBirthdayEmail(to: string, name: string, couponCode: string) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #ff6b6b 0%, #feca57 100%); color: white; padding: 40px; text-align: center; border-radius: 15px 15px 0 0; }
        .content { background: #fff; padding: 30px; border: 1px solid #eee; }
        .coupon { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px; text-align: center; margin: 20px 0; }
        .coupon-code { font-size: 28px; font-weight: bold; letter-spacing: 3px; margin: 10px 0; }
        .button { display: inline-block; background: #667eea; color: white; padding: 15px 40px; text-decoration: none; border-radius: 30px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="font-size: 40px; margin: 0;">🎂 Happy Birthday!</h1>
          <p style="font-size: 18px; margin-top: 10px;">${name}</p>
        </div>
        
        <div class="content">
          <p style="font-size: 18px;">Dear ${name},</p>
          <p>On your special day, we want to celebrate with you! 🎉</p>
          <p>As our valued customer, we're giving you an exclusive birthday gift:</p>
          
          <div class="coupon">
            <p style="margin: 0;">🎁 Your Birthday Gift</p>
            <p style="font-size: 28px; margin: 10px 0;">15% OFF</p>
            <p class="coupon-code">${couponCode}</p>
            <p style="font-size: 12px; margin: 0;">Valid for 7 days • Min. order ৳500</p>
          </div>
          
          <center>
            <a href="${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/shop" class="button">
              Shop Now & Celebrate! 🛍️
            </a>
          </center>
          
          <p style="margin-top: 30px; color: #666;">
            Wishing you a wonderful birthday filled with joy and happiness!<br>
            - The CTG Collection Team 💝
          </p>
        </div>
      </div>
    </body>
    </html>
  `

  await getTransporter().sendMail({
    from: `"CTG Collection 🎂" <${process.env.SMTP_USER}>`,
    to,
    subject: `🎂 Happy Birthday ${name}! Here's 15% OFF just for you!`,
    html
  })
}

// Abandoned Cart Email Service
export async function sendAbandonedCartEmails() {
  try {
    // Find carts abandoned more than 1 hour ago but less than 24 hours
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)

    // This would need a Cart model in schema
    // For now, we'll use a simplified approach with orders in 'pending' status
    const abandonedOrders = await (prisma.order.findMany as any)({
      where: {
        status: 'pending',
        paymentStatus: 'pending',
        createdAt: {
          gte: oneDayAgo,
          lte: oneHourAgo
        },
        abandonedEmailSent: { not: true }
      },
      include: {
        user: true,
        items: { include: { product: true } }
      }
    })

    console.log(`Found ${abandonedOrders.length} abandoned carts`)

    for (const order of abandonedOrders) {
      const email = order.user?.email || order.guestEmail
      if (!email) continue

      await sendAbandonedCartEmail(email, order)
      
      // Mark as email sent
      await (prisma.order.update as any)({
        where: { id: order.id },
        data: { abandonedEmailSent: true }
      })

      console.log(`Abandoned cart email sent to ${email}`)
    }

    return { success: true, count: abandonedOrders.length }
  } catch (error) {
    console.error('Error sending abandoned cart emails:', error)
    return { success: false, error }
  }
}

async function sendAbandonedCartEmail(to: string, order: any) {
  const itemsHtml = order.items.slice(0, 3).map((item: any) => `
    <tr>
      <td style="padding: 15px; border-bottom: 1px solid #eee;">
        <img src="${item.product.images?.[0] || ''}" alt="${item.product.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;">
      </td>
      <td style="padding: 15px; border-bottom: 1px solid #eee;">
        <strong>${item.product.name}</strong><br>
        <span style="color: #666;">Qty: ${item.quantity}</span>
      </td>
      <td style="padding: 15px; border-bottom: 1px solid #eee; text-align: right;">
        <strong>৳${item.price.toFixed(0)}</strong>
      </td>
    </tr>
  `).join('')

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #fff; padding: 30px; border: 1px solid #eee; }
        .button { display: inline-block; background: #667eea; color: white; padding: 15px 40px; text-decoration: none; border-radius: 30px; margin-top: 20px; }
        table { width: 100%; border-collapse: collapse; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0;">🛒 Did you forget something?</h1>
        </div>
        
        <div class="content">
          <p style="font-size: 18px;">Hi there,</p>
          <p>You left some amazing items in your cart! They're waiting for you:</p>
          
          <table style="margin: 20px 0;">
            ${itemsHtml}
          </table>
          
          <div style="background: #f7f7f7; padding: 15px; border-radius: 8px; text-align: center;">
            <strong style="font-size: 20px;">Total: ৳${order.total.toFixed(0)}</strong>
          </div>
          
          <center>
            <a href="${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/checkout" class="button">
              Complete Your Order →
            </a>
          </center>
          
          <p style="margin-top: 30px; color: #666; font-size: 14px;">
            Questions? Reply to this email or contact us at ctgcollection2@gmail.com
          </p>
        </div>
      </div>
    </body>
    </html>
  `

  await getTransporter().sendMail({
    from: `"CTG Collection" <${process.env.SMTP_USER}>`,
    to,
    subject: `🛒 Your cart is waiting! Complete your order`,
    html
  })
}
