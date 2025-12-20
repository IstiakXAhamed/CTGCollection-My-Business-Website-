import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { executeBkashPayment } from '@/lib/bkash'
import { sendOrderConfirmationWithPDF } from '@/lib/email'
import { generateReceiptPDF } from '@/lib/pdf-generator'

export const dynamic = 'force-dynamic'

// GET - bKash callback after customer approves payment
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const paymentID = searchParams.get('paymentID')
    const status = searchParams.get('status')

    if (!paymentID) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_URL}/checkout?error=missing_payment_id`)
    }

    // Find order with this payment ID
    const order = await (prisma.order.findFirst as any)({
      where: { paymentId: paymentID },
      include: {
        user: true,
        address: true,
        items: { include: { product: true } }
      }
    })

    if (!order) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_URL}/checkout?error=order_not_found`)
    }

    if (status === 'cancel' || status === 'failure') {
      // Update order status
      await (prisma.order.update as any)({
        where: { id: order.id },
        data: { paymentStatus: 'failed' }
      })
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_URL}/checkout?error=payment_${status}`)
    }

    // Execute the payment
    const result = await executeBkashPayment(paymentID)

    if (result.success) {
      // Update order with payment details
      await (prisma.order.update as any)({
        where: { id: order.id },
        data: {
          paymentStatus: 'paid',
          status: 'confirmed',
          transactionId: result.transactionId
        }
      })

      // Send confirmation email with PDF receipt
      const recipientEmail = order.user?.email || order.guestEmail
      if (recipientEmail) {
        const pdfBuffer = await generateReceiptPDF(order.id)
        await sendOrderConfirmationWithPDF({
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
          paymentMethod: 'bkash',
          pdfBuffer: pdfBuffer || undefined
        })
      }

      // Redirect to success page
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_URL}/order-success?orderId=${order.id}`)
    }

    // Payment failed
    await (prisma.order.update as any)({
      where: { id: order.id },
      data: { paymentStatus: 'failed' }
    })

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_URL}/checkout?error=payment_failed&message=${encodeURIComponent(result.message || '')}`)
  } catch (error: any) {
    console.error('bKash callback error:', error)
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_URL}/checkout?error=callback_error`)
  }
}
