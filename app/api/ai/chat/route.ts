import { NextRequest, NextResponse } from 'next/server'
import { generateChatResponse } from '@/lib/gemini-ai'

export async function POST(request: NextRequest) {
  try {
    const { message, context } = await request.json()
    
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    const aiResponse = await generateChatResponse(message, context)

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
