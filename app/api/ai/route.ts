/**
 * Multi-Purpose AI API Endpoint
 * 
 * Handles all AI requests across the site
 */

import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import * as AI from '@/lib/gemini-ai'

export const dynamic = 'force-dynamic'

// Check access (admin, seller, or specific permission)
async function checkAccess(request: NextRequest) {
  const user = await verifyAuth(request)
  if (!user) return null
  
  // Allow admin, superadmin, seller roles
  const allowedRoles = ['admin', 'superadmin', 'seller', 'ADMIN', 'SUPER_ADMIN', 'SELLER']
  if (allowedRoles.includes(user.role)) {
    return user
  }
  
  return null
}

export async function POST(request: NextRequest) {
  try {
    const user = await checkAccess(request)
    if (!user) {
      return NextResponse.json({ error: 'Access denied' }, { status: 401 })
    }

    const { action, ...params } = await request.json()

    if (!action) {
      return NextResponse.json({ error: 'Action required' }, { status: 400 })
    }

    // Fetch site settings for store name
    let storeName = 'Silk Mart'
    let fullSettings = null
    try {
      const settings = await (prisma as any).siteSettings.findUnique({ where: { id: 'main' } })
      if (settings?.storeName) storeName = settings.storeName
      fullSettings = settings
    } catch (e) {
      console.warn('Failed to fetch settings for generic AI route:', e)
    }

    let result: AI.AIResponse

    switch (action) {
      // ===== Product AI =====
      case 'product_description':
        result = await AI.generateProductDescription(params.productName, params.category, storeName)
        break
      
      case 'product_analyze':
        result = await AI.analyzeProductForSuggestions(params.productName, storeName)
        break

      // ===== Chat AI =====
      case 'chat_response':
        result = await AI.generateChatResponse(params.message, params.context, fullSettings || { siteName: storeName })
        break
      
      case 'chat_suggestions':
        result = await AI.suggestChatReplies(params.message)
        break

      // ===== Review AI =====
      case 'review_analyze':
        result = await AI.analyzeReview(params.reviewText, params.rating, storeName)
        break
      
      case 'review_response':
        result = await AI.generateReviewResponse(params.reviewText, params.rating, params.productName)
        break

      // ===== Coupon AI =====
      case 'coupon_ideas':
        result = await AI.generateCouponIdeas({
          occasion: params.occasion,
          targetAudience: params.targetAudience,
          discountType: params.discountType,
          storeName: storeName
        })
        break

      // ===== Announcement AI =====
      case 'announcement_generate':
        result = await AI.generateAnnouncement(params.topic, params.type || 'general', storeName)
        break

      // ===== Order AI =====
      case 'order_insights':
        result = await AI.generateOrderInsights(params.orderData)
        break

      // ===== SEO AI =====
      case 'seo_content':
        result = await AI.generateSEOContent(params.pageName, params.pageType || 'page', storeName)
        break

      // ===== Translation AI =====
      case 'translate':
        result = await AI.translateContent(params.text, params.targetLang || 'bn')
        break

      // ===== Email AI =====
      case 'email_order':
        result = await AI.generateOrderEmail(params.emailType, { ...params.orderDetails, storeName })
        break
      
      case 'email_marketing':
        result = await AI.generateMarketingEmail(params.campaign, params.targetAudience, storeName)
        break

      // ===== Smart Suggestions =====
      case 'smart_suggest':
        result = await AI.getSmartSuggestions(params.context, params.suggestionType)
        break

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 })
    }

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('AI API error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'AI request failed' 
    }, { status: 500 })
  }
}
