import './nproc-init'
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Detect environment: Vercel sets VERCEL=1, cPanel doesn't
const isVercel = process.env.VERCEL === '1'
const isCPanel = !isVercel && process.env.NODE_ENV === 'production'

// True singleton — cached in ALL environments (including production)
export const prisma = (() => {
  if (globalForPrisma.prisma) return globalForPrisma.prisma
  
  // Environment-aware connection configuration
  let connectionParams = ''
  
  if (isVercel) {
    // Vercel (Serverless): Higher connection limit + pgbouncer for Neon pooling
    // connection_limit=10 allows better concurrency in serverless functions
    // pgbouncer=true enables Neon's connection pooling (reduces cold starts)
    connectionParams = 'connection_limit=10&pool_timeout=10&pgbouncer=true'
  } else if (isCPanel) {
    // cPanel (Shared Hosting): Conservative limits for stability
    // connection_limit=1 prevents NPROC issues on shared hosting
    connectionParams = 'connection_limit=1&pool_timeout=5'
  } else {
    // Development: Moderate limits for local testing
    connectionParams = 'connection_limit=5&pool_timeout=10'
  }
  
  const baseUrl = process.env.DATABASE_URL || ''
  const separator = baseUrl.includes('?') ? '&' : '?'
  const finalUrl = `${baseUrl}${separator}${connectionParams}`
  
  const client = new PrismaClient({
    datasources: {
      db: {
        url: finalUrl,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  })

  // Cache in ALL environments — this was the critical bug
  globalForPrisma.prisma = client
  
  // Log environment for debugging (only in dev)
  if (process.env.NODE_ENV === 'development') {
    console.log(`🔧 Prisma initialized for: ${isVercel ? 'Vercel' : isCPanel ? 'cPanel' : 'Development'}`)
  }
  
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
