/**
 * Centralized Gemini AI Library
 * 
 * This library provides AI-powered features across the entire site.
 * All AI calls go through this library for consistency and control.
 */

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.0-pro:generateContent'

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
    const json = JSON.parse(result.match(/\{[\s\S]*\}/)?.[0] || '{}')
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
    const replies = JSON.parse(result.match(/\[[\s\S]*\]/)?.[0] || '[]')
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
    const json = JSON.parse(result.match(/\{[\s\S]*\}/)?.[0] || '{}')
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
    const coupons = JSON.parse(result.match(/\[[\s\S]*\]/)?.[0] || '[]')
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
    const json = JSON.parse(result.match(/\{[\s\S]*\}/)?.[0] || '{}')
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
    const json = JSON.parse(result.match(/\{[\s\S]*\}/)?.[0] || '{}')
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
    const json = JSON.parse(result.match(/\{[\s\S]*\}/)?.[0] || '{}')
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
    const json = JSON.parse(result.match(/\{[\s\S]*\}/)?.[0] || '{}')
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
    const json = JSON.parse(result.match(/\{[\s\S]*\}/)?.[0] || '{}')
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
      ? JSON.parse(result.match(/\{[\s\S]*\}/)?.[0] || '{}')
      : JSON.parse(result.match(/\[[\s\S]*\]/)?.[0] || '[]')
    return { success: true, result: parsed }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}
