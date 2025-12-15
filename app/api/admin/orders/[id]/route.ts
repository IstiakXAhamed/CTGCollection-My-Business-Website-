import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'
import { saveReceiptToFile, generateReceiptHTML, getOrderForReceipt } from '@/lib/receipt'
import { sendReceiptEmail, sendShippingNotification, sendOrderStatusUpdate, sendLoyaltyUpdateEmail } from '@/lib/email'
import { notifyOrderShipped, notifyOrderDelivered, notifyOrderCancelled } from '@/lib/notifications'
import { calculateTierForUser } from '@/lib/tier-calculator'

async function checkAdmin(request: NextRequest) {
  const user = await verifyAuth(request)
  if (!user || (user.role !== 'admin' && user.role !== 'superadmin' && user.role !== 'seller')) {
    return null
  }
  return user
}

// GET single order by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await checkAdmin(request)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const order = await (prisma.order.findUnique as any)({
      where: { id: params.id },
      include: {
        user: { select: { name: true, email: true, phone: true } },
        items: {
          include: {
            product: true
          }
        },
        address: true,
        payment: true
      }
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json({ order })
  } catch (error: any) {
    console.error('Get order error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT - Update order status, payment status, etc.
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await checkAdmin(request)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { status, paymentStatus, trackingNumber, notes, sendEmail } = body

    // Get existing order
    const existingOrder = await (prisma.order.findUnique as any)({
      where: { id: params.id },
      include: {
        user: { select: { name: true, email: true } },
        items: { include: { product: true } },
        address: true
      }
    })

    if (!existingOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Prepare update data
    const updateData: any = {}
    if (status) updateData.status = status
    if (paymentStatus) updateData.paymentStatus = paymentStatus
    if (trackingNumber !== undefined) updateData.trackingNumber = trackingNumber
    if (notes !== undefined) updateData.notes = notes

    // If payment is being confirmed, set confirmation timestamp
    if (paymentStatus === 'paid' && existingOrder.paymentStatus !== 'paid') {
      updateData.paymentConfirmedAt = new Date()
    }

    // Update order
    const order = await (prisma.order.update as any)({
      where: { id: params.id },
      data: updateData,
      include: {
        user: { select: { name: true, email: true } },
        items: { include: { product: true } },
        address: true
      }
    })

    let emailSent = false
    let receiptUrl = null

    // Handle payment confirmation - generate receipt and send email with attachment
    if (paymentStatus === 'paid' && existingOrder.paymentStatus !== 'paid') {
      // Generate receipt
      receiptUrl = await saveReceiptToFile(order.id)
      
      if (receiptUrl) {
        await (prisma.order.update as any)({
          where: { id: order.id },
          data: { receiptUrl }
        })
      }

      // Send receipt email with HTML attachment
      const recipientEmail = order.user?.email || existingOrder.guestEmail
      console.log('=== RECEIPT EMAIL DEBUG ===')
      console.log('Recipient email:', recipientEmail)
      console.log('Receipt URL:', receiptUrl)
      console.log('Send email flag:', sendEmail)
      
      if (recipientEmail && sendEmail !== false) {
        try {
          // Get receipt HTML for attachment
          console.log('Getting order for receipt...')
          const receiptOrder = await getOrderForReceipt(order.id)
          console.log('Receipt order found:', !!receiptOrder)
          
          const receiptHtml = receiptOrder ? generateReceiptHTML(receiptOrder) : undefined
          console.log('Receipt HTML generated:', !!receiptHtml, 'Length:', receiptHtml?.length || 0)
          
          console.log('Calling sendReceiptEmail with:', {
            to: recipientEmail,
            orderNumber: order.orderNumber,
            customerName: order.address.name,
            hasReceiptPath: !!receiptUrl,
            hasReceiptHtml: !!receiptHtml
          })
          
          emailSent = await sendReceiptEmail({
            to: recipientEmail,
            orderNumber: order.orderNumber,
            customerName: order.address.name,
            receiptPath: receiptUrl || undefined,
            receiptHtml: receiptHtml
          })
          
          console.log('Email sent result:', emailSent)

          if (emailSent) {
            await (prisma.order.update as any)({
              where: { id: order.id },
              data: { receiptSentAt: new Date() }
            })
          }
        } catch (e) {
          console.error('Failed to send receipt email:', e)
        }
      } else {
        console.log('Skipping email - no recipient or sendEmail is false')
      }
    }

    // Handle shipping notification
    if (status === 'shipped' && existingOrder.status !== 'shipped') {
      const recipientEmail = order.user?.email || existingOrder.guestEmail
      if (recipientEmail && sendEmail !== false) {
        try {
          await sendShippingNotification(recipientEmail, order.orderNumber, trackingNumber || '')
        } catch (e) {
          console.error('Failed to send shipping email:', e)
        }
      }
      // In-app notification for logged in users
      if (existingOrder.userId) {
        try {
          await notifyOrderShipped(existingOrder.userId, order.id, trackingNumber)
        } catch (e) {
          console.log('Notification error (non-blocking):', e)
        }
      }
    }

    // Handle delivered notification
    if (status === 'delivered' && existingOrder.status !== 'delivered') {
      if (existingOrder.userId) {
        try {
          await notifyOrderDelivered(existingOrder.userId, order.id)

          // Award Loyalty Points
          try {
            const settings = await prisma.loyaltySettings.findFirst() as any
            if (settings && settings.isEnabled && settings.pointsPerTaka > 0) {
              const pointsEarned = Math.floor(existingOrder.total * settings.pointsPerTaka)
              if (pointsEarned > 0) {
                 await prisma.loyaltyPoints.upsert({
                  where: { userId: existingOrder.userId },
                  create: {
                    userId: existingOrder.userId,
                    totalPoints: pointsEarned,
                    lifetimePoints: pointsEarned,
                    lifetimeSpent: existingOrder.total
                  } as any,
                  update: {
                    totalPoints: { increment: pointsEarned },
                    lifetimePoints: { increment: pointsEarned },
                    lifetimeSpent: { increment: existingOrder.total }
                  } as any
                })

                const loyalty = await prisma.loyaltyPoints.findUnique({ where: { userId: existingOrder.userId } })
                if (loyalty) {
                  await prisma.pointsTransaction.create({
                    data: {
                      userId: existingOrder.userId,
                      loyaltyId: loyalty.id,
                      points: pointsEarned,
                      type: 'earned',
                      description: `Points earned from order #${order.orderNumber}`,
                      orderId: order.id
                    } as any
                  })
                  
                  // Auto-calculate and update tier based on lifetime spending
                  try {
                    await calculateTierForUser(existingOrder.userId)
                  } catch (tierError) {
                    console.error('Failed to calculate tier:', tierError)
                  }

                  const user = await prisma.user.findUnique({ where: { id: existingOrder.userId } })
                  if (user) {
                    await sendLoyaltyUpdateEmail(user.email, {
                      customerName: user.name,
                      type: 'Points Earned',
                      points: pointsEarned,
                      message: `You earned points for your recent order!`
                    })
                  }
                }
              }
            }
          } catch (lpError) {
            console.error('Loyalty points error:', lpError)
          }

        } catch (e) {
          console.log('Notification error (non-blocking):', e)
        }
      }
    }

    // If order is cancelled, restore stock and notify customer
    if (status === 'cancelled' && existingOrder.status !== 'cancelled') {
      // Notify customer about cancellation
      if (existingOrder.userId) {
        try {
          await notifyOrderCancelled(existingOrder.userId, order.id, notes)
        } catch (e) {
          console.log('Notification error (non-blocking):', e)
        }
      }
      
      // Restore stock
      for (const item of order.items) {
        if (item.variantInfo) {
          try {
            const variantData = JSON.parse(item.variantInfo)
            if (variantData.variantId) {
              await prisma.productVariant.update({
                where: { id: variantData.variantId },
                data: { stock: { increment: item.quantity } }
              })
            }
          } catch (e) {
            // Ignore JSON parse errors
          }
        }
      }
    }

    // Handle generic status update email
    if (status && status !== existingOrder.status && sendEmail !== false) {
      // Don't duplicate for shipped as it has handled above (check logic)
      if (status !== 'shipped' && status !== 'paid') {
        const recipientEmail = order.user?.email || existingOrder.guestEmail
        if (recipientEmail) {
          await sendOrderStatusUpdate(recipientEmail, {
            orderNumber: order.orderNumber,
            customerName: order.address?.name || order.user?.name || 'Customer',
            status: status,
            message: notes
          })
        }
      }
    }

    return NextResponse.json({ 
      order,
      emailSent,
      receiptUrl,
      message: paymentStatus === 'paid' && existingOrder.paymentStatus !== 'paid' 
        ? 'Payment confirmed and receipt generated' 
        : 'Order updated successfully'
    })
  } catch (error: any) {
    console.error('Update order error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
