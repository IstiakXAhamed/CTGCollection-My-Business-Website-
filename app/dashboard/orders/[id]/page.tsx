'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Package, Truck, CheckCircle, MapPin, FileDown, Shield, CreditCard, Loader2, Star, Edit2, X, Send, Camera, ImagePlus, Trash2, Undo2 } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

const statusSteps = ['pending', 'confirmed', 'processing', 'shipped', 'delivered']

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [downloadingReceipt, setDownloadingReceipt] = useState(false)
  
  // Review state
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [reviewingProduct, setReviewingProduct] = useState<any>(null)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  const [reviewPhotos, setReviewPhotos] = useState<string[]>([])
  const [submittingReview, setSubmittingReview] = useState(false)
  const [existingReviews, setExistingReviews] = useState<{[key: string]: any}>({})

  // Refund State
  const [showRefundModal, setShowRefundModal] = useState(false)
  const [refundReason, setRefundReason] = useState('')
  const [isSubmittingRefund, setIsSubmittingRefund] = useState(false)

  const handleRefundRequest = async () => {
    if (!refundReason) return alert('Please provide a reason')
    
    setIsSubmittingRefund(true)
    try {
      const res = await fetch('/api/refunds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id,
          amount: order.total,
          reason: refundReason,
          images: [] // TODO: Add Image upload for refunds if needed
        })
      })

      if (res.ok) {
        alert('Refund request submitted successfully')
        setShowRefundModal(false)
      } else {
        const err = await res.json()
        alert(err.error || 'Failed to submit request')
      }
    } catch (e) {
      alert('Error submitting request')
    } finally {
      setIsSubmittingRefund(false)
    }
  }

  useEffect(() => {
    if (params.id) {
      fetchOrder(params.id as string)
    }
  }, [params.id])

  const fetchOrder = async (orderId: string) => {
    try {
      const res = await fetch(`/api/user/orders/${orderId}`, { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setOrder(data)
      }
    } catch (error) {
      console.error('Failed to fetch order:', error)
    } finally {
      setLoading(false)
    }
  }

  const downloadReceipt = async () => {
    setDownloadingReceipt(true)
    try {
      const res = await fetch(`/api/orders/${order.id}/receipt`, { credentials: 'include' })
      const data = await res.json()
      
      if (res.ok && data.receiptUrl) {
        // Mobile-friendly: Create a temporary link and click it
        // This avoids popup blocker issues on mobile browsers
        const link = document.createElement('a')
        link.href = data.receiptUrl
        link.target = '_blank'
        link.rel = 'noopener noreferrer'
        // For better mobile compatibility, briefly add to DOM, click, then remove
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } else {
        alert(data.error || 'Receipt not available yet')
      }
    } catch (error) {
      alert('Failed to download receipt')
    } finally {
      setDownloadingReceipt(false)
    }
  }

  const downloadPremiumReceipt = async () => {
    setDownloadingReceipt(true)
    try {
      const res = await fetch(`/api/orders/${order.id}/receipt-premium`, { credentials: 'include' })
      const data = await res.json()
      
      if (res.ok && data.receiptUrl) {
        // Mobile-friendly download
        const link = document.createElement('a')
        link.href = data.receiptUrl
        link.target = '_blank'
        link.rel = 'noopener noreferrer'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } else {
        alert(data.error || 'Premium receipt not available')
      }
    } catch (error) {
      alert('Failed to download premium receipt')
    } finally {
      setDownloadingReceipt(false)
    }
  }

  // Fetch existing reviews for order items
  const fetchExistingReviews = async (orderItems: any[]) => {
    const reviews: {[key: string]: any} = {}
    for (const item of orderItems) {
      try {
        const res = await fetch(`/api/reviews?productId=${item.product.id}&myReview=true`, { credentials: 'include' })
        if (res.ok) {
          const data = await res.json()
          if (data.myReview) {
            reviews[item.product.id] = data.myReview
          }
        }
      } catch (error) {
        console.error('Failed to fetch review:', error)
      }
    }
    setExistingReviews(reviews)
  }

  // Open review modal for a product
  const openReviewModal = (item: any, existingReview?: any) => {
    setReviewingProduct(item)
    if (existingReview) {
      setReviewRating(existingReview.rating)
      setReviewComment(existingReview.comment || '')
      // Parse existing photos
      if (existingReview.photos) {
        try {
          const photos = JSON.parse(existingReview.photos)
          setReviewPhotos(Array.isArray(photos) ? photos : [])
        } catch {
          setReviewPhotos([])
        }
      } else {
        setReviewPhotos([])
      }
    } else {
      setReviewRating(5)
      setReviewComment('')
      setReviewPhotos([])
    }
    setShowReviewModal(true)
  }

  // Handle photo upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    // Limit to 5 photos total
    const remainingSlots = 5 - reviewPhotos.length
    if (remainingSlots <= 0) {
      alert('Maximum 5 photos allowed')
      return
    }

    const filesToProcess = Array.from(files).slice(0, remainingSlots)

    filesToProcess.forEach(file => {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('Photo size should be less than 5MB')
        return
      }

      const reader = new FileReader()
      reader.onload = (event) => {
        const base64 = event.target?.result as string
        setReviewPhotos(prev => [...prev, base64])
      }
      reader.readAsDataURL(file)
    })
    
    // Reset input
    e.target.value = ''
  }

  // Remove photo
  const removePhoto = (index: number) => {
    setReviewPhotos(prev => prev.filter((_, i) => i !== index))
  }

  // Submit or update review
  const submitReview = async () => {
    if (!reviewingProduct) return
    setSubmittingReview(true)
    
    try {
      const existingReview = existingReviews[reviewingProduct.product.id]
      const method = existingReview ? 'PUT' : 'POST'
      const url = existingReview 
        ? `/api/reviews/${existingReview.id}` 
        : '/api/reviews'
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          productId: reviewingProduct.product.id,
          rating: reviewRating,
          comment: reviewComment,
          photos: reviewPhotos.length > 0 ? reviewPhotos : undefined
        })
      })
      
      if (res.ok) {
        const data = await res.json()
        setExistingReviews(prev => ({
          ...prev,
          [reviewingProduct.product.id]: data.review || data
        }))
        setShowReviewModal(false)
        alert(existingReview ? 'Review updated!' : 'Review submitted!')
      } else {
        const err = await res.json()
        alert(err.error || 'Failed to submit review')
      }
    } catch (error) {
      alert('Failed to submit review')
    } finally {
      setSubmittingReview(false)
    }
  }

  // Fetch reviews when order loads
  useEffect(() => {
    if (order?.items && order.status === 'delivered') {
      fetchExistingReviews(order.items)
    }
  }, [order])

  if (loading) return <div className="text-center py-12">Loading order...</div>
  if (!order) return <div className="text-center py-12">Order not found</div>

  const currentStepIndex = statusSteps.indexOf(order.status)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Orders
        </Button>
        
        {/* Request Refund */}
        {order.status === 'delivered' && (
           <Button
             onClick={() => setShowRefundModal(true)}
             variant="outline"
             className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
           >
             <Undo2 className="w-4 h-4 mr-2" />
             Request Refund
           </Button>
        )}

        {/* Receipt Download - Single glowing blue button */}
        {order.paymentStatus === 'paid' && (
          <Button 
            onClick={downloadReceipt}
            disabled={downloadingReceipt}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all"
          >
            {downloadingReceipt ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <span className="mr-2">📄</span>
            )}
            Download Receipt
          </Button>
        )}
      </div>

      <div>
        <h1 className="text-3xl font-bold mb-2">Order #{order.orderNumber}</h1>
        <p className="text-muted-foreground">
          Placed on {new Date(order.createdAt).toLocaleDateString('en-BD', {
            day: 'numeric', month: 'long', year: 'numeric'
          })}
        </p>
      </div>

      {/* Payment Status Banner */}
      <div className={`p-4 rounded-lg flex items-center gap-3 ${
        order.paymentStatus === 'paid' 
          ? 'bg-green-50 border border-green-200' 
          : 'bg-yellow-50 border border-yellow-200'
      }`}>
        <CreditCard className={`w-6 h-6 ${order.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'}`} />
        <div>
          <p className={`font-semibold ${order.paymentStatus === 'paid' ? 'text-green-700' : 'text-yellow-700'}`}>
            {order.paymentStatus === 'paid' ? '✓ Payment Confirmed' : '⏳ Payment Pending'}
          </p>
          <p className="text-sm text-muted-foreground">
            {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
            {order.paymentStatus === 'paid' && ' - Receipt available for download'}
          </p>
        </div>
      </div>

      {/* Order Status Timeline */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Order Status</h2>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-8">
            {statusSteps.map((step, index) => (
              <div key={step} className="flex-1 relative">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    index <= currentStepIndex ? 'bg-blue-600 text-white' : 'bg-gray-200'
                  }`}>
                    {index < currentStepIndex ? <CheckCircle className="w-6 h-6" /> : index + 1}
                  </div>
                  <p className="text-xs mt-2 capitalize">{step}</p>
                </div>
                {index < statusSteps.length - 1 && (
                  <div className={`absolute top-5 left-1/2 w-full h-0.5 ${
                    index < currentStepIndex ? 'bg-blue-600' : 'bg-gray-200'
                  }`} style={{ zIndex: -1 }} />
                )}
              </div>
            ))}
          </div>

          {order.trackingNumber && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Tracking Number</p>
              <p className="font-mono font-semibold">{order.trackingNumber}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Items */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Order Items</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          {order.items.map((item: any) => {
            const images = typeof item.product.images === 'string' 
              ? JSON.parse(item.product.images) 
              : item.product.images
            const imageUrl = images?.[0] || '/placeholder.png'
            
            return (
              <div key={item.id} className="flex gap-4 pb-4 border-b last:border-0">
                <div className="relative w-20 h-20 bg-gray-100 rounded overflow-hidden">
                  <Image
                    src={imageUrl}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                    unoptimized={imageUrl.includes('picsum.photos')}
                  />
                </div>
                <div className="flex-1">
                  <Link href={`/product/${item.product.slug}`} className="font-semibold hover:text-blue-600">
                    {item.product.name}
                  </Link>
                  <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                  {item.variantInfo && (
                    <p className="text-sm text-muted-foreground">
                      {(() => {
                        try {
                          const v = JSON.parse(item.variantInfo)
                          return `${v.size || ''} ${v.color ? '- ' + v.color : ''}`
                        } catch { return '' }
                      })()}
                    </p>
                  )}
                  {/* Warranty Badge */}
                  {item.product.hasWarranty && (
                    <div className="flex items-center gap-1 mt-1 text-green-600 text-sm">
                      <Shield className="w-4 h-4" />
                      <span>{item.product.warrantyPeriod || 'Warranty Included'}</span>
                    </div>
                  )}
                </div>
                <div className="text-right flex flex-col items-end gap-2">
                  <p className="font-semibold">{formatPrice(item.price)}</p>
                  <p className="text-sm text-muted-foreground">×{item.quantity}</p>
                  
                  {/* Review Button - Only for delivered orders */}
                  {order.status === 'delivered' && (
                    <Button
                      size="sm"
                      variant={existingReviews[item.product.id] ? 'outline' : 'default'}
                      onClick={() => openReviewModal(item, existingReviews[item.product.id])}
                      className="mt-1"
                    >
                      {existingReviews[item.product.id] ? (
                        <>
                          <Edit2 className="w-3 h-3 mr-1" />
                          Edit Review
                        </>
                      ) : (
                        <>
                          <Star className="w-3 h-3 mr-1" />
                          Write Review
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Shipping Address */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Shipping Address
          </h2>
        </CardHeader>
        <CardContent>
          <p className="font-semibold">{order.address.name}</p>
          <p>{order.address.phone}</p>
          <p className="text-muted-foreground mt-2">
            {order.address.address}, {order.address.city}
            <br />
            {order.address.district}{order.address.postalCode && `, ${order.address.postalCode}`}
          </p>
        </CardContent>
      </Card>

      {/* Order Summary */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Order Summary</h2>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatPrice(order.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>{formatPrice(order.shippingCost)}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Discount{order.couponCode && ` (${order.couponCode})`}</span>
              <span>-{formatPrice(order.discount)}</span>
            </div>
          )}
          <div className="flex justify-between text-lg font-bold pt-2 border-t">
            <span>Total</span>
            <span className="text-blue-600">{formatPrice(order.total)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Review Modal */}
      <AnimatePresence>
        {showReviewModal && reviewingProduct && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setShowReviewModal(false)}
            />
            
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-md bg-white rounded-xl shadow-2xl z-50 p-6"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  {existingReviews[reviewingProduct.product.id] ? 'Edit Review' : 'Write a Review'}
                </h3>
                <button onClick={() => setShowReviewModal(false)} className="p-1 hover:bg-gray-100 rounded">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {/* Product Info */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded overflow-hidden relative">
                  <Image
                    src={(() => {
                      const images = typeof reviewingProduct.product.images === 'string' 
                        ? JSON.parse(reviewingProduct.product.images) 
                        : reviewingProduct.product.images
                      return images?.[0] || '/placeholder.png'
                    })()}
                    alt={reviewingProduct.product.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <p className="font-medium text-sm">{reviewingProduct.product.name}</p>
              </div>
              
              {/* Star Rating */}
              <div className="mb-4">
                <label className="text-sm font-medium mb-2 block">Your Rating</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="p-1 transition-transform hover:scale-110"
                    >
                      <Star 
                        className={`w-8 h-8 ${
                          star <= reviewRating 
                            ? 'text-yellow-400 fill-yellow-400' 
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Comment */}
              <div className="mb-4">
                <label className="text-sm font-medium mb-2 block">Your Review (Optional)</label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share your experience with this product..."
                  className="w-full p-3 border rounded-lg text-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  rows={3}
                />
              </div>
              
              {/* Photo Upload */}
              <div className="mb-4">
                <label className="text-sm font-medium mb-2 block">Add Photos (Optional, max 5)</label>
                
                {/* Photo Preview Grid */}
                {reviewPhotos.length > 0 && (
                  <div className="grid grid-cols-5 gap-2 mb-2">
                    {reviewPhotos.map((photo, index) => (
                      <div key={index} className="relative aspect-square rounded overflow-hidden group">
                        <Image
                          src={photo}
                          alt={`Review photo ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removePhoto(index)}
                          className="absolute top-0 right-0 p-1 bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Add Photo Button */}
                {reviewPhotos.length < 5 && (
                  <label className="flex items-center justify-center gap-2 p-3 border-2 border-dashed rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
                    <Camera className="w-5 h-5 text-gray-500" />
                    <span className="text-sm text-gray-600">Add Photos ({reviewPhotos.length}/5)</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              
              {/* Submit Button */}
              <Button 
                onClick={submitReview} 
                disabled={submittingReview}
                className="w-full"
              >
                {submittingReview ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                {existingReviews[reviewingProduct.product.id] ? 'Update Review' : 'Submit Review'}
              </Button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      <Dialog open={showRefundModal} onOpenChange={setShowRefundModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Refund</DialogTitle>
            <DialogDescription>
              We are sorry you are not satisfied. Please tell us why you want to return this order.
              Note: Refund requests are subject to approval.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
             <div className="space-y-2">
               <Label>Reason for Refund</Label>
               <Textarea 
                 value={refundReason}
                 onChange={(e) => setRefundReason(e.target.value)}
                 placeholder="e.g. Damaged item, wrong size, etc."
                 rows={4}
               />
             </div>
             <p className="text-sm text-muted-foreground">
               Refund Amount: <span className="font-bold text-gray-900">{formatPrice(order?.total)}</span>
             </p>
          </div>
          <DialogFooter>
             <Button variant="outline" onClick={() => setShowRefundModal(false)}>Cancel</Button>
             <Button onClick={handleRefundRequest} disabled={isSubmittingRefund} className="bg-red-600 hover:bg-red-700">
               {isSubmittingRefund && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
               Submit Request
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

