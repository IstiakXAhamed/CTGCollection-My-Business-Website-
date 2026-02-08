'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Plus, X, Upload, Loader2, Tag } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useToast } from '@/components/ui/use-toast'
import AdvancedProductForm from '@/components/admin/AdvancedProductForm'
import VariantManager from '@/components/admin/VariantManager'
import AIProductAssist from '@/components/AIProductAssist'

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
  
  // State
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [categories, setCategories] = useState<any[]>([])
  const [product, setProduct] = useState<any>(null)
  
  // Settings State
  const [useAdvancedMode, setUseAdvancedMode] = useState(false)

  // Simple Form State
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
    metaTitle: '',
    metaKeywords: '',
  })
  
  const [images, setImages] = useState<string[]>([])
  const [variants, setVariants] = useState<Variant[]>([])

  useEffect(() => {
    const init = async () => {
      try {
        const [catRes, setRes, prodRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/settings'),
          fetch(`/api/admin/products/${productId}`)
        ])

        // Categories
        if (catRes.ok) {
          const data = await catRes.json()
          setCategories(data.categories || [])
        }
        
        // Settings
        if (setRes.ok) {
          const data = await setRes.json()
          // Default to simple, but allow override from DB
          setUseAdvancedMode(data.settings?.adminProductMode === 'advanced')
        }

        // Product
        if (prodRes.ok) {
          const data = await prodRes.json()
          const p = data.product
          setProduct(p)
          
          // Populate Simple Form
          setFormData({
            name: p.name || '',
            slug: p.slug || '',
            description: p.description || '',
            categoryId: p.categoryId || '',
            basePrice: p.basePrice?.toString() || '',
            salePrice: p.salePrice?.toString() || '',
            isFeatured: p.isFeatured || false,
            isBestseller: p.isBestseller || false,
            isActive: p.isActive !== false,
            metaTitle: p.metaTitle || '',
            metaKeywords: p.metaKeywords || '',
          })

          let parsedImages: string[] = []
          if (p.images) {
             try {
               parsedImages = typeof p.images === 'string' ? JSON.parse(p.images) : p.images
             } catch { parsedImages = [] }
          }
          setImages(parsedImages)
          setVariants(p.variants || [])
          
          // If product has advanced fields (meta, type != clothing), enable advanced mode automatically
          if (p.metaTitle || p.metaDescription || (p.productType && p.productType !== 'clothing')) {
            setUseAdvancedMode(true)
          }

        } else {
           throw new Error('Product not found')
        }

      } catch (error) {
        console.error('Init error:', error)
         toast({ title: 'Error', description: 'Failed to load data', variant: 'destructive' })
      } finally {
        setFetching(false)
      }
    }
    init()
  }, [productId])


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
      toast({ title: 'Upload Failed', variant: 'destructive' })
    } finally {
      setUploading(false)
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
    setVariants(prev => prev.map((v, i) => i === index ? { ...v, [field]: value } : v))
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
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        toast({ title: 'Success!', description: 'Product updated successfully' })
        router.push('/admin/products')
      } else {
        throw new Error('Failed to update')
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update product', variant: 'destructive' })
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
      <div className="flex items-center justify-between">
         <div className="flex items-center gap-4">
          <Link href="/admin/products">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Edit Product</h1>
            <p className="text-muted-foreground">{product?.name}</p>
          </div>
        </div>
        
        {/* Toggle Mode */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
           <Button 
             type="button"
             variant={!useAdvancedMode ? 'ghost' : 'ghost'} 
             size="sm" 
             onClick={() => setUseAdvancedMode(false)}
             className={!useAdvancedMode ? 'bg-white shadow-sm' : 'text-gray-500 hover:text-gray-900'}
           >Simple</Button>
           <Button 
             type="button"
             variant={useAdvancedMode ? 'ghost' : 'ghost'} 
             size="sm" 
             onClick={() => setUseAdvancedMode(true)}
             className={useAdvancedMode ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-900'}
           >Advanced</Button>
        </div>
      </div>

      {useAdvancedMode ? (
        <AdvancedProductForm categories={categories} initialData={product} />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Simple Form Implementation */}
           <Card>
            <CardHeader><CardTitle>Basic Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Product Name *</Label>
                  <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                </div>
                <div className="space-y-2">
                  <Label>Category *</Label>
                  <select className="w-full h-10 px-3 border rounded-md" value={formData.categoryId} onChange={e => setFormData({...formData, categoryId: e.target.value})} required>
                     <option value="">Select Category</option>
                     {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                <AIProductAssist 
                  productName={formData.name}
                  category={categories.find(c => c.id === formData.categoryId)?.name}
                  onSuggestionAccept={(f, v) => {
                    if (f === 'description') setFormData(prev => ({ ...prev, description: v }))
                    if (f === 'tags' || f === 'keywords') setFormData(prev => ({ ...prev, metaKeywords: v }))
                    if (f === 'seoTitle' || f === 'metaTitle') setFormData(prev => ({ ...prev, metaTitle: v }))
                  }}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Pricing & Variants</CardTitle></CardHeader>
            <CardContent className="space-y-4">
               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                   <Label>Base Price</Label>
                   <Input type="number" value={formData.basePrice} onChange={e => setFormData({...formData, basePrice: e.target.value})} required />
                 </div>
                 <div className="space-y-2">
                   <Label>Sale Price</Label>
                   <Input type="number" value={formData.salePrice} onChange={e => setFormData({...formData, salePrice: e.target.value})} />
                 </div>
               </div>
               
               {/* Advanced Variant Manager */}
               <VariantManager 
                  variants={variants} 
                  onChange={setVariants} 
                  hasColor={true}
                  productName={formData.name}
               />
            </CardContent>
          </Card>

           <Card>
              <CardHeader><CardTitle>Images</CardTitle></CardHeader>
              <CardContent>
                 <div className="grid grid-cols-4 gap-4">
                    {images.map((img, i) => (
                       <div key={i} className="relative aspect-square border rounded overflow-hidden">
                          <Image src={img} alt="Product" fill className="object-cover" />
                          <button type="button" onClick={() => removeImage(i)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"><X className="w-3 h-3"/></button>
                       </div>
                    ))}
                    <label className="aspect-square border-2 border-dashed flex items-center justify-center cursor-pointer hover:bg-slate-50">
                       {uploading ? <Loader2 className="animate-spin"/> : <Upload/>}
                       <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} />
                    </label>
                 </div>
              </CardContent>
           </Card>

          <div className="flex gap-4">
            <Button type="submit" disabled={loading}>{loading ? 'Updating...' : 'Update Product'}</Button>
            <Link href="/admin/products"><Button variant="outline">Cancel</Button></Link>
          </div>
        </form>
      )}
    </div>
  )
}
