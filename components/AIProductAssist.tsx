'use client'

import { useState } from 'react'
import { Sparkles, Loader2, Wand2, Tag, FileText, CheckCircle, Zap, Brain, TrendingUp, Palette, Ruler, Globe, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { motion, AnimatePresence } from 'framer-motion'

// Types for advanced AI features
type AITone = 'professional' | 'luxury' | 'friendly' | 'urgent' | 'casual'
type AILanguage = 'en' | 'bn'

interface AIProductAssistProps {
  productName: string
  category?: string
  currentDescription?: string // For magic rewrite
  onSuggestionAccept: (field: string, value: any) => void
  onAnalysisResult?: (analysis: any) => void
}

interface AnalysisResult {
  productType?: string
  suggestedCategory?: string
  priceRange?: { min: number; max: number }
  suggestedVariants?: { sizes: string[]; colors: string[] }
  keywords?: string[]
  confidence?: string
}

const TONE_OPTIONS: { value: AITone; label: string; emoji: string }[] = [
  { value: 'professional', label: 'Professional', emoji: '💼' },
  { value: 'luxury', label: 'Luxury', emoji: '✨' },
  { value: 'friendly', label: 'Friendly', emoji: '😊' },
  { value: 'urgent', label: 'Urgent', emoji: '🔥' },
  { value: 'casual', label: 'Casual', emoji: '👋' },
]

export default function AIProductAssist({ productName, category, currentDescription, onSuggestionAccept, onAnalysisResult }: AIProductAssistProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const [suggestions, setSuggestions] = useState<Record<string, any>>({})
  const [showSuggestion, setShowSuggestion] = useState<string | null>(null)
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [isFallback, setIsFallback] = useState(false)
  
  // NEW: Tone and Language state
  const [selectedTone, setSelectedTone] = useState<AITone>('professional')
  const [selectedLanguage, setSelectedLanguage] = useState<AILanguage>('en')

  const callAI = async (action: string, extraParams?: Record<string, any>) => {
    if (!productName) {
      alert('Enter product name first')
      return null
    }
    
    setLoading(action)
    try {
      const res = await fetch('/api/ai/product-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          action, 
          productName, 
          category,
          tone: selectedTone,
          language: selectedLanguage,
          ...extraParams
        })
      })
      
      if (res.ok) {
        const data = await res.json()
        setIsFallback(data.fallback || false)
        return data
      } else {
        alert('AI generation failed. Check API key.')
        return null
      }
    } catch (err) {
      alert('Failed to connect to AI service')
      return null
    } finally {
      setLoading(null)
    }
  }

  const generateDescription = async () => {
    const data = await callAI('description')
    if (data?.suggestion) {
      setSuggestions(prev => ({ ...prev, description: data.suggestion }))
      setShowSuggestion('description')
    }
  }

  const generateTags = async () => {
    const data = await callAI('tags')
    if (data?.suggestion) {
      setSuggestions(prev => ({ ...prev, tags: data.suggestion }))
      setShowSuggestion('tags')
    }
  }

  const generateSEO = async () => {
    const data = await callAI('seo')
    if (data?.suggestion) {
      setSuggestions(prev => ({ ...prev, seo: data.suggestion }))
      setShowSuggestion('seo')
    }
  }

  const smartAnalyze = async () => {
    const data = await callAI('analyze')
    if (data) {
      setAnalysis({
        productType: data.productType,
        suggestedCategory: data.suggestedCategory,
        priceRange: data.priceRange,
        suggestedVariants: data.suggestedVariants,
        keywords: data.keywords,
        confidence: data.confidence
      })
      onAnalysisResult?.(data)
    }
  }

  const autoFillAll = async () => {
    const data = await callAI('complete')
    if (data) {
      // Apply all suggestions at once
      if (data.description) onSuggestionAccept('description', data.description)
      if (data.category) onSuggestionAccept('category', data.category)
      if (data.suggestedPrice) onSuggestionAccept('basePrice', data.suggestedPrice)
      if (data.salePrice) onSuggestionAccept('salePrice', data.salePrice)
      if (data.tags) onSuggestionAccept('tags', data.tags)
      if (data.seoTitle) onSuggestionAccept('seoTitle', data.seoTitle)
      if (data.variants) onSuggestionAccept('variants', data.variants)
      if (data.isFeatured !== undefined) onSuggestionAccept('isFeatured', data.isFeatured)
      
      setSuggestions({ complete: 'All fields populated by AI!' })
      setShowSuggestion('complete')
    }
  }

  const acceptSuggestion = (field: string) => {
    if (suggestions[field]) {
      onSuggestionAccept(field, suggestions[field])
      setShowSuggestion(null)
    }
  }

  const acceptAnalysisSuggestion = (field: string, value: any) => {
    onSuggestionAccept(field, value)
  }

  return (
    <div className="border rounded-xl p-4 bg-gradient-to-br from-purple-50 to-blue-50 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          <h3 className="font-bold text-purple-800">AI Product Assistant</h3>
        </div>
        <div className="flex items-center gap-2">
          {isFallback && (
            <Badge variant="outline" className="text-amber-600 border-amber-300">
              Fallback
            </Badge>
          )}
        </div>
      </div>

      {/* Language & Tone Selector */}
      <div className="flex flex-wrap items-center gap-3 p-3 bg-white/60 rounded-lg border border-purple-100">
        {/* Language Toggle */}
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-gray-500" />
          <div className="flex rounded-lg overflow-hidden border">
            <button
              type="button"
              onClick={() => setSelectedLanguage('en')}
              className={`px-3 py-1 text-xs font-medium transition-all ${
                selectedLanguage === 'en' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              🇺🇸 English
            </button>
            <button
              type="button"
              onClick={() => setSelectedLanguage('bn')}
              className={`px-3 py-1 text-xs font-medium transition-all ${
                selectedLanguage === 'bn' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              🇧🇩 বাংলা
            </button>
          </div>
        </div>

        {/* Tone Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Tone:</span>
          <div className="flex gap-1">
            {TONE_OPTIONS.map(tone => (
              <button
                key={tone.value}
                type="button"
                onClick={() => setSelectedTone(tone.value)}
                className={`px-2 py-1 text-xs rounded-md transition-all ${
                  selectedTone === tone.value
                    ? 'bg-purple-600 text-white'
                    : 'bg-white text-gray-600 border hover:bg-gray-50'
                }`}
                title={tone.label}
              >
                {tone.emoji}
              </button>
            ))}
          </div>
          <span className="text-xs text-purple-600 font-medium">{TONE_OPTIONS.find(t => t.value === selectedTone)?.label}</span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2">
        <Button 
          type="button"
          size="sm" 
          variant="outline"
          onClick={generateDescription}
          disabled={!!loading}
          className="gap-2"
        >
          {loading === 'description' ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
          Generate Description
        </Button>

        <Button 
          type="button"
          size="sm" 
          variant="outline"
          onClick={generateTags}
          disabled={!!loading}
          className="gap-2"
        >
          {loading === 'tags' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Tag className="w-4 h-4" />}
          Suggest Tags
        </Button>

        <Button 
          type="button"
          size="sm" 
          variant="outline"
          onClick={generateSEO}
          disabled={!!loading}
          className="gap-2"
        >
          {loading === 'seo' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
          SEO Title
        </Button>
      </div>

      {/* Smart Actions */}
      <div className="flex flex-wrap gap-2 pt-2 border-t border-purple-200">
        <Button 
          type="button"
          size="sm" 
          onClick={smartAnalyze}
          disabled={!!loading}
          className="gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
        >
          {loading === 'analyze' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
          Smart Analyze
        </Button>

        <Button 
          type="button"
          size="sm" 
          onClick={autoFillAll}
          disabled={!!loading}
          className="gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
        >
          {loading === 'complete' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
          Auto-Fill All Fields
        </Button>
      </div>

      {/* Analysis Results */}
      <AnimatePresence>
        {analysis && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 bg-white rounded-lg border border-purple-200 space-y-3"
          >
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-purple-700 flex items-center gap-2">
                <Brain className="w-4 h-4" />
                AI Analysis Results
              </h4>
              <Badge className={
                analysis.confidence === 'high' ? 'bg-green-100 text-green-700' :
                analysis.confidence === 'medium' ? 'bg-amber-100 text-amber-700' :
                'bg-gray-100 text-gray-700'
              }>
                {analysis.confidence} confidence
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              {analysis.productType && (
                <div className="p-2 bg-blue-50 rounded-lg">
                  <span className="text-blue-600 font-medium">Product Type:</span>
                  <p className="text-blue-800">{analysis.productType}</p>
                </div>
              )}

              {analysis.suggestedCategory && (
                <div className="p-2 bg-green-50 rounded-lg cursor-pointer hover:bg-green-100" 
                     onClick={() => acceptAnalysisSuggestion('category', analysis.suggestedCategory)}>
                  <span className="text-green-600 font-medium">Suggested Category:</span>
                  <p className="text-green-800 flex items-center gap-1">
                    {analysis.suggestedCategory}
                    <CheckCircle className="w-3 h-3 text-green-500" />
                  </p>
                </div>
              )}

              {analysis.priceRange && (
                <div className="p-2 bg-amber-50 rounded-lg">
                  <span className="text-amber-600 font-medium flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    Price Range:
                  </span>
                  <p className="text-amber-800">৳{analysis.priceRange.min.toLocaleString()} - ৳{analysis.priceRange.max.toLocaleString()}</p>
                </div>
              )}

              {analysis.suggestedVariants?.sizes && analysis.suggestedVariants.sizes.length > 0 && (
                <div className="p-2 bg-purple-50 rounded-lg">
                  <span className="text-purple-600 font-medium flex items-center gap-1">
                    <Ruler className="w-3 h-3" />
                    Sizes:
                  </span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {analysis.suggestedVariants.sizes.map(size => (
                      <Badge key={size} variant="outline" className="text-xs">{size}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {analysis.suggestedVariants?.colors && analysis.suggestedVariants.colors.length > 0 && (
                <div className="p-2 bg-pink-50 rounded-lg sm:col-span-2">
                  <span className="text-pink-600 font-medium flex items-center gap-1">
                    <Palette className="w-3 h-3" />
                    Colors:
                  </span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {analysis.suggestedVariants.colors.map(color => (
                      <Badge key={color} variant="outline" className="text-xs">{color}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {analysis.keywords && analysis.keywords.length > 0 && (
                <div className="p-2 bg-indigo-50 rounded-lg sm:col-span-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-indigo-600 font-medium flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      Keywords / Tags:
                    </span>
                    <Button 
                      type="button"
                      size="sm" 
                      variant="ghost" 
                      onClick={() => acceptAnalysisSuggestion('tags', analysis.keywords?.join(', '))}
                      className="h-5 text-[10px] px-2 text-indigo-700 hover:bg-indigo-200"
                    >
                      Use All
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {analysis.keywords.map(keyword => (
                      <Badge key={keyword} variant="outline" className="text-xs bg-white text-indigo-700 border-indigo-200">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Button 
              type="button"
              size="sm" 
              variant="outline" 
              onClick={() => setAnalysis(null)}
              className="w-full"
            >
              Dismiss
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Suggestion Display */}
      <AnimatePresence>
        {showSuggestion && suggestions[showSuggestion] && showSuggestion !== 'complete' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-3 bg-white rounded-lg border overflow-hidden"
          >
            <p className="text-sm font-semibold text-purple-600 mb-2 capitalize">{showSuggestion} Suggestion:</p>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{suggestions[showSuggestion]}</p>
            <div className="flex gap-2 mt-3">
              <Button type="button" size="sm" onClick={() => acceptSuggestion(showSuggestion)} className="gap-2">
                <CheckCircle className="w-4 h-4" />
                Accept
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={() => setShowSuggestion(null)}>
                Dismiss
              </Button>
            </div>
          </motion.div>
        )}
        
        {showSuggestion === 'complete' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-3 bg-green-50 rounded-lg border border-green-200"
          >
            <p className="text-green-700 font-medium flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              All fields have been populated by AI! Review and adjust as needed.
            </p>
            <Button type="button" size="sm" variant="outline" onClick={() => setShowSuggestion(null)} className="mt-2">
              Got it
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
