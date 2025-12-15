import { NextResponse } from 'next/server'

// GET - Check auth status
export async function GET(request: Request) {
  try {
    const cookieHeader = request.headers.get('cookie')
    const token = cookieHeader?.split(';').find(c => c.trim().startsWith('token='))?.split('=')[1]

    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 401 })
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

    return NextResponse.json({
      authenticated: true,
      user: {
        id: freshUser.id,
        name: freshUser.name,
        email: freshUser.email,
        role: freshUser.role,
        tier: freshUser.loyaltyPoints?.tier?.name || 'bronze'
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
