import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth'
import { readAIConfig, writeAIConfig } from '@/lib/ai-config'

export const dynamic = 'force-dynamic'

// Check super admin access
async function checkSuperAdmin(request: NextRequest) {
  const user = await verifyAuth(request)
  if (!user || (user.role !== 'SUPER_ADMIN' && user.role !== 'superadmin')) {
    return null
  }
  return user
}

// GET AI settings
export async function GET(request: NextRequest) {
  try {
    const admin = await checkSuperAdmin(request)
    if (!admin) {
      return NextResponse.json({ error: 'Super Admin access required' }, { status: 401 })
    }

    const aiConfig = readAIConfig()
    
    // Check if API key exists in env
    const hasApiKey = !!process.env.GOOGLE_AI_API_KEY
    
    return NextResponse.json({
      ...aiConfig,
      apiKey: hasApiKey ? '••••••••••••••••' : '', // Masked for security
      apiKeyValid: hasApiKey,
    })
  } catch (error: any) {
    console.error('Failed to fetch AI settings:', error)
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

// POST save AI settings
export async function POST(request: NextRequest) {
  try {
    const admin = await checkSuperAdmin(request)
    if (!admin) {
      return NextResponse.json({ error: 'Super Admin access required' }, { status: 401 })
    }

    const body = await request.json()
    const { enabled, features, maxTokens, temperature } = body

    const config = {
      enabled: typeof enabled === 'boolean' ? enabled : true,
      features: features || {},
      maxTokens: maxTokens || 1024,
      temperature: temperature || 0.7,
    }

    const success = writeAIConfig(config)
    
    if (success) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ error: 'Failed to save config' }, { status: 500 })
    }
  } catch (error: any) {
    console.error('Failed to save AI settings:', error)
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 })
  }
}
