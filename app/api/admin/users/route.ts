import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth, createToken, setAuthCookie } from '@/lib/auth'
import { notifyRoleChange, notifyAccountDeactivated, notifyAccountReactivated } from '@/lib/notifications'
import { sendRoleChangeEmail, sendAccountDeactivatedEmail, sendAccountReactivatedEmail, sendAccountDeletedEmail } from '@/lib/email'

export const dynamic = 'force-dynamic'

// Helper to check if user is superadmin
async function checkSuperAdmin(request: NextRequest) {
  const user = await verifyAuth(request)
  if (!user || user.role !== 'superadmin') {
    return null
  }
  return user
}

// Helper to check if user is any admin
async function checkAdmin(request: NextRequest) {
  const user = await verifyAuth(request)
  if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
    return null
  }
  return user
}

// GET: List all users (admin can view, but role management is superadmin only)
export async function GET(request: NextRequest) {
  try {
    const admin = await checkAdmin(request)
    if (!admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: any = {}
    if (role && role !== 'all') {
      where.role = role
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ]
    }

    const includeLoyalty = searchParams.get('includeLoyalty') === 'true'
    
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          role: true,
          isActive: true,
          createdById: true,
          createdAt: true,
          _count: { select: { orders: true } },
          loyaltyPoints: {
            select: {
              totalPoints: true,
              tierId: true,
              tier: {
                select: {
                  id: true,
                  name: true,
                  displayName: true,
                  color: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.user.count({ where })
    ])

    return NextResponse.json({
      users,
      isSuperAdmin: admin.role === 'superadmin',
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST: Create new admin user (superadmin only)
export async function POST(request: NextRequest) {
  try {
    const superAdmin = await checkSuperAdmin(request)
    if (!superAdmin) {
      return NextResponse.json({ error: 'Superadmin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { userId, role } = body

    if (!userId || !role) {
      return NextResponse.json({ error: 'User ID and role required' }, { status: 400 })
    }

    // Cannot change superadmin role
    const targetUser = await prisma.user.findUnique({ where: { id: userId } })
    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (targetUser.role === 'superadmin') {
      return NextResponse.json({ error: 'Cannot modify superadmin account' }, { status: 403 })
    }

    // Only allow valid roles
    if (!['customer', 'admin', 'seller'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { 
        role,
        createdById: role === 'admin' ? superAdmin.id : null
      }
    })

    // Send notification and email for role change
    try {
      await notifyRoleChange(userId, targetUser.role, role)
      await sendRoleChangeEmail(targetUser.email, {
        customerName: targetUser.name || 'Valued Customer',
        oldRole: targetUser.role,
        newRole: role
      })
    } catch (notifyError) {
      console.error('Failed to send role change notification/email:', notifyError)
    }

    // If user is being promoted to admin/seller, create new JWT token for them
    // This allows them to access admin panel immediately without re-login
    let newToken = null
    if ((role === 'admin' || role === 'seller') && (targetUser.role !== 'admin' && targetUser.role !== 'seller')) {
      try {
        newToken = await createToken({
          userId: updatedUser.id,
          email: updatedUser.email,
          role: updatedUser.role
        })
      } catch (tokenError) {
        console.error('Failed to create new token:', tokenError)
      }
    }

    return NextResponse.json({ 
      success: true, 
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role
      },
      newToken, // Send new token to frontend if role was promoted
      message: newToken ? 'Role updated. Please refresh the page to access admin features.' : 'Role updated successfully'
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT: Update user role/status (superadmin only for role changes)
export async function PUT(request: NextRequest) {
  try {
    const superAdmin = await checkSuperAdmin(request)
    if (!superAdmin) {
      return NextResponse.json({ error: 'Superadmin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { userId, isActive, role } = body

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    const targetUser = await prisma.user.findUnique({ where: { id: userId } })
    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Cannot deactivate or change role of superadmin
    if (targetUser.role === 'superadmin') {
      return NextResponse.json({ error: 'Cannot modify superadmin account' }, { status: 403 })
    }

    // Cannot make someone superadmin
    if (role === 'superadmin') {
      return NextResponse.json({ error: 'Cannot create superadmin via API' }, { status: 403 })
    }

    const updateData: any = {}
    if (isActive !== undefined) updateData.isActive = isActive
    if (role) updateData.role = role

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData
    })

    // Send notification and email for status and role changes
    try {
      // Role change notification/email
      if (role && role !== targetUser.role) {
        await notifyRoleChange(userId, targetUser.role, role)
        await sendRoleChangeEmail(targetUser.email, {
          customerName: targetUser.name || 'Valued Customer',
          oldRole: targetUser.role,
          newRole: role
        })
      }
      
      // Deactivation notification/email
      if (isActive === false && targetUser.isActive !== false) {
        await notifyAccountDeactivated(userId)
        await sendAccountDeactivatedEmail(targetUser.email, targetUser.name || 'Valued Customer')
      }
      
      // Reactivation notification/email
      if (isActive === true && targetUser.isActive === false) {
        await notifyAccountReactivated(userId)
        await sendAccountReactivatedEmail(targetUser.email, targetUser.name || 'Valued Customer')
      }
    } catch (notifyError) {
      console.error('Failed to send status change notification/email:', notifyError)
    }

    return NextResponse.json({ success: true, user: updatedUser })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE: Delete user (superadmin only)
export async function DELETE(request: NextRequest) {
  try {
    const superAdmin = await checkSuperAdmin(request)
    if (!superAdmin) {
      return NextResponse.json({ error: 'Superadmin access required' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    // Cannot delete self
    if (userId === superAdmin.id) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 403 })
    }

    const targetUser = await prisma.user.findUnique({ where: { id: userId } })
    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Cannot delete superadmin
    if (targetUser.role === 'superadmin') {
      return NextResponse.json({ error: 'Cannot delete superadmin account' }, { status: 403 })
    }

    // Send email BEFORE deleting the user (so we have their email)
    try {
      await sendAccountDeletedEmail(targetUser.email, targetUser.name || 'Valued Customer')
    } catch (emailError) {
      console.error('Failed to send account deleted email:', emailError)
    }

    await prisma.user.delete({ where: { id: userId } })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
