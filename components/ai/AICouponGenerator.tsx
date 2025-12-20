'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Bot, Loader2, Sparkles, Gift, Tag, Calendar, Copy, CheckCircle
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface AICouponGeneratorProps {
  onCouponSelect?: (coupon: GeneratedCoupon) => void
}

interface GeneratedCoupon {
  code: string
  name: string
  description: string
  discountPercent: number
  validDays: number
}

export function AICouponGenerator({ onCouponSelect }: AICouponGeneratorProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [occasion, setOccasion] = useState('')
  const [coupons, setCoupons] = useState<GeneratedCoupon[]>([])

  const generateCoupons = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'coupon_ideas',
          occasion: occasion || 'general promotion',
          targetAudience: 'all customers',
          discountType: 'percentage'
        })
      })

      const data = await res.json()
      if (data.success && Array.isArray(data.result)) {
        setCoupons(data.result)
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to generate coupons', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const copyCouponCode = (code: string) => {
    navigator.clipboard.writeText(code)
    toast({ title: 'Copied!', description: `Code "${code}" copied` })
  }

  return (
    <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200 space-y-3">
      <div className="flex items-center gap-2">
        <Bot className="w-5 h-5 text-green-600" />
        <span className="font-semibold text-green-800">AI Coupon Generator</span>
        <Badge variant="outline" className="text-xs">Gemini</Badge>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <Input
          placeholder="Occasion (e.g., Eid, New Year, Summer Sale)"
          value={occasion}
          onChange={(e) => setOccasion(e.target.value)}
          className="flex-1"
        />
        <Button onClick={generateCoupons} disabled={loading} className="gap-2 bg-green-600 hover:bg-green-700">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          Generate Ideas
        </Button>
      </div>

      {coupons.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {coupons.map((coupon, i) => (
            <div 
              key={i} 
              className="p-3 bg-white rounded-lg border hover:border-green-300 transition-colors cursor-pointer"
              onClick={() => onCouponSelect?.(coupon)}
            >
              <div className="flex items-center justify-between mb-2">
                <code className="text-lg font-bold text-green-700">{coupon.code}</code>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="h-7 w-7 p-0"
                  onClick={(e) => { e.stopPropagation(); copyCouponCode(coupon.code) }}
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
              <p className="text-sm font-medium text-gray-800">{coupon.name}</p>
              <p className="text-xs text-gray-500 mt-1">{coupon.description}</p>
              <div className="flex gap-2 mt-2">
                <Badge className="bg-green-100 text-green-700 text-xs">
                  <Tag className="w-3 h-3 mr-1" />
                  {coupon.discountPercent}% OFF
                </Badge>
                <Badge variant="outline" className="text-xs">
                  <Calendar className="w-3 h-3 mr-1" />
                  {coupon.validDays} days
                </Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
