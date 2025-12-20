import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { notifyNewOrder, notifyOrderConfirmed } from '@/lib/notifications'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { shippingDetails, paymentMethod, cartItems, total, subtotal, shippingCost, couponCode } = body

    // Validate required fields
    if (!shippingDetails || !paymentMethod || !cartItems || !total) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (!cartItems.length) {
      return NextResponse.json(
        { message: 'Cart is empty' },
        { status: 400 }
      )
    }

    // Get authenticated user if available (optional for guest checkout)
    let userId: string | null = null
    const token = request.cookies.get('token')?.value
    if (token) {
      const payload = await verifyToken(token)
      if (payload?.userId) {
        // Verify the user actually exists in database (may have been deleted during db reset)
        const userExists = await prisma.user.findUnique({ 
          where: { id: payload.userId },
          select: { id: true }
        })
        if (userExists) {
          userId = payload.userId
        }
      }
    }

    // Guest checkout: require email for order tracking
    const guestEmail = shippingDetails.email || null
    if (!userId && !guestEmail) {
      return NextResponse.json(
        { message: 'Please provide an email address for order tracking' },
        { status: 400 }
      )
    }

    // Generate unique order number
    const orderNumber = `CTG${Date.now()}${Math.floor(Math.random() * 1000)}`

    // Create address - use raw SQL for guest checkout to avoid FK constraint issues
    let address: any
    
    if (userId) {
      // For logged-in users, use Prisma normally
      address = await prisma.address.create({
        data: {
          userId: userId,
          name: shippingDetails.name,
          phone: shippingDetails.phone,
          address: shippingDetails.address,
          city: shippingDetails.city,
          district: shippingDetails.district,
          postalCode: shippingDetails.postalCode || '',
        },
      })
    } else {
      // For guest checkout, use raw SQL to bypass FK constraint
      const addressId = `addr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      await prisma.$executeRaw`
        INSERT INTO "Address" ("id", "userId", "guestEmail", "name", "phone", "address", "city", "district", "postalCode", "isDefault", "createdAt", "updatedAt")
        VALUES (${addressId}, NULL, ${guestEmail || null}, ${shippingDetails.name}, ${shippingDetails.phone}, ${shippingDetails.address}, ${shippingDetails.city}, ${shippingDetails.district}, ${shippingDetails.postalCode || ''}, false, NOW(), NOW())
      `
      address = await prisma.address.findUnique({ where: { id: addressId } })
    }

    // Calculate discount if coupon applied
    let discount = 0
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({ where: { code: couponCode } })
      if (coupon && coupon.isActive && new Date() >= coupon.validFrom && new Date() <= coupon.validUntil) {
        if (coupon.discountType === 'percentage') {
          discount = (subtotal * coupon.discountValue) / 100
          if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount)
        } else {
          discount = coupon.discountValue
        }
        // Increment coupon usage
        await prisma.coupon.update({
          where: { id: coupon.id },
          data: { usedCount: { increment: 1 } }
        })
      }
    }

    // Create order - build data object conditionally
    const orderData: any = {
      orderNumber,
      addressId: address.id,
      subtotal: subtotal || total - (shippingCost || 0),
      shippingCost: shippingCost || 0,
      discount,
      total: total - discount,
      couponCode,
      paymentMethod,
      paymentStatus: 'pending',
      status: 'pending',
      items: {
        create: cartItems.map((item: any) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          variantInfo: JSON.stringify({
            size: item.size,
            color: item.color,
            variantId: item.variantId
          }),
        })),
      },
    }
    
    // Only add userId if user is logged in
    if (userId) {
      orderData.userId = userId
    } else {
      orderData.guestEmail = guestEmail
    }
    
    const order = await prisma.order.create({
      data: orderData,
      include: {
        items: {
          include: {
            product: { select: { name: true, images: true } }
          }
        },
        address: true,
      },
    })

    // Deduct stock for each item with a variant (only if variant exists)
    for (const item of cartItems) {
      if (item.variantId) {
        try {
          // First check if variant exists
          const variant = await prisma.productVariant.findUnique({
            where: { id: item.variantId }
          })
          
          if (variant) {
            await prisma.productVariant.update({
              where: { id: item.variantId },
              data: { stock: { decrement: item.quantity } }
            })
          }
        } catch (stockError) {
          // Log but don't fail the order if stock update fails
          console.log('Stock update skipped for variant:', item.variantId, stockError)
        }
      }
    }

    // Create payment record
    await prisma.payment.create({
      data: {
        orderId: order.id,
        method: paymentMethod,
        amount: order.total,
        status: 'pending',
      },
    })

    // Send notifications
    try {
      // Notify admins about new order
      await notifyNewOrder(order.id, shippingDetails.name, order.total)
      
      // Notify customer if logged in
      if (userId) {
        await notifyOrderConfirmed(userId, order.id)
      }

      // Email Notifications (Async)
      import('@/lib/email').then(async ({ sendOrderConfirmation, sendNewOrderSellerEmail }) => {
         // 1. Notify Customer
         const itemsForEmail = cartItems.map((item: any) => ({ 
             name: item.name || 'Product', 
             quantity: item.quantity, 
             price: item.price 
         }))

         sendOrderConfirmation({
           to: shippingDetails.email || guestEmail || '',
           orderNumber: order.orderNumber,
           customerName: shippingDetails.name || 'Customer',
           items: itemsForEmail,
           subtotal: order.subtotal,
           shipping: order.shippingCost,
           discount: order.discount,
           total: order.total,
           address: `${shippingDetails.address}, ${shippingDetails.city}`,
           paymentMethod: order.paymentMethod
         }).catch(console.error)
  
         // 2. Notify Sellers
         const sellerEarnings: Record<string, number> = {}
         const productIds = cartItems.map((i: any) => i.productId)
         
         try {
           const products = await prisma.product.findMany({
             where: { id: { in: productIds } },
             include: { seller: { select: { email: true } }, shop: { include: { owner: { select: { email: true } } } } }
           })
  
           products.forEach(p => {
             const sellerEmail = p.seller?.email || p.shop?.owner?.email
             if (sellerEmail) {
                const item = cartItems.find((i: any) => i.productId === p.id)
                if (item) {
                   sellerEarnings[sellerEmail] = (sellerEarnings[sellerEmail] || 0) + (item.price * item.quantity)
                }
             }
           })
  
           Object.entries(sellerEarnings).forEach(([email, amount]) => {
              sendNewOrderSellerEmail(email, order.orderNumber, amount).catch(console.error)
           })
         } catch(e) { console.error('Seller email error', e) }
      })
    } catch (notifyError) {
      console.log('Notification error (non-blocking):', notifyError)
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        total: order.total,
        discount: order.discount,
        status: order.status
      }
    })
  } catch (error: any) {
    console.error('Order creation error:', error)
    return NextResponse.json(
      { message: error.message || 'Failed to create order' },
      { status: 500 }
    )
  }
}
