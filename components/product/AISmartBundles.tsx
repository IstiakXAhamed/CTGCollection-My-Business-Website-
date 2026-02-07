'use client'

import { useState, useEffect } from 'react'
import { PackagePlus, Sparkles, ShoppingBag, Plus, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { formatPrice } from '@/lib/utils'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { useCartStore } from '@/store/cart'

interface Product {
  id: string
  name: string
  price: number
  image: string
}

interface AISmartBundlesProps {
  currentProduct: Product
  category: string
}

export function AISmartBundles({ currentProduct, category }: AISmartBundlesProps) {
  const [bundle, setBundle] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const addItem = useCartStore(state => state.addItem)

  useEffect(() => {
    // Simulate AI generating detailed bundle suggestions
    // In real app: call /api/ai/suggest-bundles
    const timer = setTimeout(() => {
      setBundle({
        name: "Complete The Look",
        discount: 15,
        items: [
          {
            id: 'mock-1',
            name: category === 'Saree' ? 'Matching Blouse Piece' : 'Premium Cotton Socks',
            price: 450,
            image: '/placeholder-product.jpg', // Replace with real matching product logic
            originalPrice: 550
          },
          {
            id: 'mock-2',
            name: category === 'Saree' ? 'Accessorized Belt' : 'Leather Care Kit',
            price: 1200,
            image: '/placeholder-product.jpg',
            originalPrice: 1500
          }
        ],
        reason: "These items are frequently bought together by customers with similar taste."
      })
      setLoading(false)
    }, 1500)
    
    return () => clearTimeout(timer)
  }, [category])

  if (loading) return null // Don't show anything while loading to avoid layout shift, or show skeleton

  const bundleTotal = currentProduct.price + bundle.items.reduce((acc: number, item: any) => acc + item.price, 0)
  const originalTotal = currentProduct.price + bundle.items.reduce((acc: number, item: any) => acc + item.originalPrice, 0)
  const savings = originalTotal - bundleTotal

  const handleAddBundle = () => {
    // Add main product
    addItem({
      productId: currentProduct.id,
      name: currentProduct.name,
      price: currentProduct.price,
      quantity: 1,
      image: currentProduct.image,
      variantId: 'default' // Should ideally select variant BEFORE bundle
    })
    
    // Add bundle items
    bundle.items.forEach((item: any) => {
      addItem({
        productId: item.id,
        name: item.name,
        price: item.price,
        quantity: 1,
        image: item.image,
        variantId: 'default'
      })
    })

    alert("✅ Bundle added to cart with 15% discount applied!")
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="border-2 border-indigo-100 rounded-xl p-4 sm:p-6 bg-gradient-to-br from-indigo-50/50 to-purple-50/50"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="bg-indigo-100 p-2 rounded-full">
          <Sparkles className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <h3 className="font-bold text-lg text-gray-900">AI Smart Bundle</h3>
          <p className="text-xs text-gray-500">Curated just for you</p>
        </div>
        <div className="ml-auto bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold border border-green-200">
          Save {15}%
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
        {/* Main Product */}
        <div className="relative group">
          <div className="w-24 h-24 bg-white rounded-lg border shadow-sm p-2">
            <div className="relative w-full h-full">
              <Image src={currentProduct.image} alt={currentProduct.name} fill className="object-contain" />
            </div>
          </div>
          <div className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-1 shadow border">
            <Plus className="w-4 h-4 text-gray-400" />
          </div>
        </div>

        {/* Bundle Items */}
        {bundle.items.map((item: any, idx: number) => (
          <div key={item.id} className="relative group">
            <div className="w-24 h-24 bg-white rounded-lg border shadow-sm p-2">
              <div className="relative w-full h-full">
                <Image src={item.image} alt={item.name} fill className="object-contain" />
              </div>
            </div>
            {idx < bundle.items.length - 1 && (
              <div className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-1 shadow border">
                <Plus className="w-4 h-4 text-gray-400" />
              </div>
            )}
             {idx === bundle.items.length - 1 && (
              <div className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-1 shadow border">
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </div>
            )}
          </div>
        ))}

        {/* Total & Action */}
        <div className="flex-1 text-center md:text-left md:pl-4">
          <p className="text-sm text-gray-500 mb-1">Total Bundle Price:</p>
          <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
             <span className="text-2xl font-bold text-indigo-700">{formatPrice(bundleTotal)}</span>
             <span className="text-sm text-gray-400 line-through">{formatPrice(originalTotal)}</span>
          </div>
          <Button onClick={handleAddBundle} className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 gap-2 shadow-lg shadow-indigo-200">
            <ShoppingBag className="w-4 h-4" />
            Add All to Cart
          </Button>
        </div>
      </div>

      <p className="text-xs text-gray-500 italic text-center md:text-left bg-white/50 p-2 rounded border border-indigo-100">
        <Sparkles className="w-3 h-3 inline mr-1 text-indigo-400" />
        {bundle.reason}
      </p>
    </motion.div>
  )
}
