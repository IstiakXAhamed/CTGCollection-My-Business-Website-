const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Checking SiteSettings columns in database...');
  try {
    const columns = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'SiteSettings'
    `;
    
    console.log('Current columns in SiteSettings:');
    if (Array.isArray(columns) && columns.length > 0) {
      columns.forEach(c => {
        console.log(`- ${c.column_name} (${c.data_type})`);
      });

      const schemaFields = [
        'adminProductMode', 'spinWheelConfig', 'unifiedLogin', 
        'multiVendorEnabled', 'defaultCommission', 'couponCostPolicy'
      ];
      
      const missing = schemaFields.filter(f => 
        !columns.find(c => c.column_name.toLowerCase() === f.toLowerCase())
      );
      
      if (missing.length > 0) {
          console.log('\n🚨 MISSING COLUMNS DETECTED:');
          missing.forEach(m => console.log(`- ${m}`));
          console.log('\nTIP: Run "npx prisma db push" to add these columns.');
      } else {
          console.log('\n✅ All expected columns are present.');
      }
    } else {
      console.log('❌ SiteSettings table not found or empty.');
    }
  } catch (error) {
    console.error('❌ Error querying database:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
