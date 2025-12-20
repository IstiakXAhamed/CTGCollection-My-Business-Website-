import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// GET - List user's addresses
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const addresses = await prisma.address.findMany({
      where: { userId: user.id },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }]
    })

    return NextResponse.json({ addresses })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST - Add new address
export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, phone, address, city, district, postalCode, isDefault } = body

    // Validation
    if (!name || !phone || !address || !city || !district) {
      return NextResponse.json({ error: 'Name, phone, address, city, and district are required' }, { status: 400 })
    }

    // If setting as default, unset other defaults
    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: user.id, isDefault: true },
        data: { isDefault: false }
      })
    }

    // Check if this is user's first address (auto-set default)
    const existingCount = await prisma.address.count({ where: { userId: user.id } })
    const shouldBeDefault = isDefault || existingCount === 0

    const newAddress = await prisma.address.create({
      data: {
        userId: user.id,
        name,
        phone,
        address,
        city,
        district,
        postalCode: postalCode || '',
        isDefault: shouldBeDefault
      }
    })

    return NextResponse.json({ success: true, address: newAddress })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT - Update address
export async function PUT(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, name, phone, address, city, district, postalCode, isDefault } = body

    if (!id) {
      return NextResponse.json({ error: 'Address ID is required' }, { status: 400 })
    }

    // Check ownership
    const existingAddress = await prisma.address.findFirst({
      where: { id, userId: user.id }
    })

    if (!existingAddress) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 })
    }

    // If setting as default, unset other defaults
    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: user.id, isDefault: true },
        data: { isDefault: false }
      })
    }

    const updatedAddress = await prisma.address.update({
      where: { id },
      data: {
        name: name || existingAddress.name,
        phone: phone || existingAddress.phone,
        address: address || existingAddress.address,
        city: city || existingAddress.city,
        district: district || existingAddress.district,
        postalCode: postalCode ?? existingAddress.postalCode,
        isDefault: isDefault ?? existingAddress.isDefault
      }
    })

    return NextResponse.json({ success: true, address: updatedAddress })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE - Remove address
export async function DELETE(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Address ID is required' }, { status: 400 })
    }

    // Check ownership
    const address = await prisma.address.findFirst({
      where: { id, userId: user.id }
    })

    if (!address) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 })
    }

    // Check if address is used in any orders
    const ordersUsingAddress = await prisma.order.count({
      where: { addressId: id }
    })

    if (ordersUsingAddress > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete address used in orders. You can add a new default address instead.' 
      }, { status: 400 })
    }

    await prisma.address.delete({ where: { id } })

    // If deleted address was default, set another as default
    if (address.isDefault) {
      const firstAddress = await prisma.address.findFirst({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' }
      })
      if (firstAddress) {
        await prisma.address.update({
          where: { id: firstAddress.id },
          data: { isDefault: true }
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
