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
        data: { id: 'main', storeName: 'Silk Mart' }
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
        adminProductMode: 'simple',
        chatStatus: 'online',
        promoEnabled: true,
        promoCode: 'WELCOME10',
        promoMessage: '🎉 FLASH SALE! Use code WELCOME10 for 10% OFF'
      }
    })
  }
}

// PUT - Update site settings (admin only)
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    console.log('[Settings API] PUT received keys:', Object.keys(body))

    const whitelist = [
      'storeName', 'storeTagline', 'storeDescription', 'logo',
      'stat1Value', 'stat1Label', 'stat2Value', 'stat2Label', 'stat3Value', 'stat3Label', 'stat4Value', 'stat4Label',
      'returnsEnabled', 'showFreeShipping', 'showEasyReturns', 'showCOD', 'showAuthentic',
      'featureShippingTitle', 'featureShippingDesc', 'featureReturnTitle', 'featureReturnDesc', 'featureCODTitle', 'featureCODDesc', 'featureAuthenticTitle', 'featureAuthenticDesc',
      'value1Title', 'value1Desc', 'value2Title', 'value2Desc', 'value3Title', 'value3Desc', 'value4Title', 'value4Desc',
      'storeEmail', 'email2', 'storePhone', 'phone2', 'storeAddress', 'addressLine2',
      'workingDays', 'workingHours', 'offDays',
      'facebook', 'instagram', 'twitter', 'youtube', 'linkedin', 'whatsapp',
      'aboutTitle', 'aboutContent', 'aboutMission', 'aboutVision',
      'footerAbout', 'copyrightText',
      'metaTitle', 'metaDescription', 'metaKeywords',
      'googleMapsEmbed', 'chatStatus',
      'aiContactEmail', 'aiContactPhone', 'supportEmail', 'supportPhone',
      'promoEnabled', 'promoCode', 'promoMessage', 'promoEndTime',
      'shippingCost', 'freeShippingMin',
      'codEnabled', 'sslEnabled',
      'bkashEnabled', 'bkashNumber', 'nagadEnabled', 'nagadNumber', 'rocketEnabled', 'rocketNumber',
      'pointsPerTaka', 'pointsValue',
      'unifiedLogin', 'multiVendorEnabled', 'defaultCommission', 'couponCostPolicy',
      'adminProductMode', 'pwaEnabled', 'pwaPromptDelay', 'pwaShowInstallLink'
    ]

    let data: any = {}

    if (body.spinWheelConfig !== undefined) {
      data.spinWheelConfig = body.spinWheelConfig
    }

    // Filter and sanitize body
    Object.keys(body).forEach(key => {
      if (!whitelist.includes(key)) return
      
      const value = body[key]
      if (value === undefined) return

      // Handle specific types
      if (key === 'promoEndTime') {
        if (!value) {
          data[key] = null
        } else {
          const d = new Date(value)
          data[key] = isNaN(d.getTime()) ? null : d
        }
      } else if (['shippingCost', 'freeShippingMin', 'pointsPerTaka', 'pointsValue', 'defaultCommission'].includes(key)) {
        data[key] = parseFloat(value) || 0
      } else if (typeof value === 'boolean' || [
        'promoEnabled', 'codEnabled', 'sslEnabled', 'bkashEnabled', 'nagadEnabled', 'rocketEnabled', 
        'unifiedLogin', 'multiVendorEnabled', 'returnsEnabled', 'showFreeShipping', 
        'showEasyReturns', 'showCOD', 'showAuthentic'
      ].includes(key)) {
        data[key] = Boolean(value)
      } else {
        data[key] = value
      }
    })

    const attemptUpdate = async (updateData: any) => {
      return await (prisma as any).siteSettings.upsert({
        where: { id: 'main' },
        update: updateData,
        create: {
          id: 'main',
          ...updateData
        }
      })
    }

    let result
    let skippedFields: string[] = []
    let currentData = { ...data }
    let success = false
    let lastError: any = null

    // Loop to handle potential multiple schema mismatches (missing columns)
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        result = await attemptUpdate(currentData)
        success = true
        break
      } catch (error: any) {
        lastError = error
        console.warn(`[Settings API] Attempt ${attempt + 1} failed:`, error.message)
        
        if (error.message.includes('Unknown argument')) {
          const match = error.message.match(/Unknown argument `([^`]+)`/)
          const problematicField = match ? match[1] : null
          
          if (problematicField && currentData[problematicField] !== undefined) {
            console.warn(`[Settings API] Removing problematic field: ${problematicField}`)
            skippedFields.push(problematicField)
            const { [problematicField]: _, ...nextData } = currentData
            currentData = nextData
            continue // Try again with the field removed
          }
        }
        
        // If it's not an 'Unknown argument' or we couldn't identify the field, stop
        break
      }
    }

    if (!success) {
      throw lastError || new Error('Failed to update settings after multiple attempts')
    }

    return NextResponse.json({ 
      success: true, 
      settings: result,
      skippedFields: skippedFields.length > 0 ? skippedFields : undefined
    })
  } catch (error: any) {
    console.error('Settings update CRITICAL error:', error)
    return NextResponse.json({ 
      error: 'Failed to update settings', 
      details: error?.message || 'Unknown database error' 
    }, { status: 500 })
  }
}
