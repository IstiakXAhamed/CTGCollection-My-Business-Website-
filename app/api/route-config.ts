// Force all API routes to be dynamic (not static)
// This prevents Next.js from trying to statically render routes that use cookies, request.url, etc.
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
