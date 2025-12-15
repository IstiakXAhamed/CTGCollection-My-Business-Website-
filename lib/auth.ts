import bcrypt from 'bcrypt'
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
export async function verifyAuth(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value
    
    if (!token) return null
    
    const payload = await verifyToken(token)
    if (!payload) return null
    
    // Return consistent user object with 'id' field
    // JWT stores userId, but we expose it as 'id' for API consistency
    return {
      id: payload.userId,
      userId: payload.userId, // Keep for backwards compatibility
      email: payload.email,
      role: payload.role
    }
  } catch (error) {
    return null
  }
}
