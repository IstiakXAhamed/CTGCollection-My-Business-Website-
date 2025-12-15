import { prisma } from '../lib/prisma'
import bcrypt from 'bcryptjs'

async function createSuperadmin() {
  const email = 'sanim1728@gmail.com'
  const password = 'Sanim@9944'
  const name = 'Super Admin'

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } })
    
    if (existingUser) {
      // Update to superadmin if exists
      await prisma.user.update({
        where: { email },
        data: { role: 'superadmin' }
      })
      console.log('✅ Existing user upgraded to superadmin!')
    } else {
      // Create new superadmin
      const hashedPassword = await bcrypt.hash(password, 10)
      await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          role: 'superadmin',
          isActive: true
        }
      })
      console.log('✅ Superadmin account created!')
    }

    console.log(`
📧 Email: ${email}
🔑 Password: ${password}
🛡️ Role: superadmin
    `)
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createSuperadmin()
