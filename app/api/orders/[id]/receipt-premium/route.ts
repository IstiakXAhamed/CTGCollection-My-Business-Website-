import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth'
import { savePremiumReceiptToFile } from '@/lib/receipt-premium'

// GET - Generate premium receipt for an order
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const orderId = params.id

    // Generate premium receipt
    const receiptUrl = await savePremiumReceiptToFile(orderId)

    if (!receiptUrl) {
      return NextResponse.json({ error: 'Failed to generate receipt' }, { status: 500 })
    }

    return NextResponse.json({ receiptUrl, type: 'premium' })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
