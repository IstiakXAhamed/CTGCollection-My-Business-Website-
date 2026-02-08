/**
 * Centralized Gemini AI Library
 * 
 * This library provides AI-powered features across the entire site.
 * All AI calls go through this library for consistency and control.
 */

const DEFAULT_STORE_NAME = 'Silk Mart'

const FALLBACK_MODELS = [
  // 1. Primary: Gemini 2.5 Flash (User's choice)
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash' },
  
  // 2. Flash Lite: Lighter, potentially separate quota
  { id: 'gemini-2.5-flash-lite', name: 'Gemini 2.5 Flash Lite' },
  
  // 3. Next Gen: Gemini 3 Flash
  { id: 'gemini-3-flash', name: 'Gemini 3 Flash' },
  
  // 4. Gemma 3 Models (Open Models hosted on API) - Assuming 'it' (instruction tuned) variants for chat
  { id: 'gemma-3-27b-it', name: 'Gemma 3 27B' },
  { id: 'gemma-3-12b-it', name: 'Gemma 3 12B' },
  { id: 'gemma-3-4b-it', name: 'Gemma 3 4B' },
  { id: 'gemma-3-1b-it', name: 'Gemma 3 1B' },
  { id: 'gemma-3-2b-it', name: 'Gemma 3 2B' },

  // 5. Reliable Fallbacks (Known stable models)
  { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash' },
  { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro' },
  { id: 'gemini-pro', name: 'Gemini Pro (Legacy)' }
]

export interface AIResponse {
  success: boolean
  result?: any
  error?: string
  fallback?: boolean
  modelUsed?: string
}

// ============ Core AI Function ============

export async function callGeminiAI(prompt: string, options?: {
  temperature?: number
  maxTokens?: number
}): Promise<string> {
  const apiKey = process.env.GOOGLE_AI_API_KEY ? process.env.GOOGLE_AI_API_KEY.trim() : null
  
  if (!apiKey) {
    console.error('❌ GOOGLE_AI_API_KEY is missing in environment variables!')
    throw new Error('GOOGLE_AI_API_KEY not configured')
  }

  let lastError: any = null

  // Loop through all models in priority order
  for (const model of FALLBACK_MODELS) {
    try {
      /* console.log(`[Gemini] Attempting with ${model.name}...`) */
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model.id}:generateContent`
      
      const response = await fetch(`${url}?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: options?.temperature ?? 0.7,
            maxOutputTokens: options?.maxTokens ?? 2048,
          }
        })
      })

      if (response.ok) {
        // Success! Return immediately
        const data = await response.json()
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
        if (!text) throw new Error('Empty response from AI')
        
        // Log successful fallback if not primary
        if (model.id !== FALLBACK_MODELS[0].id) {
          console.log(`✅ AI Success using fallback model: ${model.name}`)
        }
        return text
      }

      // Handle Errors
      const status = response.status
      const errorText = await response.text()
      
      // If 429 (Rate Limit), 503 (Overload), or 404/400 (Model issue), we continue to next model
      if (status === 429 || status === 503) {
        console.warn(`⚠️ ${model.name} hit rate limit/overload (${status}). Switching to next model...`)
      } else if (status === 404 || status === 400) {
        console.warn(`⚠️ ${model.name} not found/supported (${status}). Switching to next model...`)
      } else {
        console.error(`❌ ${model.name} failed with ${status}: ${errorText}`)
      }
      
      lastError = new Error(`[${model.name}] ${status} ${response.statusText}`)

    } catch (error: any) {
      // Network errors etc
      console.warn(`⚠️ Error calling ${model.name}: ${error.message}`)
      lastError = error
    }
  }

  // If we get here, ALL models failed
  console.error('❌ All AI models failed. Please check API Key or Quota.')
  throw lastError || new Error('All AI models failed')
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

export async function generateProductDescription(productName: string, category?: string, storeName: string = DEFAULT_STORE_NAME): Promise<AIResponse> {
  try {
    const prompt = `Write a compelling, detailed 5-7 sentence product description for "${productName}"${category ? ` in ${category}` : ''} for a premium Bangladeshi e-commerce store "${storeName}". 
    Highlight specific features, luxury appeal, and sensory details. Make it extremely professional and engaging. Return ONLY the description, no placeholders.`
    const result = await callGeminiAI(prompt)
    return { success: true, result: result.trim() }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

export async function analyzeProductForSuggestions(productName: string, storeName: string = DEFAULT_STORE_NAME): Promise<AIResponse> {
  try {
    const prompt = `Analyze this product: "${productName}" for a Bangladeshi E-commerce store "${storeName}".
    Return JSON with:
    {
      "productType": "Specific type (e.g., Running Shoe, Matte Lipstick)",
      "suggestedCategory": "Best matching category",
      "priceRange": { "min": number, "max": number } (Realistic price in BDT),
      "suggestedVariants": { "sizes": ["size1", "size2"], "colors": ["color1", "color2"] },
      "keywords": ["tag1", "tag2", "tag3", "tag4", "tag5"],
      "confidence": "high"
    }
    Return ONLY valid JSON.`
    
    // Using a more creative temperature for better analysis
    const result = await callGeminiAI(prompt, { temperature: 0.4 })
    const json = parseAIJSON(result, {})
    return { success: true, result: json }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

// ============ Customer Support AI ============


export async function generateChatResponse(
  message: string, 
  context?: { 
    orderStatus?: string, 
    previousMessages?: any[],
    foundProducts?: string, // New: Pre-fetched product data
    categories?: string,    // New: List of categories
    storePolicies?: string, // New: Shipping/Return info
    coupons?: string        // New: Active coupons
  },
  settings?: any
): Promise<AIResponse> {
  try {
    const shopName = settings?.storeName || settings?.siteName || DEFAULT_STORE_NAME
    
    let systemPrompt = `You are the elite, charming, and highly persuasive AI Sales Associate for ${shopName}. 
    Your goal is not just to answer, but to SELL and delight the customer. 
    
    PERSONALITY:
    - EXPERT & CONFIDENT: You know everything about the products.
    - CHARMING & MANIPULATIVE (In a good way): Use psychology to encourage buying. "This would look stunning on you," "It's selling out fast."
    - POLITE & EMPATHETIC: If a product is missing, apologize profusely but immediately pivot to a better alternative.
    - 🇧🇩 MULTILINGUAL: 
      - If user speaks Bangla or Banglish (e.g., "Ki obostha?"), REPLY IN BANGLA. 
      - If user speaks English, reply in English. 
      - You can mix both for a natural "Dhaka Cool" vibe if appropriate.

    CRITICAL INSTRUCTIONS:
    1. USE CONTEXT: Use the "Found Products" list to recommend specific items.
       - IF OFFERS FOUND: List them with bullet points. Bold the discount (e.g., "**25% OFF**").
       - ⚡ URGENCY: If a product has [LOW STOCK: X], say: "Hurry! Only X left in stock!" 
    
    2. 🎁 GIFT CONCIERGE:
       - If user asks for "Gift ideas", enter QUIZ MODE.
       - Ask: "Who is it for?" -> "Budget?" -> "Style?". Then suggest a bundle.

    3. 📦 RE-ORDER:
       - If context shows [PAST ORDERS], and user asks "Buy again", show the item and Ask to Confirm.

    4. 👨‍💻 HUMAN HANDOFF:
       - If user says "Talk to agent/human", Say: "Connecting you to a specialist..." AND end message with "[ACTION:HANDOFF]".

    5. 📝 COMPLAINT ESCALATION:
       - If user is ANGRY or has a COMPLAINT, Apologize sincerely and end message with "[URGENT_COMPLAINT]".

    6. VISUAL CARDS & TAGS:
       - "[SHOW:product-slug]" for specific products.
       - "[CATEGORY:category-slug]" for categories.
       - "[MISSING:search_term]" for missing items.
       - NO LEAKING TAGS: Do not show internal tags to user.

    STORE CONTEXT:
    ${context?.orderStatus ? `\n[ORDER INFO]\n${context.orderStatus}` : ''}
    ${(context as any)?.pastOrders ? `\n[PAST ORDERS]\n${(context as any).pastOrders}` : ''} 
    ${context?.foundProducts ? `\n[MATCHING PRODUCTS]\n${context.foundProducts}` : ''}
    ${context?.categories ? `\n[AVAILABLE CATEGORIES]\n${context.categories}` : ''}
    ${context?.coupons ? `\n[ACTIVE COUPONS]\n${context.coupons}` : ''}
    ${context?.storePolicies ? `\n[STORE POLICIES]\n${context.storePolicies}` : ''}
    
    Current User Message: "${message}"`

    // Use history for continuity if available
    let history: any[] = []
    if (context?.previousMessages && context.previousMessages.length > 0) {
       history = context?.previousMessages.map(msg => ({
         role: msg.sender === 'user' ? 'user' : 'model',
         parts: [{ text: msg.text }]
       }))
    }

    const result = await callGeminiAI(systemPrompt)
    return { success: true, result }

  } catch (error: any) {
    console.error('Chat Gen Error:', error)
    return { success: false, error: error.message }
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

export async function analyzeReview(reviewText: string, rating: number, storeName: string = DEFAULT_STORE_NAME): Promise<AIResponse> {
  try {
    console.log(`[Gemini] Analyzing Review for ${storeName}:`, reviewText.substring(0, 50) + '...')
    const prompt = `Analyze this customer review for "${storeName}":
Text: "${reviewText}"
Rating: ${rating}/5

Task: Provide a JSON analysis with:
1. sentiment: "positive", "negative", "neutral"
2. isSpam: boolean (random chars, ads, irrelevant)
3. isInappropriate: boolean (offensive, hate speech)
4. keyPoints: Array of strings (main topics mentioned)
5. suggestedResponse: A polite, professional reply (1-2 sentences)
6. qualityScore: 1-10 (usefulness of review)

Return ONLY valid JSON.`

    const result = await callGeminiAI(prompt, { temperature: 0.1, maxTokens: 1024 })
    // Ensure result isn't empty
    if (!result) throw new Error('Empty response from AI')
    
    const json = parseAIJSON(result, {
      sentiment: 'neutral',
      isSpam: false,
      isInappropriate: false,
      keyPoints: [],
      suggestedResponse: 'Thank you for your feedback.',
      qualityScore: 5
    })
    
    console.log('[Gemini] Analysis Result:', JSON.stringify(json))
    return { success: true, result: json }
  } catch (e: any) {
    console.error('[Gemini] Review Analysis Failed:', e)
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

export async function generateCouponIdeas(options: { occasion?: string, targetAudience?: string, discountType?: string, storeName?: string }): Promise<AIResponse> {
  try {
    const storeName = options.storeName || DEFAULT_STORE_NAME
    const prompt = `Generate 5 creative coupon/promo code ideas for "${storeName}" in Bangladesh.
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

export async function generateAnnouncement(topic: string, type: 'sale' | 'new_arrival' | 'event' | 'policy' | 'general', storeName: string = DEFAULT_STORE_NAME): Promise<AIResponse> {
  try {
    const prompt = `Write an engaging store announcement for ${storeName}:
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

export async function generateSEOContent(pageName: string, pageType: 'category' | 'product' | 'blog' | 'page', storeName: string = DEFAULT_STORE_NAME): Promise<AIResponse> {
  try {
    const prompt = `Generate SEO content for: "${pageName}" (${pageType} page)
Store: ${storeName} (Bangladesh e-commerce)

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

export async function generateOrderEmail(type: 'confirmation' | 'shipped' | 'delivered' | 'cancelled', orderDetails: { orderId: string, customerName: string, items: string[], total: number, storeName?: string }): Promise<AIResponse> {
  try {
    const storeName = orderDetails.storeName || DEFAULT_STORE_NAME
    const prompt = `Write an order ${type} email for ${storeName}:
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

export async function generateMarketingEmail(campaign: string, targetAudience: string, storeName: string = DEFAULT_STORE_NAME): Promise<AIResponse> {
  try {
    const prompt = `Write a marketing email for ${storeName}:
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
      price: `Suggest appropriate price range in BDT for: "${context}". 
      CRITICAL: The price must be realistic for the Bangladesh market. 
      The range width must NOT exceed 3000 BDT (e.g., 2000-5000 is ok, 1000-10000 is NOT).
      Return JSON: {"min": number, "max": number, "recommended": number}`
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
  options?: { category?: string, tone?: AITone, language?: AILanguage, storeName?: string }
): Promise<AIResponse> {
  try {
    const tone = options?.tone || 'professional'
    const lang = options?.language || 'en'
    const storeName = options?.storeName || DEFAULT_STORE_NAME
    const langName = lang === 'bn' ? 'Bengali (বাংলা)' : 'English'
    
    const toneGuides: Record<AITone, string> = {
      professional: 'Use professional, business-like language. Focus on features and quality.',
      luxury: 'Use premium, sophisticated language. Emphasize exclusivity and elegance.',
      friendly: 'Use warm, conversational tone. Make it feel personal and approachable.',
      urgent: 'Create urgency. Use phrases like "Limited stock", "Don\'t miss out".',
      casual: 'Use relaxed, everyday language. Keep it simple and relatable.'
    }
    
    const prompt = `Write a compelling, highly detailed 6-8 sentence product description for "${productName}"${options?.category ? ` in ${options.category}` : ''}.

TONE: ${toneGuides[tone]}
LANGUAGE: Write in ${langName}
STORE: ${storeName} (Premium Bangladesh Fashion & Lifestyle)

Requirements:
- Be highly specific, professional, and engaging
- Highlight premium features, materials, and benefits
- Use sensory language appropriate for the product type
- Do NOT use placeholders like [color] or [size]
- Make it flow naturally and persuasively
- Match the ${tone} tone perfectly`

    const result = await callGeminiAI(prompt)
    return { success: true, result: result.trim() }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

// 2. Magic Rewrite - Improve existing content
export async function rewriteContent(
  text: string, 
  options?: { tone?: AITone, language?: AILanguage, action?: 'improve' | 'shorten' | 'expand' | 'fix_grammar', storeName?: string }
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
  options?: { language?: AILanguage, tone?: AITone, includeEmoji?: boolean, storeName?: string }
): Promise<AIResponse> {
  try {
    const lang = options?.language || 'en'
    const tone = options?.tone || 'professional'
    const langName = lang === 'bn' ? 'Bengali (Standard & Elegant)' : 'English'
    const emoji = options?.includeEmoji !== false ? 'Include relevant, eye-catching emojis.' : 'No emojis.'
    
    const typeConfigs: Record<string, { format: string, length: string }> = {
      facebook_post: { format: 'Facebook post with attention-grabbing hook, engaging body, benefits list, and strong CTA', length: 'Short-Medium (150-250 words)' },
      instagram_caption: { format: 'Instagram caption with hook, emotional storytelling, value proposition', length: 'Medium (100-150 words) + 15 relevant hashtags' },
      email_campaign: { format: 'High-conversion Email with catchy subject, preview text, personal opening, persuasive body, and clear CTA', length: 'Long (300-400 words)' },
      ad_copy: { format: 'PPC/Social Ad: Headline (Punchy), Description (Benefit-driven)', length: 'Headline 15 words max, description 50 words max' },
      sms: { format: 'Urgent and clear SMS promotional text', length: 'Max 160 characters' }
    }
    
    const config = typeConfigs[type]
    
    const storeName = options?.storeName || DEFAULT_STORE_NAME
    
    const prompt = `Act as an expert Digital Marketer and Copywriter for "${storeName}", a premium fashion and lifestyle brand in Bangladesh.
    
    Task: Create high-quality, engaging ${type.replace(/_/g, ' ')} content.
    Topic/Product: ${productOrCampaign}
    
    Target Audience: Fashion-conscious Bangladeshi customers.
    Tone: ${tone} (Make it sound authentic and human, not robotic).
    Language: ${langName}
    
    Format Requirements:
    ${config.format}
    Target Length: ${config.length}
    ${emoji}
    
    CRITICAL LANGUAGE INSTRUCTION:
    If Language is Bengali, the ENTIRE output MUST be in proper Bengali script (Bangla). Use a natural, flowing style suitable for the Bangladeshi audience.
    
    Return JSON with fields:
    {
      "subject": "Email subject or Post title",
      "headline": "Ad headline or Main hook",
      "body": "The main content body (formatted with newlines)",
      "hashtags": ["tag1", "tag2"...],
      "cta": "Call to Action"
    }
    
    Return ONLY valid JSON.`

    const result = await callGeminiAI(prompt, { maxTokens: 4096, temperature: 0.7 })
    const json = parseAIJSON(result, {})
    return { success: true, result: json }
  } catch (e: any) {
    console.error('Marketing AI Error:', e)
    const storeName = options?.storeName || DEFAULT_STORE_NAME
    // Fallback content to prevent "undefined" in UI
    const fallbackContent = {
      subject: `Special Offer: ${productOrCampaign}`,
      headline: productOrCampaign,
      preheader: 'Don\'t miss out on our latest updates!',
      body: `Check out ${productOrCampaign} at ${storeName}. We have amazing deals tailored just for you. Visit our store today to explore the collection.`,
      text: `Check out ${productOrCampaign} at ${storeName}! Shop now.`,
      cta: 'Shop Now',
      hashtags: [`#${storeName.replace(/\s+/g, '')}`, '#Fashion']
    }
    return { success: true, result: fallbackContent, error: e.message }
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
  salesLast7Days: number,
  storeName?: string
}): Promise<AIResponse> {
  try {
    const storeName = productData.storeName || DEFAULT_STORE_NAME
    const prompt = `Predict inventory needs for this product for "${storeName}":

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
  itemCount: number,
  storeName?: string
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
  options?: { language?: AILanguage, count?: number, storeName?: string }
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
  options?: { platform?: 'instagram' | 'facebook' | 'tiktok', count?: number, storeName?: string }
): Promise<AIResponse> {
  try {
    const platform = options?.platform || 'instagram'
    const count = options?.count || 15
    const storeName = options?.storeName || DEFAULT_STORE_NAME
    
    const prompt = `Generate ${count} trending hashtags for ${platform}:
  
Product: ${productName}
Category: ${category}
Store: ${storeName} (Bangladesh)

Return JSON: {
  "primary": ["#topHashtag1", "#topHashtag2", "#topHashtag3"],
  "secondary": ["other", "relevant", "hashtags"],
  "trending": ["currently", "trending", "ones"],
  "branded": ["#${storeName.replace(/\s+/g, '')}", "#ShopBangladesh"]
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
  orderDetails: { orderId: string, customerName: string, items: string[], estimatedDelivery?: string, storeName?: string },
  language: AILanguage = 'en'
): Promise<AIResponse> {
  try {
    const langName = language === 'bn' ? 'Bengali (বাংলা)' : 'English'
    const storeName = orderDetails.storeName || DEFAULT_STORE_NAME
    
    const prompt = `Write an order ${type.replace(/_/g, ' ')} message:

Order ID: ${orderDetails.orderId}
Customer: ${orderDetails.customerName}
Items: ${orderDetails.items.join(', ')}
${orderDetails.estimatedDelivery ? `Expected Delivery: ${orderDetails.estimatedDelivery}` : ''}

Language: ${langName}
Store: ${storeName}

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

