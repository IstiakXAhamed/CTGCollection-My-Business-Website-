import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth'

// Diagnostic endpoint to check current JWT token contents
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    
    if (!user) {
      return NextResponse.json({ 
        authenticated: false,
        message: 'No valid JWT token found. Please log in.'
      })
    }

    return NextResponse.json({
      authenticated: true,
      tokenContents: {
        userId: user.userId || user.id,
        email: user.email,
        role: user.role
      },
      message: `Your JWT token shows role: ${user.role}`,
      hasAdminAccess: user.role === 'admin' || user.role === 'superadmin' || user.role === 'seller',
      instructions: user.role === 'customer' 
        ? 'Your token still shows customer role. Please log out and log back in to get a new token with your admin role.'
        : 'Your token has admin access. If you still see no data, check browser console for API errors.'
    })
  } catch (error: any) {
    return NextResponse.json({ 
      error: error.message,
      message: 'Error reading JWT token'
    }, { status: 500 })
  }
}
