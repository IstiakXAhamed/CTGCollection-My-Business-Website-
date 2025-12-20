import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

const db = prisma as any

// PUT - Approve or reject application (admin/superadmin)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await verifyAuth(request)
    if (!admin || (admin.role !== 'admin' && admin.role !== 'superadmin')) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 401 })
    }

    const body = await request.json()
    const { action, rejectionReason } = body // action: 'approve' | 'reject'

    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    const application = await db.sellerApplication.findUnique({
      where: { id: params.id },
      include: { user: true }
    })

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    if (application.status !== 'pending') {
      return NextResponse.json({ error: 'Application already processed' }, { status: 400 })
    }

    if (action === 'approve') {
      // Create shop for the user
      const slug = application.shopName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      
      await db.shop.create({
        data: {
          ownerId: application.userId,
          name: application.shopName,
          slug: `${slug}-${Date.now().toString(36)}`, // Ensure unique
          description: application.shopDescription,
          phone: application.phone,
          address: application.address,
          city: application.city,
          isVerified: application.verificationTier === 'verified',
          isActive: true
        }
      })

      // Update user role to seller
      await prisma.user.update({
        where: { id: application.userId },
        data: { role: 'seller' }
      })

      // Update application status
      await db.sellerApplication.update({
        where: { id: params.id },
        data: {
          status: 'approved',
          reviewedBy: admin.id,
          reviewedAt: new Date()
        }
      })

      return NextResponse.json({
        success: true,
        message: `Application approved! ${application.user.name} is now a seller.`
      })
    } else {
      // Reject
      await db.sellerApplication.update({
        where: { id: params.id },
        data: {
          status: 'rejected',
          rejectionReason: rejectionReason || 'Application did not meet requirements',
          reviewedBy: admin.id,
          reviewedAt: new Date()
        }
      })

      return NextResponse.json({
        success: true,
        message: 'Application rejected'
      })
    }
  } catch (error: any) {
    console.error('Process application error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
