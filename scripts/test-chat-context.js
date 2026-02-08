
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testChatContext() {
  const message = "Do you have any sarees?";
  console.log(`🤖 Simulating User Message: "${message}"`);

  // 1. Simulate Product Search
  console.log('\n🔎 Testing Product Search...');
  const stopWords = ['the', 'is', 'a', 'an', 'and', 'or', 'do', 'you', 'have', 'i', 'need', 'want', 'looking', 'for', 'show', 'me', 'price', 'of', 'what', 'are'];
  const keywords = message.split(' ').filter(w => !stopWords.includes(w.toLowerCase()) && w.length > 2).slice(0, 3).join(' | ');
  
  console.log(`   Keywords extracted: "${keywords}"`);

  if (keywords) {
    const products = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: message, mode: 'insensitive' } },
          { description: { contains: keywords.split(' | ')[0], mode: 'insensitive' } },
          { category: { name: { contains: keywords.split(' | ')[0], mode: 'insensitive' } } }
        ],
        isActive: true
      },
      take: 5,
      select: { 
          name: true, 
          basePrice: true, 
          salePrice: true, 
          slug: true, 
          variants: { select: { stock: true } }
      }
    });

    if (products.length > 0) {
      console.log(`   ✅ Found ${products.length} products:`);
      products.forEach(p => console.log(`      - ${p.name} (৳${p.salePrice || p.basePrice})`));
    } else {
      console.log(`   ❌ No products found.`);
    }
  }

  // 2. Simulate Category Fetch
  console.log('\n📂 Testing Category Fetch...');
  const categories = await prisma.category.findMany({
    where: { isActive: true, parentId: null },
    select: { name: true, slug: true },
    take: 5
  });
  console.log(`   ✅ Fetched ${categories.length} categories: ${categories.map(c => c.name).join(', ')}`);

  // 3. Simulate Coupon Fetch
  console.log('\n🎟️ Testing Coupon Fetch...');
  const coupons = await prisma.coupon.findMany({
    where: { isActive: true },
    take: 3
  });
  console.log(`   ✅ Fetched ${coupons.length} coupons.`);
}

testChatContext()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
