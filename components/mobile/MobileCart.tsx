'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag, ChevronRight } from 'lucide-react'
import { haptics } from '@/lib/haptics'
import { cn } from '@/lib/utils'

interface CartItem {
  id: string
  productId: string
  name: string
  price: number
  image: string
  quantity: number
  variant?: string
}

interface MobileCartItemProps {
  item: CartItem
  onUpdateQuantity: (id: string, quantity: number) => void
  onRemove: (id: string) => void
  currency?: string
}

/**
 * MobileCartItem - Swipeable cart item component
 * 
 * Features:
 * - Swipe left to reveal delete
 * - Swipe right to restore
 * - Tap quantity buttons
 * - Smooth animations
 */
function MobileCartItem({ 
  item, 
  onUpdateQuantity, 
  onRemove,
  currency = '৳' 
}: MobileCartItemProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  
  const x = useMotionValue(0)
  const deleteOpacity = useTransform(x, [-100, -50], [1, 0])
  const deleteScale = useTransform(x, [-100, -50], [1, 0.8])
  const itemOpacity = useTransform(x, [-150, -100], [0.5, 1])

  const handleDragEnd = useCallback((event: any, info: PanInfo) => {
    const threshold = -100
    
    if (info.offset.x < threshold) {
      // Swipe far enough - delete
      setIsDeleting(true)
      haptics.rigid()
      setTimeout(() => {
        onRemove(item.id)
      }, 200)
    } else {
      // Snap back
      x.set(0)
    }
  }, [item.id, onRemove, x])

  if (isDeleting) {
    return (
      <motion.div
        initial={{ height: 'auto', opacity: 1 }}
        animate={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="overflow-hidden"
      />
    )
  }

  return (
    <div className="relative overflow-hidden">
      {/* Delete background */}
      <motion.div
        style={{ opacity: deleteOpacity, scale: deleteScale }}
        className="absolute inset-y-0 right-0 w-24 bg-red-500 flex items-center justify-center rounded-r-xl"
      >
        <Trash2 className="w-6 h-6 text-white" />
      </motion.div>
      
      {/* Cart item */}
      <motion.div
        style={{ x, opacity: itemOpacity }}
        drag="x"
        dragConstraints={{ left: -100, right: 0 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        className="relative bg-white dark:bg-gray-900 rounded-xl p-3 flex gap-3 cursor-grab active:cursor-grabbing"
      >
        {/* Product image */}
        <Link href={`/product/${item.productId}`} className="flex-shrink-0">
          <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
            <Image
              src={item.image || '/placeholder.png'}
              alt={item.name}
              fill
              className="object-cover"
            />
          </div>
        </Link>
        
        {/* Product details */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            <Link href={`/product/${item.productId}`}>
              <h3 className="font-medium text-sm text-gray-900 dark:text-white line-clamp-2">
                {item.name}
              </h3>
            </Link>
            {item.variant && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {item.variant}
              </p>
            )}
          </div>
          
          <div className="flex items-center justify-between mt-2">
            <span className="font-bold text-blue-600">
              {currency}{(item.price * item.quantity).toLocaleString()}
            </span>
            
            {/* Quantity controls */}
            <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  if (item.quantity > 1) {
                    onUpdateQuantity(item.id, item.quantity - 1)
                    haptics.light()
                  } else {
                    onRemove(item.id)
                    haptics.rigid()
                  }
                }}
                className="w-11 h-11 flex items-center justify-center text-gray-600 dark:text-gray-400"
              >
                {item.quantity === 1 ? (
                  <Trash2 className="w-4 h-4 text-red-500" />
                ) : (
                  <Minus className="w-4 h-4" />
                )}
              </motion.button>
              
              <span className="w-8 text-center font-semibold text-sm text-gray-900 dark:text-white">
                {item.quantity}
              </span>
              
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  onUpdateQuantity(item.id, item.quantity + 1)
                  haptics.light()
                }}
                className="w-11 h-11 flex items-center justify-center text-gray-600 dark:text-gray-400"
              >
                <Plus className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

interface MobileCartProps {
  items: CartItem[]
  onUpdateQuantity: (id: string, quantity: number) => void
  onRemove: (id: string) => void
  onCheckout: () => void
  currency?: string
  isLoading?: boolean
}

/**
 * MobileCart - Full mobile cart experience
 * 
 * Features:
 * - Swipeable cart items
 * - Order summary
 * - Promo code input
 * - Sticky checkout button
 * - Empty state
 */
export function MobileCart({
  items,
  onUpdateQuantity,
  onRemove,
  onCheckout,
  currency = '৳',
  isLoading = false,
}: MobileCartProps) {
  const [promoCode, setPromoCode] = useState('')
  const [promoApplied, setPromoApplied] = useState(false)
  const [discount, setDiscount] = useState(0)

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = subtotal > 2000 ? 0 : 60 // Free shipping over 2000
  const total = subtotal - discount + shipping

  const handleApplyPromo = () => {
    if (!promoCode.trim()) return
    
    // Mock promo validation - in production, call API
    if (promoCode.toUpperCase() === 'SILK10') {
      setDiscount(Math.round(subtotal * 0.1))
      setPromoApplied(true)
      haptics.success()
    } else {
      haptics.error()
      // Toast would go here - using alert for now
      alert('Invalid promo code')
    }
  }

  // Empty cart state
  if (items.length === 0 && !isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 15 }}
          className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6"
        >
          <ShoppingBag className="w-12 h-12 text-gray-400" />
        </motion.div>
        
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-xl font-bold text-gray-900 dark:text-white mb-2"
        >
          Your cart is empty
        </motion.h2>
        
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-gray-500 dark:text-gray-400 mb-6 max-w-xs"
        >
          Looks like you haven't added anything to your cart yet.
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Link href="/shop">
            <motion.button
              whileTap={{ scale: 0.98 }}
              className="px-8 py-4 bg-blue-600 text-white font-bold rounded-2xl flex items-center gap-2"
            >
              Start Shopping
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="pb-48">
      {/* Cart items */}
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-bold text-lg text-gray-900 dark:text-white">
            Cart ({items.length} {items.length === 1 ? 'item' : 'items'})
          </h2>
          <span className="text-sm text-gray-500">Swipe left to delete</span>
        </div>
        
        <AnimatePresence>
          {items.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ delay: index * 0.05 }}
            >
              <MobileCartItem
                item={item}
                onUpdateQuantity={onUpdateQuantity}
                onRemove={onRemove}
                currency={currency}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      
      {/* Promo code */}
      <div className="mx-4 p-4 bg-white dark:bg-gray-900 rounded-xl">
        <div className="flex items-center gap-2 mb-3">
          <Tag className="w-4 h-4 text-blue-600" />
          <span className="font-semibold text-sm text-gray-900 dark:text-white">
            Promo Code
          </span>
        </div>
        
        {promoApplied ? (
          <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <span className="text-green-700 dark:text-green-400 font-medium text-sm">
              {promoCode.toUpperCase()} applied!
            </span>
            <button
              onClick={() => {
                setPromoApplied(false)
                setPromoCode('')
                setDiscount(0)
                haptics.light()
              }}
              className="text-sm text-red-500"
            >
              Remove
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              type="text"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              placeholder="Enter code"
              className="flex-1 h-11 px-4 bg-gray-100 dark:bg-gray-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleApplyPromo}
              className="px-5 h-11 bg-blue-600 text-white font-semibold rounded-xl text-sm"
            >
              Apply
            </motion.button>
          </div>
        )}
      </div>
      
      {/* Order summary - Fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 p-4 pb-safe z-50">
        {/* Summary rows */}
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Subtotal</span>
            <span className="text-gray-900 dark:text-white">{currency}{subtotal.toLocaleString()}</span>
          </div>
          
          {discount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-green-600">Discount</span>
              <span className="text-green-600">-{currency}{discount.toLocaleString()}</span>
            </div>
          )}
          
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Shipping</span>
            <span className={cn(
              shipping === 0 ? "text-green-600" : "text-gray-900 dark:text-white"
            )}>
              {shipping === 0 ? 'Free' : `${currency}${shipping}`}
            </span>
          </div>
          
          <div className="flex justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
            <span className="font-bold text-gray-900 dark:text-white">Total</span>
            <span className="font-bold text-xl text-blue-600">{currency}{total.toLocaleString()}</span>
          </div>
        </div>
        
        {/* Checkout button */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => { onCheckout(); haptics.success() }}
          className="w-full h-14 bg-blue-600 text-white font-bold text-base rounded-2xl flex items-center justify-center gap-2"
        >
          Proceed to Checkout
          <ChevronRight className="w-5 h-5" />
        </motion.button>
        
        {/* Free shipping progress */}
        {subtotal < 2000 && (
          <div className="mt-3">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Add {currency}{(2000 - subtotal).toLocaleString()} more for free shipping</span>
              <span>{Math.round((subtotal / 2000) * 100)}%</span>
            </div>
            <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((subtotal / 2000) * 100, 100)}%` }}
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MobileCart
