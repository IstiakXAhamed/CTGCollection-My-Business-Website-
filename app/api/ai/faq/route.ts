
import { NextRequest, NextResponse } from 'next/server'
import { generateProductFAQ } from '@/lib/gemini-ai'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { productName, description, category } = await request.json()

    if (!productName || !category) {
      return NextResponse.json({ error: 'Product name and category are required' }, { status: 400 })
    }

    const start = Date.now()
    const result = await generateProductFAQ(productName, description || '', category, { count: 5 })
    const duration = Date.now() - start
    
    console.log(`FAQ generation for ${productName} took ${duration}ms`)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      faqs: result.result.faqs 
    })
  } catch (error: any) {
    console.error('FAQ API Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
