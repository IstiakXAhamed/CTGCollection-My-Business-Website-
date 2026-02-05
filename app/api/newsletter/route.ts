import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmailWithAttachments } from '@/lib/email'

export const dynamic = 'force-dynamic'

// POST - Subscribe to newsletter
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, source, discountCode } = body

    // Validation
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
    }

    // Check if already subscribed
    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email }
    })

    if (existing) {
      if (existing.isActive) {
        return NextResponse.json({ 
          success: false, 
          message: 'You are already subscribed to our newsletter!' 
        }, { status: 400 })
      } else {
        // Reactivate subscription
        await prisma.newsletterSubscriber.update({
          where: { email },
          data: { 
            isActive: true, 
            unsubscribedAt: null,
            confirmedAt: new Date() 
          }
        })
      }
    } else {
      // Create new subscriber
      await prisma.newsletterSubscriber.create({
        data: {
          email,
          source: source || 'footer',
          discountCode: discountCode || null,
          confirmedAt: new Date() // Auto-confirm for now
        }
      })
    }

    // Send welcome email
    console.log('🔔 Newsletter: Attempting to send welcome email to:', email)
    console.log('🔔 SMTP Config - Host:', process.env.SMTP_HOST, 'User:', process.env.SMTP_USER ? 'SET' : 'NOT SET')
    
    const welcomeHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 0; background: #f4f4f4; }
          .container { max-width: 600px; margin: 0 auto; background: white; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; color: white; }
          .content { padding: 40px; text-align: center; }
          .code-box { background: #f0f9ff; border: 2px dashed #3b82f6; border-radius: 10px; padding: 20px; margin: 20px 0; }
          .code { font-size: 28px; font-family: monospace; color: #3b82f6; font-weight: bold; letter-spacing: 3px; }
          .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 40px; text-decoration: none; border-radius: 30px; font-weight: bold; margin-top: 20px; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; font-size: 28px;">Welcome to CTG Collection! 🎉</h1>
          </div>
          <div class="content">
            <p style="font-size: 18px; color: #333;">Thank you for subscribing to our newsletter!</p>
            <p style="color: #666;">You'll now receive exclusive offers, new arrivals, and special discounts directly in your inbox.</p>
            ${discountCode ? `
              <div class="code-box">
                <p style="margin: 0 0 10px 0; color: #666;">Your exclusive welcome discount:</p>
                <div class="code">${discountCode}</div>
                <p style="margin: 10px 0 0 0; color: #888; font-size: 14px;">Use at checkout for your discount!</p>
              </div>
            ` : ''}
            <a href="${process.env.NEXT_PUBLIC_URL}/shop" class="button">Start Shopping →</a>
          </div>
          <div class="footer">
            <p>CTG Collection - Premium E-Commerce Store</p>
            <p>You can unsubscribe at any time from your account settings.</p>
          </div>
        </div>
      </body>
      </html>
    `

    let emailSent = false
    try {
      emailSent = await sendEmailWithAttachments({
        to: email,
        subject: discountCode 
          ? `🎁 Welcome! Here's Your ${discountCode} Discount Code` 
          : '🎉 Welcome to CTG Collection Newsletter!',
        html: welcomeHtml
      })
      console.log('🔔 Newsletter email send result:', emailSent ? 'SUCCESS' : 'FAILED')
    } catch (emailError: any) {
      console.error('🔔 Newsletter email error:', emailError.message || emailError)
    }

    return NextResponse.json({
      success: true,
      message: emailSent 
        ? 'Successfully subscribed! Check your email for confirmation.' 
        : 'Subscribed! (Email may arrive shortly)',
      emailSent
    })
  } catch (error: any) {
    console.error('Newsletter subscription error:', error)
    return NextResponse.json({ error: error.message || 'Subscription failed' }, { status: 500 })
  }
}

// GET - List subscribers (admin)  
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const skip = (page - 1) * limit

    const [subscribers, total] = await Promise.all([
      prisma.newsletterSubscriber.findMany({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip
      }),
      prisma.newsletterSubscriber.count({ where: { isActive: true } })
    ])

    return NextResponse.json({ 
      subscribers, 
      total,
      pages: Math.ceil(total / limit),
      currentPage: page
    })
  } catch (error: any) {
    console.error('Get subscribers error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE - Unsubscribe
export async function DELETE(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    await prisma.newsletterSubscriber.update({
      where: { email },
      data: { 
        isActive: false, 
        unsubscribedAt: new Date() 
      }
    })

    return NextResponse.json({ success: true, message: 'Unsubscribed successfully' })
  } catch (error: any) {
    console.error('Unsubscribe error:', error)
    return NextResponse.json({ error: 'Unsubscribe failed' }, { status: 500 })
  }
}
