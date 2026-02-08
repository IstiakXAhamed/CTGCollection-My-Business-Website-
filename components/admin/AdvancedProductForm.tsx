'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Plus, X, Upload, Loader2, Sparkles, Wand2 } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useToast } from '@/components/ui/use-toast'
import AIProductAssist from '@/components/AIProductAssist'

// Product Types definition
const PRODUCT_TYPES = [
  { id: 'clothing', label: 'Clothing (Standard)', sizeLabel: 'Size', colorLabel: 'Color', hasColor: true },
  { id: 'footwear', label: 'Footwear', sizeLabel: 'Shoe Size', colorLabel: 'Color', hasColor: true },
  { id: 'beauty', label: 'Beauty & Cosmetics', sizeLabel: 'Volume/Weight', colorLabel: 'Shade', hasColor: true },
  { id: 'fragrance', label: 'Fragrance', sizeLabel: 'Volume', colorLabel: 'Color', hasColor: false },
  { id: 'electronics', label: 'Electronics', sizeLabel: 'Storage/Specs', colorLabel: 'Color', hasColor: true },
  { id: 'general', label: 'General / Other', sizeLabel: 'Option', colorLabel: 'Variant', hasColor: true },
] as const

type ProductType = typeof PRODUCT_TYPES[number]['id']

interface AdvancedProductFormProps {
  initialData?: any
  categories: any[]
}

export default function AdvancedProductForm({ initialData, categories }: AdvancedProductFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [generatingSEO, setGeneratingSEO] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    slug: initialData?.slug || '',
    description: initialData?.description || '',
    categoryId: initialData?.categoryId || '',
    basePrice: initialData?.basePrice || '',
    salePrice: initialData?.salePrice || '',
    isFeatured: initialData?.isFeatured || false,
    isBestseller: initialData?.isBestseller || false,
    isActive: initialData?.isActive ?? true,
    hasWarranty: initialData?.hasWarranty || false,
    warrantyPeriod: initialData?.warrantyPeriod || '',
    // New Fields
    productType: initialData?.productType || 'clothing' as ProductType,
    metaTitle: initialData?.metaTitle || '',
    metaDescription: initialData?.metaDescription || '',
    metaKeywords: initialData?.metaKeywords || '',
  })
  
  let initialImages: string[] = []
  if (initialData?.images) {
    try {
      initialImages = typeof initialData.images === 'string' ? JSON.parse(initialData.images) : initialData.images
    } catch (e) {
      console.error('Error parsing initial images:', e)
      initialImages = []
    }
  }

  const [images, setImages] = useState<string[]>(initialImages)
  const [variants, setVariants] = useState<any[]>(initialData?.variants || [])
  const [uploading, setUploading] = useState(false)

  // Get current type config
  const typeConfig = PRODUCT_TYPES.find(t => t.id === formData.productType) || PRODUCT_TYPES[0]

  // Auto-generate slug
  useEffect(() => {
    if (!initialData && formData.name) {
      const slug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
      setFormData(prev => ({ ...prev, slug }))
    }
  }, [formData.name, initialData])

  // Image Upload Logic
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    const newImages: string[] = []

    try {
      for (const file of Array.from(files)) {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('folder', 'products')

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        if (res.ok) {
          const data = await res.json()
          if (data.success && data.url) {
            newImages.push(data.url)
          }
        }
      }
      setImages(prev => [...prev, ...newImages])
    } catch (error) {
      toast({
        title: 'Upload Failed',
        description: 'Could not upload images',
        variant: 'destructive'
      })
    } finally {
      setUploading(false)
    }
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  // Variant Logic
  const addVariant = () => {
    setVariants(prev => [...prev, { size: '', color: typeConfig.hasColor ? '' : 'Default', stock: 0, sku: '' }])
  }

  const updateVariant = (index: number, field: string, value: any) => {
    setVariants(prev => prev.map((v, i) => i === index ? { ...v, [field]: value } : v))
  }

  const removeVariant = (index: number) => {
    setVariants(prev => prev.filter((_, i) => i !== index))
  }

  // AI SEO Generator
  const generateSEO = async () => {
    if (!formData.name || !formData.description) {
      toast({
        title: "Missing Information",
        description: "Please enter product name and description first.",
        variant: "destructive"
      })
      return
    }

    setGeneratingSEO(true)
    try {
      const res = await fetch('/api/ai/generate-seo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          category: categories.find(c => c.id === formData.categoryId)?.name
        })
      })
      
      const data = await res.json()
      if (data.success) {
        setFormData(prev => ({
          ...prev,
          metaTitle: data.result.metaTitle,
          metaDescription: data.result.metaDescription,
          metaKeywords: data.result.metaKeywords
        }))
        toast({ title: "SEO Tags Generated!", description: "Review and save them." })
      }
    } catch (error) {
      toast({ title: "Generation Failed", variant: "destructive" })
    } finally {
      setGeneratingSEO(false)
    }
  }

  // Submit Logic
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const payload = {
        ...formData,
        basePrice: parseFloat(formData.basePrice),
        salePrice: formData.salePrice ? parseFloat(formData.salePrice) : null,
        images,
        variants: variants.map(v => ({
          ...v,
          stock: parseInt(v.stock?.toString() || '0')
        }))
      }

      const url = initialData ? `/api/admin/products/${initialData.id}` : '/api/admin/products'
      const method = initialData ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        toast({ title: 'Success!', description: 'Product saved successfully' })
        router.push('/admin/products')
      } else {
        throw new Error('Failed to save')
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Could not save product', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* 1. Basic Info & Type Selection */}
      <Card className="border-l-4 border-l-blue-500 shadow-sm">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl">Product Information</CardTitle>
              <CardDescription>Select the type to customize the form</CardDescription>
            </div>
            <div className="w-48">
              <Label>Product Type</Label>
              <Select 
                value={formData.productType} 
                onValueChange={(value: string) => {
                  const v = value as ProductType
                  setFormData(prev => ({ ...prev, productType: v }))
                  // Reset variants when type changes to avoid confusion
                  if (confirm('Changing type will reset variants. Continue?')) {
                    setVariants([])
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRODUCT_TYPES.map(t => (
                    <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input 
                value={formData.name} 
                onChange={e => setFormData({ ...formData, name: e.target.value })} 
                required 
                placeholder="Product Name"
              />
            </div>
            <div className="space-y-2">
              <Label>Slug</Label>
              <Input 
                value={formData.slug} 
                onChange={e => setFormData({ ...formData, slug: e.target.value })} 
                required 
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Category *</Label>
            <Select 
              value={formData.categoryId} 
              onValueChange={v => setFormData({ ...formData, categoryId: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Description *</Label>
            <div className="relative">
              <Textarea 
                value={formData.description} 
                onChange={e => setFormData({ ...formData, description: e.target.value })} 
                required 
                rows={5}
              />
              <AIProductAssist 
                productName={formData.name}
                category={categories.find(c => c.id === formData.categoryId)?.name}
                onSuggestionAccept={(field, value) => {
                  if (field === 'description') setFormData(prev => ({ ...prev, description: value }))
                  if (field === 'tags' || field === 'keywords') setFormData(prev => ({ ...prev, metaKeywords: value }))
                  if (field === 'seo' || field === 'seoTitle' || field === 'metaTitle') setFormData(prev => ({ ...prev, metaTitle: value }))
                  if (field === 'metaDescription') setFormData(prev => ({ ...prev, metaDescription: value }))
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Dynamic Variants */}
      <Card className="border-l-4 border-l-purple-500 shadow-sm">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Variants ({typeConfig.label})</span>
            <Button type="button" onClick={addVariant} size="sm" variant="outline">
              <Plus className="w-4 h-4 mr-2" /> Add Option
            </Button>
          </CardTitle>
          <CardDescription>
            Manage availablity. 
            <strong> {typeConfig.sizeLabel}</strong> corresponds to the 'Size' column in DB.
            {typeConfig.hasColor && <strong> {typeConfig.colorLabel}</strong>} corresponds to 'Color'.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
             {variants.length === 0 && (
                <div className="text-center p-8 bg-slate-50 rounded-lg text-muted-foreground">
                  No variants added. Click "Add Option" to start.
                </div>
             )}
             
             {variants.map((variant, index) => (
                <div key={index} className="flex flex-wrap gap-3 items-end p-3 bg-slate-50 border rounded-lg">
                  <div className="flex-1 min-w-[120px]">
                    <Label className="text-xs text-muted-foreground">{typeConfig.sizeLabel}</Label>
                    <Input 
                      placeholder={typeConfig.sizeLabel}
                      value={variant.size} 
                      onChange={e => updateVariant(index, 'size', e.target.value)} 
                    />
                  </div>
                  
                  {typeConfig.hasColor && (
                    <div className="flex-1 min-w-[120px]">
                       <Label className="text-xs text-muted-foreground">{typeConfig.colorLabel}</Label>
                       <Input 
                        placeholder={typeConfig.colorLabel}
                        value={variant.color} 
                        onChange={e => updateVariant(index, 'color', e.target.value)} 
                      />
                    </div>
                  )}

                  <div className="w-[100px]">
                    <Label className="text-xs text-muted-foreground">Stock</Label>
                    <Input 
                      type="number" 
                      placeholder="0"
                      value={variant.stock} 
                      onChange={e => updateVariant(index, 'stock', e.target.value)} 
                    />
                  </div>

                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    className="text-red-500"
                    onClick={() => removeVariant(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
             ))}
          </div>
        </CardContent>
      </Card>

      {/* 3. Pricing & Images */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
           <CardHeader><CardTitle>Pricing</CardTitle></CardHeader>
           <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Base Price (BDT)</Label>
                <Input type="number" value={formData.basePrice} onChange={e => setFormData({ ...formData, basePrice: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Sale Price (Optional)</Label>
                <Input type="number" value={formData.salePrice} onChange={e => setFormData({ ...formData, salePrice: e.target.value })} />
              </div>
              
              <div className="pt-4 flex gap-4 flex-wrap">
                 <label className="flex items-center gap-2 border p-2 rounded cursor-pointer hover:bg-slate-50">
                    <input type="checkbox" checked={formData.isFeatured} onChange={e => setFormData({ ...formData, isFeatured: e.target.checked })} />
                    <span className="text-sm font-medium">✨ Featured</span>
                 </label>
                 <label className="flex items-center gap-2 border p-2 rounded cursor-pointer hover:bg-slate-50">
                    <input type="checkbox" checked={formData.isBestseller} onChange={e => setFormData({ ...formData, isBestseller: e.target.checked })} />
                    <span className="text-sm font-medium">🔥 Bestseller</span>
                 </label>
                 <label className="flex items-center gap-2 border p-2 rounded cursor-pointer hover:bg-slate-50">
                    <input type="checkbox" checked={formData.isActive} onChange={e => setFormData({ ...formData, isActive: e.target.checked })} />
                    <span className="text-sm font-medium">🟢 Active</span>
                 </label>
              </div>
           </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Images</CardTitle></CardHeader>
          <CardContent>
             <div className="grid grid-cols-3 gap-2">
                {images.map((img, i) => (
                   <div key={i} className="relative aspect-square border rounded overflow-hidden">
                      <Image src={img} alt="Product" fill className="object-cover" />
                      <button type='button' onClick={() => removeImage(i)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-80 hover:opacity-100"><X className="w-3 h-3" /></button>
                   </div>
                ))}
                
                <label className="aspect-square border-2 border-dashed flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50">
                   {uploading ? <Loader2 className="animate-spin" /> : <Upload />}
                   <span className="text-xs text-muted-foreground mt-1">Upload</span>
                   <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
             </div>
          </CardContent>
        </Card>
      </div>

      {/* 4. SEO & Search Intelligence */}
      <Card className="border-l-4 border-l-green-500 shadow-sm bg-gradient-to-br from-white to-green-50/50">
        <CardHeader>
          <div className="flex justify-between items-center">
             <div>
               <CardTitle className="flex items-center gap-2">
                 <Sparkles className="w-5 h-5 text-green-600" /> SEO & Search Intelligence
               </CardTitle>
               <CardDescription>Optimize for Google and internal search.</CardDescription>
             </div>
             <Button 
               type="button" 
               onClick={generateSEO} 
               disabled={generatingSEO}
               className="bg-green-600 hover:bg-green-700 text-white"
             >
               {generatingSEO ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Wand2 className="w-4 h-4 mr-2" />}
               Auto-Generate SEO
             </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
           <div className="space-y-2">
             <Label>Meta Title</Label>
             <Input 
               placeholder="SEO Title (e.g., Premium Silk Saree - Buy Online in BD)" 
               value={formData.metaTitle}
               onChange={e => setFormData({ ...formData, metaTitle: e.target.value })}
             />
             <p className="text-xs text-muted-foreground text-right">{(formData.metaTitle || '').length}/60 chars</p>
           </div>
           
           <div className="space-y-2">
             <Label>Meta Description</Label>
             <Textarea 
               placeholder="Short description for search results" 
               value={formData.metaDescription}
               onChange={e => setFormData({ ...formData, metaDescription: e.target.value })}
               rows={3}
             />
             <p className="text-xs text-muted-foreground text-right">{(formData.metaDescription || '').length}/160 chars</p>
           </div>
           
           <div className="space-y-2">
             <Label>Keywords (Comma separated)</Label>
             <Input 
               placeholder="silk saree, eid collection, women fashion, red saree" 
               value={formData.metaKeywords}
               onChange={e => setFormData({ ...formData, metaKeywords: e.target.value })}
             />
           </div>
        </CardContent>
      </Card>

      <div className="flex gap-4 pt-4">
         <Button type="submit" disabled={loading} size="lg" className="w-full md:w-auto min-w-[200px]">
           {loading ? 'Saving...' : 'Save Product'}
         </Button>
         <Button type="button" variant="outline" size="lg" onClick={() => router.back()}>
           Cancel
         </Button>
      </div>
    </form>
  )
}
