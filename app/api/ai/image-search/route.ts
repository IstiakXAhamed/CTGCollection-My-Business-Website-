import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// Free image search using multiple sources
export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { query } = await request.json()
    if (!query) {
      return NextResponse.json({ error: 'Query required' }, { status: 400 })
    }

    const images: string[] = []

    // Try Unsplash first (no API key needed for basic search)
    try {
      const unsplashRes = await fetch(
        `https://source.unsplash.com/random/800x800/?${encodeURIComponent(query)}`,
        { method: 'HEAD' }
      )
      if (unsplashRes.ok) {
        // Generate multiple unique Unsplash images
        for (let i = 0; i < 4; i++) {
          images.push(`https://source.unsplash.com/random/800x800/?${encodeURIComponent(query)}&sig=${Date.now()}-${i}`)
        }
      }
    } catch (e) {
      console.error('Unsplash error:', e)
    }

    // Try Lorem Picsum as fallback
    if (images.length < 8) {
      for (let i = 0; i < 4; i++) {
        images.push(`https://picsum.photos/seed/${query.replace(/\s/g, '')}-${i}/800/800`)
      }
    }

    // Try placeholder images based on product type
    const productKeywords = query.toLowerCase()
    let placeholderCategory = 'product'
    
    if (productKeywords.includes('shirt') || productKeywords.includes('cloth') || productKeywords.includes('dress')) {
      placeholderCategory = 'fashion'
    } else if (productKeywords.includes('phone') || productKeywords.includes('laptop') || productKeywords.includes('electronic')) {
      placeholderCategory = 'tech'
    } else if (productKeywords.includes('shoe') || productKeywords.includes('sneaker')) {
      placeholderCategory = 'shoes'
    } else if (productKeywords.includes('watch') || productKeywords.includes('jewelry')) {
      placeholderCategory = 'accessories'
    } else if (productKeywords.includes('bag') || productKeywords.includes('purse')) {
      placeholderCategory = 'bags'
    }

    // Add category-specific Unsplash images
    for (let i = 0; i < 4; i++) {
      images.push(`https://source.unsplash.com/random/800x800/?${placeholderCategory}&sig=${Date.now()}-cat-${i}`)
    }

    return NextResponse.json({
      success: true,
      images: images.slice(0, 12), // Return max 12 images
      source: 'unsplash,picsum'
    })
  } catch (error: any) {
    console.error('Image search error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}
