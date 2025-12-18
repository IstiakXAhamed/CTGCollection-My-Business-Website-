// Script to generate both receipt versions for comparison
const { saveReceiptToFile } = require('./lib/receipt')
const { savePremiumReceiptToFile } = require('./lib/receipt-premium')
const { prisma } = require('./lib/prisma')

async function generateBothReceipts() {
  try {
    // Get the most recent order
    const order = await prisma.order.findFirst({
      orderBy: { createdAt: 'desc' }
    })

    if (!order) {
      console.log('No orders found in database')
      return
    }

    console.log(`Found order: ${order.orderNumber} (ID: ${order.id})`)
    console.log('\nGenerating receipts...\n')

    // Generate original receipt
    const originalPath = await saveReceiptToFile(order.id)
    console.log('✓ Original Receipt:', originalPath)

    // Generate premium receipt
    const premiumPath = await savePremiumReceiptToFile(order.id)
    console.log('✓ Premium Receipt:', premiumPath)

    console.log('\n=== Open these URLs in your browser ===')
    console.log(`Original: http://localhost:3000${originalPath}`)
    console.log(`Premium:  http://localhost:3000${premiumPath}`)

  } catch (error) {
    console.error('Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

generateBothReceipts()
