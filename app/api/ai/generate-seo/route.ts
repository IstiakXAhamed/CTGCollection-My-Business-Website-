import { NextRequest, NextResponse } from 'next/server'
import { callGeminiAI, parseAIJSON } from '@/lib/gemini-ai'

export async function POST(req: NextRequest) {
  try {
    const { name, description, category } = await req.json()

    if (!name) {
      return NextResponse.json({ success: false, error: 'Product name is required' }, { status: 400 })
    }

    const prompt = `Generate SEO tags for this product.
    
    Product: ${name}
    Category: ${category}
    Description: ${description}
    
    Return JSON with:
    - metaTitle: Catchy, under 60 chars.
    - metaDescription: Engaging, under 160 chars.
    - metaKeywords: 5-8 comma-separated keywords.
    
    Example:
    {
      "metaTitle": "Premium Silk Saree - Buy Online | Silk Mart",
      "metaDescription": "Shop this exclusive silk saree. Handcrafted for elegance. Best price in Bangladesh.",
      "metaKeywords": "silk saree, women fashion, eid collection, traditional wear"
    }
    
    Return ONLY valid JSON.`

    const result = await callGeminiAI(prompt)
    const json = parseAIJSON(result, {})
    
    return NextResponse.json({ success: true, result: json })

  } catch (error: any) {
    console.error('SEO Gen Error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
