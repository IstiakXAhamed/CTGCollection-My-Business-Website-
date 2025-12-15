import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'

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
          ...(includeLoyalty ? {
            loyaltyPoints: {
              select: {
                tierId: true,
                totalPoints: true,
                tier: {
                  select: {
                    id: true,
                    displayName: true,
                    color: true
                  }
                }
              }
            }
          } : {})
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
    if (!['customer', 'admin'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { 
        role,
        createdById: role === 'admin' ? superAdmin.id : null
      }
    })

    return NextResponse.json({ 
      success: true, 
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role
      }
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

    await prisma.user.delete({ where: { id: userId } })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
