import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'
import { saveReceiptToFile, generateReceiptHTML, getOrderForReceipt } from '@/lib/receipt'
import { sendReceiptEmail, sendShippingNotification } from '@/lib/email'

async function checkAdmin(request: NextRequest) {
  const user = await verifyAuth(request)
  if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
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
    if (status === 'shipped' && existingOrder.status !== 'shipped' && trackingNumber) {
      const recipientEmail = order.user?.email || existingOrder.guestEmail
      if (recipientEmail && sendEmail !== false) {
        try {
          await sendShippingNotification(recipientEmail, order.orderNumber, trackingNumber)
        } catch (e) {
          console.error('Failed to send shipping email:', e)
        }
      }
    }

    // If order is cancelled, restore stock
    if (status === 'cancelled' && existingOrder.status !== 'cancelled') {
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
