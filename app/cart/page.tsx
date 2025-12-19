'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import Image from 'next/image'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'
import { useCartStore } from '@/store/cart'

interface CartItem {
  id: string
  productId: string
  name: string
  price: number
  quantity: number
  image: string
  variantId?: string
  size?: string
  color?: string
}

export default function CartPage() {
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null)
  const [mounted, setMounted] = useState(false)
  const [items, setItems] = useState<CartItem[]>([])
  const [bestCouponLoading, setBestCouponLoading] = useState(false)
  const [bestCouponSuggestion, setBestCouponSuggestion] = useState<any>(null)

  // Load cart from localStorage on mount
  useEffect(() => {
    // Small delay to allow Zustand persist to rehydrate from localStorage
    const loadCart = () => {
      const store = useCartStore.getState()
      console.log('Cart items from store:', store.items.length, store.items)
      setItems(store.items)
      // Load any previously applied coupon
      if (store.appliedCoupon) {
        setAppliedCoupon(store.appliedCoupon)
        setCouponCode(store.appliedCoupon.code)
      }
      setMounted(true)
    }
    
    // Try immediately first
    loadCart()
    
    // Also try after a small delay in case persist hasn't hydrated yet
    const timeout = setTimeout(loadCart, 100)
    
    // Subscribe to store changes for updates
    const unsubscribe = useCartStore.subscribe((state) => {
      console.log('Cart store updated:', state.items.length)
      setItems(state.items)
      if (state.appliedCoupon) {
        setAppliedCoupon(state.appliedCoupon)
      }
    })
    
    return () => {
      clearTimeout(timeout)
      unsubscribe()
    }
  }, [])

  // Auto-apply best coupon when cart items change (only if autoApply coupons exist)
  useEffect(() => {
    const fetchBestCoupon = async () => {
      const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
      if (subtotal <= 0 || appliedCoupon) return

      setBestCouponLoading(true)
      try {
        const res = await fetch(`/api/coupons/best?total=${subtotal}`)
        if (res.ok) {
          const data = await res.json()
          if (data.found && data.coupon) {
            // Auto-apply the best coupon and save to store
            const couponData = {
              code: data.coupon.code,
              discountType: data.coupon.discountType as 'percentage' | 'fixed' | 'free_shipping',
              discountValue: data.coupon.discountValue,
              maxDiscount: data.coupon.maxDiscount,
              isFreeShipping: data.coupon.isFreeShipping || data.coupon.discountType === 'free_shipping'
            }
            setAppliedCoupon(couponData)
            setCouponCode(data.coupon.code)
            setBestCouponSuggestion({
              savings: data.savings,
              message: data.message,
              isFreeShipping: couponData.isFreeShipping
            })
            // Save to cart store for persistence
            useCartStore.getState().applyCoupon(couponData)
          }
        }
      } catch (error) {
        console.log('Failed to fetch best coupon')
      } finally {
        setBestCouponLoading(false)
      }
    }

    if (mounted && items.length > 0 && !appliedCoupon) {
      fetchBestCoupon()
    }
  }, [mounted, items, appliedCoupon])

  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return
    useCartStore.getState().updateQuantity(itemId, newQuantity)
  }

  const handleRemoveItem = (itemId: string) => {
    useCartStore.getState().removeItem(itemId)
  }

  const handleClearCart = () => {
    useCartStore.getState().clearCart()
  }

  const applyCoupon = async () => {
    try {
      const res = await fetch(`/api/coupons/validate?code=${couponCode}`)
      if (res.ok) {
        const data = await res.json()
        const couponData = {
          code: data.coupon.code,
          discountType: data.coupon.discountType,
          discountValue: data.coupon.discountValue,
          maxDiscount: data.coupon.maxDiscount
        }
        setAppliedCoupon(couponData)
        useCartStore.getState().applyCoupon(couponData)
        setBestCouponSuggestion(null) // Clear auto-apply message
        alert('Coupon applied successfully!')
      } else {
        // Fallback mock coupons
        if (couponCode.toUpperCase() === 'WELCOME10') {
          const couponData = { code: 'WELCOME10', discountType: 'percentage' as const, discountValue: 10 }
          setAppliedCoupon(couponData)
          useCartStore.getState().applyCoupon(couponData)
          alert('Coupon applied! 10% discount')
        } else if (couponCode.toUpperCase() === 'SAVE500') {
          const couponData = { code: 'SAVE500', discountType: 'fixed' as const, discountValue: 500 }
          setAppliedCoupon(couponData)
          useCartStore.getState().applyCoupon(couponData)
          alert('Coupon applied! ৳500 off')
        } else {
          alert('Invalid coupon code')
        }
      }
    } catch (error) {
      alert('Failed to validate coupon')
    }
  }

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const baseShippingCost = subtotal >= 2000 ? 0 : (subtotal > 0 ? 100 : 0)
  
  let discount = 0
  let isFreeShipping = false
  
  if (appliedCoupon) {
    if (appliedCoupon.discountType === 'free_shipping') {
      isFreeShipping = true
      discount = 0
    } else if (appliedCoupon.discountType === 'percentage') {
      discount = Math.round(subtotal * (appliedCoupon.discountValue / 100))
    } else {
      discount = appliedCoupon.discountValue
    }
  }
  
  const shippingCost = isFreeShipping ? 0 : baseShippingCost
  const total = Math.max(0, subtotal - discount + shippingCost)

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2">Shopping Cart</h1>
          <p className="text-muted-foreground">
            {items.length} {items.length === 1 ? 'item' : 'items'} in your cart
          </p>
        </motion.div>

        {items.length === 0 ? (
          <Card className="p-12 text-center">
            <ShoppingCart className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6">
              Add some products to get started!
            </p>
            <Button asChild size="lg">
              <Link href="/shop">Browse Products</Link>
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {/* Clear Cart Button */}
              <div className="flex justify-end mb-4">
                <Button variant="outline" size="sm" onClick={handleClearCart} className="text-red-600 hover:bg-red-50">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear Cart
                </Button>
              </div>

              {items.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card>
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                        {/* Product Image */}
                        <div className="flex gap-3 sm:gap-4">
                          <div className="flex-shrink-0">
                            <div className="w-20 h-20 sm:w-24 sm:h-24 relative rounded-lg overflow-hidden bg-gray-100">
                              <Image
                                src={item.image || '/placeholder.png'}
                                alt={item.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                          </div>

                          {/* Product Info - Mobile: next to image */}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm sm:text-base line-clamp-2">{item.name}</h3>
                            {(item.size || item.color) && (
                              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">
                                {item.size && `Size: ${item.size}`}
                                {item.size && item.color && ' · '}
                                {item.color && `Color: ${item.color}`}
                              </p>
                            )}
                            <p className="text-base sm:text-lg font-bold text-blue-600 mt-1 sm:mt-2">
                              {formatPrice(item.price)}
                            </p>
                          </div>
                          
                          {/* Delete button - Mobile: top right */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 sm:hidden h-8 w-8 p-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        {/* Quantity Controls - Mobile: full width row */}
                        <div className="flex items-center justify-between sm:flex-col sm:items-end sm:justify-between">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 hidden sm:flex"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>

                          <div className="flex items-center border-2 rounded-lg">
                            <button
                              onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                              className="p-2 sm:p-2 hover:bg-gray-100 transition min-w-[40px] min-h-[40px] flex items-center justify-center"
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="px-3 sm:px-4 font-semibold min-w-[40px] text-center">{item.quantity}</span>
                            <button
                              onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                              className="p-2 sm:p-2 hover:bg-gray-100 transition min-w-[40px] min-h-[40px] flex items-center justify-center"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>

                          <p className="text-sm text-muted-foreground sm:mt-2">
                            <span className="font-semibold text-foreground">
                              {formatPrice(item.price * item.quantity)}
                            </span>
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Order Summary */}
            <div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="sticky top-24"
              >
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-bold mb-6">Order Summary</h2>

                    {/* Coupon Code */}
                    <div className="mb-6">
                      <label className="text-sm font-semibold mb-2 block">
                        Have a coupon?
                      </label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Enter code"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        />
                        <Button onClick={applyCoupon} variant="outline" disabled={bestCouponLoading}>
                          {bestCouponLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply'}
                        </Button>
                      </div>
                      {appliedCoupon && (
                        <div className="mt-2 p-2 bg-green-50 rounded-lg border border-green-200">
                          <p className="text-sm text-green-700 flex items-center gap-1 font-medium">
                            ✓ {appliedCoupon.code} applied
                            {bestCouponSuggestion && (
                              <span className="text-green-600 font-bold ml-1">
                                (Auto-applied!)
                              </span>
                            )}
                          </p>
                          {bestCouponSuggestion && (
                            <p className="text-xs text-green-600 mt-1">
                              {bestCouponSuggestion.isFreeShipping 
                                ? '🚚 Free shipping auto-applied!' 
                                : `🎉 Best coupon auto-applied! You save ৳${bestCouponSuggestion.savings?.toFixed(0) || '0'}`}
                            </p>
                          )}
                        </div>
                      )}
                      {!appliedCoupon && !bestCouponLoading && (
                        <p className="text-xs text-muted-foreground mt-2">
                          💡 We'll auto-apply the best coupon for you!
                        </p>
                      )}
                    </div>

                    {/* Price Breakdown */}
                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span className="font-semibold">{formatPrice(subtotal)}</span>
                      </div>
                      {(discount > 0 || isFreeShipping) && (
                        <div className="flex justify-between text-green-600">
                          <span>{isFreeShipping ? '🚚 Free Shipping' : 'Discount'}</span>
                          <span className="font-semibold">
                            {isFreeShipping ? `FREE (was ${formatPrice(baseShippingCost)})` : `-${formatPrice(discount)}`}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Shipping 
                          {isFreeShipping && <span className="ml-1 text-xs text-green-600">🎉</span>}
                        </span>
                        <span className={`font-semibold ${isFreeShipping ? 'text-green-600' : ''}`}>
                          {shippingCost === 0 ? (
                            <span className="text-green-600">Free</span>
                          ) : (
                            formatPrice(shippingCost)
                          )}
                        </span>
                      </div>
                      {subtotal > 0 && subtotal < 2000 && !isFreeShipping && (
                        <p className="text-xs text-blue-600">
                          Add {formatPrice(2000 - subtotal)} more for free shipping!
                        </p>
                      )}
                      <div className="border-t pt-3 flex justify-between text-lg">
                        <span className="font-bold">Total</span>
                        <span className="font-bold text-blue-600">{formatPrice(total)}</span>
                      </div>
                    </div>

                    <Button asChild size="lg" className="w-full">
                      <Link href="/checkout">
                        Proceed to Checkout
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </Link>
                    </Button>

                    <Button asChild variant="outline" size="lg" className="w-full mt-3">
                      <Link href="/shop">Continue Shopping</Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
