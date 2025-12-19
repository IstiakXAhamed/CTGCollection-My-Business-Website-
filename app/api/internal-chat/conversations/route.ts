import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET /api/internal-chat/conversations
// Fetch list of users the current user has chatted with, ordered by last message time
export async function GET(req: NextRequest) {
  try {
    // 1. Get current user (mock/session)
    // In real app, get from session. For now, assuming request header or session util
    const authRes = await fetch(new URL('/api/auth/me', req.url), { headers: req.headers })
    const authData = await authRes.json()
    
    if (!authData.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const userId = authData.user.id

    // 2. Find all unique users from sent and received messages
    // This is a bit complex in Prisma (group by). 
    // Easier strategy: Find all messages involving this user, sort desc, then filter unique counterparts
    
    const messages = await (prisma as any).internalMessage.findMany({
      where: {
        OR: [
          { senderId: userId },
          { receiverId: userId }
        ]
      },
      orderBy: { createdAt: 'desc' },
      include: {
        sender: { select: { id: true, name: true, role: true, email: true } },
        receiver: { select: { id: true, name: true, role: true, email: true } }
      }
    })

    // 3. Process into conversations
    const conversations = new Map()

    for (const msg of messages) {
      const otherUser = msg.senderId === userId ? msg.receiver : msg.sender
      const otherId = otherUser.id
      
      if (!conversations.has(otherId)) {
        conversations.set(otherId, {
          user: otherUser,
          lastMessage: {
            content: msg.content,
            createdAt: msg.createdAt,
            isRead: msg.isRead,
            amISender: msg.senderId === userId
          },
          unreadCount: 0
        })
      }

      // Count unread (only if I am receiver and msg is unread)
      if (msg.receiverId === userId && !msg.isRead) {
        const convo = conversations.get(otherId)
        convo.unreadCount += 1
      }
    }

    return NextResponse.json({ conversations: Array.from(conversations.values()) })
  } catch (error) {
    console.error('Conversations fetch error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
