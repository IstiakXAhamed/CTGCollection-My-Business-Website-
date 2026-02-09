const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('Testing DB connection...')
  try {
    const userCount = await prisma.user.count()
    console.log('Connection successful! User count:', userCount)
    
    console.log('Testing findUnique...')
    const firstUser = await prisma.user.findFirst()
    if (firstUser) {
        const found = await prisma.user.findUnique({ where: { id: firstUser.id } })
        console.log('findUnique successful for user:', found?.email)
    }
  } catch (error) {
    console.error('DB Test Failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
