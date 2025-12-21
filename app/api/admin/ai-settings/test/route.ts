import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent'

export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user || (user.role !== 'SUPER_ADMIN' && user.role !== 'superadmin')) {
      return NextResponse.json({ error: 'Super Admin access required' }, { status: 401 })
    }

    const { apiKey } = await request.json()
    
    if (!apiKey) {
      return NextResponse.json({ valid: false, error: 'No API key provided' })
    }

    // Test the API key with a simple request
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: 'Say "API key is valid" in exactly those words.' }] }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 20,
        }
      })
    })

    if (response.ok) {
      const data = await response.json()
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
      return NextResponse.json({ 
        valid: true, 
        message: 'API key is valid and working!',
        response: text
      })
    } else {
      const error = await response.json()
      return NextResponse.json({ 
        valid: false, 
        error: error.error?.message || 'Invalid API key'
      })
    }
  } catch (error: any) {
    console.error('API key test error:', error)
    return NextResponse.json({ 
      valid: false, 
      error: 'Failed to test API key'
    })
  }
}
