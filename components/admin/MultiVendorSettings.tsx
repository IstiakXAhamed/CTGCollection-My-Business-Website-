'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { Store, Loader2, Save } from 'lucide-react'

export function MultiVendorSettings() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState<any>({
    multiVendorEnabled: false,
    storeName: 'CTG Collection'
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings/public')
      const data = await res.json()
      setSettings({
        multiVendorEnabled: data.multiVendorEnabled ?? false,
        storeName: data.storeName || 'CTG Collection'
      })
    } catch (error) {
      console.error('Failed to fetch settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggle = async () => {
    const newValue = !settings.multiVendorEnabled
    setSettings((prev: any) => ({ ...prev, multiVendorEnabled: newValue }))
    
    setSaving(true)
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ multiVendorEnabled: newValue })
      })

      if (res.ok) {
        toast({ 
          title: 'Saved', 
          description: newValue ? 'Multi-Vendor Mode enabled!' : 'Single Vendor Mode enabled!' 
        })
      } else {
        // Revert on error
        setSettings((prev: any) => ({ ...prev, multiVendorEnabled: !newValue }))
        toast({ title: 'Error', description: 'Failed to save settings', variant: 'destructive' })
      }
    } catch (error) {
      setSettings((prev: any) => ({ ...prev, multiVendorEnabled: !newValue }))
      toast({ title: 'Error', description: 'Failed to save settings', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Store className="w-5 h-5 text-purple-600" />
          Multi-Vendor Marketplace
        </CardTitle>
        <CardDescription>
          Enable multi-vendor mode to transform your store into a marketplace with multiple sellers and shops
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white rounded-lg border gap-3">
          <div>
            <h4 className="font-semibold text-gray-900">Multi-Vendor Mode</h4>
            <p className="text-sm text-gray-500">
              {settings.multiVendorEnabled 
                ? '✅ Active: Products show individual shop/seller info' 
                : '❌ Disabled: All products sold under your store name'}
            </p>
          </div>
          <button
            onClick={handleToggle}
            disabled={saving}
            className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors flex-shrink-0 ${
              settings.multiVendorEnabled ? 'bg-purple-600' : 'bg-gray-300'
            } ${saving ? 'opacity-50' : ''}`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform ${
                settings.multiVendorEnabled ? 'translate-x-8' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
        
        {settings.multiVendorEnabled && (
          <div className="p-4 bg-purple-100 rounded-lg border border-purple-200">
            <h4 className="font-semibold text-purple-800 mb-2">🏪 Marketplace Mode Active</h4>
            <ul className="text-sm text-purple-700 space-y-1">
              <li>• Each seller can have their own shop profile</li>
              <li>• Products display "Sold by: [Shop Name]"</li>
              <li>• Customers can visit individual shop pages</li>
              <li>• Go to <strong>Admin → Shops</strong> to manage shops</li>
            </ul>
          </div>
        )}
        
        {!settings.multiVendorEnabled && (
          <div className="p-4 bg-gray-100 rounded-lg border border-gray-200">
            <h4 className="font-semibold text-gray-800 mb-2">🛒 Single Vendor Mode</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• All products sold under "{settings.storeName}"</li>
              <li>• No individual shop pages</li>
              <li>• Simpler customer experience</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
