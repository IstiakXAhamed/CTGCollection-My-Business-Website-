import { Metadata, ResolvingMetadata } from 'next'
import { prisma } from '@/lib/prisma'
import ProductDetailClient from '@/components/product/ProductDetailClient'
import { notFound } from 'next/navigation'

type Props = {
  params: { slug: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const slug = params.slug

  // 1. Safe Fetch: Try with meta fields first
  let product: any = null
  try {
    product = await prisma.product.findUnique({
      where: { slug: slug },
      select: {
        name: true,
        description: true,
        images: true,
        metaTitle: true,
        metaDescription: true,
        metaKeywords: true,
      } 
    })
  } catch (error) {
    console.warn("⚠️ Metadata fetch failed (DB mismatch?), falling back to basic fields.", error)
    // 2. Fallback: Fetch without meta fields
    product = await prisma.product.findUnique({
      where: { slug: slug },
      select: {
        name: true,
        description: true,
        images: true,
      } 
    })
  }

  if (!product) {
    return {
      title: 'Product Not Found | Silk Mart',
      description: 'The product you are looking for does not exist.'
    }
  }

  // Use meta tags if available (and successfully fetched), otherwise fall back to product data
  const p = product
  // SEO Optimized Title: Product Name - Buy at Best Price in Bangladesh
  // This is DYNAMIC and unique to EVERY product (won't be overwritten)
  const title = p.metaTitle || `${product.name} - Buy at Best Price in Bangladesh | Silk Mart`
  
  // SEO Optimized Description
  const description = p.metaDescription || 
    `Buy authentic ${product.name} at the best price in Bangladesh. Discover the latest ${product.category?.name || 'products'} with fast delivery and quality assurance from Silk Mart.`

  // Dynamic Keywords
  const baseKeywords = ["Buy", "Price in BD", "Original", "Online Shopping", "Silk Mart"]
  const productKeywords = [product.name, `${product.name} price`, `${product.name} BD`]
  const keywords = p.metaKeywords 
    ? (p.metaKeywords as string).split(',').map((k: string) => k.trim()) 
    : [...baseKeywords, ...productKeywords]
  
  let images: string[] = []
  try {
    if (Array.isArray(product.images)) {
      images = product.images as unknown as string[]
    } else if (typeof product.images === 'string') {
      images = JSON.parse(product.images)
    }
  } catch (e) {
    console.error('Error parsing product images for metadata:', e)
  }

  const mainImage = images[0] || '/placeholder.png'

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: `/product/${slug}`,
    },
    openGraph: {
      title,
      description,
      images: [{
        url: mainImage,
        width: 1200,
        height: 630,
        alt: title
      }],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [mainImage],
    }
  }
}

export default async function ProductPage({ params }: Props) {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    select: {
      id: true,
      name: true,
      description: true,
      images: true,
      basePrice: true,
      salePrice: true,
      isActive: true,
      updatedAt: true,
      category: { select: { name: true } },
      variants: {
        select: { sku: true, stock: true }
      },
      reviews: {
        select: { rating: true }
      }
    }
  })

  if (!product) {
    notFound()
  }

  // --- Construct JSON-LD Schema ---
  const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://silkmartbd.com'
  const p = product as any
  
  let imageUrls: string[] = []
  try {
    if (Array.isArray(p.images)) {
      imageUrls = p.images
    } else if (typeof p.images === 'string') {
      imageUrls = JSON.parse(p.images)
    }
  } catch (e) {
    console.error('Error parsing product images JSON-LD:', e)
    imageUrls = []
  }

  const mainImage = imageUrls[0] ? (imageUrls[0].startsWith('http') ? imageUrls[0] : `${baseUrl}${imageUrls[0]}`) : `${baseUrl}/placeholder.png`
  
  const currentPrice = p.salePrice || p.basePrice
  const inStock = p.isActive && p.variants.some((v: any) => v.stock > 0)
  
  // Calculate Average Rating
  const totalRating = p.reviews.reduce((acc: number, r: any) => acc + r.rating, 0)
  const reviewCount = p.reviews.length
  const averageRating = reviewCount > 0 ? (totalRating / reviewCount).toFixed(1) : null

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.name,
    image: mainImage,
    description: p.description ? p.description.substring(0, 160) : '',
    sku: p.variants[0]?.sku || p.id,
    brand: {
      '@type': 'Brand',
      name: 'Silk Mart'
    },
    offers: {
      '@type': 'Offer',
      url: `${baseUrl}/product/${params.slug}`,
      priceCurrency: 'BDT',
      price: currentPrice,
      priceValidUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
      itemCondition: 'https://schema.org/NewCondition',
      availability: inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'Silk Mart'
      }
    },
    ...(averageRating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: averageRating,
        reviewCount: reviewCount
      }
    })
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetailClient />
    </>
  )
}
