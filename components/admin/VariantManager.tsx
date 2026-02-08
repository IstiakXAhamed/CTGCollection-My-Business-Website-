'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, X, Hash } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Variant {
  size: string
  color: string
  stock: number
  sku: string
}

interface VariantManagerProps {
  variants: Variant[]
  onChange: (variants: Variant[]) => void
  productName?: string
  hasColor?: boolean
}

const PRESET_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', 'Free Size']
const PRESET_COLORS = [
  { name: 'Black', hex: '#000000' },
  { name: 'White', hex: '#FFFFFF', border: true },
  { name: 'Red', hex: '#EF4444' },
  { name: 'Blue', hex: '#3B82F6' },
  { name: 'Green', hex: '#22C55E' },
  { name: 'Yellow', hex: '#EAB308' },
  { name: 'Pink', hex: '#EC4899' },
  { name: 'Purple', hex: '#A855F7' },
  { name: 'Orange', hex: '#F97316' },
  { name: 'Gray', hex: '#6B7280' },
  { name: 'Navy', hex: '#1E3A8A' },
  { name: 'Maroon', hex: '#800000' }
]

export default function VariantManager({ variants, onChange, productName, hasColor = true }: VariantManagerProps) {
  const [selectedSizes, setSelectedSizes] = useState<string[]>([])
  const [selectedColors, setSelectedColors] = useState<string[]>([])
  const [customSize, setCustomSize] = useState('')
  const [customColor, setCustomColor] = useState('')

  // Sync internal selection state with incoming variants on mount or if variants change outside
  useEffect(() => {
    const sizes = Array.from(new Set(variants.map(v => v.size).filter(s => s && s !== 'Default')))
    const colors = Array.from(new Set(variants.map(v => v.color).filter(c => c && c !== 'Default')))
    setSelectedSizes(sizes)
    setSelectedColors(colors)
  }, [])

  // Auto-generate variants based on matrix
  const generateVariants = (sizes: string[], colors: string[]) => {
    const finalSizes = sizes.length > 0 ? sizes : ['Default']
    const finalColors = (hasColor && colors.length > 0) ? colors : ['Default']

    const newVariants: Variant[] = []
    finalSizes.forEach(size => {
      finalColors.forEach(color => {
        // Try to find existing variant to preserve stock/sku
        const existing = variants.find(v => v.size === size && v.color === color)
        newVariants.push({
          size,
          color,
          stock: existing?.stock || 0,
          sku: existing?.sku || ''
        })
      })
    })
    onChange(newVariants)
  }

  const toggleSize = (size: string) => {
    const next = selectedSizes.includes(size)
      ? selectedSizes.filter(s => s !== size)
      : [...selectedSizes, size]
    setSelectedSizes(next)
    generateVariants(next, selectedColors)
  }

  const toggleColor = (color: string) => {
    const next = selectedColors.includes(color)
      ? selectedColors.filter(c => c !== color)
      : [...selectedColors, color]
    setSelectedColors(next)
    generateVariants(selectedSizes, next)
  }

  const addCustomSize = () => {
    if (customSize && !selectedSizes.includes(customSize)) {
      const next = [...selectedSizes, customSize]
      setSelectedSizes(next)
      setCustomSize('')
      generateVariants(next, selectedColors)
    }
  }

  const addCustomColor = () => {
    if (customColor && !selectedColors.includes(customColor)) {
      const next = [...selectedColors, customColor]
      setSelectedColors(next)
      setCustomColor('')
      generateVariants(selectedSizes, next)
    }
  }

  const updateVariantStock = (index: number, stock: number) => {
    const next = [...variants]
    next[index].stock = stock
    onChange(next)
  }

  const removeVariant = (index: number) => {
    const next = variants.filter((_, i) => i !== index)
    onChange(next)
  }

  const bulkUpdateStock = (amount: number) => {
    const next = variants.map(v => ({ ...v, stock: amount }))
    onChange(next)
  }

  const addManualVariant = () => {
    onChange([...variants, { size: '', color: hasColor ? '' : 'Default', stock: 0, sku: '' }])
  }

  return (
    <div className="space-y-6">
      {/* 1. Size Selection */}
      <div className="space-y-3">
        <Label className="flex items-center gap-2 text-sm font-semibold">
           🏷️ Available Sizes (click to toggle)
        </Label>
        <div className="flex flex-wrap gap-2">
          {PRESET_SIZES.map(size => (
            <button
              key={size}
              type="button"
              onClick={() => toggleSize(size)}
              className={cn(
                "px-4 py-2 rounded-lg border text-sm font-medium transition-all",
                selectedSizes.includes(size)
                  ? "bg-blue-600 border-blue-600 text-white shadow-md active:scale-95"
                  : "bg-white border-gray-200 text-gray-700 hover:border-blue-400 active:scale-95"
              )}
            >
              {size}
            </button>
          ))}
        </div>
        <div className="flex gap-2 max-w-sm">
          <Input 
            placeholder="অথবা কাস্টম সাইজ লিখুন (e.g., 32, 34, 36)" 
            value={customSize} 
            onChange={e => setCustomSize(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCustomSize())}
          />
          <Button type="button" onClick={addCustomSize} variant="outline" size="sm">Add</Button>
        </div>
      </div>

      {/* 2. Color Selection */}
      {hasColor && (
        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-sm font-semibold">
             🎨 Available Colors
          </Label>
          <div className="flex flex-wrap gap-2">
            {PRESET_COLORS.map(color => (
              <button
                key={color.name}
                type="button"
                onClick={() => toggleColor(color.name)}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm transition-all",
                  selectedColors.includes(color.name)
                    ? "border-blue-600 bg-blue-50 ring-1 ring-blue-600"
                    : "border-gray-200 bg-white hover:border-gray-300"
                )}
              >
                <div 
                  className={cn("w-4 h-4 rounded-full", color.border && "border border-gray-200")} 
                  style={{ backgroundColor: color.hex }} 
                />
                <span className="font-medium text-gray-700">{color.name}</span>
              </button>
            ))}
          </div>
          <div className="flex gap-2 max-w-sm">
            <Input 
              placeholder="অথবা কাস্টম কালার লিখুন (e.g., Teal, Coral)" 
              value={customColor} 
              onChange={e => setCustomColor(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCustomColor())}
            />
            <Button type="button" onClick={addCustomColor} variant="outline" size="sm">Add</Button>
          </div>
        </div>
      )}

      {/* 3. Variant List & Bulk Actions */}
      <div className="pt-4 border-t">
        <div className="flex justify-between items-end mb-4 gap-4">
           <div>
              <Label className="flex items-center gap-2 text-sm font-semibold">
                 📦 Stock per Variant ({variants.length} variants)
              </Label>
           </div>
           <div className="flex gap-2">
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  const val = prompt('Enter stock amount for all variants:', '50')
                  if (val !== null) bulkUpdateStock(parseInt(val) || 0)
                }}
                className="text-xs h-8 border-blue-200 text-blue-700 hover:bg-blue-50"
              >
                সব ৫০ সেট করুন
              </Button>
              <Button 
                type="button" 
                size="sm" 
                onClick={addManualVariant}
                className="text-xs h-8 bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-3 h-3 mr-1" /> ম্যানুয়াল যোগ
              </Button>
           </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
           {variants.map((v, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-white border rounded-xl shadow-sm hover:shadow-md transition-shadow group">
                 <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                       <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] font-bold uppercase">{v.size || 'No Size'}</span>
                       {hasColor && <span className="text-gray-400 text-xs">×</span>}
                       {hasColor && <span className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded text-[10px] font-bold uppercase">{v.color || 'No Color'}</span>}
                    </div>
                 </div>
                 <div className="flex items-center gap-2">
                    <Input 
                      type="number" 
                      className="w-20 h-9 text-center bg-gray-50 border-none focus-visible:ring-1 focus-visible:ring-blue-500"
                      value={v.stock}
                      onChange={e => updateVariantStock(i, parseInt(e.target.value) || 0)}
                    />
                    <button 
                      type="button" 
                      onClick={() => removeVariant(i)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                 </div>
              </div>
           ))}
        </div>
        
        {variants.length === 0 && (
           <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
              <Hash className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No variants generated yet. Toggle sizes and colors above.</p>
           </div>
        )}
      </div>
    </div>
  )
}
