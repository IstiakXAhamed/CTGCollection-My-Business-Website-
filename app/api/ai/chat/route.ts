import { NextRequest, NextResponse } from 'next/server'
import { generateChatResponse } from '@/lib/gemini-ai'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    let { message, context } = await request.json()
    
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
    const orderMatch = message.match(/(?:order|track|tracking)\s*(?:#|no\.?|number)?\s*(\w+)/i)
    if (orderMatch && orderMatch[1]) {
       const orderId = orderMatch[1]
       try {
         // Try to find order by ID or OrderNumber
         // Assuming id is uuid, maybe user types short ID? 
         // For now, let's assume they might type the real ID or we simple search.
         // If schema uses UUID, partial search might fail. 
         // Let's check schema. User likely uses a short order number if you have one, or the full ID.
         // Prisam schema check needed. For now assume ID.
         const order = await prisma.order.findFirst({
           where: {
             OR: [
                { id: orderId },
                { orderNumber: orderId }
             ]
           },
           include: { items: true }
         })
         
         if (order) {
           context += `\n\nOrder Found: #${order.orderNumber}\nStatus: ${order.status}\nTotal: ৳${order.total}\nItems: ${order.items.length}\nDate: ${order.createdAt.toLocaleDateString()}`
         } else {
           // Provide context that order was not found so AI can apologize
           context += `\n\nSystem: Customer asked for Order #${orderId} but it was not found in database.`
         }
       } catch (e) {
         console.log("Order lookup error", e)
       }
    }
    
    const contextData = { 
       orderStatus: context, 
       previousMessages: [] // Simplify for now
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
