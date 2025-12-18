import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'

// GET - Fetch reviews for a product, with myReview option to get current user's review
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const productId = url.searchParams.get('productId')
    const myReview = url.searchParams.get('myReview')
    
    if (!productId) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 })
    }
    
    // If myReview is requested, fetch the current user's review
    if (myReview === 'true') {
      const user = await verifyAuth(request)
      if (!user) {
        return NextResponse.json({ myReview: null })
      }
      
      const review = await prisma.review.findFirst({
        where: { productId, userId: user.id },
        include: {
          user: { select: { id: true, name: true } }
        }
      })
      
      return NextResponse.json({ myReview: review })
    }
    
    // Otherwise fetch all reviews for the product
    const reviews = await prisma.review.findMany({
      where: { 
        productId,
        isApproved: true 
      },
      include: {
        user: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: 'desc' }
    })
    
    return NextResponse.json({ reviews })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { productId, rating, comment, photos } = body

    if (!productId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Invalid input' },
        { status: 400 }
      )
    }

    // Check if user already reviewed this product
    const existing = await prisma.review.findFirst({
      where: { productId, userId: user.id }
    })

    if (existing) {
      return NextResponse.json(
        { error: 'You have already reviewed this product' },
        { status: 400 }
      )
    }

    // Validate photos - should be an array of URLs or base64
    let photosJson = null
    if (photos && Array.isArray(photos) && photos.length > 0) {
      // Limit to 5 photos
      photosJson = JSON.stringify(photos.slice(0, 5))
    }

    const review = await prisma.review.create({
      data: {
        productId,
        userId: user.id,
        rating,
        comment: comment || '',
        photos: photosJson
      },
      include: {
        user: { select: { name: true } }
      }
    })

    return NextResponse.json(review, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
