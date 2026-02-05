'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ShoppingCart, Heart, Minus, Plus, Loader2, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { formatPrice } from '@/lib/utils'
import { ImageGallery } from '@/components/product/ImageGallery'
import { ProductTabs } from '@/components/product/ProductTabs'
import { ProductFeatures } from '@/components/product/ProductFeatures'
import { RelatedProducts } from '@/components/product/RelatedProducts'
import { ReviewDisplay } from '@/components/product/ReviewDisplay'
import { generateSpecifications } from '@/lib/specifications'
import { AISizeRecommendation } from '@/components/AISizeRecommendation'
import { RecentlyViewedProducts } from '@/components/RecentlyViewed'
import { useTrackProductView } from '@/store/recently-viewed'
import { LimitedStockAlert } from '@/components/LimitedStockAlert'
import { ProductBundle } from '@/components/ProductBundle'
import { PriceDropAlert } from '@/components/PriceDropAlert'
import { SocialShare } from '@/components/SocialShare'
import { useCartStore } from '@/store/cart'
import { StickyMobileCart } from '@/components/product/StickyMobileCart'
import Link from 'next/link'
import { Breadcrumb } from '@/components/Breadcrumb'

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedVariant, setSelectedVariant] = useState<any>(null)
  const [quantity, setQuantity] = useState(1)
  const trackView = useTrackProductView()

  useEffect(() => {
    if (slug) {
      fetchProduct()
    }
  }, [slug])

  const fetchProduct = async () => {
    try {
      const res = await fetch(`/api/products?slug=${slug}`)
      if (res.ok) {
        const data = await res.json()
        if (data.products && data.products.length > 0) {
          const productData = data.products[0]
          setProduct(productData)
          // Track product view
          const images = typeof productData.images === 'string' ? JSON.parse(productData.images) : productData.images
          trackView({
            id: productData.id,
            name: productData.name,
            slug: productData.slug,
            price: productData.basePrice,
            salePrice: productData.salePrice,
            images
          })
          // Set first variant as default
          if (productData.variants && productData.variants.length > 0) {
            setSelectedVariant(productData.variants[0])
          }
        } else {
          router.push('/shop')
        }
      }
    } catch (error) {
      console.error('Error fetching product:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = () => {
    if (!selectedVariant) {
      alert('Please select a variant')
      return
    }

    const images = typeof product.images === 'string' ? JSON.parse(product.images) : product.images
    
    useCartStore.getState().addItem({
      productId: product.id,
      name: product.name,
      price: product.salePrice || product.basePrice,
      quantity,
      image: images?.[0] || '/placeholder.png',
      variantId: selectedVariant.id,
      size: selectedVariant.size,
      color: selectedVariant.color
    })

    alert(`✅ Added ${quantity} x ${product.name} to cart!`)
  }

  const handleBuyNow = () => {
    handleAddToCart()
    window.location.href = '/checkout'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-muted-foreground">Loading product...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h2 className="text-2xl font-bold mb-2">Product Not Found</h2>
          <p className="text-muted-foreground mb-4">The product you're looking for doesn't exist.</p>
          <Link href="/shop">
            <Button>Back to Shop</Button>
          </Link>
        </div>
      </div>
    )
  }

  const images = typeof product.images === 'string' 
    ? JSON.parse(product.images) 
    : product.images || []
  const discount = product.basePrice && product.salePrice
    ? Math.round(((product.basePrice - product.salePrice) / product.basePrice) * 100)
    : 0
  const specifications = generateSpecifications(product)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Breadcrumb - hidden on very small screens */}
        {/* Breadcrumb */}
        <div className="mb-6 hidden sm:block">
          <Breadcrumb 
            items={[
              { label: 'Shop', href: '/shop' },
              { label: product.category?.name || 'Category', href: `/shop?category=${product.category?.slug}` },
              { label: product.name }
            ]} 
          />
        </div>

        {/* Main Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-12">
          {/* Left: Image Gallery */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <ImageGallery images={images} productName={product.name} />
          </motion.div>

          {/* Right: Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card>
              <CardContent className="p-4 sm:p-6">
                {/* Product Name & Category */}
                <div className="mb-3 sm:mb-4">
                  <span className="text-xs sm:text-sm text-blue-600 font-semibold">
                    {product.category?.name}
                  </span>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mt-1 sm:mt-2 mb-2 sm:mb-3">{product.name}</h1>
                  
                  {/* Rating Summary */}
                  {product.reviews && product.reviews.length > 0 && (
                    <button
                      onClick={() => document.getElementById('reviews-section')?.scrollIntoView({ behavior: 'smooth' })}
                      className="flex items-center gap-2 text-sm hover:underline"
                    >
                      <div className="flex">
                        {[...Array(5)].map((_, i) => {
                          const avgRating = product.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / product.reviews.length
                          return (
                            <svg key={i} className={`w-4 h-4 ${i < Math.round(avgRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} viewBox="0 0 24 24">
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                            </svg>
                          )
                        })}
                      </div>
                      <span className="text-muted-foreground">
                        ({product.reviews.length} {product.reviews.length === 1 ? 'review' : 'reviews'})
                      </span>
                    </button>
                  )}
                </div>

                {/* Price */}
                <div className="mb-4 sm:mb-6">
                  <div className="flex items-center gap-2 sm:gap-3 flex-wrap mb-1 sm:mb-2">
                    <span className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-600">
                      {formatPrice(product.salePrice || product.basePrice)}
                    </span>
                    {product.salePrice && (
                      <>
                        <span className="text-base sm:text-lg lg:text-xl text-gray-500 line-through">
                          {formatPrice(product.basePrice)}
                        </span>
                        <span className="bg-red-500 text-white text-xs sm:text-sm font-bold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full">
                          Save {discount}%
                        </span>
                      </>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-green-600 font-semibold">
                    You save BDT {product.basePrice - (product.salePrice || product.basePrice)}
                  </p>
                </div>

                {/* Short Description */}
                <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 leading-relaxed">
                  {product.description.substring(0, 120)}...
                </p>

                {/* Variant Selection */}
                {product.variants && product.variants.length > 0 && (
                  <div className="mb-4 sm:mb-6">
                    <label className="block text-xs sm:text-sm font-semibold mb-2 sm:mb-3">
                      Select Variant: 
                      {selectedVariant && (
                        <span className="text-blue-600 ml-2">
                          {selectedVariant.size && `${selectedVariant.size}`}
                          {selectedVariant.size && selectedVariant.color && ' / '}
                          {selectedVariant.color && `${selectedVariant.color}`}
                        </span>
                      )}
                    </label>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {product.variants.map((variant: any) => (
                        <button
                          key={variant.id}
                          onClick={() => setSelectedVariant(variant)}
                          className={`px-3 sm:px-4 py-1.5 sm:py-2 border-2 rounded-lg text-xs sm:text-sm font-medium transition min-h-[36px] sm:min-h-[40px] ${
                            selectedVariant?.id === variant.id
                              ? 'border-blue-600 bg-blue-50 text-blue-600'
                              : 'border-gray-200 hover:border-gray-300'
                          } ${variant.stock === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                          disabled={variant.stock === 0}
                        >
                          {variant.size && variant.size}
                          {variant.size && variant.color && ' / '}
                          {variant.color && variant.color}
                          {variant.stock === 0 && ' (Out)'}
                        </button>
                      ))}
                    </div>
                    {selectedVariant && (
                      <p className="text-sm text-muted-foreground mt-2">
                        Stock: <span className="font-semibold text-green-600">{selectedVariant.stock} available</span>
                      </p>
                    )}
                    
                    {/* AI Size Recommendation */}
                    <AISizeRecommendation 
                      productCategory={product.category?.name || 'clothing'} 
                      availableSizes={product.variants?.map((v: any) => v.size).filter(Boolean) || []}
                      onSizeSelect={(size) => {
                        const variant = product.variants?.find((v: any) => v.size === size)
                        if (variant) setSelectedVariant(variant)
                      }}
                    />
                  </div>
                )}

                {/* Quantity Selector */}
                <div className="mb-4 sm:mb-6">
                  <label className="block text-xs sm:text-sm font-semibold mb-2 sm:mb-3">Quantity:</label>
                  <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                    <div className="flex items-center border-2 rounded-lg">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="p-2 sm:p-3 hover:bg-gray-100 transition min-w-[40px] min-h-[40px] flex items-center justify-center"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="px-4 sm:px-6 font-semibold text-sm sm:text-base">{quantity}</span>
                      <button
                        onClick={() => setQuantity(Math.min(selectedVariant?.stock || 99, quantity + 1))}
                        className="p-2 sm:p-3 hover:bg-gray-100 transition min-w-[40px] min-h-[40px] flex items-center justify-center"
                        disabled={!selectedVariant || quantity >= selectedVariant.stock}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <span className="text-xs sm:text-sm text-muted-foreground">
                      Total: <span className="font-bold text-blue-600 text-base sm:text-lg">
                        {formatPrice((product.salePrice || product.basePrice) * quantity)}
                      </span>
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 sm:gap-3 mb-4 sm:mb-6">
                  <Button
                    onClick={handleAddToCart}
                    disabled={!selectedVariant || selectedVariant.stock === 0}
                    className="flex-1 h-11 sm:h-12 text-sm sm:text-base lg:text-lg"
                    size="lg"
                  >
                    <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
                    Add to Cart
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="h-11 sm:h-12 w-11 sm:w-12 p-0"
                  >
                    <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
                  </Button>
                </div>

                <Button variant="default" className="w-full h-11 sm:h-12 bg-green-600 hover:bg-green-700 text-sm sm:text-base lg:text-lg" onClick={handleBuyNow}>
                  Buy Now
                </Button>

                {/* Limited Stock Alert */}
                {selectedVariant && selectedVariant.stock < 10 && selectedVariant.stock > 0 && (
                  <LimitedStockAlert stock={selectedVariant.stock} />
                )}

                {/* Price Drop Alert */}
                <PriceDropAlert productId={product.id} productName={product.name} currentPrice={product.salePrice || product.basePrice} />

                {/* Social Share */}
                <SocialShare 
                  url={typeof window !== 'undefined' ? window.location.href : ''} 
                  title={product.name}
                  description={product.description?.substring(0, 100)}
                />
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Product Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <ProductFeatures />
        </motion.div>

        {/* Product Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-12"
        >
          <ProductTabs product={product} specifications={specifications} />
        </motion.div>

        {/* Reviews Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-12"
        >
          <ReviewDisplay reviews={product.reviews || []} productId={product.id} />
        </motion.div>

        {/* Related Products */}
        {product.categoryId && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <RelatedProducts currentProductId={product.id} categoryId={product.categoryId} />
          </motion.div>
        )}

        {/* Recently Viewed Products */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <RecentlyViewedProducts />
        </motion.div>
      </div>

      <StickyMobileCart 
        product={product} 
        price={product.salePrice || product.basePrice} 
        originalPrice={product.basePrice}
        onAddToCart={handleAddToCart}
        disabled={!selectedVariant || selectedVariant.stock === 0}
      />
    </div>
  )
}

