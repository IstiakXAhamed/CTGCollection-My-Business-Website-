import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET /api/internal-chat/users?query=...
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const query = searchParams.get('query') || ''

    const authRes = await fetch(new URL('/api/auth/me', req.url), { headers: req.headers })
    const authData = await authRes.json()
    if (!authData.authenticated) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    
    const currentUserRole = authData.user.role
    const currentUserId = authData.user.id

    // Define who can chat with whom
    // Admins/Superadmins: Can chat with anyone (sellers, other admins)
    // Sellers: Can chat with Admins/Superadmins
    
    let roleFilter: any = {}
    
    if (currentUserRole === 'seller') {
      // Sellers can only search for admins and superadmins
      roleFilter = { in: ['admin', 'superadmin'] }
    } else {
      // Admins/Superadmins can search for everyone except customers (sellers, admins, superadmins)
      // "for superadmin ,,admin and seller" - covers this.
      // "for admin seller and super" - covers this.
      roleFilter = { in: ['admin', 'superadmin', 'seller'] }
    }

    const users = await prisma.user.findMany({
      where: {
        AND: [
          { role: roleFilter },
          { id: { not: currentUserId } }, // DOn't show self
          {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { email: { contains: query, mode: 'insensitive' } }
            ]
          }
        ]
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      },
      take: 20
    })

    return NextResponse.json({ users })

  } catch (error) {
    console.error('User search error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
