'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Bot, Loader2, Sparkles, Search, Globe, Copy, CheckCircle, Tag
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface AISEOGeneratorProps {
  onSEOGenerated?: (seo: SEOResult) => void
}

interface SEOResult {
  metaTitle: string
  metaDescription: string
  h1: string
  keywords: string[]
}

export function AISEOGenerator({ onSEOGenerated }: AISEOGeneratorProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [pageName, setPageName] = useState('')
  const [pageType, setPageType] = useState<string>('page')
  const [seo, setSeo] = useState<SEOResult | null>(null)

  const generateSEO = async () => {
    if (!pageName.trim()) {
      toast({ title: 'Error', description: 'Enter page name first', variant: 'destructive' })
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'seo_content',
          pageName,
          pageType
        })
      })

      const data = await res.json()
      if (data.success) {
        setSeo(data.result)
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to generate SEO', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const useSEO = () => {
    if (seo) {
      onSEOGenerated?.(seo)
      toast({ title: 'Applied!', description: 'SEO content added' })
    }
  }

  const copyField = (field: string, value: string) => {
    navigator.clipboard.writeText(value)
    toast({ title: 'Copied!', description: `${field} copied` })
  }

  return (
    <div className="p-4 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-lg border border-cyan-200 space-y-3">
      <div className="flex items-center gap-2">
        <Bot className="w-5 h-5 text-cyan-600" />
        <span className="font-semibold text-cyan-800">AI SEO Generator</span>
        <Badge variant="outline" className="text-xs">Gemini</Badge>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <Input
          placeholder="Page/Category name (e.g., Men's T-Shirts, Electronics)"
          value={pageName}
          onChange={(e) => setPageName(e.target.value)}
          className="flex-1"
        />
        <Select value={pageType} onValueChange={setPageType}>
          <SelectTrigger className="w-full sm:w-32">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="category">Category</SelectItem>
            <SelectItem value="product">Product</SelectItem>
            <SelectItem value="blog">Blog</SelectItem>
            <SelectItem value="page">Page</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={generateSEO} disabled={loading} className="gap-2 bg-cyan-600 hover:bg-cyan-700">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          Generate SEO
        </Button>
      </div>

      {seo && (
        <div className="p-4 bg-white rounded-lg border space-y-4">
          <div className="space-y-3">
            <div className="p-2 bg-gray-50 rounded">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-gray-500">Meta Title ({seo.metaTitle?.length || 0}/60)</span>
                <Button size="sm" variant="ghost" className="h-6 p-1" onClick={() => copyField('Meta Title', seo.metaTitle)}>
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
              <p className="text-sm font-medium text-blue-600">{seo.metaTitle}</p>
            </div>

            <div className="p-2 bg-gray-50 rounded">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-gray-500">Meta Description ({seo.metaDescription?.length || 0}/160)</span>
                <Button size="sm" variant="ghost" className="h-6 p-1" onClick={() => copyField('Meta Description', seo.metaDescription)}>
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
              <p className="text-sm text-gray-600">{seo.metaDescription}</p>
            </div>

            <div className="p-2 bg-gray-50 rounded">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-gray-500">H1 Heading</span>
                <Button size="sm" variant="ghost" className="h-6 p-1" onClick={() => copyField('H1', seo.h1)}>
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
              <p className="text-sm font-semibold text-gray-800">{seo.h1}</p>
            </div>

            {seo.keywords?.length > 0 && (
              <div>
                <span className="text-xs font-medium text-gray-500 flex items-center gap-1 mb-2">
                  <Tag className="w-3 h-3" />
                  Keywords:
                </span>
                <div className="flex flex-wrap gap-1">
                  {seo.keywords.map((kw, i) => (
                    <Badge key={i} variant="outline" className="text-xs">{kw}</Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Button size="sm" onClick={useSEO} className="w-full gap-1">
            <Globe className="w-3 h-3" />
            Apply SEO Content
          </Button>
        </div>
      )}
    </div>
  )
}
