// Simple Demo Orders Seed Script - Fixed for Schema
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting order seed...')

  // Get customers with their addresses
  const customers = await prisma.user.findMany({
    where: { role: 'customer' },
    take: 60,
    select: { 
      id: true, 
      name: true, 
      phone: true,
      addresses: { take: 1, select: { id: true } }
    }
  })

  const products = await prisma.product.findMany({
    take: 20,
    select: { id: true, name: true, basePrice: true, salePrice: true }
  })

  if (customers.length === 0 || products.length === 0) {
    console.log('❌ Need customers and products first!')
    return
  }

  // Filter customers who have addresses
  const customersWithAddress = customers.filter(c => c.addresses && c.addresses.length > 0)
  
  if (customersWithAddress.length === 0) {
    console.log('❌ No customers have addresses! Creating demo address...')
    
    // Create a demo address for first customer
    const demoAddress = await prisma.address.create({
      data: {
        name: 'Demo Customer',
        phone: '+880 1700000000',
        address: 'House 1, Road 1, Dhanmondi',
        city: 'Dhaka',
        district: 'Dhaka',
        postalCode: '1205',
        user: { connect: { id: customers[0].id } }
      }
    })
    
    customersWithAddress.push({
      ...customers[0],
      addresses: [{ id: demoAddress.id }]
    })
  }

  console.log(`Found ${customersWithAddress.length} customers with addresses and ${products.length} products`)

  const statuses = ['pending', 'processing', 'shipped', 'delivered']
  const paymentMethods = ['cod', 'sslcommerz']
  let count = 0

  for (let i = 0; i < 100; i++) {
    const customer = customersWithAddress[i % customersWithAddress.length]
    const product = products[i % products.length]
    const price = product.salePrice || product.basePrice || 1000
    const quantity = 1 + (i % 3)
    const subtotal = price * quantity
    const shippingCost = subtotal >= 2000 ? 0 : 60
    const total = subtotal + shippingCost
    const status = statuses[i % statuses.length]
    const paymentMethod = paymentMethods[i % paymentMethods.length]

    try {
      await prisma.order.create({
        data: {
          orderNumber: `ORD-2024-${String(i + 1).padStart(4, '0')}`,
          user: { connect: { id: customer.id } },
          address: { connect: { id: customer.addresses[0].id } },
          name: customer.name,
          phone: customer.phone || '+880 1700000000',
          status,
          paymentMethod,
          paymentStatus: status === 'delivered' ? 'paid' : 'pending',
          subtotal,
          shippingCost,
          total,
          items: {
            create: [{
              product: { connect: { id: product.id } },
              price,
              quantity
            }]
          }
        }
      })
      count++
      if (count % 20 === 0) console.log(`Created ${count} orders...`)
    } catch (err) {
      console.log(`Order ${i} error:`, err.message)
    }
  }

  console.log(`\n✅ Created ${count} orders!`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
