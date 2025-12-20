import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// Check admin access
async function checkAdmin(request: NextRequest) {
  const user = await verifyAuth(request)
  if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
    return null
  }
  return user
}

// Simple AI-like product assistance (without external API dependency)
// In production, integrate with OpenAI, Gemini, or other AI APIs
export async function POST(request: NextRequest) {
  try {
    const admin = await checkAdmin(request)
    if (!admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 401 })
    }

    const { action, productName, category } = await request.json()

    if (!productName) {
      return NextResponse.json({ error: 'Product name is required' }, { status: 400 })
    }

    let suggestion = ''

    switch (action) {
      case 'description':
        suggestion = generateDescription(productName, category)
        break
      case 'tags':
        suggestion = generateTags(productName, category)
        break
      case 'seo':
        suggestion = generateSEO(productName, category)
        break
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    return NextResponse.json({ success: true, suggestion })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// Template-based description generation
function generateDescription(name: string, category?: string): string {
  const categoryText = category ? ` from our ${category} collection` : ''
  const templates = [
    `Introducing the ${name}${categoryText}. Crafted with premium materials for exceptional quality and style. Features modern design elements that make it perfect for any occasion. Experience comfort and elegance with this must-have piece.`,
    
    `Discover the ${name} - where style meets functionality. This premium product${categoryText} is designed for those who appreciate quality and attention to detail. Made with the finest materials to ensure long-lasting durability.`,
    
    `The ${name} is your perfect choice for modern elegance${categoryText}. Featuring contemporary design with timeless appeal, this item is crafted to exceed expectations. Ideal for everyday use or special occasions.`
  ]
  
  return templates[Math.floor(Math.random() * templates.length)]
}

// Template-based tag generation
function generateTags(name: string, category?: string): string {
  const baseTags = name.toLowerCase().split(' ').filter(w => w.length > 2)
  const categoryTags = category ? [category.toLowerCase(), `${category.toLowerCase()} collection`] : []
  
  const commonTags = ['premium', 'stylish', 'quality', 'trendy', 'fashion', 'comfortable', 'durable']
  const selectedCommon = commonTags.sort(() => Math.random() - 0.5).slice(0, 3)
  
  const allTags = [...baseTags, ...categoryTags, ...selectedCommon, 'ctg collection', 'bangladesh']
  return allTags.join(', ')
}

// Template-based SEO title generation
function generateSEO(name: string, category?: string): string {
  const categoryText = category ? ` - ${category}` : ''
  const templates = [
    `${name}${categoryText} | Premium Quality | CTG Collection Bangladesh`,
    `Buy ${name} Online${categoryText} | Best Price | CTG Collection`,
    `${name} - Shop${categoryText} Collection | Free Shipping | CTG Collection`
  ]
  
  return templates[Math.floor(Math.random() * templates.length)]
}
