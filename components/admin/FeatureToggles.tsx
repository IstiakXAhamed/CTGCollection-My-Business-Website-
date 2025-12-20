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
  { id: 'multiVendor', label: 'Multi-Vendor Mode', description: 'Enable multiple seller shops', field: 'multiVendorEnabled', icon: ShoppingBag, category: 'marketplace' },
  
  // Payment Methods
  { id: 'cod', label: 'Cash on Delivery', description: 'COD payment option', field: 'codEnabled', icon: Truck, category: 'payment' },
  { id: 'ssl', label: 'SSLCommerz', description: 'Card & bank payments', field: 'sslEnabled', icon: CreditCard, category: 'payment' },
  { id: 'bkash', label: 'bKash', description: 'bKash mobile banking', field: 'bkashEnabled', icon: CreditCard, category: 'payment' },
  { id: 'nagad', label: 'Nagad', description: 'Nagad mobile banking', field: 'nagadEnabled', icon: CreditCard, category: 'payment' },
  { id: 'rocket', label: 'Rocket', description: 'Rocket mobile banking', field: 'rocketEnabled', icon: CreditCard, category: 'payment' },
  
  // Marketing & Engagement
  { id: 'spinWheel', label: 'Spin Wheel', description: 'Gamified coupon wheel', field: 'spinWheelEnabled', icon: Gift, category: 'marketing' },
  { id: 'promoBanner', label: 'Promo Banner', description: 'Top promotional banner', field: 'promoEnabled', icon: Sparkles, category: 'marketing' },
  
  // Loyalty & Referral
  { id: 'loyalty', label: 'Loyalty Program', description: 'Points & tier system', field: 'loyaltyEnabled', icon: Users, category: 'loyalty' },
  
  // Communication
  { id: 'liveChat', label: 'Live Chat', description: 'Customer support chat', field: 'chatEnabled', icon: MessageSquare, category: 'communication' },
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
        toast({ title: 'Saved', description: 'Feature settings updated successfully.' })
      } else {
        const data = await res.json()
        toast({ title: 'Error', description: data.error || 'Failed to save settings', variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to save settings', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const getCategory = (cat: string) => {
    const cats: Record<string, { label: string; color: string }> = {
      marketplace: { label: 'Marketplace', color: 'bg-blue-100 text-blue-700' },
      payment: { label: 'Payment', color: 'bg-green-100 text-green-700' },
      marketing: { label: 'Marketing', color: 'bg-purple-100 text-purple-700' },
      loyalty: { label: 'Loyalty', color: 'bg-amber-100 text-amber-700' },
      communication: { label: 'Communication', color: 'bg-pink-100 text-pink-700' },
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
              Feature Control
            </CardTitle>
            <CardDescription>Enable or disable site features</CardDescription>
          </div>
          <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            Save Changes
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
