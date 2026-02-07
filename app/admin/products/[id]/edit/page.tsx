'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Plus, X, Upload, Loader2 } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useToast } from '@/hooks/use-toast'

type Variant = {
  id?: string
  size: string
  color: string
  stock: number
  sku: string
}

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const productId = params.id as string
  const { toast } = useToast()
  
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
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
  })
  
  const [images, setImages] = useState<string[]>([])
  const [variants, setVariants] = useState<Variant[]>([])

  useEffect(() => {
    fetchCategories()
    fetchProduct()
  }, [productId])

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

  const fetchProduct = async () => {
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        credentials: 'include'
      })
      
      if (res.ok) {
        const data = await res.json()
        const product = data.product
        
        // Populate form
        setFormData({
          name: product.name || '',
          slug: product.slug || '',
          description: product.description || '',
          categoryId: product.categoryId || '',
          basePrice: product.basePrice?.toString() || '',
          salePrice: product.salePrice?.toString() || '',
          isFeatured: product.isFeatured || false,
          isBestseller: product.isBestseller || false,
          isActive: product.isActive !== false,
        })
        // Parse images JSON string if needed
        let parsedImages: string[] = []
        if (product.images) {
          try {
            parsedImages = typeof product.images === 'string' 
              ? JSON.parse(product.images) 
              : product.images
          } catch {
            parsedImages = []
          }
        }
        
        setImages(parsedImages)
        setVariants(product.variants || [{ size: 'M', color: 'Default', stock: 0, sku: '' }])
      } else {
        toast({
          title: 'Error',
          description: 'Failed to load product',
          variant: 'destructive'
        })
        router.push('/admin/products')
      }
    } catch (error) {
      console.error('Failed to fetch product:', error)
      toast({
        title: 'Error',
        description: 'An error occurred while loading the product',
        variant: 'destructive'
      })
    } finally {
      setFetching(false)
    }
  }

  const [uploading, setUploading] = useState(false)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    const newImages: string[] = []

    try {
      for (const file of Array.from(files)) {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('folder', 'products') // Organize in 'products' folder

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        if (res.ok) {
          const data = await res.json()
          if (data.success && data.url) {
            newImages.push(data.url)
          }
        } else {
          console.error('Upload failed')
          toast({
            title: 'Upload Failed',
            description: `Failed to upload ${file.name}`,
            variant: 'destructive'
          })
        }
      }
      
      setImages(prev => [...prev, ...newImages])
    } catch (error) {
      console.error('Upload error:', error)
      toast({
        title: 'Error',
        description: 'An error occurred while uploading images',
        variant: 'destructive'
      })
    } finally {
      setUploading(false)
      // Reset input
      e.target.value = ''
    }
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
    if (variants.length > 1) {
      setVariants(prev => prev.filter((_, i) => i !== index))
    }
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
        variants: variants.map(v => ({
          size: v.size,
          color: v.color,
          stock: parseInt(v.stock.toString()),
          sku: v.sku || ''
        }))
      }

      const res = await fetch(`/api/admin/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include'
      })

      if (res.ok) {
        toast({
          title: 'Success!',
          description: 'Product updated successfully',
        })
        router.push('/admin/products')
      } else {
        const error = await res.json()
        toast({
          title: 'Error',
          description: error.error || 'Failed to update product',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Failed to update product:', error)
      toast({
        title: 'Error',
        description: 'An error occurred while updating the product',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2">Loading product...</span>
      </div>
    )
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
          <h1 className="text-3xl font-bold">Edit Product</h1>
          <p className="text-muted-foreground">Update product information</p>
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
                <Label htmlFor="slug">Slug</Label>
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
            <p className="text-sm text-muted-foreground">Current images (first image is the main image)</p>
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
                  {index === 0 && (
                    <div className="absolute bottom-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                      Main
                    </div>
                  )}
                </div>
              ))}
              
              <label className="aspect-square border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors">
                {uploading ? (
                  <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-2" />
                ) : (
                  <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                )}
                <span className="text-sm text-muted-foreground">
                  {uploading ? 'Uploading...' : 'Add More'}
                </span>
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

        {/* Variants */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Product Variants</CardTitle>
              <Button type="button" size="sm" onClick={addVariant}>
                <Plus className="w-4 h-4 mr-2" />
                Add Variant
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {variants.map((variant, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-sm">Variant {index + 1}</span>
                  {variants.length > 1 && (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => removeVariant(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor={`size-${index}`}>Size</Label>
                    <Input
                      id={`size-${index}`}
                      value={variant.size}
                      onChange={(e) => updateVariant(index, 'size', e.target.value)}
                      placeholder="S, M, L, XL"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <Label htmlFor={`color-${index}`}>Color</Label>
                    <Input
                      id={`color-${index}`}
                      value={variant.color}
                      onChange={(e) => updateVariant(index, 'color', e.target.value)}
                      placeholder="Red, Blue, etc."
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <Label htmlFor={`stock-${index}`}>Stock</Label>
                    <Input
                      id={`stock-${index}`}
                      type="number"
                      value={variant.stock}
                      onChange={(e) => updateVariant(index, 'stock', parseInt(e.target.value) || 0)}
                      placeholder="100"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <Label htmlFor={`sku-${index}`}>SKU (Optional)</Label>
                    <Input
                      id={`sku-${index}`}
                      value={variant.sku}
                      onChange={(e) => updateVariant(index, 'sku', e.target.value)}
                      placeholder="TSH-M-RED"
                    />
                  </div>
                </div>
              </div>
            ))}
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
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex gap-4">
          <Button type="submit" disabled={loading} className="min-w-[150px]">
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              'Update Product'
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
