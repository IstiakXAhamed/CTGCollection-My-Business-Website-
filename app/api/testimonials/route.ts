import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET featured testimonials for carousel
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const featured = searchParams.get('featured') === 'true'
    
    const testimonials = await (prisma as any).testimonial.findMany({
      where: {
        isApproved: true,
        ...(featured ? { isFeatured: true } : {})
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    return NextResponse.json({ testimonials })
  } catch (error: any) {
    console.error('Testimonials fetch error:', error)
    // Return empty array if table doesn't exist yet
    return NextResponse.json({ testimonials: [] })
  }
}

// POST new testimonial
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, content, rating } = body

    if (!name || !content) {
      return NextResponse.json(
        { message: 'Name and content are required' },
        { status: 400 }
      )
    }

    const testimonial = await (prisma as any).testimonial.create({
      data: {
        name,
        email,
        content,
        rating: rating || 5,
        isApproved: false, // Requires admin approval
        isFeatured: false
      }
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Thank you for your testimonial! It will be reviewed shortly.',
      testimonial 
    })
  } catch (error: any) {
    console.error('Testimonial creation error:', error)
    return NextResponse.json(
      { message: 'Failed to submit testimonial' },
      { status: 500 }
    )
  }
}
