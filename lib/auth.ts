import './nproc-init'
import bcrypt from 'bcryptjs'
import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
)

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export async function createToken(payload: any): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET)
}

export async function verifyToken(token: string): Promise<any> {
  try {
    const verified = await jwtVerify(token, JWT_SECRET)
    return verified.payload
  } catch (error) {
    return null
  }
}

export async function getSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')
  
  if (!token) return null
  
  const payload = await verifyToken(token.value)
  return payload
}

export async function setAuthCookie(token: string) {
  const cookieStore = await cookies()
  cookieStore.set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })
}

export async function clearAuthCookie() {
  const cookieStore = await cookies()
  cookieStore.delete('token')
}

// Verify authentication from request (for API routes)
// Returns user object with consistent 'id' field (mapped from JWT's 'userId')
// IMPORTANT: Always fetches fresh role from database to support dynamic role changes
export async function verifyAuth(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value
    
    if (!token) return null
    
    const payload = await verifyToken(token)
    if (!payload) return null
    
    // Import prisma dynamically to avoid circular dependency
    const { prisma } = await import('./prisma')
    
    // Fetch fresh user data from database to get current role
    // This enables automatic role sync without requiring re-login
    const dbUser = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, role: true, name: true, isActive: true, permissions: true }
    })
    
    if (!dbUser) return null
    
    // Check if user is active
    if (dbUser.isActive === false) return null
    
    // Return user with FRESH role from database, not stale JWT role
    return {
      id: dbUser.id,
      userId: dbUser.id, // Keep for backwards compatibility
      email: dbUser.email,
      name: dbUser.name,
      role: dbUser.role, // Fresh role from database!
      permissions: dbUser.permissions || [] 
    }
  } catch (error) {
    console.error('verifyAuth error:', error)
    return null
  }
}
