'use client'

import { useState, useRef } from 'react'
import { Star, Camera, X, Upload, Loader2, ThumbsUp, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

interface PhotoReview {
  id: string
  rating: number
  comment: string
  photos: string[]
  author: string
  date: string
  helpful: number
  verified: boolean
}

interface PhotoReviewsProps {
  productId: string
  reviews?: PhotoReview[]
  onReviewSubmit?: (review: any) => Promise<void>
}

export function PhotoReviews({ productId, reviews = [], onReviewSubmit }: PhotoReviewsProps) {
  const [showForm, setShowForm] = useState(false)
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const [name, setName] = useState('')
  const [photos, setPhotos] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Demo reviews
  const displayReviews: PhotoReview[] = reviews.length > 0 ? reviews : [
    {
      id: '1',
      rating: 5,
      comment: 'Absolutely love this product! The quality is amazing and it arrived perfectly packaged. Highly recommend!',
      photos: [],
      author: 'Rahim K.',
      date: '2 days ago',
      helpful: 12,
      verified: true
    },
    {
      id: '2',
      rating: 4,
      comment: 'Great value for money. Color is exactly as shown in the pictures. Fast delivery!',
      photos: [],
      author: 'Fatima S.',
      date: '1 week ago',
      helpful: 8,
      verified: true
    }
  ]

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const files = Array.from(e.target.files || [])
      if (files.length + photos.length > 5) {
        setError('Maximum 5 photos allowed')
        return
      }

      // Validate file types and sizes
      for (const file of files) {
        if (!file.type.startsWith('image/')) {
          setError('Only image files are allowed')
          return
        }
        if (file.size > 5 * 1024 * 1024) {
          setError('Each image must be less than 5MB')
          return
        }
      }

      setError('')
      setPhotos(prev => [...prev, ...files])

      // Create previews
      files.forEach(file => {
        const reader = new FileReader()
        reader.onload = (e) => {
          setPreviews(prev => [...prev, e.target?.result as string])
        }
        reader.readAsDataURL(file)
      })
    } catch (err) {
      console.error('Photo select error:', err)
      setError('Failed to load photos')
    }
  }

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index))
    setPreviews(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation
    if (rating === 0) {
      setError('Please select a rating')
      return
    }
    if (!comment.trim() || comment.length < 10) {
      setError('Please write at least 10 characters')
      return
    }
    if (!name.trim()) {
      setError('Please enter your name')
      return
    }

    setSubmitting(true)

    try {
      // Upload photos and get URLs
      const photoUrls: string[] = []
      for (const photo of photos) {
        const formData = new FormData()
        formData.append('file', photo)
        formData.append('type', 'review')
        formData.append('productId', productId)

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })

        if (res.ok) {
          const data = await res.json()
          photoUrls.push(data.url)
        }
      }

      // Submit review
      const reviewData = {
        productId,
        rating,
        comment,
        photos: photoUrls,
        author: name
      }

      if (onReviewSubmit) {
        await onReviewSubmit(reviewData)
      } else {
        // Default API call
        const res = await fetch(`/api/products/${productId}/reviews`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(reviewData)
        })

        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || 'Failed to submit review')
        }
      }

      setSubmitted(true)
      setRating(0)
      setComment('')
      setName('')
      setPhotos([])
      setPreviews([])
      setShowForm(false)
    } catch (err: any) {
      console.error('Submit review error:', err)
      setError(err.message || 'Failed to submit review')
    } finally {
      setSubmitting(false)
    }
  }

  const markHelpful = async (reviewId: string) => {
    try {
      await fetch(`/api/products/${productId}/reviews/${reviewId}/helpful`, {
        method: 'POST',
        credentials: 'include'
      })
    } catch (err) {
      console.error('Mark helpful error:', err)
    }
  }

  const StarRating = ({ value, interactive = false }: { value: number; interactive?: boolean }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => interactive && setRating(star)}
          onMouseEnter={() => interactive && setHoverRating(star)}
          onMouseLeave={() => interactive && setHoverRating(0)}
          className={interactive ? 'cursor-pointer' : 'cursor-default'}
          disabled={!interactive}
        >
          <Star
            className={`w-6 h-6 transition ${
              (interactive ? (hoverRating || rating) : value) >= star
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        </button>
      ))}
    </div>
  )

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <Camera className="w-6 h-6 text-blue-600" />
          Customer Photos & Reviews
        </h3>
        <Button onClick={() => setShowForm(!showForm)} variant="outline">
          <Camera className="w-4 h-4 mr-2" />
          Write Review
        </Button>
      </div>

      {/* Success Message */}
      <AnimatePresence>
        {submitted && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center gap-2"
          >
            <Check className="w-5 h-5 text-green-600" />
            <span className="text-green-700">Thank you! Your review has been submitted.</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Review Form */}
      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmit}
            className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 mb-6 overflow-hidden"
          >
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-3 mb-4">
                {error}
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Your Rating *</label>
              <StarRating value={rating} interactive />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Your Name *</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                maxLength={50}
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Your Review *</label>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience with this product..."
                rows={4}
                maxLength={1000}
              />
              <p className="text-xs text-gray-400 mt-1">{comment.length}/1000</p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Add Photos (Optional)
              </label>
              <div className="flex flex-wrap gap-3">
                {previews.map((preview, index) => (
                  <div key={index} className="relative w-20 h-20">
                    <Image
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      fill
                      className="object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {photos.length < 5 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-blue-500 hover:text-blue-500 transition"
                  >
                    <Upload className="w-6 h-6" />
                    <span className="text-xs mt-1">Add</span>
                  </button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoSelect}
                className="hidden"
              />
            </div>

            <div className="flex gap-3">
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Review'
                )}
              </Button>
              <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Reviews List */}
      <div className="space-y-6">
        {displayReviews.map((review) => (
          <div key={review.id} className="border-b pb-6 last:border-0">
            <div className="flex items-start justify-between mb-2">
              <div>
                <StarRating value={review.rating} />
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-semibold">{review.author}</span>
                  {review.verified && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                      ✓ Verified Purchase
                    </span>
                  )}
                </div>
              </div>
              <span className="text-sm text-gray-400">{review.date}</span>
            </div>

            <p className="text-gray-600 dark:text-gray-300 mb-3">{review.comment}</p>

            {review.photos.length > 0 && (
              <div className="flex gap-2 mb-3">
                {review.photos.map((photo, idx) => (
                  <div key={idx} className="relative w-16 h-16">
                    <Image
                      src={photo}
                      alt={`Review photo ${idx + 1}`}
                      fill
                      className="object-cover rounded-lg cursor-pointer hover:opacity-80 transition"
                    />
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => markHelpful(review.id)}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 transition"
            >
              <ThumbsUp className="w-4 h-4" />
              Helpful ({review.helpful})
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
