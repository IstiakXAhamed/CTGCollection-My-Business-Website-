import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// Get all chat sessions for admin
export async function GET(request: NextRequest) {
  try {
    // Check if admin
    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload || (payload.role !== 'admin' && payload.role !== 'superadmin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get sessions from database (only active sessions)
    const sessions = await (prisma as any).chatSession.findMany({
      where: { status: 'active' },  // Only show active sessions, not closed
      orderBy: { updatedAt: 'desc' },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    })

    const formattedSessions = sessions.map((session: any) => ({
      id: session.id,
      sessionId: session.sessionId,
      customerName: session.customerName,
      customerEmail: session.customerEmail,
      status: session.status,
      lastMessage: session.messages[0]?.message || 'No messages yet',
      unreadCount: 0, // Can be calculated separately if needed
      createdAt: session.createdAt.toISOString(),
      updatedAt: session.updatedAt.toISOString()
    }))

    return NextResponse.json({ sessions: formattedSessions })
  } catch (error: any) {
    console.error('Chat sessions error:', error)
    // Return empty if Prisma not ready
    return NextResponse.json({ sessions: [], error: 'Database not ready - run: npx prisma generate' })
  }
}

// Create new chat session (from customer)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionId, customerName, customerEmail } = body

    // Get user if logged in
    let userId = null
    const token = request.cookies.get('token')?.value
    if (token) {
      try {
        const payload = await verifyToken(token)
        if (payload?.userId) userId = payload.userId
      } catch {}
    }

    // Check if session exists
    let session = await (prisma as any).chatSession.findUnique({
      where: { sessionId }
    })

    if (!session) {
      session = await (prisma as any).chatSession.create({
        data: {
          sessionId,
          userId,
          customerName: customerName || 'Guest',
          customerEmail,
          status: 'active'
        }
      })
    }

    return NextResponse.json({ session })
  } catch (error: any) {
    console.error('Create session error:', error)
    return NextResponse.json({ error: 'Database not ready - run: npx prisma generate' }, { status: 500 })
  }
}
