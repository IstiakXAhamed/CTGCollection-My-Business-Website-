import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET /api/internal-chat/messages?userId=X
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const targetUserId = searchParams.get('userId')

    if (!targetUserId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 })

    const authRes = await fetch(new URL('/api/auth/me', req.url), { headers: req.headers })
    const authData = await authRes.json()
    if (!authData.authenticated) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const currentUserId = authData.user.id

    // Fetch messages
    const messages = await (prisma as any).internalMessage.findMany({
      where: {
        OR: [
          { senderId: currentUserId, receiverId: targetUserId },
          { senderId: targetUserId, receiverId: currentUserId }
        ]
      },
      orderBy: { createdAt: 'asc' }
    })

    // Mark as read (async, don't await)
    // Only mark messages sent by THEM to ME as read
    ;(prisma as any).internalMessage.updateMany({
      where: {
        senderId: targetUserId,
        receiverId: currentUserId,
        isRead: false
      },
      data: { isRead: true }
    }).catch((e: any) => console.error('Mark read failed', e))

    return NextResponse.json({ messages })

  } catch (error) {
    console.error('Messages fetch error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

// POST /api/internal-chat/messages
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { receiverId, content } = body

    if (!receiverId || !content) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

    const authRes = await fetch(new URL('/api/auth/me', req.url), { headers: req.headers })
    const authData = await authRes.json()
    if (!authData.authenticated) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const currentUserId = authData.user.id

    const message = await (prisma as any).internalMessage.create({
      data: {
        senderId: currentUserId,
        receiverId: receiverId,
        content
      }
    })

    return NextResponse.json({ message })

  } catch (error) {
    console.error('Message send error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
