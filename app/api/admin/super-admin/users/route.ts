
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
    // Build where clause - only return admins and sellers, NOT customers
    let whereClause: any = {
      // Exclude customers - only show admin/seller roles (case-insensitive)
      OR: [
        { role: { equals: 'admin', mode: 'insensitive' } },
        { role: { equals: 'seller', mode: 'insensitive' } },
        { role: { equals: 'ADMIN', mode: 'insensitive' } },
        { role: { equals: 'SELLER', mode: 'insensitive' } },
      ]
    }
    
    // If specific role filter is applied
    if (role && role !== 'all') {
      whereClause = {
        role: { equals: role, mode: 'insensitive' }
      }
    }

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
      take: 200
    })
    
    return NextResponse.json({ users })
  } catch (error) {
    console.error('Failed to fetch users:', error)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}
