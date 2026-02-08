const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  // Check if Fragrance already exists
  const existingFragrance = await prisma.category.findUnique({
    where: { slug: 'fragrance' }
  })

  if (existingFragrance) {
     console.log('Fragrance category already exists.')
     // If Beauty exists, move products to Fragrance and delete Beauty
     const beauty = await prisma.category.findUnique({
       where: { slug: 'beauty' }
     })
     if (beauty) {
       console.log('Moving products from Beauty to Fragrance...')
       await prisma.product.updateMany({
         where: { categoryId: beauty.id },
         data: { categoryId: existingFragrance.id }
       })
       await prisma.category.delete({ where: { id: beauty.id } })
       console.log('✅ Beauty category deleted and products moved.')
     }
  } else {
    // Try to rename Beauty to Fragrance
    const beauty = await prisma.category.findUnique({
      where: { slug: 'beauty' }
    })

    if (beauty) {
      await prisma.category.update({
        where: { id: beauty.id },
        data: {
          name: 'Fragrance',
          slug: 'fragrance',
          description: 'Premium fragrances and perfumes'
        }
      })
      console.log('✅ Beauty renamed to Fragrance.')
    } else {
      // Create Fragrance from scratch if Beauty doesn't exist
      await prisma.category.create({
        data: {
          name: 'Fragrance',
          slug: 'fragrance',
          description: 'Premium fragrances and perfumes',
          isActive: true
        }
      })
      console.log('✅ Fragrance category created.')
    }
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect())
