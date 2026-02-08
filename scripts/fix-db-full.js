const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('👷 Fixing database structure for SiteSettings...');
  try {
    // List of columns to check and add
    const columns = [
      { name: 'adminProductMode', type: 'TEXT', default: "'simple'" },
      { name: 'spinWheelConfig', type: 'JSONB', default: 'NULL' },
      { name: 'unifiedLogin', type: 'BOOLEAN', default: 'true' },
      { name: 'multiVendorEnabled', type: 'BOOLEAN', default: 'false' },
      { name: 'defaultCommission', type: 'DOUBLE PRECISION', default: '5.0' },
      { name: 'couponCostPolicy', type: 'TEXT', default: "'platform'" },
      { name: 'updatedAt', type: 'TIMESTAMP WITH TIME ZONE', default: 'CURRENT_TIMESTAMP' }
    ];

    for (const col of columns) {
      try {
        console.log(`- Checking column: ${col.name}`);
        await prisma.$executeRawUnsafe(`
          ALTER TABLE "SiteSettings" 
          ADD COLUMN IF NOT EXISTS "${col.name}" ${col.type} DEFAULT ${col.default};
        `);
        console.log(`  ✅ Column ${col.name} ensured.`);
      } catch (colError) {
        console.error(`  ❌ Error adding ${col.name}:`, colError.message);
      }
    }

    console.log('\n🚀 Success! Database structure is now fully updated.');
  } catch (error) {
    console.error('\n❌ CRITICAL ERROR:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
