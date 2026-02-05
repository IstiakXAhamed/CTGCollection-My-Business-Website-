import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://ctgcollection.vercel.app'

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin/',
        '/dashboard/',
        '/api/',
        '/account/',
        '/checkout/',
        '/cart/',
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
