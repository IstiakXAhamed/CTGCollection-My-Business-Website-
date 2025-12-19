'use client'

import { useState, useEffect, Suspense } from 'react'
import { motion } from 'framer-motion'
import { Search, SlidersHorizontal, Sparkles, Percent, Heart, Grid3X3, LayoutGrid, ArrowUpDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { formatPrice } from '@/lib/utils'
import type { Product, Category } from '@/types'

function ShopContent() {
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState({ min: '', max: '' })
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState('newest')
  const [gridCols, setGridCols] = useState(3)

  // Read URL params
  const featuredParam = searchParams.get('featured')
  const saleParam = searchParams.get('sale')
  const categoryParam = searchParams.get('category')
  const searchParam = searchParams.get('search')

  // Determine page mode
  const isFeatured = featuredParam === 'true'
  const isSale = saleParam === 'true'

  // Initialize search query from URL param
  useEffect(() => {
    if (searchParam) {
      setSearchQuery(searchParam)
    }
  }, [searchParam])

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [featuredParam, saleParam, categoryParam])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      // Build URL with params
      let url = '/api/products?limit=50'
      if (isFeatured) url += '&featured=true'
      if (categoryParam) url += `&category=${categoryParam}`
      
      const res = await fetch(url)
      if (res.ok) {
        let data = await res.json()
        let allProducts = data.products || []
        
        // Filter for sale items (products with discount)
        if (isSale) {
          allProducts = allProducts.filter((p: Product) => 
            p.salePrice && p.basePrice && p.salePrice < p.basePrice
          )
        }
        
        setProducts(allProducts)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories')
      if (res.ok) {
        const data = await res.json()
        setCategories(data.categories || [])
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const toggleCategory = (categoryId: string) => {
    if (selectedCategories.includes(categoryId)) {
      setSelectedCategories(selectedCategories.filter(id => id !== categoryId))
    } else {
      setSelectedCategories([...selectedCategories, categoryId])
    }
  }

  const clearFilters = () => {
    setSelectedCategories([])
    setPriceRange({ min: '', max: '' })
    setSearchQuery('')
  }

  const filteredProducts = products.filter(product => {
    // Search filter
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase())
    
    // Category filter
    const matchesCategory = selectedCategories.length === 0 || 
      (product.categoryId && selectedCategories.includes(product.categoryId))
    
    // Price filter
    const price = product.salePrice || product.basePrice
    const matchesPrice = (!priceRange.min || price >= parseFloat(priceRange.min)) &&
                         (!priceRange.max || price <= parseFloat(priceRange.max))
    
    return matchesSearch && matchesCategory && matchesPrice
  })

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const priceA = a.salePrice || a.basePrice
    const priceB = b.salePrice || b.basePrice
    switch (sortBy) {
      case 'price-low': return priceA - priceB
      case 'price-high': return priceB - priceA
      case 'name': return a.name.localeCompare(b.name)
      case 'newest': 
      default: return 0 // Assume already sorted by newest from API
    }
  })

  // Page title based on mode
  const getPageTitle = () => {
    if (isFeatured) return 'Featured Products'
    if (isSale) return 'Sale & Offers'
    return 'Shop'
  }

  const getPageDescription = () => {
    if (isFeatured) return 'Our handpicked selection of trending products'
    if (isSale) return 'Amazing deals and discounts just for you'
    return `Discover ${products.length} amazing products`
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading products...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            {isFeatured && <Sparkles className="w-8 h-8 text-yellow-500" />}
            {isSale && <Percent className="w-8 h-8 text-red-500" />}
            <h1 className="text-4xl font-bold">{getPageTitle()}</h1>
          </div>
          <p className="text-muted-foreground">{getPageDescription()}</p>
          
          {/* Mode indicator */}
          {(isFeatured || isSale) && (
            <div className="mt-4">
              <Link href="/shop">
                <Button variant="outline" size="sm">
                  ← View All Products
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Search & Filter Toggle */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="sm:hidden"
          >
            <SlidersHorizontal className="w-4 h-4 mr-2" />
            Filters {selectedCategories.length > 0 && `(${selectedCategories.length})`}
          </Button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Sidebar Filters - Mobile: shown when showFilters is true, Desktop: always visible */}
          <aside className={`w-full lg:w-64 space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <Card className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-lg">Filters</h2>
                {(selectedCategories.length > 0 || priceRange.min || priceRange.max) && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear All
                  </Button>
                )}
              </div>

              {/* Quick Links */}
              <div className="mb-6 space-y-2">
                <h3 className="font-semibold mb-3">Quick Links</h3>
                <Link href="/shop" className={`block px-3 py-2 rounded-lg transition ${!isFeatured && !isSale ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}>
                  All Products
                </Link>
                <Link href="/shop?featured=true" className={`block px-3 py-2 rounded-lg transition ${isFeatured ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}>
                  ⭐ Featured
                </Link>
                <Link href="/shop?sale=true" className={`block px-3 py-2 rounded-lg transition ${isSale ? 'bg-red-100 text-red-700' : 'hover:bg-gray-100'}`}>
                  🏷️ On Sale
                </Link>
              </div>

              {/* Categories */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3">Categories</h3>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <div key={category.id} className="flex items-center gap-2">
                      <Checkbox
                        id={category.id}
                        checked={selectedCategories.includes(category.id)}
                        onCheckedChange={() => toggleCategory(category.id)}
                      />
                      <label
                        htmlFor={category.id}
                        className="text-sm cursor-pointer flex-1"
                      >
                        {category.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h3 className="font-semibold mb-3">Price Range (BDT)</h3>
                <div className="space-y-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                  />
                </div>
              </div>
            </Card>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">
                Showing {sortedProducts.length} of {products.length} products
              </p>
              <div className="flex items-center gap-2">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[160px] text-sm">
                    <ArrowUpDown className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="name">Name A-Z</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:gap-6 grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {sortedProducts.map((product, idx) => {
                // Handle images - API returns parsed array but handle string fallback
                let images: string[] = []
                if (Array.isArray(product.images)) {
                  images = product.images
                } else if (typeof product.images === 'string') {
                  try {
                    images = JSON.parse(product.images)
                  } catch {
                    images = []
                  }
                }
                const imageUrl = images && images[0] ? images[0] : '/placeholder.png'
                const discount = product.basePrice && product.salePrice
                  ? Math.round(((product.basePrice - product.salePrice) / product.basePrice) * 100)
                  : 0

                return (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Link href={`/product/${product.slug}`}>
                      <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer h-full">
                        <CardContent className="p-4">
                          {/* Image */}
                          <div className="relative aspect-square mb-4 bg-gray-100 rounded-lg overflow-hidden">
                            <Image
                              src={imageUrl}
                              alt={product.name}
                              fill
                              className="object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                            {product.isFeatured && (
                              <span className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                                <Sparkles className="w-3 h-3" /> Featured
                              </span>
                            )}
                            {discount > 0 && (
                              <span className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded-full">
                                {discount}% OFF
                              </span>
                            )}
                          </div>

                          {/* Product Info */}
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">
                              {product.category?.name || 'Product'}
                            </p>
                            <h3 className="font-semibold mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                              {product.name}
                            </h3>
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-bold text-blue-600">
                                {formatPrice(product.salePrice || product.basePrice)}
                              </span>
                              {product.salePrice && product.basePrice > product.salePrice && (
                                <span className="text-sm text-muted-foreground line-through">
                                  {formatPrice(product.basePrice)}
                                </span>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                )
              })}
            </div>

            {/* No Results */}
            {sortedProducts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">No products found matching your filters</p>
                <Button onClick={clearFilters}>Clear All Filters</Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ShopPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <ShopContent />
    </Suspense>
  )
}
