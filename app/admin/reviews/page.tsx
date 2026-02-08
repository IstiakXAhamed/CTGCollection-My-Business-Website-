'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Star, Trash2, MessageSquare, Send, X, Loader2, CheckCircle, Filter, Search, Bot } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { formatPrice } from '@/lib/utils'
import { AIReviewAssist } from '@/components/ai/AIReviewAssist'

interface Review {
  id: string
  productId: string
  userId: string
  rating: number
  comment: string | null
  photos: string | null
  isApproved: boolean
  adminReply: string | null
  adminReplyAt: string | null
  adminReplyBy: string | null
  createdAt: string
  user: { id: string; name: string }
  product: { id: string; name: string; slug: string }
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchReviews()
  }, [filter])

  const fetchReviews = async () => {
    setLoading(true)
    try {
      let url = '/api/admin/reviews'
      if (filter !== 'all') {
        url += `?status=${filter}`
      }
      const res = await fetch(url, { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setReviews(data.reviews || [])
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  const approveReview = async (reviewId: string) => {
    try {
      const res = await fetch(`/api/admin/reviews/${reviewId}/approve`, {
        method: 'POST',
        credentials: 'include'
      })
      if (res.ok) {
        setReviews(prev => prev.map(r => 
          r.id === reviewId ? { ...r, isApproved: true } : r
        ))
      }
    } catch (error) {
      console.error('Failed to approve review:', error)
    }
  }

  const deleteReview = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return
    
    try {
      const res = await fetch(`/api/reviews/${reviewId}`, {
        method: 'DELETE',
        credentials: 'include'
      })
      if (res.ok) {
        setReviews(prev => prev.filter(r => r.id !== reviewId))
      }
    } catch (error) {
      console.error('Failed to delete review:', error)
    }
  }

  const submitReply = async (reviewId: string) => {
    if (!replyText.trim()) return
    setSubmitting(true)
    
    try {
      const res = await fetch(`/api/reviews/${reviewId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ reply: replyText })
      })
      
      if (res.ok) {
        const data = await res.json()
        setReviews(prev => prev.map(r => 
          r.id === reviewId ? { 
            ...r, 
            adminReply: replyText, 
            adminReplyAt: new Date().toISOString() 
          } : r
        ))
        setReplyingTo(null)
        setReplyText('')
      } else {
        alert('Failed to submit reply')
      }
    } catch (error) {
      console.error('Failed to submit reply:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const deleteReply = async (reviewId: string) => {
    try {
      const res = await fetch(`/api/reviews/${reviewId}/reply`, {
        method: 'DELETE',
        credentials: 'include'
      })
      if (res.ok) {
        setReviews(prev => prev.map(r => 
          r.id === reviewId ? { ...r, adminReply: null, adminReplyAt: null } : r
        ))
      }
    } catch (error) {
      console.error('Failed to delete reply:', error)
    }
  }

  const filteredReviews = reviews.filter(review => {
    if (!searchQuery) return true
    return (
      review.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (review.comment && review.comment.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  })

  const renderStars = (rating: number) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(star => (
        <Star
          key={star}
          className={`w-4 h-4 ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
        />
      ))}
    </div>
  )

  const parsePhotos = (photos: string | null): string[] => {
    if (!photos) return []
    try {
      return JSON.parse(photos)
    } catch {
      return []
    }
  }

  return (
  const [aiAssistId, setAiAssistId] = useState<string | null>(null)

  // ... (previous code)

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* ... (Header & Filters remain same) */}
      
      {/* Reviews List */}
      {loading ? (
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
          <p className="text-muted-foreground">Loading reviews...</p>
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No reviews found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredReviews.map(review => (
            <Card key={review.id} className={!review.isApproved ? 'border-yellow-300 bg-yellow-50/50' : ''}>
              <CardContent className="p-3 sm:p-4">
                {/* Header & Rating (Same as before) */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm truncate">{review.user.name}</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                      <span className="text-blue-600">{review.product.name}</span>
                    </p>
                  </div>
                  <span className={`px-1.5 py-0.5 text-[10px] rounded-full flex-shrink-0 ${review.isApproved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {review.isApproved ? 'OK' : 'Pending'}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 mb-2">
                  {renderStars(review.rating)}
                  <span className="text-[10px] sm:text-xs text-muted-foreground">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {review.comment && (
                  <p className="text-xs sm:text-sm text-gray-700 mb-2 bg-gray-50 p-2 sm:p-3 rounded-lg line-clamp-3">
                    "{review.comment}"
                  </p>
                )}

                {/* Photos (Same as before) */}
                {parsePhotos(review.photos).length > 0 && (
                  <div className="flex gap-1.5 mb-2 overflow-x-auto pb-1">
                    {parsePhotos(review.photos).map((photo, idx) => (
                      <div key={idx} className="relative w-12 h-12 sm:w-16 sm:h-16 rounded overflow-hidden flex-shrink-0">
                        <Image src={photo} alt={`Photo ${idx + 1}`} fill className="object-cover" />
                      </div>
                    ))}
                  </div>
                )}

                {/* Admin Reply Display */}
                {review.adminReply && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-blue-700">Store Reply</span>
                      <button 
                        onClick={() => deleteReply(review.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                    <p className="text-sm text-blue-800">{review.adminReply}</p>
                  </div>
                )}

                {/* AI Assist Panel */}
                {aiAssistId === review.id && (
                  <div className="mb-3">
                    <AIReviewAssist 
                      reviewText={review.comment || ''}
                      rating={review.rating}
                      productName={review.product.name}
                      onResponseGenerated={(response) => {
                        setReplyText(response)
                        setReplyingTo(review.id)
                        setAiAssistId(null) // Close AI panel, open manual reply with text filled
                      }}
                    />
                    <Button variant="ghost" size="sm" className="w-full mt-1 text-xs text-muted-foreground" onClick={() => setAiAssistId(null)}>
                      Cancel AI Assist
                    </Button>
                  </div>
                )}

                {/* Reply Form */}
                {replyingTo === review.id && (
                  <div className="flex gap-2 mb-3">
                    <Input
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Write your reply..."
                      className="flex-1"
                    />
                    <Button 
                      size="sm" 
                      onClick={() => submitReply(review.id)}
                      disabled={submitting || !replyText.trim()}
                    >
                      {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => { setReplyingTo(null); setReplyText('') }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {!review.isApproved && (
                    <Button size="sm" className="h-7 text-xs px-2" onClick={() => approveReview(review.id)}>
                      <CheckCircle className="w-3 h-3 sm:mr-1" />
                      <span className="hidden sm:inline">Approve</span>
                    </Button>
                  )}
                  
                  {!review.adminReply && replyingTo !== review.id && aiAssistId !== review.id && (
                    <>
                      <Button size="sm" variant="outline" className="h-7 text-xs px-2" onClick={() => setReplyingTo(review.id)}>
                        <MessageSquare className="w-3 h-3 sm:mr-1" />
                        <span className="hidden sm:inline">Reply</span>
                      </Button>
                      <Button size="sm" variant="secondary" className="h-7 text-xs px-2 bg-purple-100 text-purple-700 hover:bg-purple-200 border-purple-200" onClick={() => setAiAssistId(review.id)}>
                        <Bot className="w-3 h-3 sm:mr-1" />
                        <span className="hidden sm:inline">AI Reply</span>
                      </Button>
                    </>
                  )}
                  
                  <Button size="sm" variant="destructive" className="h-7 text-xs px-2" onClick={() => deleteReview(review.id)}>
                    <Trash2 className="w-3 h-3 sm:mr-1" />
                    <span className="hidden sm:inline">Delete</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
