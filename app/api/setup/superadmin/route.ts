import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// This endpoint creates the superadmin account
// It only works once - if superadmin exists, it will upgrade them
export async function GET() {
  try {
    const email = 'sanim1728@gmail.com'
    const password = 'Sanim@9944'
    const name = 'Super Admin'

    // Check if superadmin already exists
    const existingSuperadmin = await prisma.user.findFirst({
      where: { role: 'superadmin' }
    })

    if (existingSuperadmin) {
      return NextResponse.json({
        message: 'Superadmin already exists',
        email: existingSuperadmin.email
      })
    }

    // Check if user with this email exists
    const existingUser = await prisma.user.findUnique({ where: { email } })

    if (existingUser) {
      // Upgrade to superadmin
      await prisma.user.update({
        where: { email },
        data: { role: 'superadmin', isActive: true }
      })
      return NextResponse.json({
        success: true,
        message: 'User upgraded to superadmin!',
        email
      })
    }

    // Create new superadmin
    const hashedPassword = await hashPassword(password)
    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'superadmin',
        isActive: true
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Superadmin account created!',
      email,
      note: 'Login at /admin/login'
    })
  } catch (error: any) {
    console.error('Setup error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
