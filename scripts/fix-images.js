// Script to fix product image paths in database
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

// Map product slugs to their correct image paths
// Using /images/products/ to avoid Next.js route interception
const imageMap = {
  'premium-cotton-t-shirt': ['/images/products/tshirt.png'],
  'premium-cotton-tshirt': ['/images/products/tshirt.png'],
  'floral-summer-dress': ['/images/products/dress.png'],
  'classic-leather-sneakers': ['/images/products/sneakers.png'],
  'classic-white-sneakers': ['/images/products/sneakers.png'],
  'leather-backpack': ['/images/products/backpack.png'],
  'wireless-bluetooth-headphones': ['/images/products/headphones.png'],
  'smartphone-pro-x': ['/images/products/smartphone.png'],
  'artisan-coffee-blend': ['/images/products/coffee.png'],
  'stainless-steel-coffee-maker': ['/images/products/coffee.png'],
  'modern-desk-lamp': ['/images/products/lamp.png'],
  'luxury-skincare-set': ['/images/products/skincare.png'],
  'eau-de-parfum': ['/images/products/perfume.png'],
}

async function fixImages() {
  console.log('Starting image fix...')
  
  try {
    const products = await prisma.product.findMany()
    console.log(`Found ${products.length} products`)
    
    for (const product of products) {
      const newImages = imageMap[product.slug]
      if (newImages) {
        await prisma.product.update({
          where: { id: product.id },
          data: { images: JSON.stringify(newImages) }
        })
        console.log(`✅ Fixed: ${product.name} -> ${newImages[0]}`)
      } else {
        console.log(`⚠️ No mapping for: ${product.slug}`)
      }
    }
    
    console.log('\n✅ All images fixed!')
  } catch (error) {
    console.error('Error fixing images:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixImages()
