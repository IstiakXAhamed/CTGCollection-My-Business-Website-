import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { notifyNewChatMessage } from '@/lib/notifications'

export const dynamic = 'force-dynamic'

// GET messages for a session
export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params
    const { searchParams } = new URL(request.url)
    const after = searchParams.get('after')

    // Find session first
    const session = await (prisma as any).chatSession.findUnique({
      where: { sessionId }
    })

    if (!session) {
      return NextResponse.json({ messages: [] })
    }

    // Build where clause - only get messages for THIS specific session
    let whereClause: any = { sessionId: session.id }
    if (after) {
      whereClause.createdAt = { gt: new Date(after) }
    }

    const messages = await (prisma as any).chatMessage.findMany({
      where: whereClause,
      orderBy: { createdAt: 'asc' }
    })

    return NextResponse.json({ messages })
  } catch (error: any) {
    console.error('Get messages error:', error)
    return NextResponse.json({ messages: [], error: 'Database not ready' })
  }
}

// POST new message - ISOLATED to specific session
export async function POST(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params
    const body = await request.json()
    const { message, senderType, senderName, customerEmail } = body

    // Get sender ID if authenticated
    let senderId = null
    let actualSenderName = senderName
    const token = request.cookies.get('token')?.value
    if (token) {
      try {
        const payload = await verifyToken(token)
        if (payload?.userId) {
          senderId = payload.userId
          // Get actual name from database for accuracy
          if (senderType === 'customer') {
            const user = await prisma.user.findUnique({
              where: { id: payload.userId },
              select: { name: true }
            })
            if (user?.name) actualSenderName = user.name
          }
        }
      } catch {}
    }

    // Find or create session with customer name
    let session = await (prisma as any).chatSession.findUnique({
      where: { sessionId }
    })

    if (!session) {
      session = await (prisma as any).chatSession.create({
        data: {
          sessionId,
          userId: senderId,
          customerName: actualSenderName || 'Guest',
          customerEmail: customerEmail || null,
          status: 'active'
        }
      })
    } else if (senderType === 'customer' && actualSenderName && actualSenderName !== 'Guest') {
      // Update customer name if they log in
      await (prisma as any).chatSession.update({
        where: { id: session.id },
        data: { 
          customerName: actualSenderName,
          customerEmail: customerEmail || session.customerEmail
        }
      })
    }

    // Create message - tied to THIS specific session only
    const newMessage = await (prisma as any).chatMessage.create({
      data: {
        sessionId: session.id, // Links to specific session
        senderType,
        senderId,
        senderName: actualSenderName || (senderType === 'admin' ? 'Support' : 'Guest'),
        message,
        isRead: false
      }
    })

    // Update session timestamp
    await (prisma as any).chatSession.update({
      where: { id: session.id },
      data: { updatedAt: new Date() }
    })

    console.log(`[CHAT] Session:${sessionId.substring(0,10)}... | ${senderType} (${actualSenderName}): ${message}`)

    // Notify admins when customer sends a message
    if (senderType === 'customer') {
      try {
        await notifyNewChatMessage(actualSenderName || 'Guest', sessionId)
      } catch (e) {
        console.log('Notification error (non-blocking):', e)
      }
    }

    return NextResponse.json({ message: newMessage })
  } catch (error: any) {
    console.error('Send message error:', error)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}

// PATCH - Mark messages as read
export async function PATCH(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params
    const body = await request.json()
    const { markAsRead, senderType } = body

    if (markAsRead) {
      const session = await (prisma as any).chatSession.findUnique({
        where: { sessionId }
      })

      if (session) {
        await (prisma as any).chatMessage.updateMany({
          where: {
            sessionId: session.id,
            senderType: senderType === 'admin' ? 'customer' : 'admin',
            isRead: false
          },
          data: { isRead: true }
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Mark read error:', error)
    return NextResponse.json({ success: false })
  }
}

// DELETE - Close/delete a chat session (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    // Verify admin authorization
    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const payload = await verifyToken(token)
    if (!payload || (payload.role !== 'admin' && payload.role !== 'superadmin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { sessionId } = params
    
    // First, send a goodbye message to the customer
    await (prisma as any).chatMessage.create({
      data: {
        sessionId,
        senderType: 'system',
        senderId: payload.userId,
        senderName: 'Support',
        message: 'Thank you for contacting us! This chat session has been closed. If you have any more questions, feel free to start a new chat. Have a great day! 👋',
        isRead: false
      }
    })

    // Update session status to 'closed'
    await (prisma as any).chatSession.update({
      where: { sessionId },
      data: { status: 'closed' }
    })

    console.log(`[CHAT] Session ${sessionId.substring(0,10)}... closed by admin with bye message`)

    return NextResponse.json({ success: true, message: 'Session closed' })
  } catch (error: any) {
    console.error('Close session error:', error)
    return NextResponse.json({ error: 'Failed to close session' }, { status: 500 })
  }
}
