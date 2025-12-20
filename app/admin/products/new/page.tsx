'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Plus, X, Upload, Loader2 } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useToast } from '@/hooks/use-toast'
import AIProductAssist from '@/components/AIProductAssist'

type Variant = {
  size: string
  color: string
  stock: number
  sku: string
}

export default function NewProductPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<any[]>([])
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    categoryId: '',
    basePrice: '',
    salePrice: '',
    isFeatured: false,
    isBestseller: false,
    isActive: true,
    hasWarranty: false,
    warrantyPeriod: '',
  })
  
  const [images, setImages] = useState<string[]>([])
  const [variants, setVariants] = useState<Variant[]>([
    { size: 'M', color: 'Default', stock: 0, sku: '' }
  ])

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories')
      if (res.ok) {
        const data = await res.json()
        setCategories(data.categories || [])
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }

  // Auto-generate slug from name
  useEffect(() => {
    if (formData.name) {
      const slug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
      setFormData(prev => ({ ...prev, slug }))
    }
  }, [formData.name])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    Array.from(files).forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImages(prev => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const addVariant = () => {
    setVariants(prev => [...prev, { size: '', color: '', stock: 0, sku: '' }])
  }

  const updateVariant = (index: number, field: keyof Variant, value: string | number) => {
    setVariants(prev => prev.map((v, i) => 
      i === index ? { ...v, [field]: value } : v
    ))
  }

  const removeVariant = (index: number) => {
    setVariants(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const payload = {
        ...formData,
        basePrice: parseFloat(formData.basePrice),
        salePrice: formData.salePrice ? parseFloat(formData.salePrice) : null,
        images: images,
        hasWarranty: formData.hasWarranty,
        warrantyPeriod: formData.hasWarranty ? formData.warrantyPeriod : null,
        variants: variants.map(v => ({
          ...v,
          stock: parseInt(v.stock.toString())
        }))
      }

      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include'
      })

      if (res.ok) {
        toast({
          title: 'Success!',
          description: 'Product created successfully',
        })
        router.push('/admin/products')
      } else {
        const error = await res.json()
        toast({
          title: 'Error',
          description: error.error || 'Failed to create product',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Failed to create product:', error)
      toast({
        title: 'Error',
        description: 'An error occurred while creating the product',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/products">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Add New Product</h1>
          <p className="text-muted-foreground">Create a new product in your catalog</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Premium Cotton T-Shirt"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="slug">Slug (Auto-generated)</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="premium-cotton-tshirt"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Detailed product description..."
                rows={4}
                required
              />
            </div>

            {/* AI Product Assist */}
            <AIProductAssist
              productName={formData.name}
              category={categories.find((c: any) => c.id === formData.categoryId)?.name}
              onSuggestionAccept={(field, value) => {
                if (field === 'description') {
                  setFormData(prev => ({ ...prev, description: value }))
                } else if (field === 'seo' || field === 'tags') {
                  // Add to description or show to user
                  setFormData(prev => ({ ...prev, description: prev.description + '\n\n' + value }))
                }
              }}
            />

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <select
                id="category"
                value={formData.categoryId}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                className="w-full h-10 px-3 rounded-md border border-input bg-background"
                required
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card>
          <CardHeader>
            <CardTitle>Pricing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="basePrice">Base Price (BDT) *</Label>
                <Input
                  id="basePrice"
                  type="number"
                  step="0.01"
                  value={formData.basePrice}
                  onChange={(e) => setFormData(prev => ({ ...prev, basePrice: e.target.value }))}
                  placeholder="1999.00"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="salePrice">Sale Price (BDT)</Label>
                <Input
                  id="salePrice"
                  type="number"
                  step="0.01"
                  value={formData.salePrice}
                  onChange={(e) => setFormData(prev => ({ ...prev, salePrice: e.target.value }))}
                  placeholder="1499.00"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Images */}
        <Card>
          <CardHeader>
            <CardTitle>Product Images</CardTitle>
            <p className="text-sm text-muted-foreground">Upload product images (first image will be the main image)</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {images.map((img, index) => (
                <div key={index} className="relative aspect-square border-2 border-dashed rounded-lg overflow-hidden group">
                  <Image
                    src={img}
                    alt={`Product ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              
              <label className="aspect-square border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors">
                <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                <span className="text-sm text-muted-foreground">Upload Image</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Variants - Improved */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Product Variants</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">Select sizes and colors, then set stock for each combination</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Preset Sizes */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">📏 Available Sizes (click to toggle)</Label>
              <div className="flex flex-wrap gap-2">
                {['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', 'Free Size'].map(size => {
                  const isSelected = variants.some(v => v.size === size)
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          setVariants(prev => prev.filter(v => v.size !== size))
                        } else {
                          // Add variant with this size and default color
                          setVariants(prev => [...prev, { size, color: 'Default', stock: 0, sku: '' }])
                        }
                      }}
                      className={`px-4 py-2 rounded-lg border-2 font-medium transition-all ${
                        isSelected 
                          ? 'bg-blue-600 text-white border-blue-600' 
                          : 'bg-white text-gray-700 border-gray-200 hover:border-blue-400'
                      }`}
                    >
                      {size}
                    </button>
                  )
                })}
              </div>
              <Input
                placeholder="অথবা কাস্টম সাইজ লিখুন (e.g., 32, 34, 36)"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    const value = (e.target as HTMLInputElement).value.trim()
                    if (value && !variants.some(v => v.size === value)) {
                      setVariants(prev => [...prev, { size: value, color: 'Default', stock: 0, sku: '' }])
                      ;(e.target as HTMLInputElement).value = ''
                    }
                  }
                }}
                className="max-w-xs"
              />
            </div>

            {/* Preset Colors */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">🎨 Available Colors</Label>
              <div className="flex flex-wrap gap-2">
                {[
                  { name: 'Black', hex: '#000000' },
                  { name: 'White', hex: '#FFFFFF' },
                  { name: 'Red', hex: '#EF4444' },
                  { name: 'Blue', hex: '#3B82F6' },
                  { name: 'Green', hex: '#22C55E' },
                  { name: 'Yellow', hex: '#EAB308' },
                  { name: 'Pink', hex: '#EC4899' },
                  { name: 'Purple', hex: '#A855F7' },
                  { name: 'Orange', hex: '#F97316' },
                  { name: 'Gray', hex: '#6B7280' },
                  { name: 'Navy', hex: '#1E3A5F' },
                  { name: 'Maroon', hex: '#7F1D1D' },
                ].map(color => {
                  const isSelected = variants.some(v => v.color === color.name)
                  return (
                    <button
                      key={color.name}
                      type="button"
                      onClick={() => {
                        if (!isSelected) {
                          // Add this color to all existing sizes or create default
                          const sizes = Array.from(new Set(variants.map(v => v.size)))
                          if (sizes.length === 0 || (sizes.length === 1 && sizes[0] === '')) {
                            setVariants(prev => [...prev.filter(v => v.color !== 'Default'), { size: 'M', color: color.name, stock: 0, sku: '' }])
                          } else {
                            const newVariants = sizes.map(size => ({ size, color: color.name, stock: 0, sku: '' }))
                            setVariants(prev => [...prev.filter(v => v.color !== 'Default'), ...newVariants])
                          }
                        }
                      }}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all ${
                        isSelected 
                          ? 'border-blue-600 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      <span 
                        className="w-5 h-5 rounded-full border border-gray-300" 
                        style={{ backgroundColor: color.hex }}
                      />
                      <span className="text-sm">{color.name}</span>
                      {isSelected && <span className="text-blue-600">✓</span>}
                    </button>
                  )
                })}
              </div>
              <Input
                placeholder="অথবা কাস্টম কালার লিখুন (e.g., Teal, Coral)"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    const value = (e.target as HTMLInputElement).value.trim()
                    if (value) {
                      const sizes = Array.from(new Set(variants.map(v => v.size).filter(s => s)))
                      if (sizes.length === 0) sizes.push('M')
                      const newVariants = sizes.map(size => ({ size, color: value, stock: 0, sku: '' }))
                      setVariants(prev => [...prev, ...newVariants])
                      ;(e.target as HTMLInputElement).value = ''
                    }
                  }
                }}
                className="max-w-xs"
              />
            </div>

            {/* Variant List with Stock */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold">📦 Stock per Variant ({variants.length} variants)</Label>
                <div className="flex gap-2">
                  <Button 
                    type="button" 
                    size="sm" 
                    variant="outline"
                    onClick={() => {
                      setVariants(prev => prev.map(v => ({ ...v, stock: 50 })))
                    }}
                  >
                    সব ৫০ সেট করুন
                  </Button>
                  <Button type="button" size="sm" onClick={addVariant}>
                    <Plus className="w-4 h-4 mr-1" />
                    ম্যানুয়াল যোগ
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-80 overflow-y-auto">
                {variants.map((variant, index) => (
                  <div key={index} className="flex items-center gap-2 p-3 border rounded-lg bg-gray-50">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded">{variant.size || 'N/A'}</span>
                        <span className="text-gray-400">×</span>
                        <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded">{variant.color || 'N/A'}</span>
                      </div>
                    </div>
                    <Input
                      type="number"
                      value={variant.stock}
                      onChange={(e) => updateVariant(index, 'stock', parseInt(e.target.value) || 0)}
                      className="w-20 text-center"
                      placeholder="Stock"
                    />
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => removeVariant(index)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
              
              {variants.length === 0 && (
                <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                  উপরে সাইজ ও কালার সিলেক্ট করুন অথবা "ম্যানুয়াল যোগ" করুন
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Product Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
                  className="w-4 h-4"
                />
                <span>Featured Product</span>
              </label>
              
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isBestseller}
                  onChange={(e) => setFormData(prev => ({ ...prev, isBestseller: e.target.checked }))}
                  className="w-4 h-4"
                />
                <span>Bestseller</span>
              </label>
              
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="w-4 h-4"
                />
                <span>Active (Visible on site)</span>
              </label>
            </div>

            {/* Warranty Section */}
            <div className="pt-4 border-t">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.hasWarranty}
                  onChange={(e) => setFormData(prev => ({ ...prev, hasWarranty: e.target.checked }))}
                  className="w-4 h-4"
                />
                <span className="font-medium">🛡️ Product has Warranty</span>
              </label>
              
              {formData.hasWarranty && (
                <div className="mt-3 ml-6">
                  <Label htmlFor="warrantyPeriod">Warranty Period</Label>
                  <select
                    id="warrantyPeriod"
                    value={formData.warrantyPeriod}
                    onChange={(e) => setFormData(prev => ({ ...prev, warrantyPeriod: e.target.value }))}
                    className="w-full max-w-xs h-10 px-3 mt-1 rounded-md border border-input bg-background"
                  >
                    <option value="">Select warranty period</option>
                    <option value="30 Days">30 Days</option>
                    <option value="3 Months">3 Months</option>
                    <option value="6 Months">6 Months</option>
                    <option value="1 Year">1 Year</option>
                    <option value="2 Years">2 Years</option>
                    <option value="3 Years">3 Years</option>
                    <option value="Lifetime">Lifetime</option>
                  </select>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex gap-4">
          <Button type="submit" disabled={loading} className="min-w-[150px]">
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Product'
            )}
          </Button>
          <Link href="/admin/products">
            <Button type="button" variant="outline">Cancel</Button>
          </Link>
        </div>
      </form>
    </div>
  )
}
