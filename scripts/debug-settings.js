const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkSettings() {
    try {
        console.log('--- Checking SiteSettings (main) ---');
        const settings = await prisma.siteSettings.findUnique({
            where: { id: 'main' }
        });
        
        if (!settings) {
            console.log('No "main" settings record found!');
        } else {
            console.log('Settings found:', JSON.stringify(settings, null, 2));
        }

        console.log('\n--- Checking SiteSetting (singular) count ---');
        const singularCount = await prisma.siteSetting.count();
        console.log('Singular SiteSetting count:', singularCount);

    } catch (error) {
        console.error('Error checking settings:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkSettings();
