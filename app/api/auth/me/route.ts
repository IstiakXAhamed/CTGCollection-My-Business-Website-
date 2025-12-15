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
    const user = await verifyToken(token)

    if (!user) {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
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
