import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'

// Type cast for new Shop model until Prisma types are regenerated
const db = prisma as any

export const dynamic = 'force-dynamic'

// Check superadmin access
async function checkSuperAdmin(request: NextRequest) {
  const user = await verifyAuth(request)
  if (!user || user.role !== 'superadmin') {
    return null
  }
  return user
}

// Check admin/superadmin access with permission
async function checkAccess(request: NextRequest) {
  const user: any = await verifyAuth(request)
  if (!user) return null
  
  // Super Admin has full access
  if (user.role === 'superadmin') return user
  
  // Admin requires 'manage_shops' permission
  if (user.role === 'admin' && user.permissions?.includes('manage_shops')) {
    return user
  }
  
  return null
}

// GET - List all shops
export async function GET(request: NextRequest) {
  try {
    const admin = await checkAccess(request)
    if (!admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const includeOwner = searchParams.get('includeOwner') === 'true'

    const shops = await db.shop.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        owner: includeOwner ? {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true
          }
        } : false,
        _count: {
          select: { products: true }
        }
      }
    })

    return NextResponse.json({ shops })
  } catch (error: any) {
    console.error('Fetch shops error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST - Create a new shop (superadmin only)
export async function POST(request: NextRequest) {
  try {
    const admin = await checkSuperAdmin(request)
    if (!admin) {
      return NextResponse.json({ error: 'Superadmin access required' }, { status: 401 })
    }

    const body = await request.json()
    const { ownerId, name, slug, description, logo, banner, phone, email, address, city, isVerified } = body

    // Validate required fields
    if (!ownerId || !name || !slug) {
      return NextResponse.json({ error: 'Owner, name, and slug are required' }, { status: 400 })
    }

    // Check if owner exists
    const owner = await prisma.user.findUnique({
      where: { id: ownerId },
      select: { id: true, role: true, name: true }
    })

    if (!owner) {
      return NextResponse.json({ error: 'Owner not found' }, { status: 404 })
    }

    // Check if owner already has a shop
    const existingShop = await db.shop.findUnique({
      where: { ownerId }
    })

    if (existingShop) {
      return NextResponse.json({ error: 'This user already has a shop' }, { status: 400 })
    }

    // Check if slug is taken
    const slugTaken = await db.shop.findUnique({
      where: { slug }
    })

    if (slugTaken) {
      return NextResponse.json({ error: 'Shop slug already taken' }, { status: 400 })
    }

    // If owner is not a seller, update their role
    if (owner.role !== 'seller' && owner.role !== 'admin' && owner.role !== 'superadmin') {
      await prisma.user.update({
        where: { id: ownerId },
        data: { role: 'seller' }
      })
    }

    // Create shop
    const shop = await db.shop.create({
      data: {
        ownerId,
        name,
        slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
        description,
        logo,
        banner,
        phone,
        email,
        address,
        city,
        isVerified: isVerified || false
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    return NextResponse.json({ success: true, shop })
  } catch (error: any) {
    console.error('Create shop error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
