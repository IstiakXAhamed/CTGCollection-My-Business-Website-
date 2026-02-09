import './nproc-init'
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  isInitializing: boolean
}

// Ensure Prisma is a true singleton to prevent spawning 100+ processes on cPanel
export const prisma = (() => {
  if (globalForPrisma.prisma) return globalForPrisma.prisma
  
  if (globalForPrisma.isInitializing) {
     return globalForPrisma.prisma as unknown as PrismaClient
  }

  globalForPrisma.isInitializing = true
  
  const client = new PrismaClient({
    datasources: {
      db: {
        // connection_limit=1 is crucial for shared hosting stability
        // pool_timeout=5 ensures we don't hang if a connection is leaked
        url: `${process.env.DATABASE_URL}${process.env.DATABASE_URL?.includes('?') ? '&' : '?'}connection_limit=1&pool_timeout=5`,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  })

  if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = client
  globalForPrisma.isInitializing = false
  return client
})()

// Graceful shutdown to prevent "Ghost" processes on cPanel/Passenger
const disconnect = async () => {
  try {
    if (globalForPrisma.prisma) {
      console.log('🔌 Shutting down Prisma connection pool...')
      await globalForPrisma.prisma.$disconnect()
    }
  } catch (e) {
    // Silent fail on shutdown to prevent hanging
  } finally {
    process.exit(0)
  }
}

// Aggressive cleanup for cPanel/Passenger
process.on('SIGTERM', disconnect)
process.on('SIGINT', disconnect)
process.on('beforeExit', disconnect)
// If the app gets "killed" by CloudLinux, we want to try and die fast
process.on('uncaughtException', disconnect)
process.on('unhandledRejection', disconnect)

// Signal handling remains same...
