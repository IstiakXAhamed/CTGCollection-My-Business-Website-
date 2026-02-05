'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { 
  Bot, Loader2, Save, CheckCircle2, XCircle, AlertTriangle,
  Sparkles, MessageSquare, FileText, ShoppingBag, BarChart3, Eye, EyeOff,
  Image, Megaphone, Users, TrendingUp, Package, ShieldAlert, Percent,
  HelpCircle, Ruler, Hash, Mail, Globe, Wand2
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface AIFeature {
  id: string
  name: string
  description: string
  icon: any
  enabled: boolean
  category: 'core' | 'product' | 'marketing' | 'analytics' | 'customer'
}

const AI_FEATURES: AIFeature[] = [
  // Core Features
  { id: 'product_assist', name: 'Product AI Assistant', description: 'Smart descriptions with tone & language control', icon: ShoppingBag, enabled: true, category: 'core' },
  { id: 'chat_assist', name: 'Customer Support AI', description: 'AI-powered chat response suggestions', icon: MessageSquare, enabled: true, category: 'core' },
  { id: 'review_moderation', name: 'Review Moderation', description: 'Spam detection + auto-response generator', icon: FileText, enabled: true, category: 'core' },
  
  // Product Features
  { id: 'image_studio', name: 'AI Image Studio', description: 'Smart image search with Gemini keywords', icon: Image, enabled: true, category: 'product' },
  { id: 'magic_rewrite', name: 'Magic Rewrite', description: 'Improve/expand/shorten any text', icon: Wand2, enabled: true, category: 'product' },
  { id: 'faq_generator', name: 'FAQ Generator', description: 'Auto-create product Q&A sections', icon: HelpCircle, enabled: true, category: 'product' },
  { id: 'size_recommender', name: 'Size Recommender', description: 'Help customers pick the right size', icon: Ruler, enabled: true, category: 'product' },
  { id: 'bundle_suggester', name: 'Bundle Suggester', description: 'AI-powered cross-sell recommendations', icon: Package, enabled: true, category: 'product' },
  
  // Marketing Features
  { id: 'marketing_ai', name: 'Marketing AI Center', description: 'Facebook posts, emails, ad copy in BN/EN', icon: Megaphone, enabled: true, category: 'marketing' },
  { id: 'hashtag_generator', name: 'Hashtag Generator', description: 'Trending social media hashtags', icon: Hash, enabled: true, category: 'marketing' },
  { id: 'seo_generator', name: 'SEO Generator', description: 'Meta titles, descriptions, keywords', icon: Sparkles, enabled: true, category: 'marketing' },
  { id: 'email_ai', name: 'Order Email AI', description: 'Shipping updates in Bengali/English', icon: Mail, enabled: true, category: 'marketing' },
  
  // Analytics Features  
  { id: 'analytics_insights', name: 'Analytics Insights', description: 'Smart insights from sales data', icon: BarChart3, enabled: true, category: 'analytics' },
  { id: 'inventory_forecast', name: 'Inventory Forecaster', description: 'Predict stock needs & reorder points', icon: TrendingUp, enabled: true, category: 'analytics' },
  { id: 'discount_optimizer', name: 'Discount Optimizer', description: 'Calculate optimal sale prices', icon: Percent, enabled: true, category: 'analytics' },
  { id: 'fraud_detector', name: 'Fraud Detector', description: 'Flag suspicious orders with risk scores', icon: ShieldAlert, enabled: true, category: 'analytics' },
  
  // Customer Features
  { id: 'customer_persona', name: 'Customer Persona AI', description: 'Segment customers by behavior', icon: Users, enabled: true, category: 'customer' },
  { id: 'multi_language', name: 'Multi-Language AI', description: 'Bengali/English with tone control', icon: Globe, enabled: true, category: 'customer' },
]

export function AISettings() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [apiKeyValid, setApiKeyValid] = useState<boolean | null>(null)
  const [showApiKey, setShowApiKey] = useState(false)
  const [settings, setSettings] = useState({
    enabled: true,
    apiKey: '',
    features: {} as Record<string, boolean>,
    maxTokens: 1024,
    temperature: 0.7,
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/ai-settings')
      if (res.ok) {
        const data = await res.json()
        setSettings({
          enabled: typeof data.enabled === 'boolean' ? data.enabled : true,
          apiKey: data.apiKey || '',
          features: data.features || {},
          maxTokens: data.maxTokens || 1024,
          temperature: data.temperature || 0.7,
        })
        setApiKeyValid(data.apiKeyValid)
      }
    } catch (error) {
      console.error('Failed to fetch AI settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const testApiKey = async () => {
    if (!settings.apiKey) {
      toast({ title: 'Error', description: 'Enter an API key first', variant: 'destructive' })
      return
    }

    setTesting(true)
    try {
      const res = await fetch('/api/admin/ai-settings/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: settings.apiKey })
      })
      
      const data = await res.json()
      setApiKeyValid(data.valid)
      
      if (data.valid) {
        toast({ title: 'Success!', description: 'API key is valid and working!' })
      } else {
        toast({ title: 'Invalid', description: data.error || 'API key test failed', variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to test API key', variant: 'destructive' })
      setApiKeyValid(false)
    } finally {
      setTesting(false)
    }
  }

  const toggleFeature = (featureId: string, enabled: boolean) => {
    setSettings(prev => ({
      ...prev,
      features: { ...prev.features, [featureId]: enabled }
    }))
  }

  const toggleGlobal = (enabled: boolean) => {
    setSettings(prev => ({
      ...prev,
      enabled
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/ai-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })

      if (res.ok) {
        toast({ title: 'Saved!', description: 'AI settings updated successfully.' })
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

  if (loading) {
    return (
      <Card className="border-2 border-indigo-200">
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-2 border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-indigo-800">
              <Bot className="w-6 h-6" />
              AI Settings (Gemini)
            </CardTitle>
            <CardDescription>
              Configure Google Gemini AI features across your site
            </CardDescription>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border shadow-sm">
                <span className={`text-sm font-medium ${settings.enabled ? 'text-green-600' : 'text-gray-500'}`}>
                    {settings.enabled ? 'Integration Active' : 'Integration Disabled'}
                </span>
                <Switch
                    checked={settings.enabled}
                    onCheckedChange={toggleGlobal}
                />
            </div>
            <Button onClick={handleSave} disabled={saving} className="bg-indigo-600 hover:bg-indigo-700 w-full sm:w-auto">
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                Save Settings
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className={`space-y-6 ${!settings.enabled ? 'opacity-60 pointer-events-none' : ''}`}>
        {/* API Key Configuration */}
        <div className="p-4 bg-white rounded-lg border space-y-4">
          <h4 className="font-semibold text-gray-900 flex items-center gap-2">
            🔑 API Key Configuration
            {apiKeyValid === true && <Badge className="bg-green-100 text-green-700"><CheckCircle2 className="w-3 h-3 mr-1" />Valid</Badge>}
            {apiKeyValid === false && <Badge className="bg-red-100 text-red-700"><XCircle className="w-3 h-3 mr-1" />Invalid</Badge>}
          </h4>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Input
                type={showApiKey ? 'text' : 'password'}
                placeholder="Enter your Google AI API Key"
                value={settings.apiKey}
                onChange={(e) => setSettings(prev => ({ ...prev, apiKey: e.target.value }))}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <Button 
              variant="outline" 
              onClick={testApiKey} 
              disabled={testing || !settings.apiKey}
              className="w-full sm:w-auto"
            >
              {testing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Test Key
            </Button>
          </div>
          
          <p className="text-xs text-gray-500">
            Get your API key from{' '}
            <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
              Google AI Studio
            </a>
          </p>
        </div>

        {/* AI Features Toggle - Grouped by Category */}
        <div className="space-y-6">
          <h4 className="font-semibold text-gray-900 text-lg">⚡ AI Features ({AI_FEATURES.length} Available)</h4>
          
          {/* Category: Core */}
          <div className="space-y-2">
            <h5 className="text-sm font-bold text-blue-700 flex items-center gap-2">🔷 Core Features</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {AI_FEATURES.filter(f => f.category === 'core').map(feature => {
                const Icon = feature.icon
                const isEnabled = settings.features[feature.id] ?? feature.enabled
                return (
                  <div key={feature.id} className={`p-3 rounded-lg border transition-all ${isEnabled ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Icon className={`w-4 h-4 ${isEnabled ? 'text-blue-600' : 'text-gray-400'}`} />
                        <div>
                          <p className="font-medium text-xs">{feature.name}</p>
                          <p className="text-[10px] text-gray-500 line-clamp-1">{feature.description}</p>
                        </div>
                      </div>
                      <Switch checked={isEnabled} onCheckedChange={(checked) => toggleFeature(feature.id, checked)} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Category: Product */}
          <div className="space-y-2">
            <h5 className="text-sm font-bold text-purple-700 flex items-center gap-2">📦 Product AI</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {AI_FEATURES.filter(f => f.category === 'product').map(feature => {
                const Icon = feature.icon
                const isEnabled = settings.features[feature.id] ?? feature.enabled
                return (
                  <div key={feature.id} className={`p-3 rounded-lg border transition-all ${isEnabled ? 'bg-purple-50 border-purple-200' : 'bg-gray-50 border-gray-200'}`}>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Icon className={`w-4 h-4 ${isEnabled ? 'text-purple-600' : 'text-gray-400'}`} />
                        <div>
                          <p className="font-medium text-xs">{feature.name}</p>
                          <p className="text-[10px] text-gray-500 line-clamp-1">{feature.description}</p>
                        </div>
                      </div>
                      <Switch checked={isEnabled} onCheckedChange={(checked) => toggleFeature(feature.id, checked)} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Category: Marketing */}
          <div className="space-y-2">
            <h5 className="text-sm font-bold text-orange-700 flex items-center gap-2">📣 Marketing AI</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {AI_FEATURES.filter(f => f.category === 'marketing').map(feature => {
                const Icon = feature.icon
                const isEnabled = settings.features[feature.id] ?? feature.enabled
                return (
                  <div key={feature.id} className={`p-3 rounded-lg border transition-all ${isEnabled ? 'bg-orange-50 border-orange-200' : 'bg-gray-50 border-gray-200'}`}>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Icon className={`w-4 h-4 ${isEnabled ? 'text-orange-600' : 'text-gray-400'}`} />
                        <div>
                          <p className="font-medium text-xs">{feature.name}</p>
                          <p className="text-[10px] text-gray-500 line-clamp-1">{feature.description}</p>
                        </div>
                      </div>
                      <Switch checked={isEnabled} onCheckedChange={(checked) => toggleFeature(feature.id, checked)} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Category: Analytics */}
          <div className="space-y-2">
            <h5 className="text-sm font-bold text-green-700 flex items-center gap-2">📊 Analytics AI</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {AI_FEATURES.filter(f => f.category === 'analytics').map(feature => {
                const Icon = feature.icon
                const isEnabled = settings.features[feature.id] ?? feature.enabled
                return (
                  <div key={feature.id} className={`p-3 rounded-lg border transition-all ${isEnabled ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Icon className={`w-4 h-4 ${isEnabled ? 'text-green-600' : 'text-gray-400'}`} />
                        <div>
                          <p className="font-medium text-xs">{feature.name}</p>
                          <p className="text-[10px] text-gray-500 line-clamp-1">{feature.description}</p>
                        </div>
                      </div>
                      <Switch checked={isEnabled} onCheckedChange={(checked) => toggleFeature(feature.id, checked)} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Category: Customer */}
          <div className="space-y-2">
            <h5 className="text-sm font-bold text-rose-700 flex items-center gap-2">👥 Customer AI</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {AI_FEATURES.filter(f => f.category === 'customer').map(feature => {
                const Icon = feature.icon
                const isEnabled = settings.features[feature.id] ?? feature.enabled
                return (
                  <div key={feature.id} className={`p-3 rounded-lg border transition-all ${isEnabled ? 'bg-rose-50 border-rose-200' : 'bg-gray-50 border-gray-200'}`}>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Icon className={`w-4 h-4 ${isEnabled ? 'text-rose-600' : 'text-gray-400'}`} />
                        <div>
                          <p className="font-medium text-xs">{feature.name}</p>
                          <p className="text-[10px] text-gray-500 line-clamp-1">{feature.description}</p>
                        </div>
                      </div>
                      <Switch checked={isEnabled} onCheckedChange={(checked) => toggleFeature(feature.id, checked)} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Advanced Settings */}
        <div className="p-4 bg-white rounded-lg border space-y-4">
          <h4 className="font-semibold text-gray-900">⚙️ Advanced Settings</h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Max Tokens</Label>
              <Input
                type="number"
                value={settings.maxTokens}
                onChange={(e) => setSettings(prev => ({ ...prev, maxTokens: parseInt(e.target.value) || 1024 }))}
                min={256}
                max={8192}
              />
              <p className="text-xs text-gray-500">Maximum response length (256-8192)</p>
            </div>
            <div className="space-y-2">
              <Label>Temperature</Label>
              <Input
                type="number"
                step="0.1"
                value={settings.temperature}
                onChange={(e) => setSettings(prev => ({ ...prev, temperature: parseFloat(e.target.value) || 0.7 }))}
                min={0}
                max={1}
              />
              <p className="text-xs text-gray-500">Creativity level (0 = focused, 1 = creative)</p>
            </div>
          </div>
        </div>

        {/* Usage Info */}
        {!settings.apiKey && (
          <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-amber-800">API Key Required</p>
                <p className="text-sm text-amber-700">
                  AI features are running in fallback mode with limited capabilities. 
                  Add your Gemini API key for full AI functionality.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
