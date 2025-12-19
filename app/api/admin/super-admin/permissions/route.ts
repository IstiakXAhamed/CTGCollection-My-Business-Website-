
import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(request: NextRequest) {
  const auth = await verifyAuth(request)
  
  if (!auth || auth.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { userId, permissions } = await request.json()
    
    if (!userId || !Array.isArray(permissions)) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
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
