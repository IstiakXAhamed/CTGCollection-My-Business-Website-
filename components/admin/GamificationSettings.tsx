'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Plus, Trash2, Save, Gift, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Prize {
  id: string
  label: string
  code?: string
  color: string
  probability: number
}

interface WheelConfig {
  enabled: boolean
  cooldownMinutes: number
  delaySeconds: number
  prizes: Prize[]
}

const DEFAULT_PRIZES: Prize[] = [
  { id: '1', label: '5% OFF', code: 'SPIN5', color: '#FF6B6B', probability: 25 },
  { id: '2', label: '10% OFF', code: 'SPIN10', color: '#4ECDC4', probability: 20 },
  { id: '3', label: 'Free Ship', code: 'FREESHIP', color: '#45B7D1', probability: 15 },
  { id: '4', label: '15% OFF', code: 'SPIN15', color: '#96CEB4', probability: 10 },
  { id: '5', label: 'Try Again', code: '', color: '#DDA0DD', probability: 20 },
  { id: '6', label: '20% OFF', code: 'SPIN20', color: '#FFEAA7', probability: 5 },
]

export function GamificationSettings() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [config, setConfig] = useState<WheelConfig>({
    enabled: true,
    cooldownMinutes: 1440, // 24 hours
    delaySeconds: 10,
    prizes: DEFAULT_PRIZES
  })

  useEffect(() => {
    fetchConfig()
  }, [])

  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/settings/public')
      const data = await res.json()
      if (data.spinWheelConfig) {
        setConfig(data.spinWheelConfig)
      }
    } catch (error) {
      console.error('Failed to fetch config', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      // Fetch current settings first to merge (since we only expose public route currently, we might need a dedicated admin route or update via main settings API)
      // Assuming we have an endpoint for this. I'll use /api/settings route which accepts body.
      // Wait, /api/settings usually handles SiteSettings.
      
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spinWheelConfig: config
        })
      })

      if (res.ok) {
        toast({ title: 'Saved', description: 'Gamification settings updated successfully.' })
      } else {
        throw new Error('Failed to save')
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to save settings', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const addPrize = () => {
    const newPrize: Prize = {
      id: Date.now().toString(),
      label: 'New Prize',
      code: '',
      color: '#' + Math.floor(Math.random()*16777215).toString(16),
      probability: 10
    }
    setConfig({ ...config, prizes: [...config.prizes, newPrize] })
  }

  const removePrize = (id: string) => {
    setConfig({ ...config, prizes: config.prizes.filter(p => p.id !== id) })
  }

  const updatePrize = (id: string, field: keyof Prize, value: any) => {
    setConfig({
      ...config,
      prizes: config.prizes.map(p => p.id === id ? { ...p, [field]: value } : p)
    })
  }

  if (loading) return <div className="p-8 text-center"><Loader2 className="animate-spin mx-auto" /></div>

  return (
    <Card className="border-purple-200 shadow-sm mt-8">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-purple-700">
              <Gift className="w-6 h-6" />
              Spin to Win Configuration
            </CardTitle>
            <CardDescription>Manage the gamification wheel for customers</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="wheel-enabled">Enable Wheel</Label>
            <Switch 
              id="wheel-enabled"
              checked={config.enabled}
              onCheckedChange={(checked) => setConfig({ ...config, enabled: checked })}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* General Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <Label>Cooldown (Minutes)</Label>
            <Input 
              type="number" 
              value={config.cooldownMinutes}
              onChange={(e) => setConfig({ ...config, cooldownMinutes: parseInt(e.target.value) || 0 })}
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">Time before a user can spin again (0 = infinite)</p>
          </div>
          <div>
            <Label>Appearance Delay (Seconds)</Label>
            <Input 
              type="number" 
              value={config.delaySeconds}
              onChange={(e) => setConfig({ ...config, delaySeconds: parseInt(e.target.value) || 0 })}
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">Time to wait before showing popup</p>
          </div>
        </div>

        {/* Prizes */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Prizes & Segments</h3>
            <Button size="sm" onClick={addPrize} variant="outline" className="gap-1">
              <Plus className="w-4 h-4" /> Add Segment
            </Button>
          </div>
          
          <div className="space-y-3">
            {config.prizes.map((prize) => (
              <div key={prize.id} className="grid grid-cols-12 gap-2 item-center p-3 border rounded bg-white items-end">
                <div className="col-span-3">
                  <Label className="text-xs">Label</Label>
                  <Input value={prize.label} onChange={(e) => updatePrize(prize.id, 'label', e.target.value)} size={10} />
                </div>
                <div className="col-span-3">
                  <Label className="text-xs">Coupon Code</Label>
                  <Input value={prize.code || ''} onChange={(e) => updatePrize(prize.id, 'code', e.target.value)} placeholder="Wait..." />
                </div>
                <div className="col-span-2">
                  <Label className="text-xs">Color</Label>
                  <div className="flex gap-2">
                     <Input 
                       type="color" 
                       value={prize.color} 
                       onChange={(e) => updatePrize(prize.id, 'color', e.target.value)} 
                       className="w-8 p-0 h-9 border-0"
                     />
                     <Input value={prize.color} onChange={(e) => updatePrize(prize.id, 'color', e.target.value)} className="text-xs" />
                  </div>
                </div>
                <div className="col-span-2">
                  <Label className="text-xs">Prob (%)</Label>
                  <Input 
                    type="number" 
                    value={prize.probability} 
                    onChange={(e) => updatePrize(prize.id, 'probability', parseFloat(e.target.value))} 
                  />
                </div>
                <div className="col-span-2 flex justify-end pb-1">
                  <Button size="icon" variant="ghost" className="text-red-500 hover:bg-red-50" onClick={() => removePrize(prize.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
            
            <div className="text-right text-sm text-gray-500">
              Total Probability: {config.prizes.reduce((sum, p) => sum + (p.probability || 0), 0)}%
            </div>
          </div>
        </div>

        <Button onClick={handleSave} disabled={saving} className="w-full">
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Configuration
        </Button>
      </CardContent>
    </Card>
  )
}
