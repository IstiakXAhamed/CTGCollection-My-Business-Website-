import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const category = await prisma.category.findUnique({
      where: { slug: params.slug },
      include: {
        products: {
          where: { isActive: true },
          include: {
            category: { select: { name: true } }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    const productsWithImages = category.products.map(p => ({
      ...p,
      images: JSON.parse(p.images as string)
    }))

    return NextResponse.json({
      ...category,
      products: productsWithImages
    })
  } catch (error: any) {
    console.error('Category detail API error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch category' },
      { status: 500 }
    )
  }
}
