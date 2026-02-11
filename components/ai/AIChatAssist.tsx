'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  Bot, Loader2, Send, MessageSquare, Sparkles, 
  ThumbsUp, ThumbsDown, Copy, CheckCircle, AlertTriangle
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface AIChatAssistProps {
  customerMessage: string
  context?: {
    orderStatus?: string
    customerName?: string
  }
  onSelectResponse?: (response: string) => void
}

export function AIChatAssist({ customerMessage, context, onSelectResponse }: AIChatAssistProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [copied, setCopied] = useState(false)

  const generateResponse = async () => {
    if (!customerMessage.trim()) {
      toast({ title: 'Error', description: 'Customer message is empty', variant: 'destructive' })
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'chat_response',
          message: customerMessage,
          context
        })
      })

      const data = await res.json()
      if (data.success) {
        setResponse(data.result)
      } else {
        toast({ title: 'AI Error', description: data.error, variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to generate response', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const getQuickReplies = async () => {
    if (!customerMessage.trim()) return

    setLoading(true)
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'chat_suggestions',
          message: customerMessage
        })
      })

      const data = await res.json()
      if (data.success && Array.isArray(data.result)) {
        setSuggestions(data.result)
      }
    } catch (error) {
      console.error('Failed to get suggestions:', error)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast({ title: 'Copied!', description: 'Response copied to clipboard' })
  }

  const applyResponse = (text: string) => {
    onSelectResponse?.(text)
    toast({ title: 'Applied!', description: 'Response added to message' })
  }

  return (
    <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-blue-600" />
          <span className="font-semibold text-blue-800">AI Chat Assistant</span>
        </div>
        <Badge variant="outline" className="text-xs">Gemini AI</Badge>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button 
          size="sm" 
          onClick={generateResponse} 
          disabled={loading}
          className="gap-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          Generate Response
        </Button>
        <Button 
          size="sm" 
          variant="outline"
          onClick={getQuickReplies} 
          disabled={loading}
          className="gap-2"
        >
          <MessageSquare className="w-4 h-4" />
          Quick Replies
        </Button>
      </div>

      {/* AI Generated Response */}
      {response && (
        <div className="p-3 bg-white rounded-lg border space-y-2">
          <p className="text-sm text-gray-700">{response}</p>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => copyToClipboard(response)} className="gap-1">
              {copied ? <CheckCircle className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              Copy
            </Button>
            <Button size="sm" onClick={() => applyResponse(response)} className="gap-1">
              <Send className="w-3 h-3" />
              Use
            </Button>
          </div>
        </div>
      )}

      {/* Quick Reply Suggestions */}
      {suggestions.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-600">Quick Replies:</p>
          <div className="space-y-1">
            {suggestions.map((suggestion, i) => (
              <button
                key={i}
                onClick={() => applyResponse(suggestion)}
                className="w-full text-left p-2 text-sm bg-white rounded border hover:bg-blue-50 hover:border-blue-300 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
