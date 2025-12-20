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
    console.error('Settings GET error:', error)
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

// POST - Update site settings (admin only)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { spinWheelConfig, ...otherSettings } = body

    // Ensure spinWheelConfig is valid JSON (not undefined or malformed)
    const validSpinConfig = spinWheelConfig ? JSON.parse(JSON.stringify(spinWheelConfig)) : undefined
    
    // Check if settings exist
    const currentSettings = await (prisma as any).siteSettings.findUnique({
      where: { id: 'main' }
    })

    if (currentSettings) {
      // Build update data carefully
      const updateData: any = {
        updatedAt: new Date()
      }
      
      // Only add spinWheelConfig if it's provided
      if (validSpinConfig !== undefined) {
        updateData.spinWheelConfig = validSpinConfig
      }
      
      // Add other settings (filter out empty values)
      Object.entries(otherSettings).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          updateData[key] = value
        }
      })

      await (prisma as any).siteSettings.update({
        where: { id: 'main' },
        data: updateData
      })
    } else {
      // Create new settings
      await (prisma as any).siteSettings.create({
        data: {
          id: 'main',
          ...otherSettings,
          spinWheelConfig: validSpinConfig
        }
      })
    }
    
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Settings update error:', error?.message || error)
    return NextResponse.json({ 
      error: 'Failed to update settings', 
      details: error?.message || 'Unknown error' 
    }, { status: 500 })
  }
}
