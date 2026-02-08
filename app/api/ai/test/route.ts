
import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth'
import { callGeminiAI } from '@/lib/gemini-ai'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // 1. Verify Admin Access
    const user = await verifyAuth(request)
    if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 401 })
    }

    const debugInfo: any = {
      checks: {
        envVarPresent: false,
        envVarLength: 0,
        apiKeyStart: null,
        connectivity: false,
        modelAccess: false
      },
      error: null
    }

    // 2. Check Environment Variable
    const apiKey = process.env.GOOGLE_AI_API_KEY
    if (apiKey) {
      debugInfo.checks.envVarPresent = true
      debugInfo.checks.envVarLength = apiKey.length
      debugInfo.checks.apiKeyStart = apiKey.substring(0, 5) + '...'
    } else {
      return NextResponse.json({ success: false, debugInfo, message: 'Google AI API Key is missing from server environment.' })
    }

    // 3. Test Connectivity
    try {
      const response = await callGeminiAI('Reply with "OK" if you can read this.', { maxTokens: 10 })
      debugInfo.checks.connectivity = true
      debugInfo.checks.modelAccess = true
      debugInfo.response = response
      
      return NextResponse.json({ success: true, debugInfo, message: 'AI System is Operational' })
    } catch (e: any) {
      debugInfo.error = e.message
      return NextResponse.json({ success: false, debugInfo, message: `Connectivity Check Failed: ${e.message}` })
    }

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
