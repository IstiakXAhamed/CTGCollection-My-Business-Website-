const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function deepInspect() {
  console.log('🧐 Deep Inspection Starting...');
  
  try {
    // 1. Check for Category Linkage
    const products = await prisma.product.findMany({
      include: { category: true }
    });

    console.log(`📊 Statistics:`);
    console.log(`- Total Products: ${products.length}`);
    console.log(`- Products missing category: ${products.filter(p => !p.category).length}`);
    console.log(`- Products missing slug: ${products.filter(p => !p.slug).length}`);
    console.log(`- Products marked inactive: ${products.filter(p => !p.isActive).length}`);

    // 2. Check for invalid JSON in images
    console.log('\n🖼️ Image Field Validation:');
    products.forEach(p => {
        try {
            if (p.images) JSON.parse(p.images);
        } catch (e) {
            console.log(`❌ Invalid JSON in Product [${p.name}]: "${p.images}"`);
        }
    });

    // 3. Print First 3 Products Raw Data (truncated)
    console.log('\n📄 Data Sample (Top 3):');
    products.slice(0, 3).forEach(p => {
        console.log(`- [${p.id}] ${p.name} | Cat: ${p.category?.name || 'MISSING'} | Slug: ${p.slug} | Price: ${p.basePrice}`);
    });

    // 4. Test the exact query the API uses
    console.log('\n🧪 Testing API Query Simulation...');
    const apiQueryResults = await prisma.product.findMany({
      where: { isActive: true },
      take: 12
    });
    console.log(`- API Sample Query returned: ${apiQueryResults.length} items`);

  } catch (error) {
    console.error('❌ INSPECTION FAILED:', error);
  } finally {
    await prisma.$disconnect();
  }
}

deepInspect();
