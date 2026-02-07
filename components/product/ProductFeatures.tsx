import { Card, CardContent } from '@/components/ui/card'
import { Truck, RotateCcw, Banknote, ShieldCheck } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'

export function ProductFeatures() {
  const [settings, setSettings] = useState<any>(null)

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => setSettings(data.settings))
      .catch(console.error)
  }, [])

  if (!settings) return null
  const features = [
    {
      icon: Truck,
      title: settings.featureShippingTitle || 'Free Shipping',
      description: settings.featureShippingDesc || 'Orders over BDT 2,000',
      color: 'text-blue-600',
      key: 'featureShipping'
    },
    {
      icon: RotateCcw,
      title: settings.featureReturnTitle || 'Easy Returns',
      description: settings.featureReturnDesc || '7-day return policy',
      color: 'text-green-600',
      key: 'featureReturn'
    },
    {
      icon: Banknote,
      title: settings.featureCODTitle || 'COD Available',
      description: settings.featureCODDesc || 'Cash on Delivery',
      color: 'text-purple-600',
      key: 'featureCOD'
    },
    {
      icon: ShieldCheck,
      title: settings.featureAuthenticTitle || '100% Authentic',
      description: settings.featureAuthenticDesc || 'Genuine products',
      color: 'text-yellow-600',
      key: 'featureAuthentic'
    }
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {features.map((feature) => {
        // Feature Logic - Only hide if explicitly set to false (default to true)
        if (feature.key === 'featureShipping' && settings.showFreeShipping === false) return null
        if (feature.key === 'featureReturn' && (settings.showEasyReturns === false || settings.returnsEnabled === false)) return null
        if (feature.key === 'featureCOD' && settings.showCOD === false) return null
        if (feature.key === 'featureAuthentic' && settings.showAuthentic === false) return null

        const Icon = feature.icon
        return (
          <Card key={feature.title} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 text-center">
              <Icon className={`w-8 h-8 mx-auto mb-2 ${feature.color}`} />
              <p className="font-semibold text-sm mb-1">{feature.title}</p>
              <p className="text-xs text-muted-foreground">{feature.description}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
