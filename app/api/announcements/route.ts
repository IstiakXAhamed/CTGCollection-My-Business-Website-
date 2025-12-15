import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'

// GET - Get active announcements for current user (not dismissed)
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    const userId = user?.id
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')

    const now = new Date()
    
    // Get active announcements that haven't been dismissed by this user
    const announcements = await (prisma as any).announcement.findMany({
      where: {
        isActive: true,
        startDate: { lte: now },
        OR: [
          { endDate: null },
          { endDate: { gte: now } }
        ],
        // Only show appropriate audience
        ...(user?.role === 'admin' || user?.role === 'superadmin'
          ? { targetAudience: { in: ['all', 'admins'] } }
          : { targetAudience: { in: ['all', 'customers'] } }
        ),
        // Exclude dismissed announcements
        NOT: {
          dismissals: {
            some: userId 
              ? { userId } 
              : sessionId 
                ? { sessionId }
                : { userId: 'impossible' } // Never match for non-logged in without session
          }
        }
      },
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
      take: 5 // Max 5 announcements at once
    })

    return NextResponse.json({ announcements })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST - Dismiss an announcement
export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    const body = await request.json()
    const { announcementId, sessionId } = body

    if (!announcementId) {
      return NextResponse.json({ error: 'Announcement ID is required' }, { status: 400 })
    }

    // Check if already dismissed
    const existing = await (prisma as any).announcementDismissal.findFirst({
      where: {
        announcementId,
        ...(user?.id ? { userId: user.id } : { sessionId })
      }
    })

    if (!existing) {
      await (prisma as any).announcementDismissal.create({
        data: {
          announcementId,
          userId: user?.id || null,
          sessionId: user?.id ? null : sessionId
        }
      })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
