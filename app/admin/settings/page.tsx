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
  Store, Truck, CreditCard, RotateCcw,
  Smartphone, Monitor, Zap, ShieldCheck, Fingerprint, Lock
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Switch } from '@/components/ui/switch'
import { useSilkGuard } from '@/hooks/useSilkGuard'
import { motion } from 'framer-motion'
import { haptics } from '@/lib/haptics'

interface SiteSettings {
  chatStatus: string
  promoEnabled: boolean
  promoCode: string
  promoMessage: string
  promoEndTime: string | null
  storeName: string
  storeTagline?: string
  storeDescription?: string
  storeEmail: string
  storePhone: string
  storeAddress: string
  shippingCost: number
  freeShippingMin: number
  codEnabled: boolean
  sslEnabled: boolean
  bkashEnabled: boolean
  bkashNumber: string
  nagadEnabled: boolean
  nagadNumber: string
  rocketEnabled: boolean
  rocketNumber: string
  aiContactEmail?: string
  aiContactPhone?: string
  supportEmail?: string
  supportPhone?: string
  spinWheelConfig?: any
  adminProductMode: 'simple' | 'advanced'
  pwaEnabled: boolean
  pwaPromptDelay: number
  pwaShowInstallLink: boolean
}

export default function AdminSettingsPage() {
  const { toast } = useToast()
  const [settings, setSettings] = useState<SiteSettings>({
    chatStatus: 'online',
    promoEnabled: true,
    promoCode: 'WELCOME10',
    promoMessage: '🎉 FLASH SALE! Use code WELCOME10 for 10% OFF',
    promoEndTime: null,
    storeName: 'Silk Mart',
    storeEmail: 'info@ctgcollection.com',
    storePhone: '+880 1234 567890',
    storeAddress: 'Chittagong, Bangladesh',
    shippingCost: 60,
    freeShippingMin: 2000,
    codEnabled: true,
    sslEnabled: true,
    bkashEnabled: true,
    bkashNumber: '01991523289',
    nagadEnabled: true,
    nagadNumber: '01991523289',
    rocketEnabled: true,
    rocketNumber: '01991523289',
    adminProductMode: 'simple',
    pwaEnabled: true,
    pwaPromptDelay: 30,
    pwaShowInstallLink: true
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const guard = useSilkGuard('admin') // Using 'admin' as base since it's admin/settings

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings')
      if (res.ok) {
        const data = await res.json()
        if (data.settings) {
          setSettings(data.settings)
        } else {
          setSettings(data)
        }
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async (updates?: Partial<SiteSettings>) => {
    setSaving(true)
    try {
      const payload = updates ? { ...settings, ...updates } : settings

      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      })
      
      if (res.ok) {
        const data = await res.json()
        if (data.settings) {
           setSettings(data.settings)
        } 
        
        if (data.skippedFields && data.skippedFields.length > 0) {
          toast({
            title: "Settings Partially Saved",
            description: `Some fields were skipped due to database sync issues: ${data.skippedFields.join(', ')}. All other changes were saved.`,
            className: "border-amber-500 bg-amber-50"
          })
        } else {
          toast({
            title: "Success",
            description: "All changes have been successfully saved to the database.",
          })
        }
      } else {
        const errData = await res.json()
        toast({
          title: "Save Failed",
          description: `${errData.error || "Failed to update settings"}${errData.details ? `: ${errData.details}` : ""}`,
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Failed to save settings:', error)
      toast({
        title: "Network Error",
        description: "Could not connect to the server. Check your internet.",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const handleChatStatusChange = (status: string) => {
    const newSettings = { ...settings, chatStatus: status }
    setSettings(newSettings)
    // Optional: Auto-save for status? Or let user click save. 
    // User interface has a save button for this section, so we just update state.
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <Settings className="w-8 h-8 text-blue-600" />
            Settings
          </h1>
          <p className="text-muted-foreground">Manage your store settings (saved to database)</p>
        </div>
      </div>

      <div className="grid gap-6">
        {/* General Configuration */}
        <Card className="border-2 border-slate-200">
          <CardHeader className="bg-slate-50">
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-slate-700" />
              General Configuration
            </CardTitle>
            <CardDescription>System-wide operational settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Advanced Product Form</Label>
                <p className="text-sm text-muted-foreground">
                  Enable segment-specific fields (Electronics, Beauty) and AI SEO tools.
                </p>
              </div>
              <div className="flex items-center gap-2">
                 <span className={`text-sm ${settings.adminProductMode === 'simple' ? 'font-bold' : 'text-muted-foreground'}`}>Simple</span>
                 <Switch
                  checked={settings.adminProductMode === 'advanced'}
                  onCheckedChange={(checked) => handlePromoChange('adminProductMode', checked ? 'advanced' : 'simple')}
                />
                <span className={`text-sm ${settings.adminProductMode === 'advanced' ? 'font-bold text-blue-600' : 'text-muted-foreground'}`}>Advanced</span>
              </div>
            </div>

            <div className="flex items-center justify-between border-t pt-4">
              <div className="space-y-0.5">
                <Label className="text-base">Spin & Win Game</Label>
                <p className="text-sm text-muted-foreground">
                  Enable or disable the floating spin wheel game for customers.
                </p>
              </div>
              <Switch
                checked={settings.spinWheelConfig?.enabled !== false}
                onCheckedChange={(checked) => {
                   const currentConfig = settings.spinWheelConfig || {}
                   handlePromoChange('spinWheelConfig', { ...currentConfig, enabled: checked })
                }}
              />
            </div>
            
            <div className="flex justify-end pt-4 border-t">
              <Button onClick={() => saveSettings({ adminProductMode: settings.adminProductMode })} disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                Save General Settings
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* App & PWA Control */}
        <Card className="border-2 border-amber-100 bg-gradient-to-br from-white to-amber-50/30">
          <CardHeader className="bg-amber-50/50">
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-amber-600" />
              App & PWA Control
            </CardTitle>
            <CardDescription>Control the Progressive Web App (PWA) installation experience</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Enable "Add to Home Screen" Popup</Label>
                <p className="text-sm text-muted-foreground">
                  Show the automatic popup prompt for customers to install the app.
                </p>
              </div>
              <Switch
                checked={settings.pwaEnabled}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, pwaEnabled: checked }))}
              />
            </div>

            <div className="flex items-center justify-between border-t pt-4">
              <div className="space-y-0.5">
                <Label className="text-base">Popup Prompt Delay (Seconds)</Label>
                <p className="text-sm text-muted-foreground">
                  How many seconds to wait before showing the installation prompt.
                </p>
              </div>
              <div className="w-24">
                <Input 
                  type="number" 
                  value={settings.pwaPromptDelay} 
                  onChange={(e) => setSettings(prev => ({ ...prev, pwaPromptDelay: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>

            <div className="flex items-center justify-between border-t pt-4">
              <div className="space-y-0.5">
                <Label className="text-base font-bold text-amber-800">Show "Install App" Link</Label>
                <p className="text-sm text-muted-foreground">
                  Displays a prominent "Install Our App" button for customers.
                </p>
              </div>
              <Switch
                checked={settings.pwaShowInstallLink}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, pwaShowInstallLink: checked }))}
              />
            </div>
            
            <div className="flex justify-end pt-4 border-t">
              <Button 
                onClick={() => saveSettings({ 
                  pwaEnabled: settings.pwaEnabled, 
                  pwaPromptDelay: settings.pwaPromptDelay,
                  pwaShowInstallLink: settings.pwaShowInstallLink
                })} 
                className="bg-amber-600 hover:bg-amber-700"
                disabled={saving}
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Zap className="w-4 h-4 mr-2" />}
                Save App Settings
              </Button>
            </div>
          </CardContent>
        </Card>

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
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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

        {/* AI & Interaction Settings */}
        <Card className="border-2 border-purple-100">
          <CardHeader className="bg-purple-50">
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-purple-600" />
              AI & Interaction Settings
            </CardTitle>
            <CardDescription>Configure AI Bot contact info and Gamification</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-purple-700 font-bold">Store Name (AI Identity)</Label>
                <Input
                  value={settings.storeName || ''}
                  onChange={(e) => handlePromoChange('storeName', e.target.value)}
                  placeholder="Silk Mart"
                  className="border-purple-200 focus-visible:ring-purple-500"
                />
                <p className="text-xs text-muted-foreground italic">The AI will use this name to represent your business.</p>
              </div>
              <div className="space-y-2">
                <Label>Store Tagline</Label>
                <Input
                  value={settings.storeTagline || ''}
                  onChange={(e) => handlePromoChange('storeTagline', e.target.value)}
                  placeholder="Premium E-Commerce Store"
                />
              </div>
              <div className="space-y-2">
                <Label>Store Description / Mission (AI Context)</Label>
                <textarea
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={settings.storeDescription || ''}
                  onChange={(e) => handlePromoChange('storeDescription', e.target.value)}
                  placeholder="Describe your business, mission, and what makes you unique. The AI will use this to answer customer questions."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
              <div className="space-y-2">
                <Label>AI Bot Contact Email</Label>
                <Input
                  value={settings.aiContactEmail || ''}
                  onChange={(e) => handlePromoChange('aiContactEmail', e.target.value)}
                  placeholder="support@ctgcollection.com"
                />
                <p className="text-xs text-muted-foreground">Email AI shares with customers</p>
              </div>
              <div className="space-y-2">
                <Label>AI Bot Contact Phone</Label>
                <Input
                  value={settings.aiContactPhone || ''}
                  onChange={(e) => handlePromoChange('aiContactPhone', e.target.value)}
                  placeholder="+8801..."
                />
                <p className="text-xs text-muted-foreground">Phone AI shares with customers</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
              <div className="space-y-2">
                <Label>FAQ Support Email</Label>
                <Input
                  value={settings.supportEmail || ''}
                  onChange={(e) => handlePromoChange('supportEmail', e.target.value)}
                  placeholder="support@ctgcollection.com"
                />
                <p className="text-xs text-muted-foreground">Displayed in FAQ section</p>
              </div>
              <div className="space-y-2">
                <Label>FAQ Support Phone</Label>
                <Input
                  value={settings.supportPhone || ''}
                  onChange={(e) => handlePromoChange('supportPhone', e.target.value)}
                  placeholder="+8801..."
                />
                <p className="text-xs text-muted-foreground">Displayed in FAQ section</p>
              </div>
            </div>
            
            <div className="border-t pt-4 flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Spin Wheel Game</Label>
                <p className="text-sm text-muted-foreground">Enable/Disable the "Spin & Win" popup globally</p>
              </div>
              <Switch
                checked={settings.spinWheelConfig?.enabled !== false}
                onCheckedChange={(checked) => {
                   const currentConfig = settings.spinWheelConfig || {}
                   handlePromoChange('spinWheelConfig', { ...currentConfig, enabled: checked })
                }}
              />
            </div>

            <div className="flex justify-end pt-4 border-t">
              <Button onClick={() => saveSettings(settings)} disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                Save Interaction Settings
              </Button>
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
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
            {/* Mobile Banking Payment Numbers */}
            <div className="border-t pt-4 mt-4">
              <Label className="text-base font-semibold mb-3 block">📱 Mobile Banking (Send Money)</Label>
              <p className="text-sm text-muted-foreground mb-4">Enter your personal mobile banking numbers for customers to send money</p>
              
              {/* bKash */}
              <div className="flex items-center justify-between p-4 border rounded-lg mb-3 bg-pink-50">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-pink-700">📱 bKash</p>
                    <input 
                      type="checkbox"
                      checked={settings.bkashEnabled}
                      onChange={(e) => handlePromoChange('bkashEnabled', e.target.checked)}
                      className="w-4 h-4 text-pink-600 rounded"
                    />
                  </div>
                  <Input 
                    value={settings.bkashNumber}
                    onChange={(e) => handlePromoChange('bkashNumber', e.target.value)}
                    placeholder="01XXXXXXXXX"
                    className="mt-2 w-full md:max-w-xs"
                  />
                </div>
              </div>

              {/* Nagad */}
              <div className="flex items-center justify-between p-4 border rounded-lg mb-3 bg-orange-50">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-orange-700">📱 Nagad</p>
                    <input 
                      type="checkbox"
                      checked={settings.nagadEnabled}
                      onChange={(e) => handlePromoChange('nagadEnabled', e.target.checked)}
                      className="w-4 h-4 text-orange-600 rounded"
                    />
                  </div>
                  <Input 
                    value={settings.nagadNumber}
                    onChange={(e) => handlePromoChange('nagadNumber', e.target.value)}
                    placeholder="01XXXXXXXXX"
                    className="mt-2 max-w-xs"
                  />
                </div>
              </div>

              {/* Rocket */}
              <div className="flex items-center justify-between p-4 border rounded-lg mb-3 bg-purple-50">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-purple-700">🚀 Rocket</p>
                    <input 
                      type="checkbox"
                      checked={settings.rocketEnabled}
                      onChange={(e) => handlePromoChange('rocketEnabled', e.target.checked)}
                      className="w-4 h-4 text-purple-600 rounded"
                    />
                  </div>
                  <Input 
                    value={settings.rocketNumber}
                    onChange={(e) => handlePromoChange('rocketNumber', e.target.value)}
                    placeholder="01XXXXXXXXX"
                    className="mt-2 max-w-xs"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Rocket requires adding 8 at end for Send Money</p>
                </div>
              </div>
            </div>
            <div className="pt-4 border-t">
              <Button onClick={() => saveSettings({ 
                codEnabled: settings.codEnabled, 
                sslEnabled: settings.sslEnabled,
                bkashEnabled: settings.bkashEnabled,
                bkashNumber: settings.bkashNumber,
                nagadEnabled: settings.nagadEnabled,
                nagadNumber: settings.nagadNumber,
                rocketEnabled: settings.rocketEnabled,
                rocketNumber: settings.rocketNumber
              })} disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                Save Payment Settings
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Silk Guard - Mobile App Security (Admin/Seller Only) */}
        <Card className="border-2 border-indigo-100 mb-20">
          <CardHeader className="bg-indigo-50">
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
              Silk Guard (Elite Mobile Security)
            </CardTitle>
            <CardDescription>Secure this device with Biometrics or a PIN (Admin/Seller Only)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            {!guard.isMobile && (
              <div className="p-4 border border-amber-200 bg-amber-50 rounded-xl mb-4">
                <p className="text-amber-700 text-sm font-medium flex items-center gap-2">
                  <Monitor className="w-4 h-4" />
                  Silk Guard is a mobile-only feature. Open this page on your smartphone to configure app security.
                </p>
              </div>
            )}
            
            <div className={`flex items-center justify-between p-4 border rounded-xl bg-white shadow-sm ${!guard.isMobile ? 'opacity-50 pointer-events-none' : ''}`}>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-indigo-600" />
                  <Label className="text-base font-semibold">Enable App Lock</Label>
                </div>
                <p className="text-sm text-muted-foreground">Require verification whenever you open Silk Mart on this phone.</p>
              </div>
              <Switch 
                checked={guard.isEnabled}
                disabled={!guard.isMobile}
                onCheckedChange={(val) => {
                  haptics.soft()
                  // Update local UI state - will be persisted on 'Save'
                  guard.setSecurity(val, guard.biometricsActive, guard.passcode)
                }}
              />
            </div>

            {guard.isEnabled && guard.isMobile && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between p-4 border rounded-xl bg-white shadow-sm">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <Fingerprint className="w-4 h-4 text-indigo-600" />
                      <Label className="text-base font-semibold">Biometrics (FaceID/TouchID)</Label>
                    </div>
                    <p className="text-sm text-muted-foreground">Use your phone's built-in sensors to unlock.</p>
                  </div>
                  <Switch 
                    checked={guard.biometricsActive}
                    onCheckedChange={(val) => {
                      haptics.soft()
                      guard.setSecurity(guard.isEnabled, val, guard.passcode)
                    }}
                  />
                </div>

                <div className="p-4 border rounded-xl bg-white shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <Lock className="w-4 h-4 text-indigo-600" />
                    <Label className="text-base font-semibold">Security PIN (6 Digits)</Label>
                  </div>
                  <div className="flex gap-2">
                    <Input 
                      type="password"
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="Enter 6-digit PIN"
                      value={guard.passcode || ''}
                      onChange={(e) => {
                         const val = e.target.value.replace(/\D/g, '').slice(0, 6)
                         guard.setSecurity(guard.isEnabled, guard.biometricsActive, val)
                      }}
                      className="max-w-[200px]"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            <div className="pt-4 border-t flex justify-end">
              <Button 
                onClick={() => {
                  guard.setSecurity(guard.isEnabled, guard.biometricsActive, guard.passcode)
                  toast({
                    title: "Security Configured",
                    description: "Your local device security settings have been updated.",
                  })
                }} 
                className="bg-indigo-600 hover:bg-indigo-700"
                disabled={!guard.isMobile}
              >
                <Save className="w-4 h-4 mr-2" />
                Save Security Settings
              </Button>
            </div>

            <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
               <p className="text-xs text-muted-foreground leading-relaxed">
                 <ShieldCheck className="w-3 h-3 inline mr-1 text-indigo-500" />
                 <strong>Elite Security Note:</strong> These settings are stored <em>only on this device</em>. Enabling this ensures that even if your phone is unlocked, your Silk Mart Admin Dashboard remains protected. Biometrics will use your phone's native Face ID or Fingerprint scanner.
               </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
