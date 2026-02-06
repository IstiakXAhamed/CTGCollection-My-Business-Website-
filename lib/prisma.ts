import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Ensure Prisma is a true singleton to prevent spawning 100+ processes on cPanel
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
// In production on cPanel/Passenger, we also want to keep it in global to prevent leaks during hot-reloads
globalForPrisma.prisma = prisma
