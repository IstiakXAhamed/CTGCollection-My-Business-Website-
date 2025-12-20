import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// Download and convert image to base64 for upload
export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { url } = await request.json()
    if (!url) {
      return NextResponse.json({ error: 'URL required' }, { status: 400 })
    }

    // Fetch the image
    const imageRes = await fetch(url)
    if (!imageRes.ok) {
      return NextResponse.json({ error: 'Failed to fetch image' }, { status: 500 })
    }

    const arrayBuffer = await imageRes.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const base64 = buffer.toString('base64')
    
    // Detect content type
    const contentType = imageRes.headers.get('content-type') || 'image/jpeg'
    const dataUrl = `data:${contentType};base64,${base64}`

    return NextResponse.json({
      success: true,
      base64: dataUrl
    })
  } catch (error: any) {
    console.error('Image download error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}
