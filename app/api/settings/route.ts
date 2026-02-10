import { NextRequest, NextResponse } from 'next/server'
import { getSiteSettings } from '@/lib/settings'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic' // Settings must always be fresh for PUT mutations

// GET - Fetch site settings (public)
export async function GET() {
  try {
    const settings = await getSiteSettings()
    return NextResponse.json({ settings })
  } catch (error: any) {
    console.error('[Settings API] GET error:', error?.message)
    return NextResponse.json({ settings: null, error: 'Failed to fetch settings' }, { status: 500 })
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

    // Filter and sanitize body — STRICTLY whitelist only
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
      } else if (['shippingCost', 'freeShippingMin', 'pointsPerTaka', 'pointsValue', 'defaultCommission', 'pwaPromptDelay'].includes(key)) {
        data[key] = parseFloat(value) || 0
      } else if (typeof value === 'boolean' || [
        'promoEnabled', 'codEnabled', 'sslEnabled', 'bkashEnabled', 'nagadEnabled', 'rocketEnabled', 
        'unifiedLogin', 'multiVendorEnabled', 'returnsEnabled', 'showFreeShipping', 
        'showEasyReturns', 'showCOD', 'showAuthentic', 'pwaEnabled', 'pwaShowInstallLink'
      ].includes(key)) {
        data[key] = Boolean(value)
      } else {
        data[key] = String(value)
      }
    })

    // Don't attempt empty update
    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    console.log('[Settings API] Filtered data keys:', Object.keys(data))

    let result
    let skippedFields: string[] = []
    let currentData = { ...data }
    let success = false
    let lastError: any = null

    // Retry loop: gracefully handles schema mismatches by removing unknown fields
    for (let attempt = 0; attempt < 10; attempt++) {
      try {
        result = await (prisma as any).siteSettings.upsert({
          where: { id: 'main' },
          update: currentData,
          create: {
            id: 'main',
            ...currentData
          }
        })
        success = true
        break
      } catch (error: any) {
        lastError = error
        const msg = error?.message || ''
        console.warn(`[Settings API] Attempt ${attempt + 1} failed:`, msg)
        
        // Handle "Unknown argument" — field exists in whitelist but not in DB schema
        if (msg.includes('Unknown argument')) {
          const match = msg.match(/Unknown argument `([^`]+)`/)
          const problematicField = match ? match[1] : null
          
          if (problematicField && currentData[problematicField] !== undefined) {
            console.warn(`[Settings API] Removing unknown field: ${problematicField}`)
            skippedFields.push(problematicField)
            const { [problematicField]: _, ...nextData } = currentData
            currentData = nextData
            if (Object.keys(currentData).length === 0) break
            continue
          }
        }
        
        // Handle "Invalid value" — type mismatch
        if (msg.includes('Invalid value') || msg.includes('Expected')) {
          const fieldMatch = msg.match(/Argument `([^`]+)`/)
          const problematicField = fieldMatch ? fieldMatch[1] : null
          
          if (problematicField && currentData[problematicField] !== undefined) {
            console.warn(`[Settings API] Removing type-mismatched field: ${problematicField}`)
            skippedFields.push(problematicField)
            const { [problematicField]: _, ...nextData } = currentData
            currentData = nextData
            if (Object.keys(currentData).length === 0) break
            continue
          }
        }
        
        // Unknown error — stop retrying
        break
      }
    }

    if (!success) {
      console.error('[Settings API] All attempts failed:', lastError?.message)
      return NextResponse.json({ 
        error: 'Failed to update settings', 
        details: lastError?.message || 'Database error',
        skippedFields
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      settings: result,
      skippedFields: skippedFields.length > 0 ? skippedFields : undefined
    })
  } catch (error: any) {
    console.error('[Settings API] CRITICAL error:', error?.message, error?.stack)
    return NextResponse.json({ 
      error: 'Failed to update settings', 
      details: error?.message || 'Unknown server error' 
    }, { status: 500 })
  }
}
