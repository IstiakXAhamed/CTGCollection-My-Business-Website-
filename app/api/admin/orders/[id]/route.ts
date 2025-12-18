import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'
import { saveReceiptToFile } from '@/lib/receipt'
import { sendShippingNotification, sendOrderStatusUpdate, sendLoyaltyUpdateEmail } from '@/lib/email'
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

      // Send confirmation email with PDF receipt using SELECTED template
      const recipientEmail = order.user?.email || existingOrder.guestEmail
      console.log('=== RECEIPT EMAIL DEBUG ===')
      console.log('Recipient email:', recipientEmail)
      console.log('Receipt URL:', receiptUrl)
      console.log('Send email flag:', sendEmail)
      
      if (recipientEmail && sendEmail !== false) {
        try {
          // Import cloud PDF generator (uses selected template)
          const { generateTemplatedPDF } = await import('@/lib/pdf-cloud')
          const { sendOrderConfirmationWithPDF } = await import('@/lib/email')
          
          console.log('Generating templated PDF for email attachment...')
          const pdfBuffer = await generateTemplatedPDF(order.id)
          console.log('PDF generated:', !!pdfBuffer, 'Size:', pdfBuffer?.length || 0, 'bytes')
          
          // Send order confirmation with PDF attachment
          emailSent = await sendOrderConfirmationWithPDF({
            to: recipientEmail,
            orderNumber: order.orderNumber,
            customerName: order.address.name,
            items: order.items.map((item: any) => ({
              name: item.product.name,
              quantity: item.quantity,
              price: item.price
            })),
            subtotal: order.subtotal,
            shipping: order.shippingCost,
            discount: order.discount || 0,
            total: order.total,
            address: `${order.address.address}, ${order.address.city}, ${order.address.district}`,
            paymentMethod: order.paymentMethod,
            pdfBuffer: pdfBuffer || undefined
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

    // Handle shipping notification - DISABLED to reduce email volume
    if (status === 'shipped' && existingOrder.status !== 'shipped') {
      // const recipientEmail = order.user?.email || existingOrder.guestEmail
      // MUTED: Shipping emails disabled to prevent Google ban
      // if (recipientEmail && sendEmail !== false) {
      //   try {
      //     await sendShippingNotification(recipientEmail, order.orderNumber, trackingNumber || '')
      //   } catch (e) {
      //     console.error('Failed to send shipping email:', e)
      //   }
      // }
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
            // Get loyalty settings from SiteSettings (not separate LoyaltySettings model)
            const settings = await (prisma.siteSettings as any).findUnique({ where: { id: 'main' } }) as any
            if (settings && settings.pointsPerTaka > 0) {
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

    // Handle generic status update email - DISABLED to reduce email volume  
    // MUTED: Status update emails disabled to prevent Google ban
    // if (status && status !== existingOrder.status && sendEmail !== false) {
    //   if (status !== 'shipped' && status !== 'paid') {
    //     const recipientEmail = order.user?.email || existingOrder.guestEmail
    //     if (recipientEmail) {
    //       await sendOrderStatusUpdate(recipientEmail, {
    //         orderNumber: order.orderNumber,
    //         customerName: order.address?.name || order.user?.name || 'Customer',
    //         status: status,
    //         message: notes
    //       })
    //     }
    //   }
    // }

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
