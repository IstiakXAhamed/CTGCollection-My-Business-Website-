'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Clock, ChevronRight, Zap, Heart, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatPrice } from '@/lib/utils'

interface FlashSale {
  id: string
  name: string
  description?: string
  discountPercent: number
  startTime: string
  endTime: string
  products: Array<{
    product: {
      id: string
      name: string
      slug: string
      basePrice: number
      salePrice?: number
      images: string
    }
  }>
}

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

export function FlashSaleBanner() {
  const [flashSale, setFlashSale] = useState<FlashSale | null>(null)
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFlashSale()
  }, [])

  useEffect(() => {
    if (!flashSale) return

    const timer = setInterval(() => {
      const endTime = new Date(flashSale.endTime).getTime()
      const now = new Date().getTime()
      const difference = endTime - now

      if (difference <= 0) {
        setTimeLeft(null)
        clearInterval(timer)
        // Refresh to get next sale
        fetchFlashSale()
        return
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000)
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [flashSale])

  const fetchFlashSale = async () => {
    try {
      const res = await fetch('/api/flash-sales/active')
      if (res.ok) {
        const data = await res.json()
        setFlashSale(data.flashSale)
      }
    } catch (error) {
      console.error('Failed to fetch flash sale:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !flashSale || !timeLeft) return null

  const TimeBlock = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center">
      <div className="bg-white text-red-600 rounded-lg w-12 h-12 md:w-16 md:h-16 flex items-center justify-center font-bold text-xl md:text-2xl shadow-lg">
        {value.toString().padStart(2, '0')}
      </div>
      <span className="text-white/80 text-xs mt-1">{label}</span>
    </div>
  )

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-red-600 via-red-500 to-orange-500 py-8 md:py-12 relative overflow-hidden"
    >
      {/* Animated background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-60 h-60 bg-yellow-300 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          {/* Left: Sale Info */}
          <div className="text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-2 mb-2">
              <Zap className="w-6 h-6 text-yellow-300 animate-pulse" />
              <span className="text-yellow-300 font-semibold text-sm uppercase tracking-wider">
                Limited Time Offer
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
              {flashSale.name}
            </h2>
            <p className="text-white/80 text-lg mb-4">
              Up to <span className="text-yellow-300 font-bold text-2xl">{flashSale.discountPercent}%</span> OFF
            </p>
            
            {/* Countdown Timer */}
            <div className="flex items-center justify-center lg:justify-start gap-3 mb-6">
              <Clock className="w-5 h-5 text-white" />
              <span className="text-white font-medium">Ends in:</span>
              <div className="flex gap-2">
                <TimeBlock value={timeLeft.days} label="Days" />
                <span className="text-white text-2xl font-bold self-start mt-3">:</span>
                <TimeBlock value={timeLeft.hours} label="Hrs" />
                <span className="text-white text-2xl font-bold self-start mt-3">:</span>
                <TimeBlock value={timeLeft.minutes} label="Min" />
                <span className="text-white text-2xl font-bold self-start mt-3">:</span>
                <TimeBlock value={timeLeft.seconds} label="Sec" />
              </div>
            </div>

            <Button 
              asChild 
              size="lg" 
              className="bg-white text-red-600 hover:bg-gray-100 font-bold"
            >
              <Link href="/shop?sale=flash">
                Shop Flash Sale
                <ChevronRight className="w-5 h-5 ml-1" />
              </Link>
            </Button>
          </div>

          {/* Right: Product Preview */}
          <div className="flex gap-4 overflow-x-auto pb-4 max-w-full">
            {flashSale.products.slice(0, 3).map(({ product }, idx) => {
              const images = typeof product.images === 'string' 
                ? JSON.parse(product.images) 
                : product.images
              const salePrice = product.basePrice * (1 - flashSale.discountPercent / 100)
              
              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex-shrink-0"
                >
                  <Link href={`/product/${product.slug}`}>
                    <div className="bg-white rounded-xl p-3 shadow-lg hover:shadow-xl transition group w-48 h-full flex flex-col relative overflow-hidden">
                      <div className="relative aspect-square rounded-lg overflow-hidden mb-2 bg-gray-100">
                        <Image
                          src={images[0] || '/placeholder.jpg'}
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        
                        {/* Quick actions - hidden on mobile */}
                        <div className="absolute top-2 right-2 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 hidden sm:flex z-20">
                           <button className="w-7 h-7 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-red-50 transition">
                             <Heart className="w-3.5 h-3.5 text-gray-600" />
                           </button>
                           <button className="w-7 h-7 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-50 transition">
                             <Eye className="w-3.5 h-3.5 text-gray-600" />
                           </button>
                        </div>

                        {/* Minimalist Badge: Top Left */}
                        <div className="absolute top-2 left-2 z-10">
                          <span className="bg-red-500 text-white text-[10px] sm:text-xs font-bold px-1.5 py-0.5 rounded shadow-sm">
                            -{flashSale.discountPercent}%
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex-1 flex flex-col">
                        <h4 className="font-medium text-xs sm:text-sm line-clamp-2 mb-1 leading-tight text-gray-900 group-hover:text-red-600 transition-colors">
                          {product.name}
                        </h4>
                        <div className="mt-auto flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-2 flex-wrap">
                          <span className="text-red-600 font-bold text-sm sm:text-base truncate">
                            {formatPrice(salePrice)}
                          </span>
                          <span className="text-gray-400 text-[10px] sm:text-xs line-through truncate">
                            {formatPrice(product.basePrice)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </motion.section>
  )
}

export default FlashSaleBanner
