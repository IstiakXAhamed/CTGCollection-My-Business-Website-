import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { broadcastPushNotification, sendPushNotification, getPushStats, notifyPromotion } from '@/lib/push-notifications'
import { isPushConfigured } from '@/lib/webpush'

export const dynamic = 'force-dynamic'

const db = prisma as any

async function checkAdmin(request: NextRequest) {
  const user = await verifyAuth(request)
  if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
    return null
  }
  return user
}

// GET - Fetch notification stats, subscriber count, recent logs
export async function GET(request: NextRequest) {
  try {
    const admin = await checkAdmin(request)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const stats = await getPushStats()

    return NextResponse.json({
      isConfigured: isPushConfigured(),
      ...stats,
    })
  } catch (error: any) {
    console.error('Notification stats error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST - Send notification (broadcast or to specific user)
export async function POST(request: NextRequest) {
  try {
    const admin = await checkAdmin(request)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!isPushConfigured()) {
      return NextResponse.json(
        { error: 'Push notifications not configured. Set VAPID keys in .env' },
        { status: 503 }
      )
    }

    const body = await request.json()
    const { action, title, message, url, userId, type } = body

    if (!title || !message) {
      return NextResponse.json(
        { error: 'Title and message are required' },
        { status: 400 }
      )
    }

    let result

    switch (action) {
      case 'broadcast':
        // Send to ALL subscribers
        result = await broadcastPushNotification(
          title,
          message,
          type || 'promotion',
          { url: url || '/' }
        )
        break

      case 'send':
        // Send to specific user
        if (!userId) {
          return NextResponse.json(
            { error: 'userId required for targeted send' },
            { status: 400 }
          )
        }
        result = await sendPushNotification({
          userId,
          title,
          body: message,
          type: type || 'promotion',
          data: { url: url || '/' },
        })
        break

      case 'promotion':
        // Convenience alias for broadcast promotion
        result = await notifyPromotion(title, message, url)
        break

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: broadcast, send, or promotion' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      ...result,
    })
  } catch (error: any) {
    console.error('Send notification error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
