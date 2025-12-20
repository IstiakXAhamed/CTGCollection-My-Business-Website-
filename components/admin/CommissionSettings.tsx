'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import { Loader2, Save, Percent, Ticket } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"

export function CommissionSettings({ canEdit = false }: { canEdit?: boolean }) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [rate, setRate] = useState<number>(5)
  const [policy, setPolicy] = useState<string>('platform')

  useEffect(() => {
    fetch('/api/admin/site-settings') // Assuming this returns global settings including our new fields
      .then(res => res.json())
      .then(data => {
        if (data.settings) {
          setRate(data.settings.defaultCommission ?? 5)
          setPolicy(data.settings.couponCostPolicy ?? 'platform')
        }
      })
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    if (!canEdit) return

    setSubmitting(true)
    try {
      // Need a specific endpoint or update logic for partial site-settings update
      const res = await fetch('/api/admin/site-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          defaultCommission: rate,
          couponCostPolicy: policy
        })
      })

      if (res.ok) {
        toast({ title: 'Settings Updated', description: 'Commission logic saved.' })
      } else {
        toast({ title: 'Error', description: 'Failed to save settings', variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Something went wrong', variant: 'destructive' })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="p-4"><Loader2 className="animate-spin" /></div>

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Percent className="w-5 h-5 text-blue-600" />
          Commission & Fees
        </CardTitle>
        <CardDescription>
          Configure platform fees and coupon logic for multi-vendor orders.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Commission Rate */}
        <div className="space-y-3">
          <Label className="text-sm sm:text-base font-semibold">Default Platform Commission</Label>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:max-w-xs">
            <div className="relative w-full">
              <Input 
                type="number" 
                value={rate}
                onChange={e => setRate(parseFloat(e.target.value))}
                disabled={!canEdit}
                className="pr-8"
              />
              <span className="absolute right-3 top-2.5 text-gray-400">%</span>
            </div>
            {!canEdit && <Badge variant="secondary" className="whitespace-nowrap">Read Only</Badge>}
          </div>
          <p className="text-xs sm:text-sm text-gray-500">
            Percentage deducted from each order before seller payout.
          </p>
        </div>

        <div className="h-px bg-gray-100 my-4" />

        {/* Coupon Logic */}
        <div className="space-y-3">
          <Label className="text-sm sm:text-base font-semibold flex items-center gap-2">
            <Ticket className="w-4 h-4" />
            Coupon Cost Responsibility
          </Label>
          <RadioGroup 
            value={policy} 
            onValueChange={setPolicy} 
            disabled={!canEdit}
            className="flex flex-col gap-2 sm:gap-3"
          >
            <div className="flex items-start space-x-2 border p-2 sm:p-3 rounded-lg hover:bg-gray-50 transition">
              <RadioGroupItem value="platform" id="r1" className="mt-0.5 sm:mt-1" />
              <div className="grid gap-1 leading-none">
                <Label htmlFor="r1" className="cursor-pointer font-medium text-sm sm:text-base">Platform Bears Cost</Label>
                <p className="text-xs sm:text-sm text-gray-500">
                  Platform pays for discounts. Seller receives full price minus commission.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-2 border p-2 sm:p-3 rounded-lg hover:bg-gray-50 transition">
              <RadioGroupItem value="shop" id="r2" className="mt-0.5 sm:mt-1" />
              <div className="grid gap-1 leading-none">
                <Label htmlFor="r2" className="cursor-pointer font-medium text-sm sm:text-base">Shop Bears Cost</Label>
                <p className="text-xs sm:text-sm text-gray-500">
                  Seller pays for discounts. Discount deducted from earnings.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-2 border p-2 sm:p-3 rounded-lg hover:bg-gray-50 transition">
              <RadioGroupItem value="shared" id="r3" className="mt-0.5 sm:mt-1" />
              <div className="grid gap-1 leading-none">
                <Label htmlFor="r3" className="cursor-pointer font-medium text-sm sm:text-base">Shared (50/50)</Label>
                <p className="text-xs sm:text-sm text-gray-500">
                  Cost split equally between Platform and Seller.
                </p>
              </div>
            </div>
          </RadioGroup>
        </div>

        {canEdit && (
          <div className="pt-4">
            <Button onClick={handleSave} disabled={submitting} className="bg-blue-600 hover:bg-blue-700">
              {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Configuration
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
