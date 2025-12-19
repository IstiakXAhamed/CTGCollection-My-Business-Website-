import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth'
import { generateReceipt } from '@/lib/receipt'

export const dynamic = 'force-dynamic'

// Sample order data for preview
const sampleOrder = {
  id: 'preview-123',
  orderNumber: 'CTG-PREVIEW-2024',
  verificationCode: 'A7B2X9',
  createdAt: new Date(),
  status: 'delivered',
  paymentMethod: 'cod',
  paymentStatus: 'paid',
  subtotal: 4999,
  shippingCost: 60,
  discount: 500,
  total: 4559,
  couponCode: 'WELCOME10',
  address: {
    name: 'John Doe',
    phone: '+880 1234-567890',
    address: '123 Main Street, Block A',
    city: 'Chittagong',
    district: 'Chittagong',
    postalCode: '4000'
  },
  user: {
    name: 'John Doe',
    email: 'john@example.com'
  },
  guestEmail: null,
  items: [
    {
      quantity: 1,
      price: 2999,
      product: {
        name: 'Premium Leather Jacket',
        hasWarranty: true,
        warrantyPeriod: '1 Year'
      },
      variantInfo: JSON.stringify({ size: 'L', color: 'Black' })
    },
    {
      quantity: 2,
      price: 1000,
      product: {
        name: 'Cotton T-Shirt',
        hasWarranty: false,
        warrantyPeriod: null
      },
      variantInfo: JSON.stringify({ size: 'M', color: 'Navy Blue' })
    }
  ]
}

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user || !['admin', 'superadmin'].includes(user.role)) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const templateId = searchParams.get('template') || '1'

    // Pass the logo from public folder
    const logoUrl = '/logo.png'
    const html = generateReceipt(sampleOrder as any, templateId, logoUrl)

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
      }
    })
  } catch (error: any) {
    return new NextResponse(`Error: ${error.message}`, { status: 500 })
  }
}
