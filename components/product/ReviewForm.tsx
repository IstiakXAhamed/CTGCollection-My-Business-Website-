'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import Link from 'next/link'

interface ReviewFormProps {
  productId: string
  productName: string
  isLoggedIn: boolean
  hasPurchased: boolean
  onReviewSubmitted?: () => void
}

export function ReviewForm({ 
  productId, 
  productName, 
  isLoggedIn, 
  hasPurchased,
  onReviewSubmitted 
}: ReviewFormProps) {
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const maxChars = 500
  const remainingChars = maxChars - comment.length

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (rating === 0) {
      setError('Please select a rating')
      return
    }

    setSubmitting(true)

    try {
      const res = await fetch(`/api/products/${productId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ rating, comment })
      })

      const data = await res.json()

      if (res.ok) {
        setSuccess(true)
        setRating(0)
        setComment('')
        if (onReviewSubmitted) {
          onReviewSubmitted()
        }
      } else {
        setError(data.error || 'Failed to submit review')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // Not logged in
  if (!isLoggedIn) {
    return (
      <Card className="p-6 bg-blue-50 border-blue-200">
        <h3 className="font-semibold text-lg mb-2">Write a Review</h3>
        <p className="text-muted-foreground mb-4">
          You must be logged in to write a review.
        </p>
        <Link href="/login">
          <Button>Login to Review</Button>
        </Link>
      </Card>
    )
  }

  // Logged in but hasn't purchased
  if (!hasPurchased) {
    return (
      <Card className="p-6 bg-yellow-50 border-yellow-200">
        <h3 className="font-semibold text-lg mb-2">Write a Review</h3>
        <p className="text-muted-foreground mb-4">
          You must purchase <strong>{productName}</strong> before you can write a review.
        </p>
        <p className="text-sm text-muted-foreground">
          Only verified purchasers can submit reviews to ensure authenticity.
        </p>
      </Card>
    )
  }

  // Success state
  if (success) {
    return (
      <Card className="p-6 bg-green-50 border-green-200">
        <h3 className="font-semibold text-lg text-green-800 mb-2">✓ Review Submitted!</h3>
        <p className="text-green-700 mb-4">
          Thank you for your review. It will be published after admin approval.
        </p>
        <Button onClick={() => setSuccess(false)} variant="outline">
          Write Another Review
        </Button>
      </Card>
    )
  }

  // Review form
  return (
    <Card className="p-6">
      <h3 className="font-semibold text-lg mb-4">Write a Review</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Star Rating Selector */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            Your Rating <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setRating(value)}
                onMouseEnter={() => setHoverRating(value)}
                onMouseLeave={() => setHoverRating(0)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  className={`w-10 h-10 ${
                    value <= (hoverRating || rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
          </div>
          {rating > 0 && (
            <p className="text-sm text-muted-foreground mt-2">
              You rated: {rating} {rating === 1 ? 'star' : 'stars'}
            </p>
          )}
        </div>

        {/* Comment Text Area */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            Your Review (Optional)
          </label>
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value.slice(0, maxChars))}
            placeholder="Share your experience with this product..."
            rows={5}
            className="resize-none"
          />
          <div className="flex justify-between items-center mt-2">
            <p className="text-xs text-muted-foreground">
              Share details about your experience with this product
            </p>
            <p className={`text-xs ${remainingChars < 50 ? 'text-orange-600 font-semibold' : 'text-muted-foreground'}`}>
              {remainingChars} characters remaining
            </p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-muted-foreground">
            ℹ️ Your review will be published after admin approval
          </p>
          <Button type="submit" disabled={submitting || rating === 0}>
            {submitting ? 'Submitting...' : 'Submit Review'}
          </Button>
        </div>
      </form>
    </Card>
  )
}
