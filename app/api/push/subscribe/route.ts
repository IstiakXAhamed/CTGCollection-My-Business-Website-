import { NextRequest, NextResponse } from 'next/server'
import { vapidKeys, isPushConfigured } from '@/lib/webpush'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

const db = prisma as any

export async function GET() {
  // Return public key for frontend
  return NextResponse.json({
    publicKey: vapidKeys.publicKey || null,
    isConfigured: isPushConfigured(),
  })
}

export async function POST(request: NextRequest) {
  try {
    // Check if push is configured
    if (!isPushConfigured()) {
      return NextResponse.json(
        { error: 'Push notifications not configured on server' },
        { status: 503 }
      )
    }

    // Verify user is logged in
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required to subscribe to notifications' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { subscription } = body

    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return NextResponse.json(
        { error: 'Invalid subscription data' },
        { status: 400 }
      )
    }

    // Persist subscription to database
    await db.pushSubscription.upsert({
      where: {
        userId_endpoint: {
          userId: user.id,
          endpoint: subscription.endpoint,
        },
      },
      create: {
        userId: user.id,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        isActive: true,
      },
      update: {
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        isActive: true,
      },
    })

    // Send a welcome notification
    const { webPush } = await import('@/lib/webpush')
    try {
      await webPush.sendNotification(
        subscription,
        JSON.stringify({
          title: 'Silk Mart',
          body: 'You will now receive order updates and offers!',
          icon: '/icon-192.png',
          badge: '/badge-72.png',
          tag: 'welcome',
        })
      )
    } catch (pushError) {
      // Non-blocking — subscription is saved even if test notification fails
      console.warn('Welcome notification failed (non-blocking):', pushError)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Subscribe error:', error)
    return NextResponse.json(
      { error: 'Failed to subscribe' },
      { status: 500 }
    )
  }
}
