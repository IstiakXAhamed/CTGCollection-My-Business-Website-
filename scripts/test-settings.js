
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('Testing SiteSettings...')

  try {
    // 1. Try to fetch
    const settings = await prisma.siteSettings.findUnique({
      where: { id: 'main' }
    })
    console.log('Current Settings:', settings ? 'Found' : 'Not Found')
    if (settings) {
        console.log('Mode:', settings.adminProductMode)
        console.log('SpinWheel:', settings.spinWheelConfig)
    }

    // 2. Try to update
    if (settings) {
        console.log('Attempting update...')
        const updated = await prisma.siteSettings.update({
            where: { id: 'main' },
            data: {
                adminProductMode: 'advanced',
                spinWheelConfig: { enabled: true, test: 1 }
            }
        })
        console.log('Update success:', updated.adminProductMode === 'advanced')
    } else {
        console.log('Creating settings...')
        const created = await prisma.siteSettings.create({
            data: {
                id: 'main',
                adminProductMode: 'advanced',
                storeName: 'Test Store'
            }
        })
        console.log('Create success:', created.id)
    }

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
