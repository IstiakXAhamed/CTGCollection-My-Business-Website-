import { NextResponse } from 'next/server'
import { vapidKeys, isPushConfigured } from '@/lib/webpush'

export async function GET() {
  return NextResponse.json({
    publicKey: vapidKeys.publicKey || null,
    isConfigured: isPushConfigured(),
  })
}

export async function POST() {
  return NextResponse.json({ error: 'Use /api/push/subscribe' }, { status: 404 })
}
