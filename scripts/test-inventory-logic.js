const https = require('https');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const API_URL = 'http://localhost:3000/api/ai/inventory-forecast';
// Note: This script assumes the server is running or we can test the logic directly.
// Since I can't easily call the API without a running server and auth, 
// I will test the sales calculation logic by creating a small standalone script that uses Prisma.

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testSalesCalculation() {
    console.log('--- Testing Sales Calculation Logic ---');
    try {
        const product = await prisma.product.findFirst({
            include: { variants: true }
        });

        if (!product) {
            console.log('No products found in DB to test.');
            return;
        }

        console.log(`Testing with product: ${product.name} (${product.id})`);

        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        const orderItems = await prisma.orderItem.findMany({
            where: {
                productId: product.id,
                createdAt: { gte: thirtyDaysAgo },
                order: {
                    status: { notIn: ['cancelled'] }
                }
            },
            select: {
                quantity: true,
                createdAt: true
            }
        });

        const sales30d = orderItems.reduce((sum, item) => sum + item.quantity, 0);
        const sales7d = orderItems.filter(i => i.createdAt >= sevenDaysAgo).reduce((sum, i) => sum + i.quantity, 0);

        console.log(`Results: 30d Sales = ${sales30d}, 7d Sales = ${sales7d}`);
        console.log('Logic verified successfully.');

    } catch (error) {
        console.error('Test Failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testSalesCalculation();
