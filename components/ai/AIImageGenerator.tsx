'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Bot, Loader2, Sparkles, ImageIcon, Download, Check, Search, X
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import Image from 'next/image'

interface AIImageGeneratorProps {
  productName: string
  onImageSelect?: (imageUrl: string) => void
}

export function AIImageGenerator({ productName, onImageSelect }: AIImageGeneratorProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [images, setImages] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState(productName)
  const [selectedImages, setSelectedImages] = useState<Set<number>>(new Set())

  const searchImages = async () => {
    if (!searchQuery.trim()) {
      toast({ title: 'Error', description: 'Enter a search term', variant: 'destructive' })
      return
    }

    setLoading(true)
    setImages([])
    setSelectedImages(new Set())

    try {
      const res = await fetch('/api/ai/image-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery })
      })

      const data = await res.json()
      if (data.success && data.images) {
        setImages(data.images)
      } else {
        toast({ title: 'No images found', description: 'Try a different search term' })
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to search images', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const selectImage = async (index: number) => {
    const imageUrl = images[index]
    
    // Convert to base64 for upload
    try {
      const res = await fetch('/api/ai/image-download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: imageUrl })
      })

      const data = await res.json()
      if (data.success && data.base64) {
        onImageSelect?.(data.base64)
        setSelectedImages(prev => new Set(Array.from(prev).concat(index)))
        toast({ title: 'Image added!', description: 'Image has been added to product' })
      }
    } catch (error) {
      // Fallback: use URL directly
      onImageSelect?.(imageUrl)
      setSelectedImages(prev => new Set(Array.from(prev).concat(index)))
      toast({ title: 'Image added!', description: 'Image URL added to product' })
    }
  }

  return (
    <div className="p-4 bg-gradient-to-br from-rose-50 to-orange-50 rounded-lg border border-rose-200 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-rose-600" />
          <span className="font-semibold text-rose-800">AI Image Finder</span>
        </div>
        <Badge variant="outline" className="text-xs">Free Stock Images</Badge>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <Input
          placeholder="Search product images..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && searchImages()}
          className="flex-1"
        />
        <Button 
          onClick={searchImages} 
          disabled={loading} 
          className="gap-2 bg-rose-600 hover:bg-rose-700"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          Find Images
        </Button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-rose-600" />
          <span className="ml-2 text-gray-600">Searching images...</span>
        </div>
      )}

      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {images.map((img, i) => (
            <div 
              key={i} 
              className={`relative aspect-square rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${
                selectedImages.has(i) 
                  ? 'border-green-500 ring-2 ring-green-200' 
                  : 'border-gray-200 hover:border-rose-400'
              }`}
              onClick={() => selectImage(i)}
            >
              <img 
                src={img} 
                alt={`Product image ${i + 1}`}
                className="w-full h-full object-cover"
              />
              {selectedImages.has(i) && (
                <div className="absolute inset-0 bg-green-500/30 flex items-center justify-center">
                  <Check className="w-8 h-8 text-white" />
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-1">
                <button 
                  className="w-full text-xs text-white flex items-center justify-center gap-1 hover:text-rose-300"
                  onClick={(e) => { e.stopPropagation(); selectImage(i) }}
                >
                  <Download className="w-3 h-3" />
                  Use Image
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {images.length === 0 && !loading && (
        <div className="text-center py-6 text-gray-500">
          <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Enter product name and click "Find Images" to search</p>
          <p className="text-xs mt-1">Images from Unsplash, Pexels & Pixabay (free to use)</p>
        </div>
      )}
    </div>
  )
}
