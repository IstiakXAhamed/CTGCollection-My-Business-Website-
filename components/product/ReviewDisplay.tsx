'use client'

import { Star } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { calculateAverageRating, getRatingDistribution } from '@/lib/reviews'
import { AIReviewSummary } from '@/components/product/AIReviewSummary'

interface ReviewDisplayProps {
  reviews: any[]
  productId: string
  productName: string
}

export function ReviewDisplay({ reviews, productId, productName }: ReviewDisplayProps) {
  if (!reviews || reviews.length === 0) {
    return (
      <Card className="p-8 text-center" id="reviews-section">
        <Star className="w-16 h-16 mx-auto text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold mb-2">No Reviews Yet</h2>
        <p className="text-muted-foreground mb-4">Be the first to review this product!</p>
        <p className="text-sm text-muted-foreground">
          Purchase this product to write a review
        </p>
      </Card>
    )
  }

  const averageRating = calculateAverageRating(reviews)
  const distribution = getRatingDistribution(reviews)

  return (
    <Card className="p-6" id="reviews-section">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Customer Reviews</h2>
        
        {/* AI Review Summary */}
        <AIReviewSummary reviews={reviews} productName={productName} />
        
        {/* Rating Summary */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="text-center md:min-w-[120px]">
            <div className="text-5xl font-bold text-blue-600 mb-2">
              {averageRating.toFixed(1)}
            </div>
            <div className="flex justify-center mb-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${
                    i < Math.round(averageRating) 
                      ? 'fill-yellow-400 text-yellow-400' 
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              Based on {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
            </p>
          </div>
          
          {/* Rating Distribution */}
          <div className="flex-1 w-full">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = distribution[rating] || 0
              const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0
              
              return (
                <div key={rating} className="flex items-center gap-2 mb-2">
                  <span className="text-sm w-16 flex items-center gap-1">
                    {rating} <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  </span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-yellow-400 h-2.5 rounded-full transition-all" 
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-12 text-right">
                    {count}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Individual Reviews */}
      <div className="space-y-6">
        {reviews.map((review) => (
          <div key={review.id} className="border-b pb-6 last:border-0">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                  {review.user?.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div>
                  <p className="font-semibold">{review.user?.name || 'Anonymous'}</p>
                  <div className="flex gap-1 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < review.rating 
                            ? 'fill-yellow-400 text-yellow-400' 
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <span className="text-sm text-muted-foreground">
                {new Date(review.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </span>
            </div>
            {review.comment && (
              <p className="text-muted-foreground leading-relaxed ml-15">
                {review.comment}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Write Review Callout */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg text-center border border-blue-100">
        <p className="text-sm font-semibold text-blue-900 mb-1">
          Have you used this product?
        </p>
        <p className="text-xs text-blue-700">
          Login and purchase this product to write a review
        </p>
      </div>
    </Card>
  )
}
