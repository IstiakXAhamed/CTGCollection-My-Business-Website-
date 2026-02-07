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

  const product = await prisma.product.findUnique({
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

  if (!product) {
    return {
      title: 'Product Not Found | Silk Mart',
      description: 'The product you are looking for does not exist.'
    }
  }

  // Use meta tags if available, otherwise fall back to product data
  const title = product.metaTitle || `${product.name} | Silk Mart`
  const description = product.metaDescription || product.description.substring(0, 160)
  const keywords = product.metaKeywords ? product.metaKeywords.split(',').map(k => k.trim()) : []
  
  const images = JSON.parse(product.images as string || '[]')
  const mainImage = images[0] || '/placeholder.png'

  return {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      images: [mainImage],
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
    select: { id: true }
  })

  if (!product) {
    notFound()
  }

  return <ProductDetailClient />
}
