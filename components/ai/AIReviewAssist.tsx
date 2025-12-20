'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Bot, Loader2, MessageSquare, Sparkles, Shield,
  CheckCircle, XCircle, AlertTriangle, ThumbsUp, ThumbsDown
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface AIReviewAssistProps {
  reviewText: string
  rating: number
  productName: string
  onResponseGenerated?: (response: string) => void
}

interface ReviewAnalysis {
  sentiment: 'positive' | 'negative' | 'neutral'
  isSpam: boolean
  isInappropriate: boolean
  keyPoints: string[]
  suggestedResponse: string
  qualityScore: number
}

export function AIReviewAssist({ reviewText, rating, productName, onResponseGenerated }: AIReviewAssistProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState<string | null>(null)
  const [analysis, setAnalysis] = useState<ReviewAnalysis | null>(null)
  const [response, setResponse] = useState('')

  const analyzeReview = async () => {
    if (!reviewText.trim()) {
      toast({ title: 'Error', description: 'Review text is empty', variant: 'destructive' })
      return
    }

    setLoading('analyze')
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'review_analyze',
          reviewText,
          rating
        })
      })

      const data = await res.json()
      if (data.success) {
        setAnalysis(data.result)
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Analysis failed', variant: 'destructive' })
    } finally {
      setLoading(null)
    }
  }

  const generateResponse = async () => {
    setLoading('response')
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'review_response',
          reviewText,
          rating,
          productName
        })
      })

      const data = await res.json()
      if (data.success) {
        setResponse(data.result)
        onResponseGenerated?.(data.result)
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to generate response', variant: 'destructive' })
    } finally {
      setLoading(null)
    }
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'bg-green-100 text-green-700'
      case 'negative': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return <ThumbsUp className="w-3 h-3" />
      case 'negative': return <ThumbsDown className="w-3 h-3" />
      default: return <MessageSquare className="w-3 h-3" />
    }
  }

  return (
    <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-purple-600" />
          <span className="font-semibold text-purple-800">AI Review Assistant</span>
        </div>
        <Badge variant="outline" className="text-xs">Auto-Moderation</Badge>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button 
          size="sm" 
          onClick={analyzeReview} 
          disabled={!!loading}
          className="gap-2"
        >
          {loading === 'analyze' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
          Analyze Review
        </Button>
        <Button 
          size="sm" 
          variant="outline"
          onClick={generateResponse} 
          disabled={!!loading}
          className="gap-2"
        >
          {loading === 'response' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          Generate Response
        </Button>
      </div>

      {/* Analysis Results */}
      {analysis && (
        <div className="p-3 bg-white rounded-lg border space-y-3">
          <div className="flex flex-wrap gap-2">
            <Badge className={getSentimentColor(analysis.sentiment)}>
              {getSentimentIcon(analysis.sentiment)}
              <span className="ml-1 capitalize">{analysis.sentiment}</span>
            </Badge>
            
            {analysis.isSpam && (
              <Badge className="bg-red-100 text-red-700">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Spam Detected
              </Badge>
            )}
            
            {analysis.isInappropriate && (
              <Badge className="bg-amber-100 text-amber-700">
                <XCircle className="w-3 h-3 mr-1" />
                Inappropriate
              </Badge>
            )}
            
            <Badge className="bg-blue-100 text-blue-700">
              Quality: {analysis.qualityScore}/10
            </Badge>
          </div>

          {analysis.keyPoints?.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-600 mb-1">Key Points:</p>
              <ul className="text-sm text-gray-700 space-y-1">
                {analysis.keyPoints.map((point, i) => (
                  <li key={i} className="flex items-start gap-1">
                    <CheckCircle className="w-3 h-3 text-green-500 mt-1 flex-shrink-0" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {analysis.suggestedResponse && (
            <div className="pt-2 border-t">
              <p className="text-xs font-medium text-gray-600 mb-1">Suggested Response:</p>
              <p className="text-sm text-gray-700 italic">"{analysis.suggestedResponse}"</p>
              <Button 
                size="sm" 
                className="mt-2"
                onClick={() => {
                  onResponseGenerated?.(analysis.suggestedResponse)
                  toast({ title: 'Applied!' })
                }}
              >
                Use This Response
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Generated Response */}
      {response && !analysis?.suggestedResponse && (
        <div className="p-3 bg-white rounded-lg border">
          <p className="text-sm text-gray-700">{response}</p>
          <Button 
            size="sm" 
            className="mt-2"
            onClick={() => {
              onResponseGenerated?.(response)
              toast({ title: 'Applied!' })
            }}
          >
            Use Response
          </Button>
        </div>
      )}
    </div>
  )
}
