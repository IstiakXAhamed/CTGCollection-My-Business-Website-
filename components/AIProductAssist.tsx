'use client'

import { useState } from 'react'
import { Sparkles, Loader2, Wand2, Tag, FileText, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'

interface AIProductAssistProps {
  productName: string
  category?: string
  onSuggestionAccept: (field: string, value: string) => void
}

export default function AIProductAssist({ productName, category, onSuggestionAccept }: AIProductAssistProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const [suggestions, setSuggestions] = useState<Record<string, string>>({})
  const [showSuggestion, setShowSuggestion] = useState<string | null>(null)

  const generateDescription = async () => {
    if (!productName) return alert('Enter product name first')
    setLoading('description')
    try {
      const res = await fetch('/api/ai/product-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action: 'description', productName, category })
      })
      if (res.ok) {
        const data = await res.json()
        setSuggestions(prev => ({ ...prev, description: data.suggestion }))
        setShowSuggestion('description')
      } else {
        alert('AI generation failed. Check API key.')
      }
    } catch (err) {
      alert('Failed to generate description')
    } finally {
      setLoading(null)
    }
  }

  const generateTags = async () => {
    if (!productName) return alert('Enter product name first')
    setLoading('tags')
    try {
      const res = await fetch('/api/ai/product-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action: 'tags', productName, category })
      })
      if (res.ok) {
        const data = await res.json()
        setSuggestions(prev => ({ ...prev, tags: data.suggestion }))
        setShowSuggestion('tags')
      }
    } catch (err) {
      alert('Failed to generate tags')
    } finally {
      setLoading(null)
    }
  }

  const generateSEO = async () => {
    if (!productName) return alert('Enter product name first')
    setLoading('seo')
    try {
      const res = await fetch('/api/ai/product-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action: 'seo', productName, category })
      })
      if (res.ok) {
        const data = await res.json()
        setSuggestions(prev => ({ ...prev, seo: data.suggestion }))
        setShowSuggestion('seo')
      }
    } catch (err) {
      alert('Failed to generate SEO')
    } finally {
      setLoading(null)
    }
  }

  const acceptSuggestion = (field: string) => {
    if (suggestions[field]) {
      onSuggestionAccept(field, suggestions[field])
      setShowSuggestion(null)
    }
  }

  return (
    <div className="border rounded-xl p-4 bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-purple-600" />
        <h3 className="font-bold text-purple-800">AI Product Assistant</h3>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button 
          size="sm" 
          variant="outline"
          onClick={generateDescription}
          disabled={loading === 'description'}
          className="gap-2"
        >
          {loading === 'description' ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
          Generate Description
        </Button>

        <Button 
          size="sm" 
          variant="outline"
          onClick={generateTags}
          disabled={loading === 'tags'}
          className="gap-2"
        >
          {loading === 'tags' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Tag className="w-4 h-4" />}
          Suggest Tags
        </Button>

        <Button 
          size="sm" 
          variant="outline"
          onClick={generateSEO}
          disabled={loading === 'seo'}
          className="gap-2"
        >
          {loading === 'seo' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
          SEO Title
        </Button>
      </div>

      <AnimatePresence>
        {showSuggestion && suggestions[showSuggestion] && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 p-3 bg-white rounded-lg border overflow-hidden"
          >
            <p className="text-sm font-semibold text-purple-600 mb-2 capitalize">{showSuggestion} Suggestion:</p>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{suggestions[showSuggestion]}</p>
            <div className="flex gap-2 mt-3">
              <Button size="sm" onClick={() => acceptSuggestion(showSuggestion)} className="gap-2">
                <CheckCircle className="w-4 h-4" />
                Accept
              </Button>
              <Button size="sm" variant="outline" onClick={() => setShowSuggestion(null)}>
                Dismiss
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
