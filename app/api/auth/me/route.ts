import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// GET - Check auth status
export async function GET(request: Request) {
  try {
    const cookieHeader = request.headers.get('cookie')
    const token = cookieHeader?.split(';').find(c => c.trim().startsWith('token='))?.split('=')[1]

    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    // Check for role switching cookies
    const tempRole = cookieHeader?.split(';').find(c => c.trim().startsWith('tempRole='))?.split('=')[1]
    const originalRole = cookieHeader?.split(';').find(c => c.trim().startsWith('originalRole='))?.split('=')[1]
    const testPermsCookie = cookieHeader?.split(';').find(c => c.trim().startsWith('testPermissions='))?.split('=')[1]
    let testPermissions: string[] | undefined
    if (testPermsCookie) {
      try {
        testPermissions = JSON.parse(decodeURIComponent(testPermsCookie))
      } catch (e) {
        testPermissions = undefined
      }
    }

    // Verify token
    const { verifyToken } = await import('@/lib/auth')
    const { prisma } = await import('@/lib/prisma')
    const user = await verifyToken(token)

    // Get fresh user data including loyalty tier
    // Token payload uses userId, but we check both just in case
    const userId = user.userId || user.id
    
    if (!userId) {
       return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    const freshUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        loyaltyPoints: {
          include: {
            tier: true
          }
        }
      }
    })

    if (!freshUser) {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    // Determine the active role (use temp role if set, otherwise real role)
    const activeRole = tempRole || freshUser.role
    const isRoleSwitched = !!tempRole && tempRole !== freshUser.role

    return NextResponse.json({
      authenticated: true,
      user: {
        id: freshUser.id,
        name: freshUser.name,
        email: freshUser.email,
        role: activeRole,  // Return the active (potentially switched) role
        realRole: freshUser.role,  // Keep track of actual role
        originalRole: originalRole || freshUser.role,  // For role switcher component
        isRoleSwitched,  // Flag to indicate if role is switched
        permissions: freshUser.permissions || [],  // Return permissions for menu generation
        testPermissions,  // Custom test permissions for role switching (undefined if not set)
        tier: freshUser.loyaltyPoints?.tier?.name || null  // null = No Tier assigned
      }
    })
  } catch (error) {
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }
}

// POST - Logout
export async function POST(request: Request) {
  const response = NextResponse.json({ message: 'Logged out successfully' })
  
  response.cookies.set('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  })
  
  return response
}
