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

  // Load cart from localStorage on mount
  useEffect(() => {
    // Small delay to allow Zustand persist to rehydrate from localStorage
    const loadCart = () => {
      const storeItems = useCartStore.getState().items
      console.log('Cart items from store:', storeItems.length, storeItems)
      setItems(storeItems)
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
    })
    
    return () => {
      clearTimeout(timeout)
      unsubscribe()
    }
  }, [])

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
        setAppliedCoupon(data.coupon)
        alert('Coupon applied successfully!')
      } else {
        // Fallback mock coupons
        if (couponCode.toUpperCase() === 'WELCOME10') {
          setAppliedCoupon({ code: 'WELCOME10', discountType: 'percentage', discountValue: 10 })
          alert('Coupon applied! 10% discount')
        } else if (couponCode.toUpperCase() === 'SAVE500') {
          setAppliedCoupon({ code: 'SAVE500', discountType: 'fixed', discountValue: 500 })
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
  const shippingCost = subtotal >= 2000 ? 0 : (subtotal > 0 ? 100 : 0)
  
  let discount = 0
  if (appliedCoupon) {
    if (appliedCoupon.discountType === 'percentage') {
      discount = Math.round(subtotal * (appliedCoupon.discountValue / 100))
    } else {
      discount = appliedCoupon.discountValue
    }
  }
  
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
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        {/* Product Image */}
                        <div className="flex-shrink-0">
                          <div className="w-24 h-24 relative rounded-lg overflow-hidden bg-gray-100">
                            <Image
                              src={item.image || '/placeholder.png'}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        </div>

                        {/* Product Info */}
                        <div className="flex-1">
                          <h3 className="font-semibold">{item.name}</h3>
                          {(item.size || item.color) && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {item.size && `Size: ${item.size}`}
                              {item.size && item.color && ' · '}
                              {item.color && `Color: ${item.color}`}
                            </p>
                          )}
                          <p className="text-lg font-bold text-blue-600 mt-2">
                            {formatPrice(item.price)}
                          </p>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex flex-col items-end justify-between">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>

                          <div className="flex items-center border-2 rounded-lg">
                            <button
                              onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                              className="p-2 hover:bg-gray-100 transition"
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="px-4 font-semibold">{item.quantity}</span>
                            <button
                              onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                              className="p-2 hover:bg-gray-100 transition"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>

                          <p className="text-sm text-muted-foreground mt-2">
                            Subtotal: <span className="font-semibold text-foreground">
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
                        <Button onClick={applyCoupon} variant="outline">
                          Apply
                        </Button>
                      </div>
                      {appliedCoupon && (
                        <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                          ✓ {appliedCoupon.code} applied
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        Try: WELCOME10 or SAVE500
                      </p>
                    </div>

                    {/* Price Breakdown */}
                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span className="font-semibold">{formatPrice(subtotal)}</span>
                      </div>
                      {discount > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>Discount</span>
                          <span className="font-semibold">-{formatPrice(discount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Shipping</span>
                        <span className="font-semibold">
                          {shippingCost === 0 ? (
                            <span className="text-green-600">Free</span>
                          ) : (
                            formatPrice(shippingCost)
                          )}
                        </span>
                      </div>
                      {subtotal > 0 && subtotal < 2000 && (
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
