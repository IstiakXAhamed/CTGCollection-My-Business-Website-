import { NextRequest, NextResponse } from 'next/server'
import { generateChatResponse } from '@/lib/gemini-ai'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    let { message, context } = await request.json()
    
    // Initialize context data object
    const contextData: any = { 
       orderStatus: context || '', 
       previousMessages: [] 
    }
    
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }


    // Fetch site settings for contact info
    let settings = null
    try {
      const settingsRes = await fetch(`${request.nextUrl.origin}/api/settings`)
      if (settingsRes.ok) {
        const data = await settingsRes.json()
        settings = data.settings
      }
    } catch (e) {
      console.log('Failed to fetch settings for AI chat', e)
    }
    
    // 2. Product Search Intent
    const searchMatch = message.match(/(search|find|looking for|buy|price of|show me) (.+)/i) // Simple regex for demo
    if (searchMatch && searchMatch[2]) {
      const query = searchMatch[2].trim()
      // Exclude simple greetings or short words
      if (query.length > 2 && !['products', 'items', 'stuff'].includes(query.toLowerCase())) {
        try {
           const products = await prisma.product.findMany({
             where: {
               OR: [
                 { name: { contains: query } }, // Case insensitive usually supported by DB collation or use mode: 'insensitive' if postgres
                 { description: { contains: query } },
                 { category: { name: { contains: query } } }
               ],
                isActive: true
              },
              take: 4,
              select: { name: true, basePrice: true, salePrice: true, slug: true }
           })
           
           if (products.length > 0) {
             const productList = products.map((p: any) => `- ${p.name} (৳${p.salePrice || p.basePrice})`).join('\n')
             context += `\n\nFound Products matching "${query}":\n${productList}\n(Use these to recommend specific items to the user)`
           } else {
             context += `\n\nSystem: No products found for "${query}". Suggest browsing categories.`
           }
        } catch (e) {
          console.log("Product search error", e)
        }
      }
    }

    // 3. Order Tracking Intent
    // Matches "Order #12345" or "Track 12345"
    const orderMatch = message.match(/(?:order|track|tracking)\s*(?:#|no\.?|number)?\s*([a-zA-Z0-9-]+)/i)
    if (orderMatch && orderMatch[1]) {
       const orderId = orderMatch[1]
       try {
         // Check if it looks like a short order number or a UUID
         const whereClause = orderId.length > 20 ? { id: orderId } : { orderNumber: orderId }
         
         const order = await prisma.order.findFirst({
           where: whereClause,
           include: { items: true }
         })
         
         if (order) {
           contextData.orderStatus = `\n\nOrder Found: #${order.orderNumber}\nStatus: ${order.status}\nTotal: ৳${order.total}\nItems: ${order.items.length}\nDate: ${order.createdAt.toLocaleDateString()}`
         } else {
           // Provide context that order was not found so AI can apologize
           contextData.orderStatus = `\n\nSystem: Customer asked for Order #${orderId} but it was not found in database.`
         }
       } catch (e) {
         console.log("Order lookup error", e)
       }
    }
    


    const aiResponse = await generateChatResponse(message, contextData, settings)

    if (aiResponse.success) {
      return NextResponse.json({ response: aiResponse.result })
    } else {
      return NextResponse.json({ error: aiResponse.error || 'Failed to generate response' }, { status: 500 })
    }
  } catch (error) {
    console.error('Chat API Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
