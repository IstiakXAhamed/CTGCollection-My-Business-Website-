const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function simulateApi() {
  console.log('🧪 Simulating Public API Query...');
  
  try {
    // Exact where clause from app/api/products/route.ts
    const where = { isActive: true };
    
    console.log('📡 Params: skip=0, take=12, where={ isActive: true }');
    
    // Simulate the Promise.all from the API
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          shop: { select: { id: true, name: true, slug: true, logo: true } },
          variants: { select: { id: true, size: true, color: true, stock: true, sku: true } },
          reviews: {
            where: { isApproved: true },
            include: { user: { select: { name: true } } },
            orderBy: { createdAt: 'desc' }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 12
      }),
      prisma.product.count({ where })
    ]);

    console.log(`✅ Result: found ${products.length} products (total count: ${total})`);
    
    if (products.length > 0) {
        console.log('✨ Sample Product JSON:', JSON.stringify(products[0], null, 2));
    } else {
        console.log('❌ ZERO PRODUCTS RETURNED. There is something filtering them out.');
    }

  } catch (error) {
    console.error('❌ SIMULATION CRASHED:', error);
    if (error.message.includes('Invalid `prisma.product.findMany()` invitation')) {
        console.log('👉 Insight: This usually means there is a schema mismatch (e.g. "shop" relation doesnt exist in generated client).');
    }
  } finally {
    await prisma.$disconnect();
  }
}

simulateApi();
