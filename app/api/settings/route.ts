import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const revalidate = 0  // Never cache

// GET - Fetch site settings (public)
export async function GET() {
  try {
    // Get or create default settings
    let settings = await (prisma as any).siteSettings.findUnique({
      where: { id: 'main' }
    })

    if (!settings) {
      settings = await (prisma as any).siteSettings.create({
        data: { id: 'main' }
      })
    }

    return NextResponse.json({ settings })
  } catch (error: any) {
    // If model doesn't exist yet, return defaults
    return NextResponse.json({
      settings: {
        storeName: 'CTG Collection',
        storeTagline: 'Premium E-Commerce Store',
        storeEmail: 'support@ctgcollection.com',
        storePhone: '+880 1234 567890',
        storeAddress: 'Chittagong, Bangladesh',
        addressLine2: 'GEC Circle, 4000',
        workingDays: 'Sat - Thu',
        workingHours: '9AM - 9PM',
        offDays: 'Friday: 3PM - 9PM',
        aboutTitle: 'About CTG Collection',
        copyrightText: '© 2024 CTG Collection. All rights reserved.'
      }
    })
  }
}
