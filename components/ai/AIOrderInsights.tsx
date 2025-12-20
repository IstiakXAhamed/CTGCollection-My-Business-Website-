'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Bot, Loader2, Sparkles, TrendingUp, TrendingDown, Minus,
  BarChart3, Lightbulb, Target
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface AIOrderInsightsProps {
  orderData?: {
    totalOrders: number
    totalRevenue: number
    topProducts: string[]
    period: string
  }
}

interface InsightsResult {
  summary: string
  insights: string[]
  recommendations: string[]
  trend: 'up' | 'down' | 'stable'
}

export function AIOrderInsights({ orderData }: AIOrderInsightsProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [insights, setInsights] = useState<InsightsResult | null>(null)

  const generateInsights = async () => {
    if (!orderData) {
      toast({ title: 'Error', description: 'No order data available', variant: 'destructive' })
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'order_insights',
          orderData
        })
      })

      const data = await res.json()
      if (data.success) {
        setInsights(data.result)
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to generate insights', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const getTrendIcon = () => {
    switch (insights?.trend) {
      case 'up': return <TrendingUp className="w-5 h-5 text-green-500" />
      case 'down': return <TrendingDown className="w-5 h-5 text-red-500" />
      default: return <Minus className="w-5 h-5 text-gray-500" />
    }
  }

  const getTrendColor = () => {
    switch (insights?.trend) {
      case 'up': return 'bg-green-100 text-green-700 border-green-200'
      case 'down': return 'bg-red-100 text-red-700 border-red-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  return (
    <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50 to-blue-50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-indigo-800">
            <Bot className="w-5 h-5" />
            AI Business Insights
          </CardTitle>
          <Badge variant="outline" className="text-xs">Gemini AI</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {orderData && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
            <div className="p-2 bg-white rounded-lg">
              <p className="text-xs text-gray-500">Orders</p>
              <p className="font-bold text-indigo-700">{orderData.totalOrders}</p>
            </div>
            <div className="p-2 bg-white rounded-lg">
              <p className="text-xs text-gray-500">Revenue</p>
              <p className="font-bold text-indigo-700">৳{orderData.totalRevenue.toLocaleString()}</p>
            </div>
            <div className="p-2 bg-white rounded-lg col-span-2">
              <p className="text-xs text-gray-500">Period</p>
              <p className="font-bold text-indigo-700">{orderData.period}</p>
            </div>
          </div>
        )}

        <Button 
          onClick={generateInsights} 
          disabled={loading || !orderData} 
          className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          Generate AI Insights
        </Button>

        {insights && (
          <div className="space-y-4">
            <div className={`p-3 rounded-lg border ${getTrendColor()}`}>
              <div className="flex items-center gap-2 mb-1">
                {getTrendIcon()}
                <span className="font-semibold capitalize">Trend: {insights.trend}</span>
              </div>
              <p className="text-sm">{insights.summary}</p>
            </div>

            {insights.insights?.length > 0 && (
              <div className="p-3 bg-white rounded-lg border">
                <div className="flex items-center gap-2 mb-2 text-blue-700">
                  <BarChart3 className="w-4 h-4" />
                  <span className="font-semibold">Key Insights</span>
                </div>
                <ul className="space-y-1">
                  {insights.insights.map((insight, i) => (
                    <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                      <Lightbulb className="w-3 h-3 text-amber-500 mt-1 flex-shrink-0" />
                      {insight}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {insights.recommendations?.length > 0 && (
              <div className="p-3 bg-white rounded-lg border">
                <div className="flex items-center gap-2 mb-2 text-green-700">
                  <Target className="w-4 h-4" />
                  <span className="font-semibold">Recommendations</span>
                </div>
                <ul className="space-y-1">
                  {insights.recommendations.map((rec, i) => (
                    <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className="text-green-500">→</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
