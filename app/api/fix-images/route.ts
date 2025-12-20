import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// POST - Fix all product images to correct paths
export async function POST() {
  try {
    // Get all products
    const products = await prisma.product.findMany({
      select: { id: true, slug: true, images: true }
    })

    // Map slug to correct image path
    const imageMap: Record<string, string> = {
      'premium-cotton-t-shirt': '/products/tshirt.png',
      'floral-summer-dress': '/products/dress.png',
      'classic-leather-sneakers': '/products/sneakers.png',
      'leather-backpack': '/products/backpack.png',
      'wireless-bluetooth-headphones': '/products/headphones.png',
      'smartphone-pro-x': '/products/smartphone.png',
      'artisan-coffee-blend': '/products/coffee.png',
      'modern-desk-lamp': '/products/lamp.png',
      'luxury-skincare-set': '/products/skincare.png',
      'eau-de-parfum': '/products/perfume.png',
    }

    let updated = 0
    for (const product of products) {
      const newImagePath = imageMap[product.slug]
      if (newImagePath) {
        await prisma.product.update({
          where: { id: product.id },
          data: { images: JSON.stringify([newImagePath]) }
        })
        updated++
        console.log(`Fixed: ${product.slug} -> ${newImagePath}`)
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Fixed ${updated} product images`,
      updated 
    })
  } catch (error: any) {
    console.error('Fix images error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// GET - Check current image paths
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      select: { id: true, name: true, slug: true, images: true }
    })

    return NextResponse.json({ 
      products: products.map(p => ({
        name: p.name,
        slug: p.slug,
        images: p.images
      }))
    })
  } catch (error: any) {
    console.error('Get images error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
