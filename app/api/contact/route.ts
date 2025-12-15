import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { notifyNewContactMessage } from '@/lib/notifications'

// POST - Submit contact form (public)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, subject, message } = body

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: 'Name, email, subject and message are required' }, { status: 400 })
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    const contactMessage = await (prisma as any).contactMessage.create({
      data: {
        name,
        email,
        phone: phone || null,
        subject,
        message
      }
    })

    // Notify admins about new contact message
    try {
      await notifyNewContactMessage(name, subject)
    } catch (e) {
      console.log('Notification error (non-blocking):', e)
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Message sent successfully! We will get back to you soon.',
      id: contactMessage.id 
    })
  } catch (error: any) {
    console.error('Contact form error:', error)
    return NextResponse.json({ error: 'Failed to send message. Please try again.' }, { status: 500 })
  }
}
