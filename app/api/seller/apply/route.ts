import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'

const db = prisma as any

// POST - Submit seller application (authenticated users)
export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    
    if (!user) {
      return NextResponse.json({ error: 'Please login to apply' }, { status: 401 })
    }

    // Check if already a seller
    const existingShop = await db.shop.findUnique({ where: { ownerId: user.id } })
    if (existingShop) {
      return NextResponse.json({ error: 'You already have a shop' }, { status: 400 })
    }

    // Check if already applied
    const existingApp = await db.sellerApplication.findUnique({ where: { userId: user.id } })
    if (existingApp) {
      return NextResponse.json({ 
        error: `You already have a ${existingApp.status} application`,
        status: existingApp.status
      }, { status: 400 })
    }

    const body = await request.json()
    const { 
      shopName, shopDescription, category,
      nidNumber, nidImage,
      passportNumber, passportImage,
      bankName, bankAccountNo, bankBranch,
      phone, address, city
    } = body

    if (!shopName || !phone) {
      return NextResponse.json({ error: 'Shop name and phone are required' }, { status: 400 })
    }

    // Determine verification tier
    let verificationTier = 'basic'
    if (nidImage && passportImage && bankAccountNo) {
      verificationTier = 'verified'
    }

    const application = await db.sellerApplication.create({
      data: {
        userId: user.id,
        shopName,
        shopDescription,
        category,
        nidNumber,
        nidImage,
        passportNumber,
        passportImage,
        bankName,
        bankAccountNo,
        bankBranch,
        phone,
        address,
        city,
        verificationTier,
        status: 'pending'
      }
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Application submitted! We will review it soon.',
      application 
    })
  } catch (error: any) {
    console.error('Submit application error:', error)
    return NextResponse.json({ error: error.message || 'Failed to submit' }, { status: 500 })
  }
}

// GET - Check application status (authenticated)
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const application = await db.sellerApplication.findUnique({
      where: { userId: user.id }
    })

    const shop = await db.shop.findUnique({ where: { ownerId: user.id } })

    return NextResponse.json({ 
      application,
      hasShop: !!shop,
      shop
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
