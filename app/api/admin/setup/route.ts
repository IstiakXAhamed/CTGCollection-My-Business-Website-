import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcrypt'

const SETUP_KEY = process.env.ADMIN_SETUP_KEY || 'CTGCOLLECTION2024SETUP'

export async function POST(request: NextRequest) {
  try {
    const { setupKey, name, email, password } = await request.json()

    // Verify setup key
    if (setupKey !== SETUP_KEY) {
      return NextResponse.json(
        { error: 'Invalid setup key. Unauthorized access.' },
        { status: 403 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'admin'
      }
    })

    return NextResponse.json({
      message: 'Admin account created successfully',
      adminId: admin.id
    }, { status: 201 })
  } catch (error: any) {
    console.error('Admin setup error:', error)
    return NextResponse.json(
      { error: 'Failed to create admin account' },
      { status: 500 }
    )
  }
}
