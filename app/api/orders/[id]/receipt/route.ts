import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { generateReceiptHTML, getOrderForReceipt, saveReceiptToFile } from '@/lib/receipt'
import { sendOrderConfirmationWithPDF } from '@/lib/email'
import { generateReceiptPDF } from '@/lib/pdf-generator'

// GET - Get receipt for an order (user or admin)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.cookies.get('token')?.value
    const user = token ? await verifyToken(token) : null

    const order = await (prisma.order.findUnique as any)({
      where: { id: params.id },
      include: {
        address: true,
        user: { select: { id: true, email: true } },
        items: { include: { product: true } }
      }
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Check access: user must be admin or the order owner
    const isAdmin = user && (user.role === 'admin' || user.role === 'superadmin')
    const isOwner = user && order.userId === user.userId
    const isGuest = !order.userId // Guest orders

    if (!isAdmin && !isOwner && !isGuest) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Generate or get existing receipt
    let receiptUrl = order.receiptUrl
    if (!receiptUrl) {
      receiptUrl = await saveReceiptToFile(order.id)
    }

    if (!receiptUrl) {
      return NextResponse.json({ error: 'Failed to generate receipt' }, { status: 500 })
    }

    return NextResponse.json({ 
      receiptUrl,
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        paymentStatus: order.paymentStatus,
        total: order.total
      }
    })
  } catch (error: any) {
    console.error('Error getting receipt:', error)
    return NextResponse.json({ error: error.message || 'Failed to get receipt' }, { status: 500 })
  }
}

// POST - Send Order Confirmation with PDF Receipt Attachment (admin only)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const user = await verifyToken(token)
    if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('=== SEND ORDER CONFIRMATION WITH PDF ===')
    console.log('Order ID:', params.id)

    const order = await (prisma.order.findUnique as any)({
      where: { id: params.id },
      include: {
        address: true,
        user: { select: { name: true, email: true } },
        items: { include: { product: true } }
      }
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Get recipient email
    const recipientEmail = order.user?.email || order.guestEmail
    console.log('Recipient email:', recipientEmail)
    
    if (!recipientEmail) {
      return NextResponse.json({ error: 'No email address for this order' }, { status: 400 })
    }

    // Generate PDF receipt
    console.log('Generating PDF receipt...')
    const pdfBuffer = await generateReceiptPDF(order.id)
    console.log('PDF generated:', !!pdfBuffer, 'Size:', pdfBuffer?.length || 0, 'bytes')

    // Send combined email with PDF attachment
    console.log('Sending order confirmation with PDF attachment...')
    const emailSent = await sendOrderConfirmationWithPDF({
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
      // Update order with receipt sent timestamp
      await (prisma.order.update as any)({
        where: { id: order.id },
        data: { 
          receiptSentAt: new Date()
        }
      })
    }

    return NextResponse.json({ 
      success: true,
      message: emailSent 
        ? '✅ Order confirmation with PDF receipt sent successfully!' 
        : 'Email sent (PDF may have failed to attach)',
      hasPDF: !!pdfBuffer
    })
  } catch (error: any) {
    console.error('Error sending receipt:', error)
    return NextResponse.json({ error: error.message || 'Failed to send receipt' }, { status: 500 })
  }
}
