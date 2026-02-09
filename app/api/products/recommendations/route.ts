import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const revalidate = 600 // Cache recommendations for 10 minutes

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category')
    const excludeId = searchParams.get('excludeId')
    
    if (!category) {
       return NextResponse.json({ bundles: [] })
    }

    // 1. Analyze Order History for "Bought Together"
    let selectedProducts: any[] = []
    
    try {
        if (!excludeId) throw new Error("No Product ID");
        
        const ordersWithProduct = await prisma.order.findMany({
            where: { 
                items: { some: { productId: excludeId } },
                createdAt: { gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) } // Last 90 days
            },
            include: { items: true },
            take: 20
        })

        if (ordersWithProduct.length > 0) {
            const frequencyMap = new Map<string, number>()
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ordersWithProduct.forEach((order: any) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                order.items.forEach((item: any) => {
                    if (item.productId !== excludeId) {
                        frequencyMap.set(item.productId, (frequencyMap.get(item.productId) || 0) + 1)
                    }
                })
            })
            
            // Sort by frequency
            const sortedIds = Array.from(frequencyMap.entries())
                .sort((a, b) => b[1] - a[1])
                .slice(0, 2)
                .map(entry => entry[0])
            
            if (sortedIds.length > 0) {
                selectedProducts = await prisma.product.findMany({
                    where: { id: { in: sortedIds }, isActive: true },
                    select: { id: true, name: true, basePrice: true, category: { select: { name: true } } }
                })
            }
        }
    } catch (err) {
        /* console.error("Order history analysis failed:", err) */
    }

    // 2. If no history, ask AI or use Category logic (Fallback)
    if (selectedProducts.length === 0) {
        const candidates = await prisma.product.findMany({
            where: {
                isActive: true,
                id: { not: excludeId || '' },
                OR: [
                    { category: { name: { equals: category, mode: 'insensitive' } } },
                    { category: { name: { contains: 'Accessory', mode: 'insensitive' } } }
                ]
            },
            take: 20, 
            select: { id: true, name: true, basePrice: true, category: { select: { name: true } } }
        })

        if (candidates.length > 0) {
             try {
                const { callGeminiAI } = await import('@/lib/gemini-ai')
                
                const prompt = `
                I have a product from category "${category}".
                Here is a list of available candidate products:
                ${candidates.map(p => `- ID: ${p.id}, Name: ${p.name}, Category: ${p.category?.name}`).join('\n')}

                Select exactly 2 best complimentary products to bundle with it. 
                Focus on logical pairings (e.g. Saree + Blouse, Shirt + Pants).
                Return ONLY a JSON array of the 2 selected IDs. Example: ["id1", "id2"]
                `

                const aiResult = await callGeminiAI(prompt, { temperature: 0.1 })
                const cleanJson = aiResult.replace(/```json/g, '').replace(/```/g, '').trim()
                const selectedIds = JSON.parse(cleanJson)
                
                if (Array.isArray(selectedIds)) {
                    selectedProducts = candidates.filter(p => selectedIds.includes(p.id))
                }
            } catch (aiError) {
                selectedProducts = candidates.slice(0, 2)
            }
            
            // Final fallback if AI failed completely
            if (selectedProducts.length === 0) selectedProducts = candidates.slice(0, 2)
        }
    }

    // 3. Re-fetch full details (image, etc) for selected products if needed, 
    // or reusing what we have if we included images. 
    // We didn't include images in candidate fetch to save tokens. Let's fetch them now or just include them in candidate fetch (it's small enough).
    // Actually, let's just fetch the full details for the 2 selected IDs.
    const finalProducts = await prisma.product.findMany({
        where: { id: { in: selectedProducts.map(p => p.id) } },
        select: { id: true, name: true, basePrice: true, salePrice: true, images: true }
    })
    
    // Format for frontend
    const items = finalProducts.map(p => {
        let image = '/placeholder.png'
        try {
            if (Array.isArray(p.images) && p.images.length > 0) image = (p.images as string[])[0]
            else if (typeof p.images === 'string') {
                const parsed = JSON.parse(p.images)
                if (Array.isArray(parsed) && parsed.length > 0) image = parsed[0]
            }
        } catch(e) {}

        return {
            id: p.id,
            name: p.name,
            price: p.salePrice || p.basePrice,
            originalPrice: p.basePrice,
            image: image
        }
    })

    if (items.length === 0) {
        return NextResponse.json({ bundles: [] })
    }

    return NextResponse.json({
        bundle: {
            name: "Complete The Look",
            discount: 10, // Fixed 10% bundle discount
            items: items,
            reason: "Frequently bought together"
        }
    })

  } catch (error) {
    console.error('Bundle API error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
