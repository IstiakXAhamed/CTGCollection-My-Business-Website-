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
import { useToast } from '@/components/ui/use-toast'
import AIProductAssist from '@/components/AIProductAssist'
import AdvancedProductForm from '@/components/admin/AdvancedProductForm'

// Original "Simple" Form Logic (Inline)
// ... (Keeping the original simple form mainly as fallback or for "simple" mode users)
// Ideally, we could refactor the "Simple" form into its own component too (`SimpleProductForm.tsx`),
// but for now I will keep it conditional within this file to minimize file creation if not requested.

type Variant = {
  size: string
  color: string
  stock: number
  sku: string
}

export default function NewProductPage() {
  const router = useRouter()
  const { toast } = useToast()
  
  // Settings State
  const [loadingSettings, setLoadingSettings] = useState(true)
  const [useAdvancedMode, setUseAdvancedMode] = useState(false)
  
  // Data State
  const [categories, setCategories] = useState<any[]>([])
  
  // Simple Form State
  const [loading, setLoading] = useState(false)
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
  const [uploading, setUploading] = useState(false)

  // Fetch Settings & Categories
  useEffect(() => {
    const init = async () => {
      try {
        const [catRes, setRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/settings')
        ])
        
        if (catRes.ok) {
          const data = await catRes.json()
          setCategories(data.categories || [])
        }
        
        if (setRes.ok) {
          const data = await setRes.json()
          setUseAdvancedMode(data.settings?.adminProductMode === 'advanced')
        }
      } catch (error) {
        console.error('Init error:', error)
      } finally {
        setLoadingSettings(false)
      }
    }
    init()
  }, [])

  // Auto-generate slug (Simple Form)
  useEffect(() => {
    if (formData.name) {
      const slug = formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      setFormData(prev => ({ ...prev, slug }))
    }
  }, [formData.name])


  // Handlers for Simple Form
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
        const res = await fetch('/api/upload', { method: 'POST', body: formData })
        if (res.ok) {
           const data = await res.json()
           if (data.success && data.url) newImages.push(data.url)
        }
      }
      setImages(prev => [...prev, ...newImages])
    } catch {
      toast({ title: 'Upload Failed', variant: 'destructive' })
    } finally {
      setUploading(false)
    }
  }

  const removeImage = (index: number) => setImages(prev => prev.filter((_, i) => i !== index))

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
        variants: variants.map(v => ({ ...v, stock: parseInt(v.stock.toString()) }))
      }
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (res.ok) {
        toast({ title: 'Success!', description: 'Product created successfully' })
        router.push('/admin/products')
      } else {
        throw new Error('Failed to create')
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to create product', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  if (loadingSettings) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin w-8 h-8 text-blue-600"/></div>
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
            <h1 className="text-3xl font-bold">Add New Product</h1>
            <p className="text-muted-foreground">
              {useAdvancedMode ? 'Advanced Mode: Specialized fields & AI tools.' : 'Simple Mode: Quick product addition.'}
            </p>
          </div>
        </div>
        
        {/* Quick Toggle for this session only */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
           <Button 
             variant={!useAdvancedMode ? 'white' : 'ghost'} 
             size="sm" 
             onClick={() => setUseAdvancedMode(false)}
             className={!useAdvancedMode ? 'bg-white shadow-sm' : ''}
           >Simple</Button>
           <Button 
             variant={useAdvancedMode ? 'white' : 'ghost'} 
             size="sm" 
             onClick={() => setUseAdvancedMode(true)}
             className={useAdvancedMode ? 'bg-white shadow-sm text-blue-600' : ''}
           >Advanced</Button>
        </div>
      </div>

      {useAdvancedMode ? (
        <AdvancedProductForm categories={categories} />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
           {/* SIMPLE FORM CONTENT */}
           <Card>
              <CardHeader><CardTitle>Basic Information</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="space-y-2">
                     <Label>Product Name *</Label>
                     <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                   </div>
                   <div className="space-y-2">
                     <Label>Category *</Label>
                     <select className="w-full h-10 px-3 border rounded-md" required value={formData.categoryId} onChange={e => setFormData({...formData, categoryId: e.target.value})}>
                        <option value="">Select Category</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                     </select>
                   </div>
                 </div>
                 <div className="space-y-2">
                   <Label>Description</Label>
                   <Textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                   <AIProductAssist 
                      productName={formData.name} 
                      category={categories.find(c => c.id === formData.categoryId)?.name} 
                      onSuggestionAccept={(f, v) => f === 'description' && setFormData(p => ({...p, description: v}))}
                    />
                 </div>
              </CardContent>
           </Card>

           <Card>
             <CardHeader><CardTitle>Pricing</CardTitle></CardHeader>
             <CardContent className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Base Price *</Label>
                  <Input type="number" required value={formData.basePrice} onChange={e => setFormData({...formData, basePrice: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Sale Price</Label>
                  <Input type="number" value={formData.salePrice} onChange={e => setFormData({...formData, salePrice: e.target.value})} />
                </div>
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
             <Button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create Product'}</Button>
             <Link href="/admin/products"><Button variant="outline">Cancel</Button></Link>
           </div>
        </form>
      )}
    </div>
  )
}
