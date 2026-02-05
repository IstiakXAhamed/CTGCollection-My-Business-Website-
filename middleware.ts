import { NextRequest, NextResponse } from 'next/server'

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const MAX_REQUESTS_PER_WINDOW = {
  login: 5,      // 5 login attempts per minute
  register: 3,   // 3 registration attempts per minute
  forgot: 3,     // 3 password reset requests per minute
  api: 100,      // 100 general API requests per minute
}

// In-memory store for rate limiting (use Redis in production for multi-instance)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

function getRateLimitKey(ip: string, endpoint: string): string {
  return `${ip}:${endpoint}`
}

function isRateLimited(key: string, maxRequests: number): { limited: boolean; remaining: number; resetIn: number } {
  const now = Date.now()
  const record = rateLimitStore.get(key)
  
  if (!record || now > record.resetTime) {
    // Start new window
    rateLimitStore.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    return { limited: false, remaining: maxRequests - 1, resetIn: RATE_LIMIT_WINDOW }
  }
  
  if (record.count >= maxRequests) {
    return { limited: true, remaining: 0, resetIn: record.resetTime - now }
  }
  
  record.count++
  return { limited: false, remaining: maxRequests - record.count, resetIn: record.resetTime - now }
}

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  return request.headers.get('x-real-ip') || '127.0.0.1'
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const ip = getClientIP(request)
  
  // Rate limiting for auth endpoints
  if (pathname.startsWith('/api/auth/')) {
    let endpoint = 'api'
    let maxRequests = MAX_REQUESTS_PER_WINDOW.api
    
    if (pathname.includes('/login')) {
      endpoint = 'login'
      maxRequests = MAX_REQUESTS_PER_WINDOW.login
    } else if (pathname.includes('/register')) {
      endpoint = 'register'
      maxRequests = MAX_REQUESTS_PER_WINDOW.register
    } else if (pathname.includes('/forgot-password') || pathname.includes('/reset-password')) {
      endpoint = 'forgot'
      maxRequests = MAX_REQUESTS_PER_WINDOW.forgot
    }
    
    const key = getRateLimitKey(ip, endpoint)
    const { limited, remaining, resetIn } = isRateLimited(key, maxRequests)
    
    if (limited) {
      return NextResponse.json(
        { 
          error: 'Too many requests. Please try again later.',
          retryAfter: Math.ceil(resetIn / 1000)
        },
        { 
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil(resetIn / 1000)),
            'X-RateLimit-Limit': String(maxRequests),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(Math.ceil(resetIn / 1000))
          }
        }
      )
    }
    
    // Add rate limit headers to response
    const response = NextResponse.next()
    response.headers.set('X-RateLimit-Limit', String(maxRequests))
    response.headers.set('X-RateLimit-Remaining', String(remaining))
    response.headers.set('X-RateLimit-Reset', String(Math.ceil(resetIn / 1000)))
    return response
  }
  
  // General API rate limiting
  if (pathname.startsWith('/api/')) {
    const key = getRateLimitKey(ip, 'api')
    const { limited, remaining, resetIn } = isRateLimited(key, MAX_REQUESTS_PER_WINDOW.api)
    
    if (limited) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please slow down.' },
        { 
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil(resetIn / 1000))
          }
        }
      )
    }
  }
  
  return NextResponse.next()
}

// Configure which paths the middleware runs on
export const config = {
  matcher: [
    // Match all API routes
    '/api/:path*',
  ]
}
