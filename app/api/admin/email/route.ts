import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import nodemailer from 'nodemailer'

// GET - Get all newsletter subscribers
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const user = await verifyToken(token)
    if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const subscribers = await prisma.newsletterSubscriber.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    })

    // Map to expected format
    const mappedSubscribers = subscribers.map(s => ({
      id: s.id,
      email: s.email,
      name: null,
      subscribedAt: s.createdAt.toISOString(),
      isActive: s.isActive
    }))

    return NextResponse.json({ subscribers: mappedSubscribers })
  } catch (error) {
    console.error('Error fetching subscribers:', error)
    return NextResponse.json({ error: 'Failed to fetch subscribers' }, { status: 500 })
  }
}

// POST - Send email to subscribers with optional attachments
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const user = await verifyToken(token)
    if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { subject, message, recipients, attachments } = body

    if (!subject || !message) {
      return NextResponse.json({ error: 'Subject and message are required' }, { status: 400 })
    }

    // Check SMTP configuration
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      return NextResponse.json({ 
        error: 'SMTP not configured. Add SMTP_USER and SMTP_PASS to .env file.' 
      }, { status: 400 })
    }

    // Get recipients - either selected ones or all active subscribers
    let emailList: string[] = []
    if (recipients && recipients.length > 0) {
      emailList = recipients
    } else {
      const allSubscribers = await prisma.newsletterSubscriber.findMany({
        where: { isActive: true },
        select: { email: true }
      })
      emailList = allSubscribers.map(s => s.email)
    }

    if (emailList.length === 0) {
      return NextResponse.json({ error: 'No recipients found' }, { status: 400 })
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    })

    // Email HTML template
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">CTG Collection</h1>
        </div>
        <div style="background: #ffffff; padding: 30px; border: 1px solid #eee; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333; margin-bottom: 20px;">${subject}</h2>
          <div style="color: #666; line-height: 1.6;">
            ${message.replace(/\n/g, '<br>')}
          </div>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 12px; text-align: center;">
            You received this email because you subscribed to CTG Collection newsletter.
            <br><a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/unsubscribe" style="color: #667eea;">Unsubscribe</a>
          </p>
        </div>
      </div>
    `

    // Process attachments from base64
    const mailAttachments: any[] = []
    if (attachments && Array.isArray(attachments)) {
      for (const att of attachments) {
        if (att.name && att.data) {
          mailAttachments.push({
            filename: att.name,
            content: Buffer.from(att.data, 'base64'),
            contentType: att.type || 'application/octet-stream'
          })
        }
      }
    }

    // Send emails (batch for performance)
    let successCount = 0
    let failCount = 0

    for (const email of emailList) {
      try {
        await transporter.sendMail({
          from: `"CTG Collection" <${process.env.SMTP_USER}>`,
          to: email,
          subject: subject,
          html: html,
          attachments: mailAttachments.length > 0 ? mailAttachments : undefined
        })
        successCount++
      } catch (err) {
        console.error(`Failed to send to ${email}:`, err)
        failCount++
      }
    }

    const attachmentInfo = mailAttachments.length > 0 ? ` with ${mailAttachments.length} attachment(s)` : ''
    return NextResponse.json({ 
      success: true,
      sent: successCount,
      failed: failCount,
      message: `Emails sent to ${successCount} subscribers${attachmentInfo}${failCount > 0 ? `, ${failCount} failed` : ''}`
    })
  } catch (error: any) {
    console.error('Error sending emails:', error)
    return NextResponse.json({ error: error.message || 'Failed to send emails' }, { status: 500 })
  }
}

