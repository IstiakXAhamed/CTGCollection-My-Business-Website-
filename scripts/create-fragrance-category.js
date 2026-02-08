const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const fragrance = await prisma.category.upsert({
    where: { slug: 'fragrance' },
    update: { isActive: true },
    create: {
      name: 'Fragrance',
      slug: 'fragrance',
      description: 'Premium fragrances and perfumes',
      isActive: true,
    },
  })
  console.log('✅ Fragrance category ready:', fragrance.name)
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect())
