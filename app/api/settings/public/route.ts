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
        spinWheelConfig: true,
        pwaEnabled: true,
        pwaShowInstallLink: true,
        pwaPromptDelay: true
      }
    })

    return NextResponse.json({
      multiVendorEnabled: settings?.multiVendorEnabled ?? false,
      siteName: settings?.storeName || 'Silk Mart',
      storeName: settings?.storeName || 'Silk Mart',
      spinWheelConfig: settings?.spinWheelConfig || null,
      pwaEnabled: settings?.pwaEnabled ?? true,
      pwaShowInstallLink: settings?.pwaShowInstallLink ?? true,
      pwaPromptDelay: settings?.pwaPromptDelay ?? 30
    })
  } catch (error) {
    return NextResponse.json({ 
      multiVendorEnabled: false,
      siteName: 'Silk Mart',
      storeName: 'Silk Mart',
      spinWheelConfig: null,
      pwaEnabled: true,
      pwaShowInstallLink: true,
      pwaPromptDelay: 30
    })
  }
}

export const dynamic = 'force-dynamic'
