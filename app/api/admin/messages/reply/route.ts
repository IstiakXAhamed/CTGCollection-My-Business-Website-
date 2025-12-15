import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'
import nodemailer from 'nodemailer'

// Check admin access
async function checkAdmin(request: NextRequest) {
  const user = await verifyAuth(request)
  if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
    return null
  }
  return user
}

// POST - Send reply to contact message
export async function POST(request: NextRequest) {
  try {
    const admin = await checkAdmin(request)
    if (!admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 401 })
    }

    const body = await request.json()
    const { messageId, replySubject, replyContent } = body

    if (!messageId || !replyContent) {
      return NextResponse.json({ error: 'Message ID and reply content are required' }, { status: 400 })
    }

    // Get original message
    const originalMessage = await (prisma as any).contactMessage.findUnique({
      where: { id: messageId }
    })

    if (!originalMessage) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    }

    // Mark as replied
    await (prisma as any).contactMessage.update({
      where: { id: messageId },
      data: { 
        isReplied: true, 
        isRead: true,
        adminNotes: `Replied on ${new Date().toLocaleString()}: ${replyContent.substring(0, 100)}...`
      }
    })

    // Check if the email belongs to a registered user
    const registeredUser = await prisma.user.findUnique({
      where: { email: originalMessage.email }
    })

    // If user is registered, send website notification
    if (registeredUser) {
      await prisma.notification.create({
        data: {
          userId: registeredUser.id,
          type: 'message',
          title: 'Reply to your message',
          message: `We've replied to your inquiry: "${originalMessage.subject}"`,
          link: '/dashboard/notifications'
        }
      })
    }

    // Send email reply
    let emailSent = false
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      })

      // Get store settings for sender info
      let siteSettings: any = null
      try {
        siteSettings = await (prisma as any).siteSettings.findUnique({ where: { id: 'main' } })
      } catch (e) {}

      const storeName = siteSettings?.storeName || 'CTG Collection'
      const storeEmail = siteSettings?.email || process.env.SMTP_USER || 'support@ctgcollection.com'

      await transporter.sendMail({
        from: `"${storeName}" <${storeEmail}>`,
        to: originalMessage.email,
        subject: replySubject || `Re: ${originalMessage.subject}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #3b82f6, #8b5cf6); padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0;">${storeName}</h1>
            </div>
            <div style="padding: 30px; background: #f9fafb;">
              <h2 style="color: #1f2937;">Reply to Your Message</h2>
              <p style="color: #6b7280;">Hi ${originalMessage.name},</p>
              <p style="color: #6b7280;">Thank you for contacting us. Here's our response to your inquiry:</p>
              <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6; margin: 20px 0;">
                ${replyContent.replace(/\n/g, '<br>')}
              </div>
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
              <p style="color: #9ca3af; font-size: 12px;">Original message: "${originalMessage.subject}"</p>
            </div>
            <div style="background: #1f2937; padding: 20px; text-align: center;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                © ${new Date().getFullYear()} ${storeName}. All rights reserved.
              </p>
            </div>
          </div>
        `,
      })
      emailSent = true
    } catch (emailError) {
      console.error('Failed to send email:', emailError)
      // Continue even if email fails
    }

    return NextResponse.json({ 
      success: true, 
      emailSent,
      notificationSent: !!registeredUser,
      message: emailSent 
        ? 'Reply sent successfully!' 
        : 'Reply saved but email could not be sent. Check SMTP settings.'
    })
  } catch (error: any) {
    console.error('Reply error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
