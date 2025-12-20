import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// Assign all products without a seller to the first SuperAdmin
export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user || user.role !== 'superadmin') {
      return NextResponse.json({ error: 'Unauthorized - SuperAdmin only' }, { status: 401 })
    }

    // Find all products without a seller
    const productsWithoutSeller = await prisma.product.count({
      where: { sellerId: null }
    })

    if (productsWithoutSeller === 0) {
      return NextResponse.json({ 
        message: 'All products already have a seller assigned',
        updated: 0 
      })
    }

    // Get the first SuperAdmin to assign as default seller
    const superAdmin = await prisma.user.findFirst({
      where: { role: 'superadmin' },
      orderBy: { createdAt: 'asc' }
    })

    if (!superAdmin) {
      return NextResponse.json({ error: 'No SuperAdmin found' }, { status: 404 })
    }

    // Assign all unassigned products to the SuperAdmin
    const result = await prisma.product.updateMany({
      where: { sellerId: null },
      data: { sellerId: superAdmin.id }
    })

    return NextResponse.json({
      message: `Assigned ${result.count} products to ${superAdmin.name}`,
      updated: result.count,
      assignedTo: {
        id: superAdmin.id,
        name: superAdmin.name,
        email: superAdmin.email
      }
    })
  } catch (error: any) {
    console.error('Assign products error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// GET status of product assignments
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const [total, withSeller, withoutSeller] = await Promise.all([
      prisma.product.count(),
      prisma.product.count({ where: { sellerId: { not: null } } }),
      prisma.product.count({ where: { sellerId: null } })
    ])

    return NextResponse.json({
      total,
      withSeller,
      withoutSeller,
      percentage: total > 0 ? Math.round((withSeller / total) * 100) : 100
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
