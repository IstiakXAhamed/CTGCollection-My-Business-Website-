
import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const auth = await verifyAuth(request)
  
  // Handle both uppercase and lowercase role variants
  const isSuperAdmin = auth && (auth.role === 'SUPER_ADMIN' || auth.role === 'superadmin')
  
  if (!auth || !isSuperAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const role = searchParams.get('role') // Optional filter

  try {
    // Build where clause - handle case insensitivity for roles
    let whereClause: any = {}
    
    if (role && role !== 'all') {
      // Case-insensitive role filter
      whereClause.role = { equals: role, mode: 'insensitive' }
    }
    // If no role filter, get ALL users (admins, sellers, customers, but not super_admin)
    // Super admin can manage anyone except themselves

    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        permissions: true,
        createdAt: true,
        isActive: true
      },
      orderBy: { createdAt: 'desc' },
      take: 200 // Increased limit
    })
    
    return NextResponse.json({ users })
  } catch (error) {
    console.error('Failed to fetch users:', error)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}
