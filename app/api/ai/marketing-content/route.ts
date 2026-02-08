import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
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

    // Fetch site settings for store name
    let storeName = 'Silk Mart'
    try {
      const settings = await prisma.siteSettings.findUnique({ where: { id: 'main' } })
      if (settings?.storeName) storeName = settings.storeName
    } catch (e) {
      console.warn('Failed to fetch settings for marketing AI:', e)
    }

    // Generate marketing content
    const result = await generateMarketingContent(type, topic, {
      language: language || 'en',
      includeEmoji: includeEmoji !== false,
      storeName: storeName
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
