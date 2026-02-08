import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { 
  parseAIJSON, 
  callGeminiAI,
  generateAdvancedDescription,
  analyzeProductForSuggestions,
  getSmartSuggestions,
  rewriteContent
} from '@/lib/gemini-ai'

export const dynamic = 'force-dynamic'

// Check admin access
async function checkAdmin(request: NextRequest) {
  const user = await verifyAuth(request)
  if (!user || (user.role !== 'admin' && user.role !== 'superadmin' && user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN' && user.role !== 'seller' && user.role !== 'SELLER')) {
    return null
  }
  return user
}

// Note: callGemini is now imported from @/lib/gemini-ai as callGeminiAI

export async function POST(request: NextRequest) {
  try {
    const admin = await checkAdmin(request)
    if (!admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 401 })
    }

    const { action, productName, category, description, tone, language } = await request.json()

    if (!productName) {
      return NextResponse.json({ error: 'Product name is required' }, { status: 400 })
    }

    let result: any = {}
    
    // Fetch site settings for store name
    let storeName = 'Silk Mart'
    try {
      const settings = await (prisma as any).siteSettings.findUnique({ where: { id: 'main' } })
      if (settings?.storeName) storeName = settings.storeName
    } catch (e) {
      console.warn('Failed to fetch settings for product assist:', e)
    }

    try {
      switch (action) {
        case 'description':
          const descRes = await generateAdvancedDescription(productName, { category, tone, language, storeName })
          if (descRes.success) result.suggestion = descRes.result
          else throw new Error(descRes.error)
          break
        case 'tags':
          const tagsRes = await getSmartSuggestions(productName, 'tags')
          if (tagsRes.success) result.suggestion = tagsRes.result.join(', ')
          else throw new Error(tagsRes.error)
          break
        case 'seo':
          const seoRes = await getSmartSuggestions(productName, 'product_name') 
          if (seoRes.success) result.suggestion = `${productName} | Premium Quality | ${storeName}`
          else throw new Error(seoRes.error)
          break
        case 'analyze':
          const analyzeRes = await analyzeProductForSuggestions(productName, storeName)
          if (analyzeRes.success) result = analyzeRes.result
          else throw new Error(analyzeRes.error)
          break
        case 'complete':
          const compRes = await callGeminiAI(`Generate complete product details for "${productName}" in the context of "${storeName}" in JSON format...`)
          result = parseAIJSON(compRes, {})
          break
        case 'rewrite':
          const rewriteRes = await rewriteContent(description, { tone, language, storeName })
          if (rewriteRes.success) result.suggestion = rewriteRes.result
          else throw new Error(rewriteRes.error)
          break
        default:
          return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
      }
    } catch (aiError: any) {
      console.error('AI Route Critical Failure:', aiError.message)
      return NextResponse.json({ 
        success: false, 
        error: aiError.message,
        fallback: true,
        suggestion: action === 'description' ? `Discover our premium collection at ${storeName}.` : productName
      }, { status: 500 })
    }

    return NextResponse.json({ success: true, ...result })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// Local AI and Fallback functions removed as they are now centralized in @/lib/gemini-ai
