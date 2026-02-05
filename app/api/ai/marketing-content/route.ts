import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth'
import { generateMarketingContent, generateHashtags } from '@/lib/gemini-ai'

export const dynamic = 'force-dynamic'

// Check admin access
async function checkAdmin(request: NextRequest) {
  const user = await verifyAuth(request)
  if (!user || (user.role !== 'admin' && user.role !== 'superadmin' && user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN' && user.role !== 'seller' && user.role !== 'SELLER')) {
    return null
  }
  return user
}

export async function POST(request: NextRequest) {
  try {
    const admin = await checkAdmin(request)
    if (!admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 401 })
    }

    const { type, topic, language, includeEmoji } = await request.json()

    if (!topic) {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 })
    }

    // Generate marketing content
    const result = await generateMarketingContent(type, topic, {
      language: language || 'en',
      includeEmoji: includeEmoji !== false
    })

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      content: result.result 
    })
  } catch (error: any) {
    console.error('Marketing AI error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
