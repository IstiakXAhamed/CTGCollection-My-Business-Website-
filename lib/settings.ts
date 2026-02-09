import { prisma } from './prisma'

export async function getSiteSettings() {
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

    return settings
  } catch (error: any) {
    console.error('getSiteSettings error:', error)
    // Return defaults if DB fails
    return {
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
  }
}
