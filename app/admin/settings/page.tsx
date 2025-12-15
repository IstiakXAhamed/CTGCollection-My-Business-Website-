'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  MessageCircle, Gift, Settings, Save, 
  CheckCircle2, Wifi, WifiOff, Clock, Loader2,
  Store, Truck, CreditCard
} from 'lucide-react'

interface SiteSettings {
  chatStatus: string
  promoEnabled: boolean
  promoCode: string
  promoMessage: string
  promoEndTime: string | null
  storeName: string
  storeEmail: string
  storePhone: string
  storeAddress: string
  shippingCost: number
  freeShippingMin: number
  codEnabled: boolean
  sslEnabled: boolean
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>({
    chatStatus: 'online',
    promoEnabled: true,
    promoCode: 'WELCOME10',
    promoMessage: '🎉 FLASH SALE! Use code WELCOME10 for 10% OFF',
    promoEndTime: null,
    storeName: 'CTG Collection',
    storeEmail: 'info@ctgcollection.com',
    storePhone: '+880 1234 567890',
    storeAddress: 'Chittagong, Bangladesh',
    shippingCost: 60,
    freeShippingMin: 2000,
    codEnabled: true,
    sslEnabled: true
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings')
      if (res.ok) {
        const data = await res.json()
        setSettings(data)
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async (updates: Partial<SiteSettings>) => {
    setSaving(true)
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updates)
      })
      
      if (res.ok) {
        const data = await res.json()
        setSettings(data)
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
      }
    } catch (error) {
      console.error('Failed to save settings:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleChatStatusChange = (status: string) => {
    setSettings(prev => ({ ...prev, chatStatus: status }))
  }

  const handlePromoChange = (field: string, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }))
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <Wifi className="w-4 h-4 text-green-500" />
      case 'away': return <Clock className="w-4 h-4 text-yellow-500" />
      default: return <WifiOff className="w-4 h-4 text-red-500" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Settings className="w-8 h-8 text-blue-600" />
          Settings
        </h1>
        <p className="text-muted-foreground">Manage your store settings (saved to database)</p>
      </div>

      {saved && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          Settings saved successfully!
        </div>
      )}

      <div className="grid gap-6">
        {/* Live Chat Settings */}
        <Card className="border-2 border-blue-100">
          <CardHeader className="bg-blue-50">
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-blue-600" />
              Live Chat Settings
            </CardTitle>
            <CardDescription>Control the chat widget visibility and status for customers</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div>
              <Label className="text-base font-semibold mb-3 block">Chat Status</Label>
              <p className="text-sm text-muted-foreground mb-4">
                Set your availability status. This controls what customers see on the chat widget.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => handleChatStatusChange('online')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    settings.chatStatus === 'online' 
                      ? 'border-green-500 bg-green-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <Wifi className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold">Online</p>
                      <p className="text-xs text-muted-foreground">Actively responding</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleChatStatusChange('away')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    settings.chatStatus === 'away' 
                      ? 'border-yellow-500 bg-yellow-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold">Away</p>
                      <p className="text-xs text-muted-foreground">Slow response time</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleChatStatusChange('offline')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    settings.chatStatus === 'offline' 
                      ? 'border-red-500 bg-red-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                      <WifiOff className="w-5 h-5 text-red-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold">Offline</p>
                      <p className="text-xs text-muted-foreground">Chat hidden</p>
                    </div>
                  </div>
                </button>
              </div>

              <div className="flex items-center justify-between mt-6 pt-4 border-t">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Current Status:</span>
                  <Badge variant={settings.chatStatus === 'online' ? 'default' : settings.chatStatus === 'away' ? 'secondary' : 'destructive'}>
                    {getStatusIcon(settings.chatStatus)}
                    <span className="ml-1 capitalize">{settings.chatStatus}</span>
                  </Badge>
                </div>
                <Button onClick={() => saveSettings({ chatStatus: settings.chatStatus })} disabled={saving}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                  Save Chat Settings
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>



        {/* Store Information */}
        <Card className="border-2 border-green-100">
          <CardHeader className="bg-green-50">
            <CardTitle className="flex items-center gap-2">
              <Store className="w-5 h-5 text-green-600" />
              Store Information
            </CardTitle>
            <CardDescription>Basic store details shown across the site</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Store Name</Label>
                <Input 
                  value={settings.storeName}
                  onChange={(e) => handlePromoChange('storeName', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Store Email</Label>
                <Input 
                  value={settings.storeEmail}
                  onChange={(e) => handlePromoChange('storeEmail', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Store Phone</Label>
                <Input 
                  value={settings.storePhone}
                  onChange={(e) => handlePromoChange('storePhone', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Store Address</Label>
                <Input 
                  value={settings.storeAddress}
                  onChange={(e) => handlePromoChange('storeAddress', e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
            <div className="pt-4 border-t">
              <Button onClick={() => saveSettings({ storeName: settings.storeName, storeEmail: settings.storeEmail, storePhone: settings.storePhone, storeAddress: settings.storeAddress })} disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                Save Store Info
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Shipping Settings */}
        <Card className="border-2 border-orange-100">
          <CardHeader className="bg-orange-50">
            <CardTitle className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-orange-600" />
              Shipping Settings
            </CardTitle>
            <CardDescription>Configure shipping costs and free shipping threshold</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Shipping Cost (৳)</Label>
                <Input 
                  type="number"
                  value={settings.shippingCost}
                  onChange={(e) => handlePromoChange('shippingCost', parseFloat(e.target.value) || 0)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Free Shipping Minimum (৳)</Label>
                <Input 
                  type="number"
                  value={settings.freeShippingMin}
                  onChange={(e) => handlePromoChange('freeShippingMin', parseFloat(e.target.value) || 0)}
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">Orders above this amount get free shipping</p>
              </div>
            </div>
            <div className="pt-4 border-t">
              <Button onClick={() => saveSettings({ shippingCost: settings.shippingCost, freeShippingMin: settings.freeShippingMin })} disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                Save Shipping Settings
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Payment Settings */}
        <Card className="border-2 border-indigo-100">
          <CardHeader className="bg-indigo-50">
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-indigo-600" />
              Payment Methods
            </CardTitle>
            <CardDescription>Enable or disable payment options</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-semibold">Cash on Delivery (COD)</p>
                  <p className="text-sm text-muted-foreground">Pay when you receive your order</p>
                </div>
                <input 
                  type="checkbox"
                  checked={settings.codEnabled}
                  onChange={(e) => handlePromoChange('codEnabled', e.target.checked)}
                  className="w-5 h-5 text-indigo-600 rounded"
                />
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-semibold">SSLCommerz</p>
                  <p className="text-sm text-muted-foreground">Online payment gateway</p>
                </div>
                <input 
                  type="checkbox"
                  checked={settings.sslEnabled}
                  onChange={(e) => handlePromoChange('sslEnabled', e.target.checked)}
                  className="w-5 h-5 text-indigo-600 rounded"
                />
              </div>
            </div>
            <div className="pt-4 border-t">
              <Button onClick={() => saveSettings({ codEnabled: settings.codEnabled, sslEnabled: settings.sslEnabled })} disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                Save Payment Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
