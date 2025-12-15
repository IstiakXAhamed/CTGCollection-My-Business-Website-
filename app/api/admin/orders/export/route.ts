import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'

// Helper to check admin
async function checkAdmin(request: NextRequest) {
  const user = await verifyAuth(request)
  if (!user || (user.role !== 'admin' && user.role !== 'superadmin' && user.role !== 'seller')) {
    return null
  }
  return user
}

// GET - Export orders as CSV
export async function GET(request: NextRequest) {
  try {
    const admin = await checkAdmin(request)
    if (!admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'csv'
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const status = searchParams.get('status')

    // Build where clause
    const where: any = {}
    if (startDate) where.createdAt = { gte: new Date(startDate) }
    if (endDate) where.createdAt = { ...where.createdAt, lte: new Date(endDate) }
    if (status && status !== 'all') where.status = status

    const orders = await prisma.order.findMany({
      where,
      include: {
        user: { select: { name: true, email: true } },
        address: { select: { address: true, city: true, district: true, name: true, phone: true } },
        items: {
          include: {
            product: { select: { name: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    if (format === 'json') {
      return NextResponse.json({ orders, total: orders.length })
    }

    // Generate CSV
    const headers = [
      'Order Number',
      'Date',
      'Customer Name',
      'Customer Email',
      'Phone',
      'Address',
      'City',
      'District',
      'Items',
      'Subtotal',
      'Shipping',
      'Discount',
      'Total',
      'Payment Method',
      'Payment Status',
      'Order Status'
    ].join(',')

    const rows = orders.map((order: any) => {
      const items = order.items.map((item: any) => 
        `${item.product?.name || 'Unknown'} x${item.quantity}`
      ).join('; ')

      return [
        order.orderNumber,
        new Date(order.createdAt).toLocaleString(),
        order.user?.name || order.address?.name || order.name || 'Guest',
        order.user?.email || order.guestEmail || 'N/A',
        order.address?.phone || order.phone || 'N/A',
        `"${order.address?.address || 'N/A'}"`,
        order.address?.city || 'N/A',
        order.address?.district || 'N/A',
        `"${items}"`,
        order.subtotal,
        order.shippingCost,
        order.discount,
        order.total,
        order.paymentMethod,
        order.paymentStatus,
        order.status
      ].join(',')
    })

    const csv = [headers, ...rows].join('\n')

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="orders-export-${new Date().toISOString().split('T')[0]}.csv"`
      }
    })
  } catch (error: any) {
    console.error('Export error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
