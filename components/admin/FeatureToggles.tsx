'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, Settings2, Save, ShoppingBag, CreditCard, Gift, Users, MessageSquare, Truck, Sparkles } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface FeatureToggle {
  id: string
  label: string
  description: string
  field: string
  icon: any
  category: string
}

const FEATURE_TOGGLES: FeatureToggle[] = [
  // Multi-Vendor & Marketplace
  { id: 'multiVendor', label: 'মাল্টি-ভেন্ডর মোড', description: 'একাধিক সেলারের শপ সক্ষম করুন', field: 'multiVendorEnabled', icon: ShoppingBag, category: 'marketplace' },
  
  // Payment Methods
  { id: 'cod', label: 'ক্যাশ অন ডেলিভারি', description: 'COD পেমেন্ট অপশন', field: 'codEnabled', icon: Truck, category: 'payment' },
  { id: 'ssl', label: 'SSLCommerz', description: 'কার্ড/ব্যাংক পেমেন্ট', field: 'sslEnabled', icon: CreditCard, category: 'payment' },
  { id: 'bkash', label: 'bKash', description: 'bKash মোবাইল ব্যাংকিং', field: 'bkashEnabled', icon: CreditCard, category: 'payment' },
  { id: 'nagad', label: 'Nagad', description: 'নগদ মোবাইল ব্যাংকিং', field: 'nagadEnabled', icon: CreditCard, category: 'payment' },
  { id: 'rocket', label: 'Rocket', description: 'রকেট মোবাইল ব্যাংকিং', field: 'rocketEnabled', icon: CreditCard, category: 'payment' },
  
  // Marketing & Engagement
  { id: 'spinWheel', label: 'স্পিন হুইল', description: 'গেমিফাইড কুপন হুইল', field: 'spinWheelEnabled', icon: Gift, category: 'marketing' },
  { id: 'promoBanner', label: 'প্রমো ব্যানার', description: 'টপ প্রমোশনাল ব্যানার', field: 'promoEnabled', icon: Sparkles, category: 'marketing' },
  
  // Loyalty & Referral
  { id: 'loyalty', label: 'লয়্যালটি প্রোগ্রাম', description: 'পয়েন্ট ও টিয়ার সিস্টেম', field: 'loyaltyEnabled', icon: Users, category: 'loyalty' },
  
  // Communication
  { id: 'liveChat', label: 'লাইভ চ্যাট', description: 'কাস্টমার সাপোর্ট চ্যাট', field: 'chatEnabled', icon: MessageSquare, category: 'communication' },
]

export function FeatureToggles() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [features, setFeatures] = useState<Record<string, boolean>>({})

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings')
      const data = await res.json()
      if (data.settings) {
        // Map settings to features
        const mapped: Record<string, boolean> = {}
        FEATURE_TOGGLES.forEach(f => {
          mapped[f.field] = data.settings[f.field] ?? true
        })
        // Special case: spinWheel from config
        if (data.settings.spinWheelConfig) {
          mapped['spinWheelEnabled'] = data.settings.spinWheelConfig.enabled ?? true
        }
        setFeatures(mapped)
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggle = (field: string, checked: boolean) => {
    setFeatures(prev => ({ ...prev, [field]: checked }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      // Prepare payload - handle spinWheel separately
      const payload: any = { ...features }
      
      // If spinWheelEnabled changed, we need to update the config
      if ('spinWheelEnabled' in payload) {
        const spinRes = await fetch('/api/settings/public')
        const spinData = await spinRes.json()
        const currentConfig = spinData.spinWheelConfig || { enabled: true, cooldownMinutes: 1440, delaySeconds: 10, prizes: [] }
        payload.spinWheelConfig = { ...currentConfig, enabled: payload.spinWheelEnabled }
        delete payload.spinWheelEnabled
      }

      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        toast({ title: 'সেভ হয়েছে', description: 'ফিচার সেটিংস আপডেট হয়েছে।' })
      } else {
        const data = await res.json()
        toast({ title: 'এরর', description: data.error || 'সেভ করতে সমস্যা হয়েছে', variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: 'এরর', description: 'সেভ করতে সমস্যা হয়েছে', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const getCategory = (cat: string) => {
    const cats: Record<string, { label: string; color: string }> = {
      marketplace: { label: 'মার্কেটপ্লেস', color: 'bg-blue-100 text-blue-700' },
      payment: { label: 'পেমেন্ট', color: 'bg-green-100 text-green-700' },
      marketing: { label: 'মার্কেটিং', color: 'bg-purple-100 text-purple-700' },
      loyalty: { label: 'লয়্যালটি', color: 'bg-amber-100 text-amber-700' },
      communication: { label: 'কমিউনিকেশন', color: 'bg-pink-100 text-pink-700' },
    }
    return cats[cat] || { label: cat, color: 'bg-gray-100 text-gray-700' }
  }

  if (loading) {
    return (
      <Card className="border-blue-200">
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        </CardContent>
      </Card>
    )
  }

  // Group by category
  const grouped = FEATURE_TOGGLES.reduce((acc, f) => {
    if (!acc[f.category]) acc[f.category] = []
    acc[f.category].push(f)
    return acc
  }, {} as Record<string, FeatureToggle[]>)

  return (
    <Card className="border-blue-200 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-blue-700">
              <Settings2 className="w-6 h-6" />
              ফিচার কন্ট্রোল
            </CardTitle>
            <CardDescription>সাইটের ফিচারগুলো সক্ষম বা অক্ষম করুন</CardDescription>
          </div>
          <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            সেভ করুন
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {Object.entries(grouped).map(([category, featureList]) => {
          const catInfo = getCategory(category)
          return (
            <div key={category} className="space-y-3">
              <Badge className={catInfo.color}>{catInfo.label}</Badge>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {featureList.map(feature => {
                  const Icon = feature.icon
                  const isEnabled = features[feature.field] ?? true
                  return (
                    <div 
                      key={feature.id} 
                      className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                        isEnabled ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-100 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${isEnabled ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-400'}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <Label className="font-medium text-sm cursor-pointer">{feature.label}</Label>
                          <p className="text-xs text-gray-500">{feature.description}</p>
                        </div>
                      </div>
                      <Switch
                        checked={isEnabled}
                        onCheckedChange={(checked) => handleToggle(feature.field, checked)}
                      />
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
