import { prisma } from '@/lib/prisma'
import { webPush } from '@/lib/webpush'

type NotificationType = 'order' | 'price_drop' | 'flash_sale' | 'promotion' | 'stock'

interface PushPayload {
  userId: string
  title: string
  body: string
  type: NotificationType
  data?: {
    url?: string
    orderId?: string
    productId?: string
    image?: string
    oldPrice?: number
    newPrice?: number
  }
  icon?: string
  badge?: string
}

// Cast for newly added Prisma models (PushSubscription, NotificationLog)
// These exist at runtime after `prisma generate` but IDE types may lag
const db = prisma as any

/**
 * Send push notification to a specific user
 */
export async function sendPushNotification({
  userId,
  title,
  body,
  type,
  data,
  icon,
  badge,
}: PushPayload) {
  try {
    const subscriptions = await db.pushSubscription.findMany({
      where: { userId, isActive: true },
    })

    if (subscriptions.length === 0) {
      return { success: false, sent: 0, failed: 0 }
    }

    const payload = JSON.stringify({
      title,
      body,
      icon: icon || '/icon-192.png',
      badge: badge || '/badge-72.png',
      tag: `${type}-${Date.now()}`,
      data: { type, ...data },
      actions: [
        { action: 'open', title: 'View' },
        { action: 'dismiss', title: 'Dismiss' },
      ],
    })

    let sent = 0
    let failed = 0

    for (const sub of subscriptions) {
      try {
        await webPush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload
        )
        sent++
      } catch (error: any) {
        failed++
        // Deactivate invalid subscriptions (gone or not found)
        if (error.statusCode === 410 || error.statusCode === 404) {
          await db.pushSubscription.update({
            where: { id: sub.id },
            data: { isActive: false },
          })
        }
      }
    }

    // Log notification
    await db.notificationLog.create({
      data: {
        userId,
        type,
        title,
        message: body,
        data: JSON.stringify(data || {}),
      },
    })

    return { success: true, sent, failed }
  } catch (error) {
    console.error('Push notification error:', error)
    return { success: false, sent: 0, failed: 0 }
  }
}

/**
 * Broadcast push notification to ALL subscribed users
 */
export async function broadcastPushNotification(
  title: string,
  body: string,
  type: NotificationType,
  data?: Record<string, any>
) {
  try {
    const subscriptions = await db.pushSubscription.findMany({
      where: { isActive: true },
      select: { id: true, userId: true, endpoint: true, p256dh: true, auth: true },
    })

    if (subscriptions.length === 0) {
      return { success: false, sent: 0, failed: 0, total: 0, message: 'No subscribers' }
    }

    const payload = JSON.stringify({
      title,
      body,
      icon: '/icon-192.png',
      badge: '/badge-72.png',
      tag: `${type}-${Date.now()}`,
      data: { type, ...data },
      actions: [
        { action: 'open', title: 'View' },
        { action: 'dismiss', title: 'Dismiss' },
      ],
    })

    let sent = 0
    let failed = 0
    const invalidIds: string[] = []

    for (const sub of subscriptions) {
      try {
        await webPush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload
        )
        sent++
      } catch (error: any) {
        failed++
        if (error.statusCode === 410 || error.statusCode === 404) {
          invalidIds.push(sub.id)
        }
      }
    }

    // Deactivate invalid subscriptions
    if (invalidIds.length > 0) {
      await db.pushSubscription.updateMany({
        where: { id: { in: invalidIds } },
        data: { isActive: false },
      })
    }

    return { success: true, sent, failed, total: subscriptions.length }
  } catch (error) {
    console.error('Broadcast error:', error)
    return { success: false, sent: 0, failed: 0, total: 0 }
  }
}

// ============ ORDER NOTIFICATIONS ============

export const pushOrderNotifications = {
  async confirmed(orderId: string, userId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    })
    if (!order) return { success: false, sent: 0, failed: 0 }

    return sendPushNotification({
      userId,
      title: 'Order Confirmed! 🎉',
      body: `Order #${order.orderNumber} is being processed`,
      type: 'order',
      data: { orderId, url: `/orders/${orderId}` },
    })
  },

  async shipped(orderId: string, userId: string) {
    const order = await prisma.order.findUnique({ where: { id: orderId } })
    if (!order) return { success: false, sent: 0, failed: 0 }

    return sendPushNotification({
      userId,
      title: 'Order Shipped! 📦',
      body: `Order #${order.orderNumber} is on its way`,
      type: 'order',
      data: { orderId, url: `/orders/${orderId}` },
    })
  },

  async delivered(orderId: string, userId: string) {
    const order = await prisma.order.findUnique({ where: { id: orderId } })
    if (!order) return { success: false, sent: 0, failed: 0 }

    return sendPushNotification({
      userId,
      title: 'Delivered! ✅',
      body: `Order #${order.orderNumber} has arrived`,
      type: 'order',
      data: { orderId, url: `/orders/${orderId}` },
    })
  },
}

// ============ PRICE DROP NOTIFICATION ============

/**
 * Notify all push-subscribed users about a price drop.
 * Wishlist is client-side only (localStorage), so this broadcasts to all subscribers.
 */
export async function notifyPriceDrop(
  productId: string,
  productName: string,
  productSlug: string,
  oldPrice: number,
  newPrice: number
) {
  const discount = Math.round(((oldPrice - newPrice) / oldPrice) * 100)

  return broadcastPushNotification(
    'Price Drop! 📉',
    `${productName} is now ৳${newPrice.toLocaleString()} (${discount}% off)`,
    'price_drop',
    { productId, url: `/product/${productSlug}`, oldPrice, newPrice }
  )
}

// ============ PROMOTIONAL / FLASH SALE NOTIFICATION ============

/**
 * Broadcast a promotional notification to all subscribers.
 */
export async function notifyPromotion(title: string, message: string, url?: string) {
  return broadcastPushNotification(
    title,
    message,
    'flash_sale',
    { url: url || '/shop' }
  )
}

// ============ STATS ============

/**
 * Get push notification statistics for admin panel
 */
export async function getPushStats() {
  try {
    const [totalSubscribers, activeSubscribers, totalNotifications, recentNotifications] = await Promise.all([
      db.pushSubscription.count(),
      db.pushSubscription.count({ where: { isActive: true } }),
      db.notificationLog.count(),
      db.notificationLog.findMany({
        orderBy: { sentAt: 'desc' },
        take: 50,
        include: { user: { select: { name: true, email: true } } },
      }),
    ])

    return {
      totalSubscribers,
      activeSubscribers,
      totalNotifications,
      recentNotifications,
    }
  } catch (error) {
    console.error('Push stats error:', error)
    return {
      totalSubscribers: 0,
      activeSubscribers: 0,
      totalNotifications: 0,
      recentNotifications: [],
    }
  }
}
