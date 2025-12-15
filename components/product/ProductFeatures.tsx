'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Truck, RotateCcw, Banknote, ShieldCheck } from 'lucide-react'

export function ProductFeatures() {
  const features = [
    {
      icon: Truck,
      title: 'Free Shipping',
      description: 'Orders over BDT 2,000',
      color: 'text-blue-600'
    },
    {
      icon: RotateCcw,
      title: 'Easy Returns',
      description: '7-day return policy',
      color: 'text-green-600'
    },
    {
      icon: Banknote,
      title: 'COD Available',
      description: 'Cash on Delivery',
      color: 'text-purple-600'
    },
    {
      icon: ShieldCheck,
      title: '100% Authentic',
      description: 'Genuine products',
      color: 'text-yellow-600'
    }
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {features.map((feature) => {
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
