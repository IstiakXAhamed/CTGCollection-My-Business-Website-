'use client'

import { useState } from 'react'
import { 
  Megaphone, Loader2, Facebook, Instagram, Mail, MessageSquare, 
  Smartphone, Copy, CheckCircle, Globe, Sparkles, RefreshCw
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { motion, AnimatePresence } from 'framer-motion'

type ContentType = 'facebook_post' | 'instagram_caption' | 'email_campaign' | 'ad_copy' | 'sms'
type AILanguage = 'en' | 'bn'

const CONTENT_TYPES = [
  { id: 'facebook_post' as ContentType, name: 'Facebook Post', icon: Facebook, color: 'blue' },
  { id: 'instagram_caption' as ContentType, name: 'Instagram Caption', icon: Instagram, color: 'pink' },
  { id: 'email_campaign' as ContentType, name: 'Email Campaign', icon: Mail, color: 'green' },
  { id: 'ad_copy' as ContentType, name: 'Ad Copy', icon: Megaphone, color: 'orange' },
  { id: 'sms' as ContentType, name: 'SMS Promo', icon: Smartphone, color: 'purple' },
]

export default function MarketingAIPage() {
  const [loading, setLoading] = useState(false)
  const [selectedType, setSelectedType] = useState<ContentType>('facebook_post')
  const [language, setLanguage] = useState<AILanguage>('en')
  const [topic, setTopic] = useState('')
  const [generatedContent, setGeneratedContent] = useState<any>(null)
  const [copied, setCopied] = useState(false)

  const generateContent = async () => {
    if (!topic.trim()) {
      alert('Please enter a topic or product name')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/ai/marketing-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: selectedType,
          topic,
          language,
          includeEmoji: true
        })
      })

      if (res.ok) {
        const data = await res.json()
        setGeneratedContent(data.content)
      } else {
        alert('Failed to generate content. Check your API key.')
      }
    } catch (error) {
      alert('Error connecting to AI service')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const renderContent = () => {
    if (!generatedContent) return null

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        {/* Different layouts based on content type */}
        {selectedType === 'email_campaign' ? (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <Label className="text-xs text-blue-600 font-medium">Subject Line</Label>
              <div className="flex items-center justify-between mt-1">
                <p className="font-medium">{generatedContent.subject}</p>
                <Button size="sm" variant="ghost" onClick={() => copyToClipboard(generatedContent.subject)}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
            {generatedContent.preheader && (
              <div className="p-4 bg-gray-50 rounded-lg border">
                <Label className="text-xs text-gray-600 font-medium">Preheader</Label>
                <p className="text-sm mt-1">{generatedContent.preheader}</p>
              </div>
            )}
            <div className="p-4 bg-white rounded-lg border">
              <Label className="text-xs text-gray-600 font-medium">Email Body</Label>
              <div className="mt-2 whitespace-pre-wrap">{generatedContent.body}</div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <Label className="text-xs text-green-600 font-medium">Call to Action</Label>
              <p className="font-semibold mt-1">{generatedContent.cta}</p>
            </div>
          </div>
        ) : selectedType === 'ad_copy' ? (
          <div className="space-y-4">
            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
              <Label className="text-xs text-orange-600 font-medium">Ad Headline</Label>
              <p className="text-xl font-bold mt-1">{generatedContent.headline}</p>
            </div>
            <div className="p-4 bg-white rounded-lg border">
              <Label className="text-xs text-gray-600 font-medium">Ad Description</Label>
              <p className="mt-1">{generatedContent.description}</p>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-white rounded-lg border">
            <div className="flex items-center justify-between mb-2">
              <Badge>{selectedType === 'sms' ? `${(generatedContent.text || generatedContent.content || '').length}/160 chars` : 'Generated'}</Badge>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => copyToClipboard(generatedContent.text || generatedContent.content || generatedContent.hook + '\n\n' + generatedContent.body)}
              >
                {copied ? <CheckCircle className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy'}
              </Button>
            </div>
            <div className="whitespace-pre-wrap">
              {generatedContent.hook && <p className="font-semibold mb-2">{generatedContent.hook}</p>}
              {generatedContent.body || generatedContent.text || generatedContent.content}
            </div>
            {generatedContent.hashtags && (
              <div className="mt-4 pt-4 border-t">
                <Label className="text-xs text-gray-500">Hashtags</Label>
                <p className="text-blue-600 mt-1">{generatedContent.hashtags}</p>
              </div>
            )}
            {generatedContent.cta && (
              <div className="mt-4 p-2 bg-green-50 rounded-lg text-center">
                <span className="font-semibold text-green-700">{generatedContent.cta}</span>
              </div>
            )}
          </div>
        )}
      </motion.div>
    )
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-pink-500">
          <Megaphone className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Marketing AI Command Center</h1>
          <p className="text-gray-500">Generate Facebook posts, emails, ads & more with AI</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              Generate Content
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Content Type Selector */}
            <div className="space-y-2">
              <Label>Content Type</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {CONTENT_TYPES.map(type => {
                  const Icon = type.icon
                  const isSelected = selectedType === type.id
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setSelectedType(type.id)}
                      className={`p-3 rounded-lg border-2 transition-all text-left ${
                        isSelected 
                          ? `border-${type.color}-500 bg-${type.color}-50`
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Icon className={`w-5 h-5 mb-1 ${isSelected ? `text-${type.color}-600` : 'text-gray-400'}`} />
                      <p className="text-xs font-medium">{type.name}</p>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Language Toggle */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Language
              </Label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all ${
                    language === 'en' ? 'border-purple-500 bg-purple-50' : 'border-gray-200'
                  }`}
                >
                  🇺🇸 English
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('bn')}
                  className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all ${
                    language === 'bn' ? 'border-purple-500 bg-purple-50' : 'border-gray-200'
                  }`}
                >
                  🇧🇩 বাংলা
                </button>
              </div>
            </div>

            {/* Topic Input */}
            <div className="space-y-2">
              <Label>Topic / Product / Campaign</Label>
              <Textarea
                placeholder="e.g., Summer Sale - 50% off all t-shirts, New iPhone 15 arrival, Eid Special Collection..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                rows={3}
              />
            </div>

            {/* Generate Button */}
            <Button 
              className="w-full gap-2" 
              size="lg"
              onClick={generateContent}
              disabled={loading || !topic.trim()}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate {CONTENT_TYPES.find(t => t.id === selectedType)?.name}
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Right: Output */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Generated Content</span>
              {generatedContent && (
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => generateContent()}
                  disabled={loading}
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!generatedContent ? (
              <div className="text-center py-12 text-gray-400">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Generated content will appear here</p>
                <p className="text-sm">Select type, enter topic, and generate!</p>
              </div>
            ) : (
              renderContent()
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
