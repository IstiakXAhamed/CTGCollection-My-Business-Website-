// Demo Data Seed Script
// Run with: npx ts-node scripts/seed-demo-data.ts

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

// Bangladeshi names for realistic data
const firstNames = [
  'Rafiq', 'Karim', 'Jamal', 'Hasan', 'Rahim', 'Kabir', 'Salim', 'Nasir', 'Tariq', 'Imran',
  'Fatima', 'Ayesha', 'Nusrat', 'Taslima', 'Rabeya', 'Shahana', 'Jasmine', 'Razia', 'Sultana', 'Nasreen',
  'Ahmed', 'Rahman', 'Islam', 'Uddin', 'Khan', 'Chowdhury', 'Begum', 'Miah', 'Ali', 'Sheikh',
  'Akter', 'Khatun', 'Bibi', 'Jahan', 'Parvin', 'Rani', 'Devi', 'Munni', 'Shathi', 'Keya',
  'Farhan', 'Tanvir', 'Shakil', 'Mamun', 'Rubel', 'Jewel', 'Polash', 'Rony', 'Sabbir', 'Mahfuz',
  'Tania', 'Shanta', 'Mitu', 'Poly', 'Ritu', 'Sumi', 'Lima', 'Moni', 'Shila', 'Nila'
]

const lastNames = [
  'Ahmed', 'Rahman', 'Islam', 'Uddin', 'Khan', 'Chowdhury', 'Haque', 'Alam', 'Miah', 'Ali',
  'Sheikh', 'Sikder', 'Sarkar', 'Biswas', 'Das', 'Roy', 'Sen', 'Pal', 'Ghosh', 'Dey',
  'Saha', 'Paul', 'Mondal', 'Barman', 'Chakraborty', 'Talukdar', 'Majumdar', 'Bhuiyan', 'Choudhury', 'Karim'
]

const cities = [
  { city: 'Dhaka', area: 'Gulshan', zip: '1212' },
  { city: 'Dhaka', area: 'Banani', zip: '1213' },
  { city: 'Dhaka', area: 'Dhanmondi', zip: '1205' },
  { city: 'Dhaka', area: 'Mirpur', zip: '1216' },
  { city: 'Dhaka', area: 'Uttara', zip: '1230' },
  { city: 'Chittagong', area: 'Agrabad', zip: '4100' },
  { city: 'Chittagong', area: 'Nasirabad', zip: '4210' },
  { city: 'Sylhet', area: 'Zindabazar', zip: '3100' },
  { city: 'Rajshahi', area: 'Shaheb Bazar', zip: '6100' },
  { city: 'Khulna', area: 'Khalishpur', zip: '9100' }
]

const orderStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
const paymentMethods = ['cod', 'sslcommerz']

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomPhone() {
  const prefixes = ['017', '018', '019', '016', '015', '013']
  return `+880 ${randomItem(prefixes)} ${Math.floor(10000000 + Math.random() * 90000000)}`
}

function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

async function main() {
  console.log('🌱 Starting demo data seed...')

  // Get existing products
  const products = await prisma.product.findMany({
    take: 50,
    select: { id: true, name: true, basePrice: true, salePrice: true }
  })

  if (products.length === 0) {
    console.log('❌ No products found! Please seed products first.')
    return
  }

  console.log(`📦 Found ${products.length} products`)

  // Create 60 demo customers
  console.log('👥 Creating 60 demo customers...')
  const customers = []

  for (let i = 0; i < 60; i++) {
    const firstName = randomItem(firstNames)
    const lastName = randomItem(lastNames)
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`
    const location = randomItem(cities)

    try {
      const customer = await prisma.user.upsert({
        where: { email },
        update: {},
        create: {
          email,
          name: `${firstName} ${lastName}`,
          phone: randomPhone(),
          password: await bcrypt.hash('demo123', 10),
          role: 'customer',
          emailVerified: true,
          referralCode: `REF${Date.now().toString(36).toUpperCase()}${i}`,
          createdAt: randomDate(new Date('2024-01-01'), new Date())
        }
      })

      // Create address for customer
      await prisma.address.upsert({
        where: { 
          id: `addr-${customer.id}` 
        },
        update: {},
        create: {
          id: `addr-${customer.id}`,
          userId: customer.id,
          name: customer.name,
          phone: customer.phone || randomPhone(),
          address: `House ${Math.floor(1 + Math.random() * 100)}, Road ${Math.floor(1 + Math.random() * 30)}, ${location.area}`,
          city: location.city,
          district: location.city, // Use city as district
          postalCode: location.zip,
          isDefault: true
        }
      })

      customers.push(customer)
    } catch (err) {
      console.log(`Customer ${i} error:`, err.message)
    }
  }

  console.log(`✅ Created ${customers.length} customers`)

  // If no customers were created (already exist), fetch them
  let allCustomers = customers
  if (allCustomers.length === 0) {
    console.log('📥 Fetching existing customers from database...')
    allCustomers = await prisma.user.findMany({
      where: { role: 'customer' },
      take: 60
    })
    console.log(`📥 Found ${allCustomers.length} existing customers`)
  }

  // Create 100 demo orders
  console.log('🛒 Creating 100 demo orders...')
  let ordersCreated = 0

  for (let i = 0; i < 100; i++) {
    const customer = randomItem(allCustomers)
    if (!customer) continue

    const numItems = Math.floor(1 + Math.random() * 4)
    const orderProducts = []
    let subtotal = 0

    for (let j = 0; j < numItems; j++) {
      const product = randomItem(products)
      const quantity = Math.floor(1 + Math.random() * 3)
      const productPrice = product.salePrice || product.basePrice || 1000
      orderProducts.push({
        productId: product.id,
        name: product.name,
        price: productPrice,
        quantity
      })
      subtotal += productPrice * quantity
    }

    const shipping = subtotal >= 2000 ? 0 : 60
    const total = subtotal + shipping
    const status = randomItem(orderStatuses)
    const paymentMethod = randomItem(paymentMethods)
    const createdAt = randomDate(new Date('2024-06-01'), new Date())

    try {
      const address = await prisma.address.findFirst({
        where: { userId: customer.id }
      })

      const order = await prisma.order.create({
        data: {
          orderNumber: `ORD${Date.now().toString(36).toUpperCase()}${i}`,
          userId: customer.id,
          status,
          paymentMethod,
          paymentStatus: status === 'delivered' ? 'paid' : (paymentMethod === 'cod' ? 'pending' : 'paid'),
          subtotal,
          shipping,
          total,
          address: address ? `${address.address}, ${address.city}` : 'Dhaka, Bangladesh',
          phone: customer.phone || randomPhone(),
          createdAt,
          updatedAt: createdAt,
          items: {
            create: orderProducts.map(p => ({
              productId: p.productId,
              name: p.name,
              price: p.price,
              quantity: p.quantity
            }))
          }
        }
      })

      ordersCreated++
    } catch (err) {
      console.log(`Order ${i} error:`, err.message)
    }
  }

  console.log(`✅ Created ${ordersCreated} orders`)

  // Create some newsletter subscribers
  console.log('📧 Creating newsletter subscribers...')
  const subscriberEmails = customers.slice(0, 25).map(c => c.email)
  
  for (const email of subscriberEmails) {
    try {
      await prisma.newsletterSubscriber.upsert({
        where: { email },
        update: {},
        create: {
          email,
          source: randomItem(['footer', 'popup', 'spin_wheel']),
          confirmedAt: new Date(),
          isActive: true
        }
      })
    } catch (err) {
      // Skip duplicates
    }
  }

  console.log(`✅ Created ${subscriberEmails.length} newsletter subscribers`)

  console.log('\n🎉 Demo data seed complete!')
  console.log(`📊 Summary:`)
  console.log(`   - ${customers.length} customers`)
  console.log(`   - ${ordersCreated} orders`)
  console.log(`   - ${subscriberEmails.length} newsletter subscribers`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
