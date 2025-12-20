import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// Debug endpoint to test Gemini API connection
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: 'Login required' }, { status: 401 })
    }

    const apiKey = process.env.GOOGLE_AI_API_KEY
    
    // Check if key exists
    if (!apiKey) {
      return NextResponse.json({
        status: 'error',
        message: 'GOOGLE_AI_API_KEY not found in environment',
        keyExists: false,
        hint: 'Add GOOGLE_AI_API_KEY to your .env file or Vercel environment variables'
      })
    }

    // Check key format
    if (!apiKey.startsWith('AIza')) {
      return NextResponse.json({
        status: 'error',
        message: 'API key format looks incorrect',
        keyExists: true,
        keyFormat: 'invalid',
        hint: 'Google AI API keys should start with AIza'
      })
    }

    // Test the API
    const testUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.0-pro:generateContent?key=${apiKey}`
    
    const response = await fetch(testUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: 'Say "API working" in 3 words' }] }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 20,
        }
      })
    })

    const data = await response.json()

    if (response.ok) {
      const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response'
      return NextResponse.json({
        status: 'success',
        message: 'Gemini API is working!',
        keyExists: true,
        keyFormat: 'valid',
        apiResponse: aiResponse,
        model: 'gemini-1.5-flash'
      })
    } else {
      return NextResponse.json({
        status: 'error',
        message: 'Gemini API returned error',
        keyExists: true,
        keyFormat: 'valid',
        apiError: data.error?.message || JSON.stringify(data),
        statusCode: response.status,
        hint: 'Check if API key is valid and has quota remaining'
      })
    }
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: 'Failed to test API',
      error: error.message
    }, { status: 500 })
  }
}
