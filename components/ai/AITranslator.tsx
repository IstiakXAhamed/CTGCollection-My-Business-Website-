'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  Bot, Loader2, Languages, Copy, ArrowRightLeft
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface AITranslatorProps {
  initialText?: string
  onTranslated?: (translatedText: string) => void
}

export function AITranslator({ initialText = '', onTranslated }: AITranslatorProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [sourceText, setSourceText] = useState(initialText)
  const [translatedText, setTranslatedText] = useState('')
  const [targetLang, setTargetLang] = useState<'bn' | 'en'>('bn')

  const translate = async () => {
    if (!sourceText.trim()) {
      toast({ title: 'Error', description: 'Enter text to translate', variant: 'destructive' })
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'translate',
          text: sourceText,
          targetLang
        })
      })

      const data = await res.json()
      if (data.success) {
        setTranslatedText(data.result)
        onTranslated?.(data.result)
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Translation failed', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const swapLanguages = () => {
    setTargetLang(prev => prev === 'bn' ? 'en' : 'bn')
    const temp = sourceText
    setSourceText(translatedText)
    setTranslatedText(temp)
  }

  const copyTranslation = () => {
    navigator.clipboard.writeText(translatedText)
    toast({ title: 'Copied!' })
  }

  return (
    <div className="p-4 bg-gradient-to-br from-violet-50 to-purple-50 rounded-lg border border-violet-200 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-violet-600" />
          <span className="font-semibold text-violet-800">AI Translator</span>
        </div>
        <Badge variant="outline" className="text-xs">
          {targetLang === 'bn' ? 'EN → বাংলা' : 'বাংলা → EN'}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-600">Source Text</label>
          <Textarea
            placeholder="Enter text to translate..."
            value={sourceText}
            onChange={(e) => setSourceText(e.target.value)}
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-600">Translation</label>
          <div className="relative">
            <Textarea
              placeholder="Translation will appear here..."
              value={translatedText}
              readOnly
              rows={4}
              className="bg-white"
            />
            {translatedText && (
              <Button 
                size="sm" 
                variant="ghost" 
                className="absolute top-2 right-2 h-6 p-1"
                onClick={copyTranslation}
              >
                <Copy className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button onClick={translate} disabled={loading} className="gap-2 bg-violet-600 hover:bg-violet-700">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Languages className="w-4 h-4" />}
          Translate
        </Button>
        <Button variant="outline" onClick={swapLanguages} className="gap-2">
          <ArrowRightLeft className="w-4 h-4" />
          Swap
        </Button>
      </div>
    </div>
  )
}
