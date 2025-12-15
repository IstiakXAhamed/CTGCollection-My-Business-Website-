// Database Check Script
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('📊 Database Check\n')
  
  const customerCount = await prisma.user.count({ where: { role: 'customer' } })
  const adminCount = await prisma.user.count({ where: { role: { in: ['admin', 'superadmin'] } } })
  const orderCount = await prisma.order.count()
  const productCount = await prisma.product.count()
  
  console.log(`👥 Customers: ${customerCount}`)
  console.log(`👔 Admins: ${adminCount}`)
  console.log(`📦 Products: ${productCount}`)
  console.log(`🛒 Orders: ${orderCount}`)
  
  // Check newsletter subscribers
  try {
    const subscribers = await prisma.newsletterSubscriber.count()
    console.log(`📧 Newsletter subscribers: ${subscribers}`)
  } catch (e) {
    console.log('📧 Newsletter model not found (run prisma generate)')
  }
  
  // Get recent customers
  const recentCustomers = await prisma.user.findMany({
    where: { role: 'customer' },
    take: 5,
    orderBy: { createdAt: 'desc' },
    select: { email: true, name: true, createdAt: true }
  })
  
  console.log('\n📋 Recent Customers:')
  recentCustomers.forEach(c => console.log(`  - ${c.email} (${c.name})`))
  
  // If orders exist, show sample
  if (orderCount > 0) {
    const recentOrders = await prisma.order.findMany({
      take: 3,
      orderBy: { createdAt: 'desc' },
      select: { orderNumber: true, total: true, status: true }
    })
    console.log('\n📋 Recent Orders:')
    recentOrders.forEach(o => console.log(`  - ${o.orderNumber}: ৳${o.total} (${o.status})`))
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
