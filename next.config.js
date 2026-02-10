/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode for better development experience
  reactStrictMode: true,
  
  // Enable SWC minification for faster builds
  swcMinify: true,
  
  // Optimize page loading
  poweredByHeader: false,
  
  // Compress responses
  compress: true,

  // Output standalone for Vercel deployment
  output: 'standalone',

  experimental: {
    // Optimize package imports for smaller bundles
    optimizePackageImports: ['lucide-react', 'framer-motion', '@radix-ui/react-icons'],
    // Limit Next.js to 1 CPU core to survive NPROC limits
    cpus: 1,
    // Disable worker threads to reduce concurrent context-switching during build
    workerThreads: false,
  },
  
  // Disable linting and type checking during build to save memory/resource
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Increase timeout for static page generation to survive shared hosting limits
  staticPageGenerationTimeout: 300,

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '*.googleusercontent.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
    // Device sizes for responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    // Disable built-in image optimization to save server processes/memory
    // Cloudinary already handles this via URL parameters.
    unoptimized: true,
    // Optimize images with lower quality for faster loading
    minimumCacheTTL: 31536000, // 1 year
  },
  
  // Custom headers for security and caching
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // Security headers
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          // Performance: Preconnect to external domains
          { key: 'Link', value: '<https://fonts.googleapis.com>; rel=preconnect' },
        ]
      },
      // Cache static assets aggressively
      {
        source: '/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ]
      },
      // Cache images for 30 days
      {
        source: '/_next/image/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=2592000, stale-while-revalidate=86400' },
        ]
      },
      // Cache uploaded images for 30 days
      {
        source: '/uploads/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=2592000, stale-while-revalidate=86400' },
        ]
      },
      // Cache fonts for 1 year
      {
        source: '/fonts/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ]
      },
      // API caching for product listings
      {
        source: '/api/products/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=60, stale-while-revalidate=300' },
        ]
      },
      // API caching for categories
      {
        source: '/api/categories/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=300, stale-while-revalidate=600' },
        ]
      },
      // Cache static JS/CSS bundles for 1 year
      {
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ]
      },
    ]
  }
}

module.exports = nextConfig


