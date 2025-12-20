
import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth, verifyPassword } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const auth = await verifyAuth(request)
  
  if (!auth || auth.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { targetUserId, password } = await request.json()
    
    if (!targetUserId || !password) {
      return NextResponse.json({ error: 'Target user and password required' }, { status: 400 })
    }

    if (targetUserId === auth.userId) {
       return NextResponse.json({ error: 'Cannot transfer role to yourself' }, { status: 400 })
    }

    // 1. Verify Password of current super admin
    const currentUser = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: { password: true }
    })

    if (!currentUser || !currentUser.password) {
      return NextResponse.json({ error: 'User not found or no password set' }, { status: 404 })
    }

    const isValid = await verifyPassword(password, currentUser.password)
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
    }

    // 2. Perform Transfer Transaction
    await prisma.$transaction([
      // Demote current super admin
      prisma.user.update({
        where: { id: auth.userId },
        data: { role: 'ADMIN' }
      }),
      // Promote new super admin
      prisma.user.update({
        where: { id: targetUserId },
        data: { role: 'SUPER_ADMIN' }
      })
    ])

    return NextResponse.json({ 
      success: true, 
      message: 'Role transferred successfully. You are now an Admin.' 
    })
  } catch (error) {
    console.error('Transfer error:', error)
    return NextResponse.json({ error: 'Failed to transfer role' }, { status: 500 })
  }
}
