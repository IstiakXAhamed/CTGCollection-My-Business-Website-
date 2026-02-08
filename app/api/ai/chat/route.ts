import { NextRequest, NextResponse } from 'next/server'
import { generateChatResponse } from '@/lib/gemini-ai'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    let { message, context } = await request.json()
    
    // 1. Identify User
    const user = await verifyAuth(request)
    
    // Initialize context data object
    const contextData: any = { 
       orderStatus: context || '', 
       previousMessages: [],
       user: user ? { name: user.name, id: user.id } : null
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

    // A. Fetch Past Orders (For Re-Order Feature)
    if (user) {
      try {
        const pastOrders = await prisma.order.findMany({
          where: { userId: user.id },
          take: 3,
          orderBy: { createdAt: 'desc' },
          include: { items: { include: { product: { select: { name: true, slug: true } } } } }
        })
        if (pastOrders.length > 0) {
          contextData.pastOrders = pastOrders.map(o => 
            `Order #${o.orderNumber}: ${o.items.map(i => i.product.name).join(', ')} (Status: ${o.status})`
          ).join('\n')
        }
      } catch (e) { console.error("Past order fetch error", e) }
    }

    // B. Universal Product Search & Best Offers
    // Ignore short greetings to save DB calls
    const isGreeting = /^(hi|hello|hey|greetings|good morning|good evening)$/i.test(message.trim());
    const isOfferRequest = /(offer|sale|deal|discount|promo|code|coupon)/i.test(message);

    if (!isGreeting && message.length > 3) {
      try {
        let finalProducts: any[] = [];

        // 1. BEST OFFER SEARCH (Specific Logic)
        if (isOfferRequest) {
           const onSaleProducts = await prisma.product.findMany({
             where: { 
               isActive: true,
               salePrice: { not: null } // Only fetch items on sale
             },
             take: 20, 
             select: { 
                 name: true, basePrice: true, salePrice: true, slug: true,
                 variants: { select: { stock: true } }
             }
           });

           finalProducts = onSaleProducts
             .map((p: any) => {
               const discount = p.salePrice ? Math.round(((p.basePrice - p.salePrice) / p.basePrice) * 100) : 0;
               return { ...p, discount };
             })
             .filter((p: any) => p.discount >= 15)
             .sort((a: any, b: any) => b.discount - a.discount)
             .slice(0, 5);
        } 
        
        // 2. STANDARD KEYWORD SEARCH 
        if (finalProducts.length === 0) {
           const stopWords = ['the', 'is', 'a', 'an', 'and', 'or', 'do', 'you', 'have', 'i', 'need', 'want', 'looking', 'for', 'show', 'me', 'price', 'of', 'what', 'are', 'best', 'offer'];
           const keywords = message.split(' ').filter((w: string) => !stopWords.includes(w.toLowerCase()) && w.length > 2).slice(0, 3).join(' | ');

           if (keywords) {
             finalProducts = await prisma.product.findMany({
               where: {
                 OR: [
                   { name: { contains: message, mode: 'insensitive' } },
                   { description: { contains: keywords.split(' | ')[0], mode: 'insensitive' } },
                   { category: { name: { contains: keywords.split(' | ')[0], mode: 'insensitive' } } }
                 ],
                 isActive: true
               },
               take: 5,
               select: { 
                   name: true, basePrice: true, salePrice: true, slug: true,
                   variants: { select: { stock: true } }
               }
             });
           }
        }

        if (finalProducts.length > 0) {
           contextData.foundProducts = finalProducts.map((p: any) => {
             const totalStock = p.variants ? p.variants.reduce((sum: number, v: any) => sum + v.stock, 0) : 0;
             const discount = p.salePrice ? Math.round(((p.basePrice - p.salePrice) / p.basePrice) * 100) : 0;
             const priceDisplay = p.salePrice ? `৳${p.salePrice} (Was ৳${p.basePrice})` : `৳${p.basePrice}`;
             const offerBadge = discount > 0 ? `🔥 ${discount}% OFF!` : '';
             const stockUrgency = totalStock > 0 && totalStock < 5 ? ` [LOW STOCK: Only ${totalStock} left!]` : '';
             
             return `- ${p.name}: ${priceDisplay} ${offerBadge}${stockUrgency} [Stock: ${totalStock}] [Link: /product/${p.slug}]`
           }).join('\n');
        }
      } catch (e) {
        console.log("Product search error", e);
      }
    }

    // C. Fetch Categories
    try {
      const categories = await prisma.category.findMany({
        where: { isActive: true, parentId: null },
        select: { name: true, slug: true },
        take: 10
      });
      contextData.categories = categories.map((c: any) => `- ${c.name} (/shop?category=${c.slug})`).join('\n');
    } catch (e) {
      console.log("Category fetch error", e);
    }

    // D. Store Policies
    contextData.storePolicies = `
    - Shipping: Free shipping on orders over ৳2000. Nationwide delivery (2-3 days).
    - Returns: 7-day return policy for unused items.
    - Payment: Cash on Delivery (COD) and Online Payment (Bkash/Nagad/Card).
    `;

    // E. Active Coupons
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

    // 3. Order Tracking Intent
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

      // C. Check for [MISSING:term], [ACTION:HANDOFF], [URGENT_COMPLAINT]
      if (finalResponse.includes('[MISSING:')) {
         const mMatch = finalResponse.match(/\[MISSING:(.+?)\]/);
         if (mMatch) {
            const term = mMatch[1];
            finalResponse = finalResponse.replace(mMatch[0], '').trim();
            await notifyAdmin('stock_alert', 'Missing Product Request', `A customer asked for "${term}" but we don't have it in stock.`, `Missing Stock Request: ${term}`);
         }
      }

      if (finalResponse.includes('[ACTION:HANDOFF]')) {
         finalResponse = finalResponse.replace('[ACTION:HANDOFF]', '').trim();
         action = { type: 'open_live_chat', payload: { context: message } };
         await notifyAdmin('urgent', 'Human Handoff Requested', `A customer requested to talk to a human agent. Message: "${message}"`, `Handoff Request: ${user?.email || 'Guest'}`);
      }

      if (finalResponse.includes('[URGENT_COMPLAINT]')) {
         finalResponse = finalResponse.replace('[URGENT_COMPLAINT]', '').trim();
         await notifyAdmin('urgent', 'Urgent Complaint Logged', `A customer logged a complaint: "${message}"`, `[URGENT] Customer Complaint: ${user?.email || 'Guest'}`);
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

// Helper for Admin Notifications
async function notifyAdmin(type: string, title: string, message: string, subject: string) {
  try {
    const admin = await prisma.user.findFirst({ where: { role: 'admin' }, select: { id: true } });
    if (admin) {
      await prisma.notification.create({
        data: { userId: admin.id, type, title, message, link: '/admin/messages' }
      });
      await prisma.contactMessage.create({
        data: {
          name: 'AI Assistant Escalation',
          email: 'ai-bot@system.local',
          subject: subject,
          message: `Summary: ${message}\n\nTime: ${new Date().toLocaleString()}`,
          isRead: false
        }
      });
    }
  } catch (e) { console.error("Notify admin failed", e); }
}
