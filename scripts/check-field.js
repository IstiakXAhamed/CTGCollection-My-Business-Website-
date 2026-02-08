const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  try {
    console.log('Fetching site settings...')
    const settings = await prisma.siteSettings.findUnique({
      where: { id: 'main' }
    })
    
    if (settings) {
      console.log('Settings found!')
      console.log('Keys in SiteSettings:', Object.keys(settings))
      if ('adminProductMode' in settings) {
        console.log('SUCCESS: adminProductMode field is present in the database.')
      } else {
        console.log('FAILURE: adminProductMode field is MISSING from the database.')
      }
    } else {
      console.log('No settings found with id "main".')
    }
  } catch (error) {
    console.error('ERROR checking database:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

main()
