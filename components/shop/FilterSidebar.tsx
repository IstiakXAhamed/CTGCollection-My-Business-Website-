import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import Link from 'next/link'
import { Category } from '@/types'

interface FilterSidebarProps {
  categories: Category[]
  selectedCategories: string[]
  toggleCategory: (id: string) => void
  priceRange: { min: string; max: string }
  setPriceRange: (range: { min: string; max: string }) => void
  clearFilters: () => void
  isFeatured: boolean
  isSale: boolean
  className?: string
}

export function FilterSidebar({
  categories,
  selectedCategories,
  toggleCategory,
  priceRange,
  setPriceRange,
  clearFilters,
  isFeatured,
  isSale,
  className = ""
}: FilterSidebarProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      <Card className="p-4 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg">Filters</h2>
          {(selectedCategories.length > 0 || priceRange.min || priceRange.max) && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50">
              Clear All
            </Button>
          )}
        </div>

        {/* Quick Links */}
        <div className="mb-6 space-y-2">
          <h3 className="font-semibold mb-3 text-sm text-gray-900">Quick Links</h3>
          <Link href="/shop" className={`block px-3 py-2 text-sm rounded-lg transition ${!isFeatured && !isSale ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>
            All Products
          </Link>
          <Link href="/shop?featured=true" className={`block px-3 py-2 text-sm rounded-lg transition ${isFeatured ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>
            ⭐ Featured
          </Link>
          <Link href="/shop?sale=true" className={`block px-3 py-2 text-sm rounded-lg transition ${isSale ? 'bg-red-50 text-red-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>
            🏷️ On Sale
          </Link>
        </div>

        {/* Categories */}
        <div className="mb-6">
          <h3 className="font-semibold mb-3 text-sm text-gray-900">Categories</h3>
          <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {categories.map((category) => (
              <div key={category.id} className="flex items-center gap-3">
                <Checkbox
                  id={category.id}
                  checked={selectedCategories.includes(category.id)}
                  onCheckedChange={() => toggleCategory(category.id)}
                  className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                />
                <label
                  htmlFor={category.id}
                  className="text-sm text-gray-700 cursor-pointer flex-1 user-select-none hover:text-blue-600 transition-colors"
                >
                  {category.name}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div>
          <h3 className="font-semibold mb-3 text-sm text-gray-900">Price Range (BDT)</h3>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">৳</span>
              <Input
                type="number"
                placeholder="Min"
                value={priceRange.min}
                onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                className="pl-6 h-9 text-sm"
              />
            </div>
            <span className="text-gray-400">-</span>
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">৳</span>
              <Input
                type="number"
                placeholder="Max"
                value={priceRange.max}
                onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                className="pl-6 h-9 text-sm"
              />
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
