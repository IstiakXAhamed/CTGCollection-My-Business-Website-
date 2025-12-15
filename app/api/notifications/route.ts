import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'

// GET - Get user's notifications
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const unreadOnly = searchParams.get('unread') === 'true'

    const notifications = await prisma.notification.findMany({
      where: {
        userId: user.id,
        ...(unreadOnly ? { isRead: false } : {})
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    })

    const unreadCount = await prisma.notification.count({
      where: { userId: user.id, isRead: false }
    })

    return NextResponse.json({ notifications, unreadCount })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST - Mark as read or create notification
export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, notificationId, notificationIds } = body

    if (action === 'mark_read') {
      if (notificationId) {
        await prisma.notification.updateMany({
          where: { id: notificationId, userId: user.id },
          data: { isRead: true }
        })
      } else if (notificationIds) {
        await prisma.notification.updateMany({
          where: { id: { in: notificationIds }, userId: user.id },
          data: { isRead: true }
        })
      }
      return NextResponse.json({ success: true })
    }

    if (action === 'mark_all_read') {
      await prisma.notification.updateMany({
        where: { userId: user.id, isRead: false },
        data: { isRead: true }
      })
      return NextResponse.json({ success: true })
    }

    // Admin creating notification for user(s)
    if (action === 'create' && (user.role === 'admin' || user.role === 'superadmin')) {
      const { targetUserId, type, title, message, link } = body
      
      if (!targetUserId || !title || !message) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
      }

      await prisma.notification.create({
        data: {
          userId: targetUserId,
          type: type || 'general',
          title,
          message,
          link
        }
      })

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE - Delete notification
export async function DELETE(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (id) {
      await prisma.notification.deleteMany({
        where: { id, userId: user.id }
      })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// Utility function to create notifications (for use in other APIs)
export async function createNotification(
  userId: string,
  type: string,
  title: string,
  message: string,
  link?: string
) {
  try {
    await prisma.notification.create({
      data: { userId, type, title, message, link }
    })
    return true
  } catch (error) {
    console.error('Failed to create notification:', error)
    return false
  }
}
