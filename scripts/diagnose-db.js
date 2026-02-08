const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function diagnose() {
  console.log('🔍 Database Diagnosis Start...');
  
  try {
    // 1. Test basic connection
    console.log('📡 Testing connection to:', process.env.DATABASE_URL?.split('@')[1] || 'DATABASE_URL NOT SET');
    
    // 2. Count Products
    const productCount = await prisma.product.count();
    console.log('📦 Total Products in Database:', productCount);
    
    const activeProductCount = await prisma.product.count({ where: { isActive: true } });
    console.log('✅ Active Products:', activeProductCount);

    // 3. Count Categories
    const categoryCount = await prisma.category.count();
    console.log('📁 Total Categories:', categoryCount);

    // 4. Check Site Settings
    const settings = await prisma.siteSettings.findFirst();
    if (settings) {
      console.log('⚙️ Site Settings Found: Yes');
      console.log('🏷️ Store Name:', settings.storeName);
    } else {
      console.log('⚠️ Site Settings Found: No (Database might be uninitialized)');
    }

    // 5. Test specific query
    const firstProduct = await prisma.product.findFirst({
        select: { name: true, category: { select: { name: true } } }
    });
    if (firstProduct) {
        console.log('✨ Data Sample:', `[${firstProduct.name}] in category [${firstProduct.category?.name || 'None'}]`);
    }

  } catch (error) {
    console.error('❌ DIAGNOSIS FAILED:');
    if (error.message.includes('Can\'t reach database server')) {
      console.error('👉 CAUSE: The app cannot reach the Neon server. Check your DATABASE_URL in the cPanel environment variables.');
    } else if (error.message.includes('relation "Product" does not exist')) {
      console.error('👉 CAUSE: Tables are missing! You might need to run: npx prisma db push');
    } else {
      console.error(error);
    }
  } finally {
    await prisma.$disconnect();
    console.log('🏁 Diagnosis Complete.');
  }
}

diagnose();
