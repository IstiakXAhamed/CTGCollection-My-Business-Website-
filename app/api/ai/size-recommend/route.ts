
import { NextRequest, NextResponse } from 'next/server'
import { recommendSize } from '@/lib/gemini-ai'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { productType, measurements } = await request.json()

    if (!productType || !measurements) {
      return NextResponse.json({ error: 'Product type and measurements are required' }, { status: 400 })
    }

    const start = Date.now()
    const result = await recommendSize(productType, measurements)
    const duration = Date.now() - start
    
    console.log(`Size recommendation for ${productType} took ${duration}ms`)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      recommendation: result.result 
    })
  } catch (error: any) {
    console.error('Size Recommender API Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
