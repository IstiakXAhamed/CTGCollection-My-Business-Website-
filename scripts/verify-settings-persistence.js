const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifySettings() {
    try {
        console.log('--- Verifying Settings Persistence ---');
        
        // 1. Update settings
        const updated = await prisma.siteSettings.upsert({
            where: { id: 'main' },
            update: {
                storeName: 'Silk Mart TEST',
                chatStatus: 'away',
                storeTagline: 'Verified Tagline',
                storeDescription: 'Verified Description'
            },
            create: {
                id: 'main',
                storeName: 'Silk Mart TEST',
                chatStatus: 'away'
            }
        });
        
        console.log('Update success. Current chatStatus:', updated.chatStatus);
        
        // 2. Fetch to verify
        const fetched = await prisma.siteSettings.findUnique({
            where: { id: 'main' }
        });
        
        if (fetched.chatStatus === 'away' && fetched.storeName === 'Silk Mart TEST') {
            console.log('✅ Verification Passed: Settings persisted correctly.');
        } else {
            console.log('❌ Verification Failed: Settings mismatch.');
        }

        // 3. Reset to intended Silk Mart name (clean up test)
        await prisma.siteSettings.update({
            where: { id: 'main' },
            data: { storeName: 'Silk Mart' }
        });

    } catch (error) {
        console.error('Error during verification:', error);
    } finally {
        await prisma.$disconnect();
    }
}

verifySettings();
