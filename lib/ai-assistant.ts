// AI Assistant for E-commerce
// Uses Gemini API for intelligent features

const GEMINI_API_KEY = process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY

interface ProductData {
  name: string
  category: string
  features?: string[]
  price?: number
}

// Generate product description using AI
export async function generateProductDescription(product: ProductData): Promise<string> {
  if (!GEMINI_API_KEY) {
    // Fallback to template-based description if no API key
    return generateTemplateDescription(product)
  }

  try {
    const prompt = `Write a compelling, SEO-friendly product description for an e-commerce website in Bangladesh.

Product: ${product.name}
Category: ${product.category}
${product.features ? `Features: ${product.features.join(', ')}` : ''}
${product.price ? `Price: ৳${product.price}` : ''}

Requirements:
- 2-3 paragraphs
- Highlight key benefits
- Include emotional appeal
- Professional tone
- Suitable for Bangladesh market

Write only the description, no headers.`

    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 500
        }
      })
    })

    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text

    if (text) {
      return text.trim()
    }

    return generateTemplateDescription(product)
  } catch (error) {
    console.error('AI description error:', error)
    return generateTemplateDescription(product)
  }
}

// Generate SEO meta tags
export async function generateSEOTags(product: ProductData): Promise<{
  metaTitle: string
  metaDescription: string
  keywords: string[]
}> {
  if (!GEMINI_API_KEY) {
    return {
      metaTitle: `${product.name} - Buy Online | CTG Collection`,
      metaDescription: `Shop ${product.name} from ${product.category} at best prices. Quality products with fast delivery in Bangladesh.`,
      keywords: [product.name, product.category, 'buy online', 'bangladesh', 'ctg collection']
    }
  }

  try {
    const prompt = `Generate SEO metadata for this product:
Product: ${product.name}
Category: ${product.category}

Return JSON with these exact fields:
{
  "metaTitle": "60 chars max, include product name",
  "metaDescription": "160 chars max, compelling and include call-to-action",
  "keywords": ["array", "of", "5-8", "keywords"]
}`

    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.3 }
      })
    })

    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text

    if (text) {
      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
    }
  } catch (error) {
    console.error('AI SEO error:', error)
  }

  return {
    metaTitle: `${product.name} - Buy Online | CTG Collection`,
    metaDescription: `Shop ${product.name} from ${product.category} at best prices.`,
    keywords: [product.name.toLowerCase(), product.category.toLowerCase()]
  }
}

// AI Chat Assistant for customers
export async function aiChatResponse(
  message: string, 
  context?: { 
    products?: any[]
    orderHistory?: any[]
    currentPage?: string
  }
): Promise<string> {
  if (!GEMINI_API_KEY) {
    return getDefaultChatResponse(message)
  }

  try {
    let contextInfo = ''
    if (context?.products?.length) {
      contextInfo += `\nAvailable products: ${context.products.map(p => p.name).join(', ')}`
    }
    if (context?.currentPage) {
      contextInfo += `\nCustomer is on: ${context.currentPage}`
    }

    const prompt = `You are a helpful customer support AI for CTG Collection, a premium e-commerce store in Bangladesh.

Customer message: "${message}"
${contextInfo}

Provide a helpful, friendly response. If asking about:
- Products: Suggest relevant items
- Orders: Guide them to order tracking
- Returns: Explain the return policy
- Payment: Mention bKash, Nagad, SSLCommerz, and COD options

Keep response under 100 words. Be conversational.`

    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.8, maxOutputTokens: 200 }
      })
    })

    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text

    if (text) {
      return text.trim()
    }

    return getDefaultChatResponse(message)
  } catch (error) {
    console.error('AI chat error:', error)
    return getDefaultChatResponse(message)
  }
}

// Smart product search with synonyms
export async function smartSearch(query: string): Promise<string[]> {
  if (!GEMINI_API_KEY) {
    return [query]
  }

  try {
    const prompt = `Given this search query: "${query}"
Generate related search terms that might help find products. Include:
- Synonyms
- Related categories
- Common variations

Return as JSON array of strings. Max 5 terms.`

    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.3 }
      })
    })

    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text

    if (text) {
      const match = text.match(/\[[\s\S]*\]/)
      if (match) {
        return JSON.parse(match[0])
      }
    }

    return [query]
  } catch (error) {
    console.error('Smart search error:', error)
    return [query]
  }
}

// Template-based description fallback
function generateTemplateDescription(product: ProductData): string {
  const templates = [
    `Introducing the ${product.name} - a premium quality product from our ${product.category} collection. Designed with attention to detail and crafted for excellence, this item is perfect for those who appreciate quality and style.\n\nExperience the difference with CTG Collection. Order now and enjoy fast delivery across Bangladesh!`,
    `Discover the ${product.name}, your new favorite from our ${product.category} range. Built to last and designed to impress, this product combines functionality with aesthetics.\n\nAt CTG Collection, we believe in providing only the best. Shop with confidence and enjoy our hassle-free return policy.`,
    `The ${product.name} is here to elevate your ${product.category.toLowerCase()} experience. Whether you're looking for quality, style, or value, this product delivers on all fronts.\n\nJoin thousands of satisfied customers. Order from CTG Collection today!`
  ]

  return templates[Math.floor(Math.random() * templates.length)]
}

// Default chat responses
function getDefaultChatResponse(message: string): string {
  const lowerMsg = message.toLowerCase()

  if (lowerMsg.includes('price') || lowerMsg.includes('cost')) {
    return "Our prices are displayed on each product page. We offer competitive prices with free shipping on orders over ৳2000! 🛍️"
  }
  if (lowerMsg.includes('delivery') || lowerMsg.includes('shipping')) {
    return "We deliver across Bangladesh! Inside Chittagong: ৳80, Outside Chittagong: ৳130. Delivery takes 2-5 business days. 🚚"
  }
  if (lowerMsg.includes('return') || lowerMsg.includes('refund')) {
    return "We have a 7-day return policy for most items. Products must be unused and in original packaging. Contact us to initiate a return! 📦"
  }
  if (lowerMsg.includes('payment') || lowerMsg.includes('pay')) {
    return "We accept bKash, Nagad, SSLCommerz (cards), and Cash on Delivery (COD). Choose what's convenient for you! 💳"
  }
  if (lowerMsg.includes('order') || lowerMsg.includes('track')) {
    return "You can track your order in your dashboard under 'My Orders'. You'll also receive email updates at each stage! 📬"
  }

  return "Thank you for reaching out! Our team is here to help. Could you please provide more details about what you need? 😊"
}
