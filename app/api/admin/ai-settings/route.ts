import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'

export const dynamic = 'force-dynamic'

// AI config file path (stored locally for now)
const AI_CONFIG_PATH = join(process.cwd(), 'data', 'ai-config.json')

// Check super admin access
async function checkSuperAdmin(request: NextRequest) {
  const user = await verifyAuth(request)
  if (!user || (user.role !== 'SUPER_ADMIN' && user.role !== 'superadmin')) {
    return null
  }
  return user
}

// Read AI config from file
function readAIConfig() {
  try {
    if (existsSync(AI_CONFIG_PATH)) {
      const data = readFileSync(AI_CONFIG_PATH, 'utf-8')
      return JSON.parse(data)
    }
  } catch (e) {
    console.error('Failed to read AI config:', e)
  }
  
  // Default config
  return {
    features: {
      product_assist: true,
      chat_assist: false,
      review_moderation: false,
      seo_generator: false,
      analytics_insights: false,
    },
    maxTokens: 1024,
    temperature: 0.7,
  }
}

// Write AI config to file
function writeAIConfig(config: any) {
  try {
    // Ensure data directory exists
    const dataDir = join(process.cwd(), 'data')
    if (!existsSync(dataDir)) {
      require('fs').mkdirSync(dataDir, { recursive: true })
    }
    writeFileSync(AI_CONFIG_PATH, JSON.stringify(config, null, 2))
    return true
  } catch (e) {
    console.error('Failed to write AI config:', e)
    return false
  }
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

    const { features, maxTokens, temperature } = await request.json()

    const config = {
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
