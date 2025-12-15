import { prisma } from '@/lib/prisma'

// Check if user has purchased a specific product
export async function hasUserPurchased(userId: string, productId: string): Promise<boolean> {
  try {
    const orderItem = await prisma.orderItem.findFirst({
      where: {
        productId,
        order: {
          userId,
          status: 'delivered' // Only count delivered orders
        }
      }
    })
    
    return !!orderItem
  } catch (error) {
    console.error('Error checking purchase:', error)
    return false
  }
}

// Validate review data
export function validateReview(rating: number, comment?: string): { valid: boolean; error?: string } {
  if (!rating || rating < 1 || rating > 5) {
    return { valid: false, error: 'Rating must be between 1 and 5' }
  }

  if (comment && comment.length > 500) {
    return { valid: false, error: 'Comment must be 500 characters or less' }
  }

  return { valid: true }
}

// Calculate average rating
export function calculateAverageRating(reviews: any[]): number {
  if (!reviews || reviews.length === 0) return 0
  const sum = reviews.reduce((acc, review) => acc + review.rating, 0)
  return sum / reviews.length
}

// Get rating distribution
export function getRatingDistribution(reviews: any[]): Record<number, number> {
  const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  
  reviews.forEach(review => {
    if (review.rating >= 1 && review.rating <= 5) {
      distribution[review.rating]++
    }
  })
  
  return distribution
}
