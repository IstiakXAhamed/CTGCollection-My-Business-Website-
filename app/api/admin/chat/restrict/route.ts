import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

async function checkAdmin(request: NextRequest) {
  const user = await verifyAuth(request)
  if (!user || (user.role !== 'admin' && user.role !== 'superadmin' && user.role !== 'seller')) {
    return null
  }
  return user
}

// GET - Check if a session is restricted
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')
    
    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 })
    }

    const restriction = await (prisma as any).chatRestriction.findUnique({
      where: { sessionId }
    })

    if (!restriction) {
      return NextResponse.json({ restricted: false })
    }

    // Check if restriction has expired
    if (new Date(restriction.restrictedUntil) < new Date()) {
      // Delete expired restriction
      await (prisma as any).chatRestriction.delete({
        where: { sessionId }
      })
      return NextResponse.json({ restricted: false })
    }

    return NextResponse.json({
      restricted: true,
      restrictedUntil: restriction.restrictedUntil,
      // Calculate remaining seconds on server to avoid timezone issues
      remainingSeconds: Math.max(0, Math.floor((new Date(restriction.restrictedUntil).getTime() - Date.now()) / 1000)),
      reason: restriction.reason
    })
  } catch (error: any) {
    console.error('Check restriction error:', error)
    return NextResponse.json({ restricted: false })
  }
}

// POST - Add chat restriction (admin only)
export async function POST(request: NextRequest) {
  try {
    const admin = await checkAdmin(request)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { sessionId, duration, reason, userId } = body

    if (!sessionId || !duration) {
      return NextResponse.json({ error: 'Session ID and duration required' }, { status: 400 })
    }

    // Calculate restriction end time
    const now = new Date()
    let restrictedUntil: Date

    switch (duration) {
      case '5min':
        restrictedUntil = new Date(now.getTime() + 5 * 60 * 1000)
        break
      case '15min':
        restrictedUntil = new Date(now.getTime() + 15 * 60 * 1000)
        break
      case '1hr':
        restrictedUntil = new Date(now.getTime() + 60 * 60 * 1000)
        break
      case '24hr':
        restrictedUntil = new Date(now.getTime() + 24 * 60 * 60 * 1000)
        break
      default:
        // Custom duration in minutes
        const minutes = parseInt(duration) || 5
        restrictedUntil = new Date(now.getTime() + minutes * 60 * 1000)
    }

    // Create or update restriction
    const restriction = await (prisma as any).chatRestriction.upsert({
      where: { sessionId },
      update: {
        restrictedUntil,
        reason: reason || 'Restricted by admin',
        createdBy: admin.userId
      },
      create: {
        sessionId,
        userId: userId || null,
        restrictedUntil,
        reason: reason || 'Restricted by admin',
        createdBy: admin.userId
      }
    })

    // Send system message to notify user
    await (prisma as any).chatMessage.create({
      data: {
        sessionId,
        senderType: 'system',
        senderId: admin.userId,
        senderName: 'System',
        message: `⚠️ Your chat has been restricted for ${duration}. Reason: ${reason || 'Policy violation'}. You can send messages again after the restriction expires.`,
        isRead: false
      }
    })

    return NextResponse.json({ 
      success: true, 
      restriction,
      message: `User restricted until ${restrictedUntil.toLocaleString()}`
    })
  } catch (error: any) {
    console.error('Add restriction error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE - Remove chat restriction (admin only)
export async function DELETE(request: NextRequest) {
  try {
    const admin = await checkAdmin(request)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 })
    }

    await (prisma as any).chatRestriction.delete({
      where: { sessionId }
    })

    // Send system message
    await (prisma as any).chatMessage.create({
      data: {
        sessionId,
        senderType: 'system',
        senderId: admin.userId,
        senderName: 'System',
        message: '✅ Your chat restriction has been lifted. You can now send messages again.',
        isRead: false
      }
    })

    return NextResponse.json({ success: true, message: 'Restriction removed' })
  } catch (error: any) {
    console.error('Remove restriction error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
