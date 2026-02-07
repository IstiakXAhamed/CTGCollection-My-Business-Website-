
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Testing DB connection...')
  try {
    const settings = await prisma.siteSettings.findUnique({
      where: { id: 'main' }
    })
    console.log('Connection successful!')
    console.log('Settings found:', settings)
  } catch (e) {
    console.error('Connection failed:', e)
  } finally {
    await prisma.$disconnect()
  }
}

main()
