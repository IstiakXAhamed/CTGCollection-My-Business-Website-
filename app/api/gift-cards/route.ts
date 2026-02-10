import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'
import { getTransporter } from '@/lib/email'

export const dynamic = 'force-dynamic'

// POST - Create gift card
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { amount, recipientEmail, recipientName, senderName, message } = body

    // Validation
    if (!amount || amount < 100 || amount > 50000) {
      return NextResponse.json({ error: 'Amount must be between ৳100 and ৳50,000' }, { status: 400 })
    }
    if (!recipientEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail)) {
      return NextResponse.json({ error: 'Invalid recipient email' }, { status: 400 })
    }
    if (!recipientName?.trim() || !senderName?.trim()) {
      return NextResponse.json({ error: 'Recipient and sender names are required' }, { status: 400 })
    }

    // Generate unique gift card code
    const code = 'GC' + crypto.randomBytes(6).toString('hex').toUpperCase()

    // Calculate expiry (1 year from now)
    const expiresAt = new Date()
    expiresAt.setFullYear(expiresAt.getFullYear() + 1)

    // In production, create gift card in database
    // For now, simulate creation
    const giftCard = {
      id: crypto.randomUUID(),
      code,
      amount,
      balance: amount,
      recipientEmail,
      recipientName,
      senderName,
      message,
      status: 'active',
      expiresAt: expiresAt.toISOString(),
      createdAt: new Date().toISOString()
    }

    // Send email to recipient (using shared transport — no new threads)
    try {

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', sans-serif; }
            .container { max-width: 600px; margin: 0 auto; }
            .card { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 20px; padding: 40px; color: white; text-align: center; }
            .code { font-size: 32px; font-family: monospace; letter-spacing: 4px; margin: 20px 0; }
            .amount { font-size: 48px; font-weight: bold; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="card">
              <h1>🎁 You've received a Gift Card!</h1>
              <p>From: ${senderName}</p>
              <div class="amount">৳${amount}</div>
              <p>Your Gift Card Code:</p>
              <div class="code">${code}</div>
              ${message ? `<p style="font-style: italic;">"${message}"</p>` : ''}
              <p>Valid until: ${expiresAt.toLocaleDateString()}</p>
            </div>
            <p style="text-align: center; margin-top: 20px;">
              <a href="${process.env.NEXT_PUBLIC_URL}/shop" style="background: #667eea; color: white; padding: 12px 30px; border-radius: 30px; text-decoration: none;">
                Shop Now
              </a>
            </p>
          </div>
        </body>
        </html>
      `

      await getTransporter().sendMail({
        from: `"Silk Mart" <${process.env.SMTP_USER}>`,
        to: recipientEmail,
        subject: `🎁 ${senderName} sent you a ৳${amount} Gift Card!`,
        html
      })
    } catch (emailError) {
      console.error('Failed to send gift card email:', emailError)
    }

    return NextResponse.json({ success: true, giftCard })
  } catch (error: any) {
    console.error('Gift card creation error:', error)
    return NextResponse.json({ error: error.message || 'Failed to create gift card' }, { status: 500 })
  }
}

// GET - List gift cards (for admin)
export async function GET(request: NextRequest) {
  try {
    // In production, fetch from database
    return NextResponse.json({ giftCards: [] })
  } catch (error: any) {
    console.error('Get gift cards error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
