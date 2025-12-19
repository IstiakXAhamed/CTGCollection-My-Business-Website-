import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'

const db = prisma as any

// Check access
async function checkAccess(request: NextRequest) {
  const user: any = await verifyAuth(request)
  if (!user) return null
  
  if (user.role === 'superadmin') return user
  
  if (user.role === 'admin' && user.permissions?.includes('approve_sellers')) {
    return user
  }
  
  return null
}

// GET - List all applications (admin)
export async function GET(request: NextRequest) {
  try {
    const admin = await checkAccess(request)
    if (!admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') // pending, approved, rejected

    const where: any = {}
    if (status) where.status = status

    const applications = await db.sellerApplication.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true }
        }
      }
    })

    const counts = await Promise.all([
      db.sellerApplication.count({ where: { status: 'pending' } }),
      db.sellerApplication.count({ where: { status: 'approved' } }),
      db.sellerApplication.count({ where: { status: 'rejected' } })
    ])

    return NextResponse.json({ 
      applications,
      counts: { pending: counts[0], approved: counts[1], rejected: counts[2] }
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
