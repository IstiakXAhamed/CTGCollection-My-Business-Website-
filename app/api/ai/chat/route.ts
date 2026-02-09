import { NextRequest, NextResponse } from 'next/server'
import { generateChatResponse } from '@/lib/gemini-ai'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'
import { getSiteSettings } from '@/lib/settings'

// IN-MEMORY CACHE (V5 optimization)
const CHAT_CONTEXT_CACHE = new Map<string, { data: any; expires: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

async function getCachedContext() {
  const now = Date.now()
  const cached = CHAT_CONTEXT_CACHE.get('global_context')
  if (cached && now < cached.expires) return cached.data
  return null
}

function setCachedContext(data: any) {
  CHAT_CONTEXT_CACHE.set('global_context', {
    data,
    expires: Date.now() + CACHE_TTL
  })
}

export async function POST(request: NextRequest) {
  try {
    let { message, context, cartItems } = await request.json()
    
    // 1. Identify User
    const user = await verifyAuth(request)
    
    // Initialize context data object
    const contextData: any = { 
       orderStatus: context || '', 
       previousMessages: [],
       user: user ? { name: user.name, id: user.id, email: user.email } : null,
       cart: cartItems || []
    }
    
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // ==========================================
    // 2. ENHANCED CONTEXT GATHERING (V5 - Parallelized)
    // ==========================================
 
    // Check Cache First
    const cachedGlobal = await getCachedContext()
    
    // Define parallel tasks
    const tasks: any[] = []
    
    // A. Settings (Direct DB call - WAY FASTER and saves a process)
    const fetchSettings = async () => {
      return await getSiteSettings()
    }
    
    // B. Trending / Categories (Cached)
    const fetchGlobalContext = async () => {
      if (cachedGlobal) return cachedGlobal
      
      try {
        const [trendingProducts, categories] = await Promise.all([
          prisma.product.findMany({
            where: { isActive: true, isFeatured: true },
            take: 5,
            select: { name: true, slug: true, basePrice: true, salePrice: true }
          }),
          prisma.category.findMany({
            where: { isActive: true, parentId: null },
            select: { name: true, slug: true },
            take: 12
          })
        ])
        
        const data = {
          trending: trendingProducts.map(p => `- ${p.name} [SHOW:${p.slug}]`).join('\n'),
          categories: categories.map((c: any) => `- ${c.name} [CATEGORY:${c.slug}]`).join('\n')
        }
        setCachedContext(data)
        return data
      } catch (e) {
        console.error("Global context fetch error", e)
        return { trending: '', categories: '' }
      }
    }
 
    // Execute Parallel Context Fetching
    const [fetchedSettings, globalData, pastOrders] = await Promise.all([
      fetchSettings(),
      fetchGlobalContext(),
      user ? prisma.order.findMany({
        where: { userId: user.id },
        take: 3,
        orderBy: { createdAt: 'desc' },
        include: { items: { include: { product: { select: { name: true, slug: true } } } } }
      }) : Promise.resolve([])
    ])
 
    // Assign gathered data
    let settings = fetchedSettings
    contextData.trending = globalData.trending
    contextData.categories = globalData.categories
    
    if (user && pastOrders.length > 0) {
      contextData.pastOrders = (pastOrders as any[]).map(o => 
        `Order #${o.orderNumber} (Status: ${o.status}): ${o.items.map((i: any) => i.product.name).join(', ')}`
      ).join('\n')
    }

    // C. Universal Product Search & Best Offers
    // Ignore pure short greetings to save DB calls, but search if message is long or contains keywords
    const isPureGreeting = /^(hi|hello|hey|greetings|good morning|good evening|yo|hola|assalamu alaikum)$/i.test(message.trim());
    const isOfferRequest = /(offer|sale|deal|discount|promo|code|coupon)/i.test(message);

    if (!isPureGreeting || message.length > 10) {
      try {
        let finalProducts: any[] = [];

        // 1. BEST OFFER SEARCH (Specific Logic)
        if (isOfferRequest) {
           const onSaleProducts = await prisma.product.findMany({
             where: { 
               isActive: true,
               salePrice: { not: null } // Only fetch items on sale
             },
             take: 10, 
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
             .filter((p: any) => p.discount >= 10)
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
               take: 8,
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
             
             return `- ${p.name}: ${priceDisplay} ${discount > 0 ? `🔥 ${discount}% OFF!` : ''} [SHOW:${p.slug}]`
           }).join('\n');
        }
      } catch (e) {
        console.log("Product search error", e);
      }
    }


    // E. Store Policies
    contextData.storePolicies = `
    - Shipping: Free shipping on orders over ৳2000. Nationwide delivery (2-3 days).
    - Returns: 7-day return policy for unused items.
    - Payment: Cash on Delivery (COD) and Online Payment (Bkash/Nagad/Card).
    `;

    // 3. Order Tracking Intent (Enhanced for V5)
    const orderMatch = message.match(/(?:order|track|tracking)\s*(?:#|no\.?|number)?\s*([a-zA-Z0-9-]+)/i);
    if (orderMatch && orderMatch[1]) {
       const orderId = orderMatch[1];
       try {
         const whereClause = orderId.length > 20 ? { id: orderId } : { orderNumber: orderId };
         const order = await prisma.order.findFirst({
           where: whereClause,
           include: { items: { include: { product: { select: { name: true, slug: true } } } } }
         });
         
         if (order) {
           const itemsList = order.items.map((i: any) => `${i.product.name} (x${i.quantity})`).join(', ');
           const progress = order.status === 'delivered' ? 100 : order.status === 'shipping' ? 75 : order.status === 'processing' ? 40 : 15;
           contextData.orderStatus = `Order #${order.orderNumber} is ${order.status.toUpperCase()}.\nTotal: ৳${order.total}\nItems: ${itemsList}\nPlaced on: ${order.createdAt.toLocaleDateString()}\n[ORDER_PROGRESS:${order.orderNumber}:${order.status}:${progress}]`;
         } else {
           contextData.orderStatus = `Customer asked for Order #${orderId} but it was NOT found.`;
         }
       } catch (e) { console.log("Order lookup error", e); }
    }
    
    const aiResponse = await generateChatResponse(message, contextData, settings)

    if (aiResponse.success) {
      // 4. MULTI-ACTION PARSING LOGIC (V5)
      let finalResponse = aiResponse.result;
      const actions: any[] = [];

      // A. [SHOW:slug] (Multi-Product)
      const showMatches = [...finalResponse.matchAll(/\[SHOW:(.+?)\]/g)];
      for (const match of showMatches) {
        const slug = match[1];
        finalResponse = finalResponse.replace(match[0], '').trim();
        try {
          const product = await prisma.product.findUnique({
            where: { slug },
            select: { id: true, name: true, slug: true, basePrice: true, salePrice: true, images: true }
          });
          if (product) actions.push({ type: 'show_product', payload: product });
        } catch (e) { console.error("Product action fetch error:", e); }
      }

      // B. [CATEGORY:slug] (Multi-Category)
      const catMatches = [...finalResponse.matchAll(/\[CATEGORY:(.+?)\]/g)];
      for (const match of catMatches) {
        const slug = match[1];
        finalResponse = finalResponse.replace(match[0], '').trim();
        try {
          const category = await prisma.category.findUnique({
             where: { slug },
             select: { name: true, slug: true, image: true }
          });
          if (category) actions.push({ type: 'show_category', payload: category });
        } catch (e) { console.error("Category action fetch error:", e); }
      }

      // C. [COMPARE:slug1,slug2] (Compare)
      const compareMatch = finalResponse.match(/\[COMPARE:(.+?),(.+?)\]/);
      if (compareMatch) {
         finalResponse = finalResponse.replace(compareMatch[0], '').trim();
         const slugs = [compareMatch[1], compareMatch[2]];
         try {
           const products = await prisma.product.findMany({
             where: { slug: { in: slugs } },
             select: { name: true, slug: true, basePrice: true, salePrice: true, images: true }
           });
           actions.push({ type: 'compare_products', payload: products.map(p => ({ 
             name: p.name, 
             slug: p.slug, 
             image: typeof p.images === 'string' ? JSON.parse(p.images)[0] : (p.images as any)[0] 
           })) });
         } catch (e) { console.error("Compare fetch error:", e); }
      }

      // D. [ORDER_PROGRESS:number:status:progress]
      const progressMatch = finalResponse.match(/\[ORDER_PROGRESS:(.+?):(.+?):(.+?)\]/);
      if (progressMatch) {
         finalResponse = finalResponse.replace(progressMatch[0], '').trim();
         actions.push({ 
           type: 'order_progress', 
           payload: { number: progressMatch[1], status: progressMatch[2], progress: parseInt(progressMatch[3]) } 
         });
      }

      // E. [MISSING:...], [ACTION:HANDOFF], [URGENT_COMPLAINT]
      if (finalResponse.includes('[MISSING:')) {
         const mMatch = finalResponse.match(/\[MISSING:(.+?)\]/);
         if (mMatch) {
            const term = mMatch[1];
            finalResponse = finalResponse.replace(mMatch[0], '').trim();
            await notifyAdmin('stock_alert', 'Missing Product Request', `Looking for: "${term}"\nMessage: "${message}"`, `Missing Stock Request: ${term}`, user);
         }
      }

      if (finalResponse.includes('[ACTION:HANDOFF]')) {
         finalResponse = finalResponse.replace('[ACTION:HANDOFF]', '').trim();
         actions.push({ type: 'open_live_chat', payload: { context: message } });
         await notifyAdmin('customer_support', 'Human Agent Requested', `User "${user?.name || 'Guest'}" is requesting a human agent.\nMessage: "${message}"`, 'Human Agent Handoff Request', user);
      }

      if (finalResponse.includes('[URGENT_COMPLAINT]')) {
         finalResponse = finalResponse.replace('[URGENT_COMPLAINT]', '').trim();
         await notifyAdmin('complaint', 'Urgent Complaint', `User "${user?.name || 'Guest'}" filed an urgent complaint.\nMessage: "${message}"`, 'Urgent Customer Complaint', user);
      }

      return NextResponse.json({ 
        response: finalResponse,
        actions: actions 
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
async function notifyAdmin(type: string, title: string, message: string, subject: string, customer?: any) {
  try {
    const admin = await prisma.user.findFirst({ where: { role: 'admin' }, select: { id: true } });
    if (admin) {
      await prisma.notification.create({
        data: { userId: admin.id, type, title, message: `${message}\nCustomer: ${customer?.email || 'Guest'}`, link: '/admin/messages' }
      });
      await prisma.contactMessage.create({
        data: {
          name: customer?.name ? `AI Alert: ${customer.name}` : 'AI Assistant Escalation',
          email: customer?.email || 'ai-bot@system.local',
          subject: subject,
          message: `Summary: ${message}\n\nTime: ${new Date().toLocaleString()}\n\nNote: This message was generated automatically by Silk Lite because a customer requested something unavailable or needs assistance.`,
          isRead: false
        }
      });
    }
  } catch (e) { console.error("Notify admin failed", e); }
}
