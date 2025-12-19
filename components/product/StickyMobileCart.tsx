'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ShoppingCart } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

interface StickyMobileCartProps {
  product: any
  price: number
  originalPrice?: number
  onAddToCart: () => void
  disabled: boolean
}

export function StickyMobileCart({ 
  product, 
  price, 
  originalPrice, 
  onAddToCart, 
  disabled 
}: StickyMobileCartProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      // Show after scrolling past the main main image/header (approx 300px)
      const shouldShow = window.scrollY > 300
      setIsVisible(shouldShow)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (!isVisible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white border-t shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] md:hidden animate-in slide-in-from-bottom duration-300">
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <p className="text-sm font-semibold truncate max-w-[200px]">{product.name}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-blue-600">{formatPrice(price)}</span>
            {originalPrice && originalPrice > price && (
              <span className="text-xs text-gray-500 line-through">{formatPrice(originalPrice)}</span>
            )}
          </div>
        </div>
        <Button 
          onClick={onAddToCart} 
          disabled={disabled}
          className="flex-1 h-12 text-base font-bold shadow-lg shadow-blue-200"
        >
          <ShoppingCart className="w-5 h-5 mr-2" />
          Add
        </Button>
      </div>
    </div>
  )
}
