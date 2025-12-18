import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth'
import { cookies } from 'next/headers'

// POST - Switch to a different role (SuperAdmin only)
export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the original role from cookie or use current role
    const cookieStore = await cookies()
    const originalRole = cookieStore.get('originalRole')?.value || user.role

    // Only superadmin can use role switch
    if (originalRole !== 'superadmin') {
      return NextResponse.json({ 
        error: 'Only Super Admin can use role switching' 
      }, { status: 403 })
    }

    const { targetRole } = await request.json()

    // Validate target role
    const validRoles = ['superadmin', 'admin', 'seller', 'customer']
    if (!validRoles.includes(targetRole)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    const response = NextResponse.json({
      success: true,
      message: targetRole === 'superadmin' 
        ? 'Switched back to Super Admin' 
        : `Now viewing as ${targetRole}`,
      currentRole: targetRole,
      originalRole: 'superadmin',
      isSwitched: targetRole !== 'superadmin'
    })

    // Store the temporary role and original role in cookies
    if (targetRole === 'superadmin') {
      // Switching back - clear the temp role cookie
      response.cookies.set('tempRole', '', { 
        httpOnly: true, 
        path: '/', 
        maxAge: 0 
      })
      response.cookies.set('originalRole', '', { 
        httpOnly: true, 
        path: '/', 
        maxAge: 0 
      })
    } else {
      // Switching to a different role
      response.cookies.set('tempRole', targetRole, {
        httpOnly: true,
        path: '/',
        maxAge: 60 * 60 * 4, // Auto-revert after 4 hours
        sameSite: 'lax'
      })
      response.cookies.set('originalRole', 'superadmin', {
        httpOnly: true,
        path: '/',
        maxAge: 60 * 60 * 4,
        sameSite: 'lax'
      })
    }

    return response
  } catch (error) {
    console.error('Role switch error:', error)
    return NextResponse.json({ error: 'Failed to switch role' }, { status: 500 })
  }
}

// GET - Get current role switch status
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const cookieStore = await cookies()
    const tempRole = cookieStore.get('tempRole')?.value
    const originalRole = cookieStore.get('originalRole')?.value

    return NextResponse.json({
      currentRole: tempRole || user.role,
      originalRole: originalRole || user.role,
      isSwitched: !!tempRole && tempRole !== user.role,
      canSwitch: user.role === 'superadmin' || originalRole === 'superadmin'
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to get role status' }, { status: 500 })
  }
}
