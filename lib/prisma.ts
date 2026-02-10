import './nproc-init'
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// True singleton — cached in ALL environments (including production)
export const prisma = (() => {
  if (globalForPrisma.prisma) return globalForPrisma.prisma
  
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

  // Cache in ALL environments — this was the critical bug
  globalForPrisma.prisma = client
  return client
})()

// Graceful shutdown — ONLY on controlled signals from Passenger
// DO NOT handle uncaughtException/unhandledRejection (causes respawn loops)
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

// Only SIGTERM (Passenger stop) and SIGINT (Ctrl+C)
process.on('SIGTERM', disconnect)
process.on('SIGINT', disconnect)
