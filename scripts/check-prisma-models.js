const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkPrisma() {
    try {
        console.log('--- Prisma Model Check ---');
        const models = Object.keys(prisma).filter(key => !key.startsWith('_') && typeof prisma[key] === 'object');
        console.log('Available models in Prisma client:', models);
        
        if (models.includes('siteSettings')) {
            console.log('siteSettings model is present.');
            const count = await prisma.siteSettings.count();
            console.log('Count:', count);
        } else {
            console.log('siteSettings model is MISSING from Prisma client!');
        }

        if (models.includes('siteSetting')) {
            console.log('siteSetting (singular) model is present.');
        }

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

checkPrisma();
