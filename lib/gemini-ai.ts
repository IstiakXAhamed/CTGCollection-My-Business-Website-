/**
 * Centralized Gemini AI Library
 * 
 * This library provides AI-powered features across the entire site.
 * All AI calls go through this library for consistency and control.
 */

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent'

export interface AIResponse {
  success: boolean
  result?: any
  error?: string
  fallback?: boolean
}

// ============ Core AI Function ============

export async function callGeminiAI(prompt: string, options?: {
  temperature?: number
  maxTokens?: number
}): Promise<string> {
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
        temperature: options?.temperature ?? 0.7,
        maxOutputTokens: options?.maxTokens ?? 1024,
      }
    })
  })

  if (!response.ok) {
    throw new Error('AI request failed')
  }

  const data = await response.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text || ''
}

// ============ Helper for JSON Parsing ============

/**
 * Robustly parses JSON from AI response, handling Markdown code blocks.
 */
export function parseAIJSON<T>(text: string, defaultValue: T): T {
  try {
    // 1. Try parsing directly
    try {
      return JSON.parse(text)
    } catch (e) {
      // Continue if direct parsing fails
    }

    // 2. Strip Markdown code blocks (```json ... ```)
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
    if (jsonMatch && jsonMatch[1]) {
      try {
        return JSON.parse(jsonMatch[1])
      } catch (e) {
        // Continue
      }
    }

    // 3. Find first { or [ and last } or ]
    const firstOpen = text.search(/[{[]/)
    const lastClose = text.search(/[}\]][^}\]]*$/)

    if (firstOpen !== -1 && lastClose !== -1 && lastClose > firstOpen) {
      const jsonString = text.substring(firstOpen, lastClose + 1)
      try {
        return JSON.parse(jsonString)
      } catch (e) {
        // Continue
      }
    }

    console.warn('Failed to parse AI JSON:', text)
    return defaultValue
  } catch (error) {
    console.error('Error in parseAIJSON:', error)
    return defaultValue
  }
}

// ============ Product AI ============

export async function generateProductDescription(productName: string, category?: string): Promise<AIResponse> {
  try {
    const prompt = `Write a compelling 3-4 sentence product description for "${productName}"${category ? ` in ${category}` : ''} for a Bangladeshi e-commerce store. Be specific, engaging, and highlight benefits. Do NOT use placeholders.`
    const result = await callGeminiAI(prompt)
    return { success: true, result: result.trim() }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

export async function analyzeProductForSuggestions(productName: string): Promise<AIResponse> {
  try {
    const prompt = `Analyze this product: "${productName}". Return JSON with: { "category": "...", "priceRange": { "min": number, "max": number } (in BDT), "sizes": [...], "colors": [...], "tags": [...] }. Return ONLY valid JSON.`
    const result = await callGeminiAI(prompt, { temperature: 0.3 })
    const json = parseAIJSON(result, {})
    return { success: true, result: json }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

// ============ Customer Support AI ============

export async function generateChatResponse(customerMessage: string, context?: { orderStatus?: string, previousMessages?: string[] }): Promise<AIResponse> {
  try {
    const contextInfo = context?.orderStatus ? `Order Status: ${context.orderStatus}` : ''
    const prompt = `You are a helpful customer support agent for CTG Collection (Bangladesh e-commerce).
Customer message: "${customerMessage}"
${contextInfo}

Write a professional, helpful response in 2-3 sentences. Be polite and solution-oriented. If about order, provide tracking info or next steps.`
    const result = await callGeminiAI(prompt)
    return { success: true, result: result.trim() }
  } catch (e: any) {
    return { success: false, error: e.message, fallback: true, result: 'Thank you for contacting us. Our team will get back to you shortly.' }
  }
}

export async function suggestChatReplies(customerMessage: string): Promise<AIResponse> {
  try {
    const prompt = `Customer message: "${customerMessage}"
Generate 3 quick reply options for support agent. Return as JSON array: ["reply1", "reply2", "reply3"]. Keep each under 50 words.`
    const result = await callGeminiAI(prompt, { temperature: 0.5 })
    const replies = parseAIJSON(result, [])
    return { success: true, result: replies }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

// ============ Review AI ============

export async function analyzeReview(reviewText: string, rating: number): Promise<AIResponse> {
  try {
    const prompt = `Analyze this product review:
Text: "${reviewText}"
Rating: ${rating}/5

Return JSON: {
  "sentiment": "positive/negative/neutral",
  "isSpam": true/false,
  "isInappropriate": true/false,
  "keyPoints": ["..."],
  "suggestedResponse": "...",
  "qualityScore": 1-10
}
Return ONLY valid JSON.`
    const result = await callGeminiAI(prompt, { temperature: 0.2 })
    const json = parseAIJSON(result, {})
    return { success: true, result: json }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

export async function generateReviewResponse(reviewText: string, rating: number, productName: string): Promise<AIResponse> {
  try {
    const isPositive = rating >= 4
    const prompt = `Write a ${isPositive ? 'thank you' : 'apologetic'} response to this review:
Product: ${productName}
Rating: ${rating}/5
Review: "${reviewText}"

Keep it professional, 2-3 sentences. If negative, offer to help resolve issues.`
    const result = await callGeminiAI(prompt)
    return { success: true, result: result.trim() }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

// ============ Coupon AI ============

export async function generateCouponIdeas(options: { occasion?: string, targetAudience?: string, discountType?: string }): Promise<AIResponse> {
  try {
    const prompt = `Generate 5 creative coupon/promo code ideas for a Bangladesh e-commerce store.
${options.occasion ? `Occasion: ${options.occasion}` : ''}
${options.targetAudience ? `Target: ${options.targetAudience}` : ''}
${options.discountType ? `Type: ${options.discountType}` : ''}

Return JSON array: [{ "code": "EXAMPLE20", "name": "...", "description": "...", "discountPercent": 20, "validDays": 7 }, ...]
Use creative, memorable codes. Return ONLY valid JSON array.`
    const result = await callGeminiAI(prompt)
    const coupons = parseAIJSON(result, [])
    return { success: true, result: coupons }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

// ============ Announcement AI ============

export async function generateAnnouncement(topic: string, type: 'sale' | 'new_arrival' | 'event' | 'policy' | 'general'): Promise<AIResponse> {
  try {
    const prompt = `Write an engaging store announcement for CTG Collection:
Topic: ${topic}
Type: ${type}

Return JSON: {
  "title": "Catchy headline (max 60 chars)",
  "content": "Full announcement (100-150 words)",
  "emoji": "relevant emoji",
  "cta": "Call to action button text"
}
Make it exciting and action-oriented. Return ONLY valid JSON.`
    const result = await callGeminiAI(prompt)
    const json = parseAIJSON(result, {})
    return { success: true, result: json }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

// ============ Order AI ============

export async function generateOrderInsights(orderData: { totalOrders: number, totalRevenue: number, topProducts: string[], period: string }): Promise<AIResponse> {
  try {
    const prompt = `Analyze this e-commerce data and provide insights:
Period: ${orderData.period}
Total Orders: ${orderData.totalOrders}
Revenue: ৳${orderData.totalRevenue.toLocaleString()}
Top Products: ${orderData.topProducts.join(', ')}

Provide 3-4 actionable business insights in JSON: {
  "summary": "Quick overview sentence",
  "insights": ["insight1", "insight2", "insight3"],
  "recommendations": ["recommendation1", "recommendation2"],
  "trend": "up/down/stable"
}
Return ONLY valid JSON.`
    const result = await callGeminiAI(prompt)
    const json = parseAIJSON(result, {})
    return { success: true, result: json }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

// ============ SEO AI ============

export async function generateSEOContent(pageName: string, pageType: 'category' | 'product' | 'blog' | 'page'): Promise<AIResponse> {
  try {
    const prompt = `Generate SEO content for: "${pageName}" (${pageType} page)
Store: CTG Collection (Bangladesh e-commerce)

Return JSON: {
  "metaTitle": "Max 60 chars, include keywords",
  "metaDescription": "Max 160 chars, compelling and keyword-rich",
  "h1": "Main heading",
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"]
}
Return ONLY valid JSON.`
    const result = await callGeminiAI(prompt)
    const json = parseAIJSON(result, {})
    return { success: true, result: json }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

// ============ Translation AI ============

export async function translateContent(text: string, targetLang: 'bn' | 'en'): Promise<AIResponse> {
  try {
    const langName = targetLang === 'bn' ? 'Bengali' : 'English'
    const prompt = `Translate the following text to ${langName}. Keep the tone and meaning accurate.

Text: "${text}"

Return ONLY the translated text, nothing else.`
    const result = await callGeminiAI(prompt, { temperature: 0.2 })
    return { success: true, result: result.trim() }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

// ============ Email AI ============

export async function generateOrderEmail(type: 'confirmation' | 'shipped' | 'delivered' | 'cancelled', orderDetails: { orderId: string, customerName: string, items: string[], total: number }): Promise<AIResponse> {
  try {
    const prompt = `Write an order ${type} email for CTG Collection:
Order ID: ${orderDetails.orderId}
Customer: ${orderDetails.customerName}
Items: ${orderDetails.items.join(', ')}
Total: ৳${orderDetails.total}

Return JSON: {
  "subject": "Email subject line",
  "heading": "Main heading",
  "body": "Email body (2-3 paragraphs)",
  "cta": "Call to action if applicable"
}
Be warm, professional. Include relevant info for ${type} emails. Return ONLY valid JSON.`
    const result = await callGeminiAI(prompt)
    const json = parseAIJSON(result, {})
    return { success: true, result: json }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

export async function generateMarketingEmail(campaign: string, targetAudience: string): Promise<AIResponse> {
  try {
    const prompt = `Write a marketing email for CTG Collection:
Campaign: ${campaign}
Target: ${targetAudience}

Return JSON: {
  "subject": "Catchy subject line (max 50 chars)",
  "preheader": "Preview text (max 100 chars)",
  "heading": "Main heading",
  "body": "Email content (150-200 words)",
  "cta": "Call to action button text"
}
Make it compelling and action-oriented. Return ONLY valid JSON.`
    const result = await callGeminiAI(prompt)
    const json = parseAIJSON(result, {})
    return { success: true, result: json }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

// ============ Smart Suggestions ============

export async function getSmartSuggestions(context: string, type: 'product_name' | 'category' | 'tags' | 'price'): Promise<AIResponse> {
  try {
    const prompts: Record<string, string> = {
      product_name: `Suggest 5 similar product names based on: "${context}". Return JSON array: ["name1", "name2", ...]`,
      category: `Suggest appropriate categories for product: "${context}". Return JSON array of 3 best matching categories.`,
      tags: `Suggest 10 SEO-optimized tags for: "${context}". Return JSON array.`,
      price: `Suggest appropriate price range in BDT for: "${context}". Return JSON: {"min": number, "max": number, "recommended": number}`
    }
    
    const result = await callGeminiAI(prompts[type], { temperature: 0.4 })
    const parsed = type === 'price' 
      ? parseAIJSON(result, {})
      : parseAIJSON(result, [])
    return { success: true, result: parsed }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

// ============ ADVANCED AI FEATURES ============

// Types for advanced features
export type AITone = 'professional' | 'luxury' | 'friendly' | 'urgent' | 'casual'
export type AILanguage = 'en' | 'bn'

// 1. Advanced Product Description with Tone & Language
export async function generateAdvancedDescription(
  productName: string, 
  options?: { category?: string, tone?: AITone, language?: AILanguage }
): Promise<AIResponse> {
  try {
    const tone = options?.tone || 'professional'
    const lang = options?.language || 'en'
    const langName = lang === 'bn' ? 'Bengali (বাংলা)' : 'English'
    
    const toneGuides: Record<AITone, string> = {
      professional: 'Use professional, business-like language. Focus on features and quality.',
      luxury: 'Use premium, sophisticated language. Emphasize exclusivity and elegance.',
      friendly: 'Use warm, conversational tone. Make it feel personal and approachable.',
      urgent: 'Create urgency. Use phrases like "Limited stock", "Don\'t miss out".',
      casual: 'Use relaxed, everyday language. Keep it simple and relatable.'
    }
    
    const prompt = `Write a compelling 3-4 sentence product description for "${productName}"${options?.category ? ` in ${options.category}` : ''}.

TONE: ${toneGuides[tone]}
LANGUAGE: Write in ${langName}
STORE: CTG Collection (Bangladesh e-commerce)

Requirements:
- Be specific and engaging
- Highlight benefits
- Do NOT use placeholders like [color] or [size]
- Match the specified tone perfectly`

    const result = await callGeminiAI(prompt)
    return { success: true, result: result.trim() }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

// 2. Magic Rewrite - Improve existing content
export async function rewriteContent(
  text: string, 
  options?: { tone?: AITone, language?: AILanguage, action?: 'improve' | 'shorten' | 'expand' | 'fix_grammar' }
): Promise<AIResponse> {
  try {
    const action = options?.action || 'improve'
    const lang = options?.language || 'en'
    const langName = lang === 'bn' ? 'Bengali' : 'English'
    
    const actionPrompts: Record<string, string> = {
      improve: 'Improve this text to sound more professional and engaging',
      shorten: 'Make this text more concise while keeping key points',
      expand: 'Expand this text with more details and benefits',
      fix_grammar: 'Fix any grammar, spelling, or punctuation errors'
    }
    
    const prompt = `${actionPrompts[action]}:

Original text: "${text}"
${options?.tone ? `Apply ${options.tone} tone.` : ''}
Output in ${langName}.

Return ONLY the rewritten text, nothing else.`

    const result = await callGeminiAI(prompt, { temperature: 0.4 })
    return { success: true, result: result.trim() }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

// 3. Smart Image Keywords - Generate perfect search terms for Unsplash
export async function generateImageKeywords(productName: string, category?: string): Promise<AIResponse> {
  try {
    const prompt = `Generate 5 perfect search queries for finding product images on Unsplash/Pexels.

Product: "${productName}"
${category ? `Category: ${category}` : ''}

Return JSON: {
  "primary": "best single search term",
  "queries": ["query1", "query2", "query3", "query4", "query5"],
  "style": "product photography style suggestion",
  "colors": ["suggested", "color", "scheme"]
}

Make queries specific enough to find relevant images. Return ONLY valid JSON.`

    const result = await callGeminiAI(prompt, { temperature: 0.5 })
    const json = parseAIJSON(result, {})
    return { success: true, result: json }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

// 4. Marketing Content Generator - Facebook, Email, Ads
export async function generateMarketingContent(
  type: 'facebook_post' | 'instagram_caption' | 'email_campaign' | 'ad_copy' | 'sms',
  productOrCampaign: string,
  options?: { language?: AILanguage, tone?: AITone, includeEmoji?: boolean }
): Promise<AIResponse> {
  try {
    const lang = options?.language || 'en'
    const langName = lang === 'bn' ? 'Bengali (বাংলা)' : 'English'
    const emoji = options?.includeEmoji !== false ? 'Include relevant emojis.' : 'No emojis.'
    
    const typeConfigs: Record<string, { format: string, length: string }> = {
      facebook_post: { format: 'Facebook post with hook, body, CTA', length: '100-150 words' },
      instagram_caption: { format: 'Instagram caption with hook and hashtags', length: '50-100 words + 10 hashtags' },
      email_campaign: { format: 'Email with subject, preheader, body, CTA', length: '200-250 words' },
      ad_copy: { format: 'Ad headline + description', length: 'Headline 10 words max, description 30 words max' },
      sms: { format: 'SMS promotional text', length: 'Max 160 characters' }
    }
    
    const config = typeConfigs[type]
    
    const prompt = `Create ${type.replace(/_/g, ' ')} for CTG Collection:

Topic/Product: ${productOrCampaign}
Format: ${config.format}
Length: ${config.length}
Language: ${langName}
${emoji}

Return JSON with appropriate fields for ${type}. Return ONLY valid JSON.`

    const result = await callGeminiAI(prompt)
    const json = parseAIJSON(result, {})
    return { success: true, result: json }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

// 5. Customer Persona Generator
export async function generateCustomerPersona(orderData: {
  totalOrders: number,
  avgOrderValue: number,
  topCategories: string[],
  lastOrderDate: string
}): Promise<AIResponse> {
  try {
    const prompt = `Analyze this customer data and create a persona:

Orders: ${orderData.totalOrders}
Avg Order Value: ৳${orderData.avgOrderValue}
Top Categories: ${orderData.topCategories.join(', ')}
Last Order: ${orderData.lastOrderDate}

Return JSON: {
  "segment": "VIP/Regular/New/At-Risk",
  "persona": "Brief description",
  "preferences": ["preference1", "preference2"],
  "recommendations": ["product recommendation 1", "product recommendation 2"],
  "retentionStrategy": "How to keep this customer"
}
Return ONLY valid JSON.`

    const result = await callGeminiAI(prompt, { temperature: 0.4 })
    const json = parseAIJSON(result, {})
    return { success: true, result: json }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

// 6. Inventory Demand Forecaster
export async function predictInventoryNeeds(productData: {
  name: string,
  category: string,
  currentStock: number,
  salesLast30Days: number,
  salesLast7Days: number
}): Promise<AIResponse> {
  try {
    const prompt = `Predict inventory needs for this product:

Product: ${productData.name}
Category: ${productData.category}
Current Stock: ${productData.currentStock}
Sales (30 days): ${productData.salesLast30Days}
Sales (7 days): ${productData.salesLast7Days}

Return JSON: {
  "dailyRate": estimated daily sales (number),
  "daysUntilStockout": number,
  "restockRecommendation": number to restock,
  "urgency": "critical/high/medium/low",
  "reason": "Brief explanation"
}
Return ONLY valid JSON.`

    const result = await callGeminiAI(prompt, { temperature: 0.2 })
    const json = parseAIJSON(result, {})
    return { success: true, result: json }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

// 7. Product Bundle Suggester
export async function suggestProductBundles(
  productName: string,
  category: string,
  price: number
): Promise<AIResponse> {
  try {
    const prompt = `Suggest product bundles for cross-selling:

Main Product: ${productName}
Category: ${category}
Price: ৳${price}

Return JSON: {
  "bundles": [
    {
      "name": "Bundle name",
      "products": ["product1", "product2"],
      "discount": suggested bundle discount %,
      "reason": "Why these go together"
    }
  ],
  "frequentlyBoughtTogether": ["product1", "product2", "product3"],
  "upsellSuggestion": "Premium version or upgrade suggestion"
}
Return ONLY valid JSON.`

    const result = await callGeminiAI(prompt, { temperature: 0.5 })
    const json = parseAIJSON(result, {})
    return { success: true, result: json }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

// 8. Order Fraud Detector
export async function detectOrderFraud(orderDetails: {
  orderValue: number,
  paymentMethod: string,
  shippingAddress: string,
  customerOrderCount: number,
  itemCount: number
}): Promise<AIResponse> {
  try {
    const prompt = `Analyze this order for potential fraud indicators:

Order Value: ৳${orderDetails.orderValue}
Payment: ${orderDetails.paymentMethod}
Shipping: ${orderDetails.shippingAddress}
Customer's Previous Orders: ${orderDetails.customerOrderCount}
Items in Order: ${orderDetails.itemCount}

Return JSON: {
  "riskScore": 1-100,
  "riskLevel": "low/medium/high/critical",
  "flags": ["flag1", "flag2"],
  "recommendation": "approve/review/reject",
  "reason": "Brief explanation"
}
Return ONLY valid JSON.`

    const result = await callGeminiAI(prompt, { temperature: 0.2 })
    const json = parseAIJSON(result, {})
    return { success: true, result: json }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

// 9. Discount Optimizer
export async function optimizeDiscount(productData: {
  name: string,
  originalPrice: number,
  currentDiscount: number,
  salesVelocity: 'slow' | 'moderate' | 'fast',
  stockLevel: number,
  competitorPrice?: number
}): Promise<AIResponse> {
  try {
    const prompt = `Suggest optimal discount strategy:

Product: ${productData.name}
Price: ৳${productData.originalPrice}
Current Discount: ${productData.currentDiscount}%
Sales Speed: ${productData.salesVelocity}
Stock: ${productData.stockLevel} units
${productData.competitorPrice ? `Competitor Price: ৳${productData.competitorPrice}` : ''}

Return JSON: {
  "suggestedDiscount": optimal discount %,
  "suggestedPrice": final price after discount,
  "expectedImpact": "Predicted sales increase",
  "strategy": "flash_sale/clearance/competitive/premium",
  "reason": "Explanation"
}
Return ONLY valid JSON.`

    const result = await callGeminiAI(prompt, { temperature: 0.3 })
    const json = parseAIJSON(result, {})
    return { success: true, result: json }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

// 10. Product FAQ Generator
export async function generateProductFAQ(
  productName: string,
  description: string,
  category: string,
  options?: { language?: AILanguage, count?: number }
): Promise<AIResponse> {
  try {
    const lang = options?.language || 'en'
    const count = options?.count || 5
    const langName = lang === 'bn' ? 'Bengali (বাংলা)' : 'English'
    
    const prompt = `Generate ${count} frequently asked questions and answers for this product:

Product: ${productName}
Category: ${category}
Description: ${description}

Language: ${langName}

Return JSON: {
  "faqs": [
    { "question": "...", "answer": "..." }
  ]
}
Make questions realistic (shipping, size, material, care, warranty).
Return ONLY valid JSON.`

    const result = await callGeminiAI(prompt)
    const json = parseAIJSON(result, {})
    return { success: true, result: json }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

// 11. Size Recommender
export async function recommendSize(
  productType: string,
  measurements: { bust?: number, waist?: number, hip?: number, height?: number }
): Promise<AIResponse> {
  try {
    const prompt = `Recommend the best size based on measurements:

Product Type: ${productType}
${measurements.bust ? `Bust: ${measurements.bust} cm` : ''}
${measurements.waist ? `Waist: ${measurements.waist} cm` : ''}
${measurements.hip ? `Hip: ${measurements.hip} cm` : ''}
${measurements.height ? `Height: ${measurements.height} cm` : ''}

Return JSON: {
  "recommendedSize": "S/M/L/XL/XXL",
  "confidence": "high/medium/low",
  "alternativeSize": "second best option",
  "fitNotes": "How it will likely fit",
  "tip": "Sizing advice"
}
Return ONLY valid JSON.`

    const result = await callGeminiAI(prompt, { temperature: 0.2 })
    const json = parseAIJSON(result, {})
    return { success: true, result: json }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

// 12. Social Media Hashtag Generator
export async function generateHashtags(
  productName: string,
  category: string,
  options?: { platform?: 'instagram' | 'facebook' | 'tiktok', count?: number }
): Promise<AIResponse> {
  try {
    const platform = options?.platform || 'instagram'
    const count = options?.count || 15
    
    const prompt = `Generate ${count} trending hashtags for ${platform}:

Product: ${productName}
Category: ${category}
Store: CTG Collection (Bangladesh)

Return JSON: {
  "primary": ["#topHashtag1", "#topHashtag2", "#topHashtag3"],
  "secondary": ["other", "relevant", "hashtags"],
  "trending": ["currently", "trending", "ones"],
  "branded": ["#CTGCollection", "#ShopBangladesh"]
}
Mix English and Bengali hashtags. Return ONLY valid JSON.`

    const result = await callGeminiAI(prompt, { temperature: 0.6 })
    const json = parseAIJSON(result, {})
    return { success: true, result: json }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

// 13. Order Communication Generator (Bengali/English)
export async function generateOrderCommunication(
  type: 'confirmation' | 'shipped' | 'out_for_delivery' | 'delivered' | 'delayed',
  orderDetails: { orderId: string, customerName: string, items: string[], estimatedDelivery?: string },
  language: AILanguage = 'en'
): Promise<AIResponse> {
  try {
    const langName = language === 'bn' ? 'Bengali (বাংলা)' : 'English'
    
    const prompt = `Write an order ${type.replace(/_/g, ' ')} message:

Order ID: ${orderDetails.orderId}
Customer: ${orderDetails.customerName}
Items: ${orderDetails.items.join(', ')}
${orderDetails.estimatedDelivery ? `Expected Delivery: ${orderDetails.estimatedDelivery}` : ''}

Language: ${langName}
Store: CTG Collection

Return JSON: {
  "sms": "Short SMS version (max 160 chars)",
  "email": {
    "subject": "Email subject",
    "body": "Full email content"
  },
  "whatsapp": "WhatsApp friendly message with emojis"
}
Return ONLY valid JSON.`

    const result = await callGeminiAI(prompt)
    const json = parseAIJSON(result, {})
    return { success: true, result: json }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

