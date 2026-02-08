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
        storeName: 'Silk Mart',
        storeTagline: 'Premium E-Commerce Store',
        storeEmail: 'support@ctgcollection.com',
        storePhone: '+880 1234 567890',
        storeAddress: 'Chittagong, Bangladesh',
        addressLine2: 'GEC Circle, 4000',
        workingDays: 'Sat - Thu',
        workingHours: '9AM - 9PM',
        offDays: 'Friday: 3PM - 9PM',
        aboutTitle: 'About Silk Mart',
        copyrightText: '© 2024 Silk Mart. All rights reserved.',
        supportEmail: 'support@ctgcollection.com',
        supportPhone: '+880 1234 567890',
        aiContactEmail: 'support@ctgcollection.com',
        aiContactPhone: '+880 1234 567890',
        adminProductMode: 'simple'
      }
    })
  }
}

// PUT - Update site settings (admin only)
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    // Destructure to remove system fields and special JSON fields
    const { id, createdAt, updatedAt, spinWheelConfig, ...otherSettings } = body

    // Ensure spinWheelConfig is valid JSON (not undefined or malformed)
    // Only parse if it exists and is not null
    const validSpinConfig = spinWheelConfig !== undefined ? spinWheelConfig : undefined
    
    // Check if settings exist
    const currentSettings = await (prisma as any).siteSettings.findUnique({
      where: { id: 'main' }
    })

    if (currentSettings) {
      // Build update data
      // We ONLY include fields that are present in the body to allow partial updates
      const updateData: any = {
        updatedAt: new Date()
      }
      
      // Handle spinWheelConfig separately
      if (validSpinConfig !== undefined) {
        updateData.spinWheelConfig = validSpinConfig
      }
      
      // Add other settings
      Object.entries(otherSettings).forEach(([key, value]) => {
        // filter out nulls or undefined if necessary, but usually we want to allow updating to null if schema allows
        if (value !== undefined) {
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
          spinWheelConfig: validSpinConfig !== undefined ? validSpinConfig : undefined,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })
    }
    
    // Return the updated settings to the client to keep state in sync
    const updatedSettings = await (prisma as any).siteSettings.findUnique({
      where: { id: 'main' }
    })

    return NextResponse.json({ success: true, settings: updatedSettings })
  } catch (error: any) {
    console.error('Settings update error:', error?.message || error)
    return NextResponse.json({ 
      error: 'Failed to update settings', 
      details: error?.message || 'Unknown error' 
    }, { status: 500 })
  }
}
