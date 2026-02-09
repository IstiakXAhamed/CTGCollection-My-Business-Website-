
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Fetch all categories and the count of products in each
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true }
        }
      }
    });

    // Also fetch distinct category names used in products directly if any (in case of legacy data)
    // Prisma doesn't support distinct on relation fields easily in one query, so we rely on the Category model
    
    return NextResponse.json({
      status: 'success',
      categories: categories.map(c => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        productCount: c._count.products
      }))
    });
  } catch (error: any) {
    return NextResponse.json({ 
      status: 'error', 
      message: error.message 
    }, { status: 500 });
  }
}
