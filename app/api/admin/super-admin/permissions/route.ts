
import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function PUT(request: NextRequest) {
  const auth = await verifyAuth(request)
  
  if (!auth || auth.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { userId, permissions, password } = await request.json()
    
    if (!userId || !Array.isArray(permissions)) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }

    // Verify Super Admin password
    if (!password) {
      return NextResponse.json({ error: 'Password required for security verification' }, { status: 400 })
    }

    const superAdmin = await prisma.user.findUnique({
      where: { id: auth.id || auth.userId },
      select: { password: true }
    })

    if (!superAdmin?.password) {
      return NextResponse.json({ error: 'Password not configured' }, { status: 400 })
    }

    const isValid = await bcrypt.compare(password, superAdmin.password)
    if (!isValid) {
      return NextResponse.json({ error: 'Incorrect password' }, { status: 401 })
    }

    // Update user permissions
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { permissions },
      select: { id: true, email: true, permissions: true }
    })

    return NextResponse.json({ 
      success: true, 
      user: updatedUser 
    })
  } catch (error) {
    console.error('Permission update error:', error)
    return NextResponse.json({ error: 'Failed to update permissions' }, { status: 500 })
  }
}
