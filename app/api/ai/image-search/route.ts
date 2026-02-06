import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth'
import { callGeminiAI } from '@/lib/gemini-ai'

export const dynamic = 'force-dynamic'

// Smart image search using AI keywords + multiple sources
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

    let searchTerms = [query]

    // 1. SMART ENHANCEMENT: Ask AI for better visual keywords
    // Only do this if we have an API key (implied by callGeminiAI success)
    try {
      if (process.env.GOOGLE_AI_API_KEY) {
        const aiPrompt = `For the product "${query}", suggest 3 highly visual, specific stock photo search queries. 
        Example: for "Rose Perfume", suggest "luxury perfume bottle rose", "pink floral aesthetic".
        Return ONLY comma-separated phrases.`
        
        const aiResult = await callGeminiAI(aiPrompt, { temperature: 0.4 })
        const aiKeywords = aiResult.split(',').map(s => s.trim()).filter(s => s.length > 0)
        if (aiKeywords.length > 0) {
          searchTerms = [...aiKeywords, query] // Prioritize AI terms
        }
      }
    } catch (e) {
      console.log('AI Keyword generation failed, falling back to raw query', e)
    }

    const images: string[] = []

    // 2. Fetch images using smart keywords
    for (const term of searchTerms.slice(0, 3)) { // Use top 3 terms
      try {
        // Try Unsplash (using generic source endpoint which mimics search)
        const encodedTerm = encodeURIComponent(term)
        images.push(`https://source.unsplash.com/random/800x800/?${encodedTerm}&sig=${Date.now()}-${Math.random()}`)
        images.push(`https://source.unsplash.com/random/800x800/?${encodedTerm}&sig=${Date.now()}-${Math.random()}`)
      } catch (e) {
        console.error('Unsplash error:', e)
      }
    }

    // 3. Fallback: Lorem Picsum (if AI search yields little)
    if (images.length < 4) {
      for (let i = 0; i < 4; i++) {
        images.push(`https://picsum.photos/seed/${query.replace(/\s/g, '')}-${i}/800/800`)
      }
    }

    return NextResponse.json({
      success: true,
      images: images.slice(0, 12), // Return max 12 images
      source: 'smart-ai-studio'
    })
  } catch (error: any) {
    console.error('Image search error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}
