'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ShoppingCart, Heart, Star, ChevronLeft, ChevronRight, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatPrice } from '@/lib/utils'

interface Product {
  id: string
  name: string
  slug: string
  description: string
  basePrice: number
  salePrice?: number | null
  images: string
  category?: { name: string }
  variants?: Array<{
    id: string
    size?: string
    color?: string
    stock: number
  }>
  reviews?: Array<{ rating: number }>
}

interface QuickViewModalProps {
  product: Product | null
  isOpen: boolean
  onClose: () => void
}

export function QuickViewModal({ product, isOpen, onClose }: QuickViewModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [selectedSize, setSelectedSize] = useState<string>('')
  const [selectedColor, setSelectedColor] = useState<string>('')
  const [quantity, setQuantity] = useState(1)
  const [addedToCart, setAddedToCart] = useState(false)

  // Parse images from JSON
  const images: string[] = product ? (
    typeof product.images === 'string' ? JSON.parse(product.images) : product.images
  ) : []

  // Get unique sizes and colors from variants
  const sizes = product?.variants 
    ? Array.from(new Set(product.variants.map(v => v.size).filter(Boolean))) as string[]
    : []
  
  const colors = product?.variants
    ? Array.from(new Set(product.variants.map(v => v.color).filter(Boolean))) as string[]
    : []

  // Calculate average rating
  const avgRating = product?.reviews?.length 
    ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
    : 0

  // Check stock for selected variant
  const selectedVariant = product?.variants?.find(
    v => v.size === selectedSize && v.color === selectedColor
  )
  const inStock = selectedVariant ? selectedVariant.stock > 0 : true

  // Reset state when product changes
  useEffect(() => {
    if (product) {
      setCurrentImageIndex(0)
      setSelectedSize(sizes[0] || '')
      setSelectedColor(colors[0] || '')
      setQuantity(1)
      setAddedToCart(false)
    }
  }, [product?.id])

  const handleAddToCart = async () => {
    if (!product) return
    
    try {
      const { useCartStore } = await import('@/store/cart')
      useCartStore.getState().addItem({
        productId: product.id,
        name: product.name,
        price: product.salePrice || product.basePrice,
        quantity,
        image: images[0] || '/placeholder.jpg',
        variantId: selectedVariant?.id,
        size: selectedSize,
        color: selectedColor,
      })
      
      setAddedToCart(true)
      setTimeout(() => setAddedToCart(false), 2000)
    } catch (error) {
      console.error('Failed to add to cart:', error)
    }
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  if (!product) return null

  const discountPercent = product.salePrice 
    ? Math.round((1 - product.salePrice / product.basePrice) * 100)
    : 0

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[900px] md:max-h-[85vh] bg-white rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-2 bg-white/90 rounded-full shadow-lg hover:bg-gray-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 h-full max-h-[85vh] overflow-auto">
              {/* Left: Images */}
              <div className="relative bg-gray-100 aspect-square md:aspect-auto">
                {/* Main Image */}
                <div className="relative h-full min-h-[300px] md:min-h-[400px]">
                  <Image
                    src={images[currentImageIndex] || '/placeholder.jpg'}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                  
                  {/* Sale Badge */}
                  {discountPercent > 0 && (
                    <Badge className="absolute top-4 left-4 bg-red-500 text-white text-sm px-3 py-1">
                      -{discountPercent}%
                    </Badge>
                  )}

                  {/* Image Navigation */}
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full shadow-lg hover:bg-white transition"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full shadow-lg hover:bg-white transition"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </>
                  )}
                </div>

                {/* Thumbnail Strip */}
                {images.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {images.slice(0, 5).map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition ${
                          idx === currentImageIndex ? 'border-blue-600' : 'border-white'
                        }`}
                      >
                        <Image
                          src={img}
                          alt=""
                          width={48}
                          height={48}
                          className="object-cover w-full h-full"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Right: Details */}
              <div className="p-6 md:p-8 flex flex-col">
                {/* Category */}
                {product.category && (
                  <span className="text-sm text-blue-600 font-medium mb-2">
                    {product.category.name}
                  </span>
                )}

                {/* Title */}
                <h2 className="text-2xl font-bold mb-2">{product.name}</h2>

                {/* Rating */}
                {avgRating > 0 && (
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= avgRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      ({product.reviews?.length || 0} reviews)
                    </span>
                  </div>
                )}

                {/* Price */}
                <div className="flex items-center gap-3 mb-4">
                  {product.salePrice ? (
                    <>
                      <span className="text-3xl font-bold text-blue-600">
                        {formatPrice(product.salePrice)}
                      </span>
                      <span className="text-xl text-gray-400 line-through">
                        {formatPrice(product.basePrice)}
                      </span>
                    </>
                  ) : (
                    <span className="text-3xl font-bold text-blue-600">
                      {formatPrice(product.basePrice)}
                    </span>
                  )}
                </div>

                {/* Description */}
                <p className="text-muted-foreground mb-6 line-clamp-3">
                  {product.description}
                </p>

                {/* Size Selection */}
                {sizes.length > 0 && (
                  <div className="mb-4">
                    <label className="text-sm font-medium mb-2 block">Size</label>
                    <div className="flex flex-wrap gap-2">
                      {sizes.map((size) => (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size || '')}
                          className={`px-4 py-2 border rounded-lg text-sm font-medium transition ${
                            selectedSize === size
                              ? 'border-blue-600 bg-blue-50 text-blue-600'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Color Selection */}
                {colors.length > 0 && (
                  <div className="mb-6">
                    <label className="text-sm font-medium mb-2 block">Color</label>
                    <div className="flex flex-wrap gap-2">
                      {colors.map((color) => (
                        <button
                          key={color}
                          onClick={() => setSelectedColor(color || '')}
                          className={`px-4 py-2 border rounded-lg text-sm font-medium transition ${
                            selectedColor === color
                              ? 'border-blue-600 bg-blue-50 text-blue-600'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {color}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity */}
                <div className="mb-6">
                  <label className="text-sm font-medium mb-2 block">Quantity</label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 border rounded-lg flex items-center justify-center hover:bg-gray-50"
                    >
                      -
                    </button>
                    <span className="w-12 text-center font-semibold">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-10 h-10 border rounded-lg flex items-center justify-center hover:bg-gray-50"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 mt-auto">
                  <Button
                    onClick={handleAddToCart}
                    disabled={!inStock || addedToCart}
                    className="flex-1 h-12"
                  >
                    {addedToCart ? (
                      <>
                        <Check className="w-5 h-5 mr-2" />
                        Added to Cart!
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-5 h-5 mr-2" />
                        {inStock ? 'Add to Cart' : 'Out of Stock'}
                      </>
                    )}
                  </Button>
                  <Button variant="outline" size="icon" className="h-12 w-12">
                    <Heart className="w-5 h-5" />
                  </Button>
                </div>

                {/* View Full Details Link */}
                <Link
                  href={`/product/${product.slug}`}
                  onClick={onClose}
                  className="text-center text-sm text-blue-600 hover:underline mt-4"
                >
                  View Full Details →
                </Link>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default QuickViewModal
