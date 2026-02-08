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

const TYPE_PRESETS: Record<string, { sizes: string[] }> = {
  clothing: { sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', 'Free Size'] },
  footwear: { sizes: ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45'] },
  beauty: { sizes: ['5ml', '10ml', '30ml', '50ml', '100ml', '200ml', '500ml'] },
  fragrance: { sizes: ['1ml', '2ml', '5ml', '10ml', '30ml', '50ml', '100ml'] },
  electronics: { sizes: ['8GB/256GB', '16GB/512GB', '32GB/1TB', 'Standard', 'Pro'] },
  general: { sizes: ['Small', 'Medium', 'Large', 'Pack of 1', 'Pack of 3'] },
  universal: { sizes: ['Option A', 'Option B', 'Standard'] }
}

interface VariantManagerProps {
  variants: Variant[]
  onChange: (variants: Variant[]) => void
  productName?: string
  hasColor?: boolean
  productType?: string
  sizeLabel?: string
  colorLabel?: string
}

// Preset sizes moved to TYPE_PRESETS
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

export default function VariantManager({ 
  variants, 
  onChange, 
  productName, 
  hasColor = true,
  productType = 'clothing',
  sizeLabel = 'Size',
  colorLabel = 'Color'
}: VariantManagerProps) {
  const [selectedSizes, setSelectedSizes] = useState<string[]>([])
  const [selectedColors, setSelectedColors] = useState<string[]>([])
  const [customSize, setCustomSize] = useState('')
  const [customColor, setCustomColor] = useState('')

  const presets = TYPE_PRESETS[productType as keyof typeof TYPE_PRESETS] || TYPE_PRESETS.clothing

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
      <div className="space-y-4">
        <Label className="flex items-center gap-2 text-base font-bold text-gray-800 dark:text-gray-200">
           📦 Product Variants ({productType.charAt(0).toUpperCase() + productType.slice(1)})
        </Label>
        
        <div className="space-y-3 p-5 bg-slate-50 dark:bg-gray-800/50 rounded-2xl border border-slate-100 dark:border-gray-700">
          <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">
             🏷️ Available {sizeLabel} (click to toggle)
          </Label>
          <div className="flex flex-wrap gap-2">
            {presets.sizes.map(size => (
              <button
                key={size}
                type="button"
                onClick={() => toggleSize(size)}
                className={cn(
                  "px-4 py-2 rounded-xl border text-sm font-semibold transition-all duration-200",
                  selectedSizes.includes(size)
                    ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/30 scale-105"
                    : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-blue-400 hover:bg-blue-50/50"
                )}
              >
                {size}
              </button>
            ))}
          </div>
          <div className="flex gap-2 max-w-sm pt-2">
            <Input 
              placeholder={`অথবা কাস্টম ${sizeLabel} লিখুন...`} 
              value={customSize} 
              onChange={e => setCustomSize(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCustomSize())}
              className="rounded-xl border-slate-200 h-10"
            />
            <Button type="button" onClick={addCustomSize} variant="secondary" className="rounded-xl px-6">Add</Button>
          </div>
        </div>
      </div>

      {/* 2. Color Selection */}
      {hasColor && (
        <div className="space-y-3 p-5 bg-slate-50 dark:bg-gray-800/50 rounded-2xl border border-slate-100 dark:border-gray-700">
          <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">
             🎨 Available {colorLabel}
          </Label>
          <div className="flex flex-wrap gap-2">
            {PRESET_COLORS.map(color => (
              <button
                key={color.name}
                type="button"
                onClick={() => toggleColor(color.name)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl border text-sm transition-all duration-200",
                  selectedColors.includes(color.name)
                    ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20 ring-1 ring-blue-600 scale-105"
                    : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-400"
                )}
              >
                <div 
                  className={cn("w-4 h-4 rounded-full shadow-sm", color.border && "border border-gray-200")} 
                  style={{ backgroundColor: color.hex }} 
                />
                <span className="font-semibold text-gray-700 dark:text-gray-300">{color.name}</span>
              </button>
            ))}
          </div>
          <div className="flex gap-2 max-w-sm pt-2">
            <Input 
              placeholder={`অথবা কাস্টম ${colorLabel} লিখুন...`} 
              value={customColor} 
              onChange={e => setCustomColor(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCustomColor())}
              className="rounded-xl border-slate-200 h-10"
            />
            <Button type="button" onClick={addCustomColor} variant="secondary" className="rounded-xl px-6">Add</Button>
          </div>
        </div>
      )}

      {/* 3. Variant List & Bulk Actions */}
      <div className="pt-6 border-t border-slate-100 dark:border-gray-700">
        <div className="flex justify-between items-center mb-6 gap-4">
           <div>
              <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">
                 📋 Variant Inventory List ({variants.length})
              </Label>
           </div>
           <div className="flex gap-3">
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  const val = prompt('Enter stock amount for all variants:', '50')
                  if (val !== null) bulkUpdateStock(parseInt(val) || 0)
                }}
                className="text-xs h-9 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold"
              >
                সব ৫০ সেট করুন
              </Button>
              <Button 
                type="button" 
                size="sm" 
                onClick={addManualVariant}
                className="text-xs h-9 rounded-xl bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 px-4"
              >
                <Plus className="w-3.5 h-3.5 mr-2" /> ম্যানুয়াল যোগ
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
