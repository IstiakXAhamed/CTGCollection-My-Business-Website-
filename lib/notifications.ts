import { prisma } from '@/lib/prisma'

// ============= NOTIFICATION UTILITY FUNCTIONS =============

/**
 * Create a notification for a specific user
 */
export async function createUserNotification(
  userId: string,
  type: string,
  title: string,
  message: string,
  link?: string
) {
  try {
    await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        link: link || null
      }
    })
    return true
  } catch (error) {
    console.error('Failed to create notification:', error)
    return false
  }
}

/**
 * Create notification for all admins
 */
export async function notifyAllAdmins(
  type: string,
  title: string,
  message: string,
  link?: string
) {
  try {
    const admins = await prisma.user.findMany({
      where: { role: { in: ['admin', 'superadmin'] } },
      select: { id: true }
    })

    await Promise.all(
      admins.map(admin =>
        prisma.notification.create({
          data: {
            userId: admin.id,
            type,
            title,
            message,
            link: link || null
          }
        })
      )
    )
    return true
  } catch (error) {
    console.error('Failed to notify admins:', error)
    return false
  }
}

// ============= ORDER NOTIFICATIONS =============

export async function notifyNewOrder(orderId: string, customerName: string, total: number) {
  await notifyAllAdmins(
    'order',
    '🛒 New Order Received!',
    `${customerName} placed an order (৳${total.toLocaleString()})`,
    `/admin/orders`
  )
}

export async function notifyOrderConfirmed(userId: string, orderId: string) {
  await createUserNotification(
    userId,
    'order',
    '✅ Order Confirmed!',
    'Your order has been confirmed and is being processed.',
    `/dashboard/orders`
  )
}

export async function notifyOrderShipped(userId: string, orderId: string, trackingNumber?: string) {
  await createUserNotification(
    userId,
    'order',
    '📦 Order Shipped!',
    `Your order is on the way!${trackingNumber ? ` Tracking: ${trackingNumber}` : ''}`,
    `/dashboard/orders`
  )
}

export async function notifyOrderDelivered(userId: string, orderId: string) {
  await createUserNotification(
    userId,
    'order',
    '🎉 Order Delivered!',
    'Your order has been delivered. Thank you for shopping with us!',
    `/dashboard/orders`
  )
}

export async function notifyOrderCancelled(userId: string, orderId: string, reason?: string) {
  await createUserNotification(
    userId,
    'order',
    '❌ Order Cancelled',
    reason || 'Your order has been cancelled.',
    `/dashboard/orders`
  )
}

// ============= USER NOTIFICATIONS =============

export async function notifyWelcome(userId: string, userName: string) {
  await createUserNotification(
    userId,
    'welcome',
    '🎉 Welcome to CTG Collection!',
    `Hi ${userName}, thank you for joining us! Explore our amazing products.`,
    `/shop`
  )
}

export async function notifyNewRegistration(userName: string, email: string) {
  await notifyAllAdmins(
    'user',
    '👤 New User Registered!',
    `${userName} (${email}) just joined.`,
    `/admin/customers`
  )
}

// ============= CONTACT MESSAGE NOTIFICATIONS =============

export async function notifyNewContactMessage(senderName: string, subject: string) {
  await notifyAllAdmins(
    'message',
    '📧 New Contact Message!',
    `${senderName}: "${subject}"`,
    `/admin/messages`
  )
}

// ============= CHAT NOTIFICATIONS =============

export async function notifyNewChatMessage(customerName: string, sessionId: string) {
  await notifyAllAdmins(
    'chat',
    '💬 New Chat Message!',
    `${customerName} sent a message`,
    `/admin/chat`
  )
}

// ============= INVENTORY NOTIFICATIONS =============

export async function notifyLowStock(productName: string, currentStock: number, threshold: number = 10) {
  if (currentStock <= threshold && currentStock > 0) {
    await notifyAllAdmins(
      'inventory',
      '⚠️ Low Stock Alert',
      `${productName} has only ${currentStock} items left!`,
      `/admin/products`
    )
  }
}

export async function notifyOutOfStock(productName: string) {
  await notifyAllAdmins(
    'inventory',
    '🚨 Out of Stock!',
    `${productName} is now out of stock.`,
    `/admin/products`
  )
}

// ============= LOYALTY NOTIFICATIONS =============

export async function notifyPointsEarned(userId: string, points: number, orderTotal: number) {
  await createUserNotification(
    userId,
    'loyalty',
    '⭐ Points Earned!',
    `You earned ${points} loyalty points from your ৳${orderTotal.toLocaleString()} purchase!`,
    `/dashboard/loyalty`
  )
}

// ============= PROMOTION NOTIFICATIONS =============

export async function notifyFlashSale(userId: string, saleName: string, discountPercent: number) {
  await createUserNotification(
    userId,
    'promo',
    '🔥 Flash Sale Started!',
    `${saleName} - Get ${discountPercent}% OFF! Limited time only.`,
    `/shop?sale=true`
  )
}

export async function notifyPromotion(userId: string, title: string, message: string) {
  await createUserNotification(
    userId,
    'promo',
    title,
    message,
    `/shop`
  )
}

// ============= ACCOUNT STATUS NOTIFICATIONS =============

export async function notifyRoleChange(userId: string, oldRole: string, newRole: string) {
  const roleLabels: Record<string, string> = {
    customer: 'Customer',
    seller: 'Seller',
    admin: 'Admin',
    superadmin: 'Super Admin'
  }
  
  const newRoleLabel = roleLabels[newRole] || newRole
  const isPromotion = ['admin', 'seller', 'superadmin'].includes(newRole) && oldRole === 'customer'
  
  await createUserNotification(
    userId,
    'account',
    isPromotion ? '🎊 Congratulations! Role Upgraded' : '📋 Account Role Updated',
    isPromotion 
      ? `You have been promoted to ${newRoleLabel}! Welcome to the team.`
      : `Your account role has been changed to ${newRoleLabel}.`,
    `/dashboard`
  )
}

export async function notifyTierChange(userId: string, tierName: string) {
  await createUserNotification(
    userId,
    'loyalty',
    '🏆 Membership Tier Updated!',
    `Congratulations! You are now a ${tierName} member. Enjoy exclusive benefits!`,
    `/dashboard/loyalty`
  )
}

export async function notifyAccountDeactivated(userId: string) {
  await createUserNotification(
    userId,
    'account',
    '⚠️ Account Deactivated',
    'Your account has been temporarily deactivated. Please contact support for assistance.',
    null
  )
}

export async function notifyAccountReactivated(userId: string) {
  await createUserNotification(
    userId,
    'account',
    '✅ Account Reactivated',
    'Great news! Your account has been reactivated. Welcome back!',
    `/dashboard`
  )
}

