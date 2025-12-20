import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// Gemini API configuration
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent'

// Check admin access
async function checkAdmin(request: NextRequest) {
  const user = await verifyAuth(request)
  if (!user || (user.role !== 'admin' && user.role !== 'superadmin' && user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN' && user.role !== 'seller' && user.role !== 'SELLER')) {
    return null
  }
  return user
}

// Call Gemini API
async function callGemini(prompt: string): Promise<string> {
  const apiKey = process.env.GOOGLE_AI_API_KEY
  
  if (!apiKey) {
    throw new Error('GOOGLE_AI_API_KEY not configured')
  }

  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
      }
    })
  })

  if (!response.ok) {
    const error = await response.text()
    console.error('Gemini API error:', error)
    throw new Error('AI generation failed')
  }

  const data = await response.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text || ''
}

export async function POST(request: NextRequest) {
  try {
    const admin = await checkAdmin(request)
    if (!admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 401 })
    }

    const { action, productName, category, description } = await request.json()

    if (!productName) {
      return NextResponse.json({ error: 'Product name is required' }, { status: 400 })
    }

    let result: any = {}

    try {
      switch (action) {
        case 'description':
          result.suggestion = await generateDescription(productName, category)
          break
        case 'tags':
          result.suggestion = await generateTags(productName, category)
          break
        case 'seo':
          result.suggestion = await generateSEO(productName, category)
          break
        case 'analyze':
          result = await analyzeProduct(productName)
          break
        case 'complete':
          result = await completeProduct(productName)
          break
        default:
          return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
      }
    } catch (aiError: any) {
      // Fallback to template-based if AI fails
      console.log('AI failed, using fallback:', aiError.message)
      switch (action) {
        case 'description':
          result.suggestion = fallbackDescription(productName, category)
          break
        case 'tags':
          result.suggestion = fallbackTags(productName, category)
          break
        case 'seo':
          result.suggestion = fallbackSEO(productName, category)
          break
        case 'analyze':
          result = fallbackAnalyze(productName)
          break
        case 'complete':
          result = fallbackComplete(productName)
          break
      }
      result.fallback = true
    }

    return NextResponse.json({ success: true, ...result })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// ============ Real AI Functions ============

async function generateDescription(name: string, category?: string): Promise<string> {
  const prompt = `You are a professional e-commerce copywriter for a Bangladeshi fashion and lifestyle store called "CTG Collection".

Write a compelling, detailed product description for: "${name}"
${category ? `Category: ${category}` : ''}

Requirements:
- 3-4 sentences, engaging and persuasive
- Highlight key features and benefits
- Use sensory words and emotional appeal
- Mention quality, comfort, or style as appropriate
- Do NOT include prices or availability
- Do NOT use placeholder brackets like [color] or [size]
- Write in English
- Make it specific to the actual product, not generic

Product Description:`

  const response = await callGemini(prompt)
  return response.trim()
}

async function generateTags(name: string, category?: string): Promise<string> {
  const prompt = `Generate SEO-optimized tags for this product: "${name}"
${category ? `Category: ${category}` : ''}

Requirements:
- Return 8-12 relevant tags separated by commas
- Include product type, materials, style, occasion
- Include relevant Bengali/Bangladesh terms like "bangladesh", "ctg", "chittagong"
- Make tags lowercase
- No hashtags, just comma-separated words

Tags:`

  const response = await callGemini(prompt)
  return response.trim().toLowerCase()
}

async function generateSEO(name: string, category?: string): Promise<string> {
  const prompt = `Create an SEO-optimized meta title for this product: "${name}"
${category ? `Category: ${category}` : ''}

Requirements:
- Max 60 characters
- Include main keyword
- Include "CTG Collection" brand
- Include a benefit or USP
- Format: Product Name | Benefit | CTG Collection

SEO Title:`

  const response = await callGemini(prompt)
  return response.trim()
}

async function analyzeProduct(name: string): Promise<any> {
  const prompt = `Analyze this product name and provide suggestions: "${name}"

You are helping a Bangladeshi e-commerce store manager. Respond in this exact JSON format:

{
  "productType": "detected product type (e.g., Shoes, T-Shirt, Electronics)",
  "suggestedCategory": "best category from: Fashion, Electronics, Home & Living, Beauty, Sports, Accessories",
  "priceRange": {
    "min": minimum suggested price in BDT (number only),
    "max": maximum suggested price in BDT (number only)
  },
  "suggestedVariants": {
    "sizes": ["array of suggested sizes if applicable"],
    "colors": ["array of common colors for this product type"]
  },
  "keywords": ["5 SEO keywords"],
  "confidence": "high/medium/low"
}

Return ONLY the JSON, no other text.`

  const response = await callGemini(prompt)
  
  try {
    // Extract JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
    throw new Error('Invalid JSON response')
  } catch (e) {
    return fallbackAnalyze(name)
  }
}

async function completeProduct(name: string): Promise<any> {
  const prompt = `You are an AI assistant for a Bangladeshi e-commerce store. Generate complete product details for: "${name}"

Return a JSON object with these fields:
{
  "description": "compelling 3-4 sentence product description",
  "category": "one of: Fashion, Electronics, Home & Living, Beauty, Sports, Accessories",
  "suggestedPrice": base price in BDT (number only),
  "salePrice": optional sale price in BDT (number only, or null),
  "tags": "comma-separated SEO tags",
  "seoTitle": "SEO meta title under 60 chars",
  "variants": {
    "sizes": ["suggested sizes if applicable"],
    "colors": ["suggested colors"]
  },
  "isFeatured": true or false based on popularity
}

Return ONLY the JSON, no other text.`

  const response = await callGemini(prompt)
  
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
    throw new Error('Invalid JSON response')
  } catch (e) {
    return fallbackComplete(name)
  }
}

// ============ Fallback Functions (when AI unavailable) ============

function fallbackDescription(name: string, category?: string): string {
  const categoryText = category ? ` from our ${category} collection` : ''
  return `Discover the ${name}${categoryText}. Crafted with premium quality materials for exceptional comfort and style. This product features modern design elements perfect for any occasion. Experience the perfect blend of functionality and elegance with CTG Collection.`
}

function fallbackTags(name: string, category?: string): string {
  const baseTags = name.toLowerCase().split(' ').filter(w => w.length > 2)
  const categoryTags = category ? [category.toLowerCase()] : []
  const commonTags = ['premium', 'quality', 'ctg collection', 'bangladesh', 'chittagong', 'online shopping']
  return [...baseTags, ...categoryTags, ...commonTags].join(', ')
}

function fallbackSEO(name: string, category?: string): string {
  return `${name} | Premium Quality | CTG Collection Bangladesh`
}

function fallbackAnalyze(name: string): any {
  const nameLower = name.toLowerCase()
  
  // Simple keyword detection
  let category = 'Fashion'
  let productType = 'Product'
  let sizes: string[] = []
  let colors = ['Black', 'White', 'Navy']
  let priceRange = { min: 999, max: 2999 }

  if (nameLower.includes('shirt') || nameLower.includes('tshirt') || nameLower.includes('t-shirt')) {
    productType = 'T-Shirt'
    sizes = ['S', 'M', 'L', 'XL', 'XXL']
    priceRange = { min: 599, max: 1499 }
  } else if (nameLower.includes('shoe') || nameLower.includes('sneaker') || nameLower.includes('boot')) {
    productType = 'Footwear'
    category = 'Sports'
    sizes = ['39', '40', '41', '42', '43', '44', '45']
    priceRange = { min: 2999, max: 8999 }
  } else if (nameLower.includes('phone') || nameLower.includes('laptop') || nameLower.includes('headphone')) {
    productType = 'Electronics'
    category = 'Electronics'
    sizes = []
    priceRange = { min: 4999, max: 49999 }
  } else if (nameLower.includes('watch')) {
    productType = 'Watch'
    category = 'Accessories'
    sizes = []
    priceRange = { min: 1999, max: 9999 }
  } else if (nameLower.includes('bag') || nameLower.includes('backpack')) {
    productType = 'Bag'
    category = 'Accessories'
    sizes = []
    priceRange = { min: 1499, max: 4999 }
  } else if (nameLower.includes('pant') || nameLower.includes('jeans') || nameLower.includes('trouser')) {
    productType = 'Pants'
    sizes = ['28', '30', '32', '34', '36', '38']
    priceRange = { min: 1299, max: 3499 }
  }

  return {
    productType,
    suggestedCategory: category,
    priceRange,
    suggestedVariants: { sizes, colors },
    keywords: [nameLower, category.toLowerCase(), 'online shopping', 'bangladesh', 'ctg collection'],
    confidence: 'low'
  }
}

function fallbackComplete(name: string): any {
  const analysis = fallbackAnalyze(name)
  return {
    description: fallbackDescription(name, analysis.suggestedCategory),
    category: analysis.suggestedCategory,
    suggestedPrice: analysis.priceRange.max,
    salePrice: Math.round(analysis.priceRange.max * 0.85),
    tags: fallbackTags(name, analysis.suggestedCategory),
    seoTitle: fallbackSEO(name, analysis.suggestedCategory),
    variants: analysis.suggestedVariants,
    isFeatured: false
  }
}
