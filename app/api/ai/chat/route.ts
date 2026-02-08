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
    
    // ==========================================
    // 2. ENHANCED CONTEXT GATHERING
    // ==========================================

    // A. Universal Product Search (Run on almost every message)
    // Ignore short greetings to save DB calls
    const isGreeting = /^(hi|hello|hey|greetings|good morning|good evening)$/i.test(message.trim());
    
    if (!isGreeting && message.length > 3) {
      try {
        // Extract potential keywords (simple approach: remove common stopwords)
        const stopWords = ['the', 'is', 'a', 'an', 'and', 'or', 'do', 'you', 'have', 'i', 'need', 'want', 'looking', 'for', 'show', 'me', 'price', 'of', 'what', 'are'];
        const keywords = message.split(' ').filter((w: string) => !stopWords.includes(w.toLowerCase()) && w.length > 2).slice(0, 3).join(' | ');

        if (keywords) {
          // const products = await prisma.product.findMany({ // TS Error workarounds
          const products: any[] = await prisma.product.findMany({
            where: {
              OR: [
                { name: { contains: message, mode: 'insensitive' } },
                // { name: { search: keywords } }, // Removed search to fix TS error
                { description: { contains: keywords.split(' | ')[0], mode: 'insensitive' } },
                { category: { name: { contains: keywords.split(' | ')[0], mode: 'insensitive' } } }
              ],
              isActive: true
            },
            take: 5,
            select: { 
                name: true, 
                basePrice: true, 
                salePrice: true, 
                slug: true, 
                variants: { select: { stock: true } } // Fetch variants to sum stock
            }
          });

          // If standard search fails, try a broader search on the first keyword
          let finalProducts = products;
          if (finalProducts.length === 0) {
             // const broadSearch = await prisma.product.findMany({
             const broadSearch: any[] = await prisma.product.findMany({
                where: {
                   name: { contains: keywords.split(' | ')[0], mode: 'insensitive' },
                   isActive: true
                },
                take: 3,
                select: { 
                    name: true, 
                    basePrice: true, 
                    salePrice: true, 
                    slug: true,
                    variants: { select: { stock: true } }
                }
             })
             finalProducts = broadSearch;
          }

          if (finalProducts.length > 0) {
            contextData.foundProducts = finalProducts.map((p: any) => {
              const totalStock = p.variants.reduce((sum: number, v: any) => sum + v.stock, 0);
              return `- ${p.name}: ৳${p.salePrice || p.basePrice} ${p.salePrice ? '(On Sale!)' : ''} [Stock: ${totalStock}] [Link: /product/${p.slug}]`
            }).join('\n');
          }
        }
      } catch (e) {
        console.log("Product search error", e);
      }
    }

    // B. Fetch Categories (Always helpful context)
    try {
      const categories = await prisma.category.findMany({
        where: { isActive: true, parentId: null }, // Parent categories only to save tokens
        select: { name: true, slug: true },
        take: 10
      });
      contextData.categories = categories.map((c: any) => `- ${c.name} (/category/${c.slug})`).join('\n');
    } catch (e) {
      console.log("Category fetch error", e);
    }

    // C. Store Policies (Hardcoded or fetched)
    contextData.storePolicies = `
    - Shipping: Free shipping on orders over ৳2000. Nationwide delivery (2-3 days).
    - Returns: 7-day return policy for unused items.
    - Payment: Cash on Delivery (COD) and Online Payment (Bkash/Nagad/Card).
    `;

    // D. Active Coupons
    try {
      const coupons = await prisma.coupon.findMany({
        where: { isActive: true, validUntil: { gt: new Date() } },
        select: { code: true, description: true, discountType: true, discountValue: true },
        take: 3
      });
      if (coupons.length > 0) {
        contextData.coupons = coupons.map((c: any) => 
          `- Code: ${c.code} (${c.discountType === 'percentage' ? c.discountValue + '%' : '৳' + c.discountValue} OFF) - ${c.description || 'Limited time!'}`
        ).join('\n');
      }
    } catch (e) {
        console.log("Coupon fetch error", e);
    }

    // 3. Order Tracking Intent (Existing logic optimized)
    const orderMatch = message.match(/(?:order|track|tracking)\s*(?:#|no\.?|number)?\s*([a-zA-Z0-9-]+)/i);
    if (orderMatch && orderMatch[1]) {
       const orderId = orderMatch[1];
       try {
         const whereClause = orderId.length > 20 ? { id: orderId } : { orderNumber: orderId };
         const order = await prisma.order.findFirst({
           where: whereClause,
           include: { items: { include: { product: true } } }
         });
         
         if (order) {
           const itemsList = order.items.map((i: any) => `${i.product.name} (x${i.quantity})`).join(', ');
           contextData.orderStatus = `Order #${order.orderNumber} is ${order.status.toUpperCase()}.\nTotal: ৳${order.total}\nItems: ${itemsList}\nPlaced on: ${order.createdAt.toLocaleDateString()}`;
         } else {
           contextData.orderStatus = `Customer asked for Order #${orderId} but it was NOT found. Ask them to double-check the number.`;
         }
       } catch (e) {
         console.log("Order lookup error", e);
       }
    }
    


    const aiResponse = await generateChatResponse(message, contextData, settings)

    if (aiResponse.success) {
      // 4. Action Parsing Logic
      let finalResponse = aiResponse.result;
      let action = null;

      // A. Check for [SHOW:slug] (Product Card)
      const showMatch = finalResponse.match(/\[SHOW:(.+?)\]/);
      if (showMatch && showMatch[1]) {
        const slug = showMatch[1];
        finalResponse = finalResponse.replace(showMatch[0], '').trim();
        try {
          const product = await prisma.product.findUnique({
            where: { slug },
            select: {
              id: true, name: true, slug: true, basePrice: true, salePrice: true, images: true,
              category: { select: { name: true } },
              variants: { select: { id: true, size: true, color: true, stock: true } }
            }
          });
          if (product) action = { type: 'show_product', payload: product };
        } catch (e) { console.error("Product fetch error:", e); }
      }

      // B. Check for [CATEGORY:slug] (Category Card)
      const catMatch = finalResponse.match(/\[CATEGORY:(.+?)\]/);
      if (catMatch && catMatch[1]) {
        const slug = catMatch[1];
        finalResponse = finalResponse.replace(catMatch[0], '').trim();
        try {
          const category = await prisma.category.findUnique({
             where: { slug },
             select: { name: true, slug: true, image: true, description: true }
          });
          if (category) action = { type: 'show_category', payload: category };
        } catch (e) { console.error("Category fetch error:", e); }
      }

      // C. Check for [MISSING:term] (Admin Notification)
      const missingMatch = finalResponse.match(/\[MISSING:(.+?)\]/);
      if (missingMatch && missingMatch[1]) {
        const term = missingMatch[1];
        finalResponse = finalResponse.replace(missingMatch[0], '').trim();
        
        try {
          // 1. Find an Admin to notify (First available admin)
          const admin = await prisma.user.findFirst({
            where: { role: 'admin' },
            select: { id: true }
          });

          if (admin) {
            // 2. Create Notification
            await prisma.notification.create({
              data: {
                userId: admin.id,
                type: 'stock_alert',
                title: 'Missing Product Request',
                message: `A customer asked for "${term}" but we don't have it in stock.`,
                link: '/admin/messages' // Redirect to messages
              }
            });

            // 3. Create Contact Message (for detailed record)
            await prisma.contactMessage.create({
              data: {
                name: 'AI Shopping Assistant',
                email: 'ai-bot@system.local',
                subject: `Missing Stock Request: ${term}`,
                message: `Detailed Report:\n\nCustomer asked for: "${term}"\n\nContext: Item not found in current inventory.\nAction Required: Check supplier availability or update inventory if available.\n\nTimestamp: ${new Date().toLocaleString()}`,
                isRead: false
              }
            });

            console.log(`✅ Admin Notified & Message Created: Customer asked for "${term}"`);
          } else {
            console.warn("⚠️ No Admin found to notify about missing item.");
          }
        } catch (e) {
          console.error("Failed to create admin notification:", e);
        }
      }

      return NextResponse.json({ 
        response: finalResponse,
        action: action 
      })
    } else {
      return NextResponse.json({ error: aiResponse.error || 'Failed to generate response' }, { status: 500 })
    }
  } catch (error) {
    console.error('Chat API Fatal Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
