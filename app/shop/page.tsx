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
import { Breadcrumb } from '@/components/Breadcrumb'
import { useSearchParams } from 'next/navigation'
import { formatPrice } from '@/lib/utils'
import type { Product, Category } from '@/types'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { FilterSidebar } from '@/components/shop/FilterSidebar'

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
      // Build URL with params safely
      const params = new URLSearchParams()
      params.append('limit', '100') // Show more by default
      if (isFeatured) params.append('featured', 'true')
      if (categoryParam) params.append('category', categoryParam)
      if (searchParam) params.append('search', searchParam)
      
      // Add cache buster to force fresh data from server
      params.append('_t', Date.now().toString())
      
      const res = await fetch(`/api/products?${params.toString()}`, {
        headers: { 'Cache-Control': 'no-cache' }
      })

      if (res.ok) {
        const data = await res.json()
        let allProducts = data.products || []
        
        // Filter for sale items (products with discount)
        if (isSale) {
          allProducts = allProducts.filter((p: Product) => 
            p.salePrice && p.basePrice && p.salePrice < p.basePrice
          )
        }
        
        setProducts(allProducts)
      } else {
        const errorData = await res.json().catch(() => ({}))
        console.error('Products fetch failed:', res.status, errorData)
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
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Breadcrumb 
             items={[
               { label: 'Shop', href: '/shop' },
               ...(isFeatured ? [{ label: 'Featured', href: '/shop?featured=true' }] : []),
               ...(isSale ? [{ label: 'Sale', href: '/shop?sale=true' }] : []),
               ...(categoryParam ? [{ label: categoryParam, href: `/shop?category=${categoryParam}` }] : []),
               ...(searchParam ? [{ label: `Search: ${searchParam}` }] : [])
             ]}
          />
        </div>

        {/* Header */}
        <div className="mb-4 sm:mb-8">
          <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
            {isFeatured && <Sparkles className="w-5 h-5 sm:w-8 sm:h-8 text-yellow-500" />}
            {isSale && <Percent className="w-5 h-5 sm:w-8 sm:h-8 text-red-500" />}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">{getPageTitle()}</h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">{getPageDescription()}</p>
          
          {/* Mode indicator */}
          {(isFeatured || isSale) && (
            <div className="mt-3 sm:mt-4">
              <Link href="/shop">
                <Button variant="outline" size="sm" className="text-xs sm:text-sm">
                  ← View All
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Search & Filter Toggle */}
        <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row gap-2 sm:gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 sm:pl-10 h-10 text-sm"
            />
          </div>
          
          {/* Mobile Filter Button - Triggers Dialog */}
          <div className="sm:hidden">
            <Dialog open={showFilters} onOpenChange={setShowFilters}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                  <SlidersHorizontal className="w-4 h-4 mr-2" />
                  Filters {selectedCategories.length > 0 && `(${selectedCategories.length})`}
                </Button>
              </DialogTrigger>
              <DialogContent className="w-full max-w-sm h-[85vh] p-0 overflow-y-auto">
                <div className="p-4">
                  <FilterSidebar
                    categories={categories}
                    selectedCategories={selectedCategories}
                    toggleCategory={toggleCategory}
                    priceRange={priceRange}
                    setPriceRange={setPriceRange}
                    clearFilters={clearFilters}
                    isFeatured={isFeatured}
                    isSale={isSale}
                    className="mt-4"
                  />
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Desktop Sidebar Filters - Hidden on Mobile */}
          <aside className="w-full lg:w-64 space-y-6 hidden lg:block">
            <FilterSidebar
              categories={categories}
              selectedCategories={selectedCategories}
              toggleCategory={toggleCategory}
              priceRange={priceRange}
              setPriceRange={setPriceRange}
              clearFilters={clearFilters}
              isFeatured={isFeatured}
              isSale={isSale}
            />
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
                      <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer h-full border-0 shadow-sm bg-white">
                        <div className="relative aspect-square overflow-hidden bg-gray-100">
                          <Image
                            src={imageUrl}
                            alt={product.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                            unoptimized={imageUrl.startsWith('/') && !imageUrl.startsWith('//')}
                          />
                          
                          {/* UNIFIED SMART LAYOUT - Clean & Consistent */}
                          
                          {/* Discount Badge: Top Left (Red Tag) */}
                          {discount > 0 && (
                            <div className="absolute top-2 left-2 z-10">
                              <span className="bg-red-500 text-white text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-md shadow-md">
                                -{discount}%
                              </span>
                            </div>
                          )}

                          {/* Featured Icon: Top Right (Gold Star) */}
                          {product.isFeatured && (
                            <div className="absolute top-2 right-2 z-10">
                              <div className="bg-white/90 backdrop-blur-sm p-1.5 rounded-full shadow-md">
                                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-500 fill-yellow-500" />
                              </div>
                            </div>
                          )}
                        </div>

                        <CardContent className="p-2 sm:p-3">
                          {/* Category */}
                          <p className="text-[10px] sm:text-xs text-gray-500 mb-1 truncate">{product.category?.name || 'Product'}</p>
                          
                          {/* Name */}
                          <h3 className="font-medium text-xs sm:text-sm text-gray-900 line-clamp-2 sm:line-clamp-1 h-8 sm:h-auto mb-2 sm:mb-1 leading-tight group-hover:text-blue-600 transition-colors">
                            {product.name}
                          </h3>
                          
                          {/* Price Stack - Flex Column on Mobile, Row on Desktop */}
                          <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-2 flex-wrap">
                            <span className="text-sm sm:text-base font-bold text-blue-600 truncate">
                              {formatPrice(product.salePrice || product.basePrice)}
                            </span>
                            {product.salePrice && product.basePrice > product.salePrice && (
                              <span className="text-[10px] sm:text-xs text-gray-400 line-through truncate">
                                {formatPrice(product.basePrice)}
                              </span>
                            )}
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
