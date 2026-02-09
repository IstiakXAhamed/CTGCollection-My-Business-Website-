import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const db = prisma as any

export async function GET() {
  try {
    const settings = await db.siteSettings.findUnique({
      where: { id: 'main' },
      select: {
        multiVendorEnabled: true,
        storeName: true,
        spinWheelConfig: true
      }
    })

    return NextResponse.json({
      multiVendorEnabled: settings?.multiVendorEnabled ?? false,
      siteName: settings?.storeName || 'Silk Mart',
      spinWheelConfig: settings?.spinWheelConfig || null
    })
  } catch (error) {
    return NextResponse.json({ 
      multiVendorEnabled: false,
      siteName: 'Silk Mart',
      spinWheelConfig: null
    })
  }
}

export const dynamic = 'force-dynamic'
