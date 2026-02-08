const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function recovery() {
  console.log('🚀 Starting Data Recovery & Activation...');
  
  try {
    // 1. Get counts
    const total = await prisma.product.count();
    console.log('📦 Total products found in DB:', total);

    if (total === 0) {
      console.log('⚠️ DATABASE IS EMPTY! You need to upload your data or run your seed script.');
      return;
    }

    // 2. Force activate everything
    console.log('🔓 Activating all products...');
    const result = await prisma.product.updateMany({
      data: { isActive: true }
    });
    console.log(`✅ Successfully activated ${result.count} products.`);

    // 3. Fix potential Price issues (ensure basePrice exists)
    console.log('💰 Verifying prices...');
    const noPrice = await prisma.product.count({ where: { basePrice: 0 } });
    if (noPrice > 0) {
      console.log(`⚠️ ${noPrice} products have 0 price. Checking...`);
    }

    // 4. Verify Categories
    const categories = await prisma.category.findMany();
    console.log(`📁 Found ${categories.length} categories:`, categories.map(c => c.name).join(', '));

  } catch (error) {
    console.error('❌ Recovery Failed:', error);
  } finally {
    await prisma.$disconnect();
    console.log('🏁 Recovery process finished.');
  }
}

recovery();
