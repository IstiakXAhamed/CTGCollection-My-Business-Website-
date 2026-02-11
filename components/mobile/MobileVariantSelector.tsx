'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { X, Check, ShoppingBag, Minus, Plus, Heart } from 'lucide-react'
import { haptics } from '@/lib/haptics'
import { cn } from '@/lib/utils'

interface Variant {
  id: string
  name: string
  type: 'color' | 'size' | 'style' | 'other'
  options: VariantOption[]
}

interface VariantOption {
  id: string
  value: string
  label: string
  colorHex?: string
  image?: string
  inStock?: boolean
  priceModifier?: number
}

interface MobileVariantSelectorProps {
  isOpen: boolean
  onClose: () => void
  productName: string
  productImage: string
  basePrice: number
  salePrice?: number | null
  variants: Variant[]
  selectedVariants: Record<string, string>
  onVariantChange: (variantId: string, optionId: string) => void
  onAddToCart: (quantity: number) => void
  onBuyNow?: (quantity: number) => void
  currency?: string
}

/**
 * MobileVariantSelector - Premium bottom sheet for selecting product variants
 * 
 * Features:
 * - Visual color swatches with check marks
 * - Size pills with availability indicators
 * - Quantity selector
 * - Price display with variant modifiers
 * - Add to cart / Buy now actions
 */
export function MobileVariantSelector({
  isOpen,
  onClose,
  productName,
  productImage,
  basePrice,
  salePrice,
  variants,
  selectedVariants,
  onVariantChange,
  onAddToCart,
  onBuyNow,
  currency = '৳',
}: MobileVariantSelectorProps) {
  const [quantity, setQuantity] = useState(1)
  const [isAdding, setIsAdding] = useState(false)

  // Reset quantity when closing
  useEffect(() => {
    if (!isOpen) {
      setQuantity(1)
    }
  }, [isOpen])

  // Calculate final price with variant modifiers
  const finalPrice = useMemo(() => {
    let price = salePrice || basePrice
    
    variants.forEach(variant => {
      const selectedOption = variant.options.find(
        opt => opt.id === selectedVariants[variant.id]
      )
      if (selectedOption?.priceModifier) {
        price += selectedOption.priceModifier
      }
    })
    
    return price
  }, [basePrice, salePrice, variants, selectedVariants])

  // Check if all required variants are selected
  const allVariantsSelected = variants.every(
    variant => selectedVariants[variant.id]
  )

  // Check if selected combination is in stock
  const isInStock = useMemo(() => {
    return variants.every(variant => {
      const selectedOption = variant.options.find(
        opt => opt.id === selectedVariants[variant.id]
      )
      return selectedOption?.inStock !== false
    })
  }, [variants, selectedVariants])

  const handleAddToCart = async () => {
    if (!allVariantsSelected || !isInStock) return
    
    setIsAdding(true)
    haptics.success()
    
    try {
      await onAddToCart(quantity)
      setTimeout(() => {
        setIsAdding(false)
        onClose()
      }, 500)
    } catch {
      setIsAdding(false)
      haptics.error()
    }
  }

  const handleBuyNow = () => {
    if (!allVariantsSelected || !isInStock || !onBuyNow) return
    haptics.rigid()
    onBuyNow(quantity)
  }

  // Render color variant
  const renderColorVariant = (variant: Variant) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-900 dark:text-white">
          {variant.name}
        </span>
        <span className="text-sm text-gray-500">
          {variant.options.find(o => o.id === selectedVariants[variant.id])?.label || 'Select'}
        </span>
      </div>
      
      <div className="flex flex-wrap gap-3">
        {variant.options.map((option) => {
          const isSelected = selectedVariants[variant.id] === option.id
          const isAvailable = option.inStock !== false
          
          return (
            <motion.button
              key={option.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                if (isAvailable) {
                  onVariantChange(variant.id, option.id)
                  haptics.light()
                }
              }}
              className={cn(
                "relative w-12 h-12 rounded-full border-2 transition-all overflow-hidden",
                isSelected 
                  ? "border-blue-600 ring-2 ring-blue-600/30" 
                  : "border-gray-200 dark:border-gray-700",
                !isAvailable && "opacity-40"
              )}
              style={{ backgroundColor: option.colorHex }}
            >
              {option.image && (
                <Image
                  src={option.image}
                  alt={option.label}
                  fill
                  className="object-cover"
                />
              )}
              
              {/* Selected check */}
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute inset-0 flex items-center justify-center bg-black/30"
                >
                  <Check className="w-5 h-5 text-white" strokeWidth={3} />
                </motion.div>
              )}
              
              {/* Out of stock indicator */}
              {!isAvailable && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-full h-0.5 bg-gray-400 rotate-45" />
                </div>
              )}
            </motion.button>
          )
        })}
      </div>
    </div>
  )

  // Render size variant
  const renderSizeVariant = (variant: Variant) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-900 dark:text-white">
          {variant.name}
        </span>
        {variant.name.toLowerCase().includes('size') && (
          <button className="text-xs text-blue-600 font-medium">
            Size Guide
          </button>
        )}
      </div>
      
      <div className="flex flex-wrap gap-2">
        {variant.options.map((option) => {
          const isSelected = selectedVariants[variant.id] === option.id
          const isAvailable = option.inStock !== false
          
          return (
            <motion.button
              key={option.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                if (isAvailable) {
                  onVariantChange(variant.id, option.id)
                  haptics.light()
                }
              }}
              className={cn(
                "relative min-w-[48px] h-11 px-4 rounded-xl border-2 text-sm font-medium transition-all",
                isSelected 
                  ? "border-blue-600 bg-blue-600 text-white" 
                  : "border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300",
                !isAvailable && "opacity-40 bg-gray-100 dark:bg-gray-800 line-through"
              )}
            >
              {option.label}
              
              {/* Price modifier badge */}
              {option.priceModifier && option.priceModifier > 0 && (
                <span className="absolute -top-1.5 -right-1.5 text-[10px] bg-orange-500 text-white px-1.5 py-0.5 rounded-full">
                  +{currency}{option.priceModifier}
                </span>
              )}
            </motion.button>
          )
        })}
      </div>
    </div>
  )

  // Render generic variant (style, etc.)
  const renderGenericVariant = (variant: Variant) => (
    <div className="space-y-3">
      <span className="text-sm font-semibold text-gray-900 dark:text-white">
        {variant.name}
      </span>
      
      <div className="flex flex-wrap gap-2">
        {variant.options.map((option) => {
          const isSelected = selectedVariants[variant.id] === option.id
          const isAvailable = option.inStock !== false
          
          return (
            <motion.button
              key={option.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                if (isAvailable) {
                  onVariantChange(variant.id, option.id)
                  haptics.light()
                }
              }}
              className={cn(
                "px-4 py-2.5 rounded-xl border-2 text-sm font-medium transition-all",
                isSelected 
                  ? "border-blue-600 bg-blue-50 dark:bg-blue-900/30 text-blue-600" 
                  : "border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300",
                !isAvailable && "opacity-40"
              )}
            >
              {option.label}
            </motion.button>
          )
        })}
      </div>
    </div>
  )

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
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
          />
          
          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-[110] bg-white dark:bg-gray-900 rounded-t-3xl max-h-[85vh] overflow-hidden"
          >
            {/* Drag handle */}
            <div className="flex justify-center py-3">
              <div className="w-12 h-1.5 rounded-full bg-gray-300 dark:bg-gray-700" />
            </div>
            
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center"
            >
              <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            
            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(85vh-60px)] pb-safe">
              {/* Product preview */}
              <div className="flex gap-4 px-5 pb-4 border-b border-gray-100 dark:border-gray-800">
                <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
                  <Image
                    src={productImage}
                    alt={productName}
                    fill
                    className="object-cover"
                  />
                </div>
                
                <div className="flex flex-col justify-center">
                  <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 text-sm">
                    {productName}
                  </h3>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-xl font-bold text-blue-600">
                      {currency}{finalPrice.toLocaleString()}
                    </span>
                    {salePrice && basePrice > salePrice && (
                      <span className="text-sm text-gray-400 line-through">
                        {currency}{basePrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                  {!isInStock && (
                    <span className="text-xs text-red-500 font-medium mt-1">
                      Out of Stock
                    </span>
                  )}
                </div>
              </div>
              
              {/* Variants */}
              <div className="p-5 space-y-6">
                {variants.map((variant) => (
                  <div key={variant.id}>
                    {variant.type === 'color' && renderColorVariant(variant)}
                    {variant.type === 'size' && renderSizeVariant(variant)}
                    {(variant.type === 'style' || variant.type === 'other') && renderGenericVariant(variant)}
                  </div>
                ))}
                
                {/* Quantity selector */}
                <div className="space-y-3">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    Quantity
                  </span>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-xl">
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => {
                          if (quantity > 1) {
                            setQuantity(q => q - 1)
                            haptics.light()
                          }
                        }}
                        disabled={quantity <= 1}
                        className="w-12 h-12 flex items-center justify-center text-gray-600 dark:text-gray-400 disabled:opacity-40"
                      >
                        <Minus className="w-5 h-5" />
                      </motion.button>
                      
                      <span className="w-12 text-center font-bold text-lg text-gray-900 dark:text-white">
                        {quantity}
                      </span>
                      
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => {
                          setQuantity(q => q + 1)
                          haptics.light()
                        }}
                        className="w-12 h-12 flex items-center justify-center text-gray-600 dark:text-gray-400"
                      >
                        <Plus className="w-5 h-5" />
                      </motion.button>
                    </div>
                    
                    <span className="text-sm text-gray-500">
                      Total: <span className="font-bold text-gray-900 dark:text-white">{currency}{(finalPrice * quantity).toLocaleString()}</span>
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Action buttons */}
              <div className="sticky bottom-0 p-5 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex gap-3">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddToCart}
                  disabled={!allVariantsSelected || !isInStock || isAdding}
                  className={cn(
                    "flex-1 h-14 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-all",
                    allVariantsSelected && isInStock
                      ? "bg-blue-600 text-white active:bg-blue-700"
                      : "bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
                  )}
                >
                  {isAdding ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                    >
                      <Check className="w-6 h-6" />
                    </motion.div>
                  ) : (
                    <>
                      <ShoppingBag className="w-5 h-5" />
                      Add to Cart
                    </>
                  )}
                </motion.button>
                
                {onBuyNow && (
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={handleBuyNow}
                    disabled={!allVariantsSelected || !isInStock}
                    className={cn(
                      "flex-1 h-14 rounded-2xl font-bold text-base transition-all",
                      allVariantsSelected && isInStock
                        ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                        : "bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
                    )}
                  >
                    Buy Now
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default MobileVariantSelector
