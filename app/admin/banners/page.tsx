'use client'

import { useState, useEffect } from 'react'
import { motion, Reorder } from 'framer-motion'
import { 
  Plus, Save, Trash2, Eye, EyeOff, GripVertical, Clock, 
  Copy, Check, Sparkles, Gift, Tag, Percent, Zap, Star, Heart, Flame,
  RefreshCw, Palette, ArrowLeft
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import Link from 'next/link'
import { PromoBanner, GRADIENT_PRESETS, ICON_OPTIONS, SIZE_PRESETS, FONT_SIZE_PRESETS, PADDING_PRESETS } from '@/components/UnifiedPromoBanner'

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<PromoBanner[]>([])
  const [editingBanner, setEditingBanner] = useState<PromoBanner | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  // Load banners
  useEffect(() => {
    const savedData = localStorage.getItem('ctg_promo_banners')
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData)
        // Merge with default fields to ensure new fields are present
        const mergedBanners = parsed.map((banner: PromoBanner) => ({
          size: 'normal',
          fontSize: 'base', 
          padding: 'normal',
          ...banner // Saved values override defaults
        }))
        setBanners(mergedBanners)
      } catch {
        setBanners(getDefaultBanners())
      }
    } else {
      setBanners(getDefaultBanners())
    }
  }, [])

  const getDefaultBanners = (): PromoBanner[] => [
    {
      id: '1',
      message: '🔥 FLASH SALE! Use code WELCOME10 for 10% OFF',
      code: 'WELCOME10',
      discount: 10,
      endTime: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
      preset: 'sunset',
      icon: 'sparkles',
      enabled: true,
      order: 0,
      size: 'normal',
      fontSize: 'base',
      padding: 'normal'
    },
    {
      id: '2',
      message: '🚚 FREE SHIPPING on orders over ৳2000!',
      code: 'FREESHIP',
      preset: 'ocean',
      icon: 'gift',
      enabled: true,
      order: 1,
      size: 'normal',
      fontSize: 'base',
      padding: 'normal'
    }
  ]

  const saveBanners = () => {
    setSaving(true)
    localStorage.setItem('ctg_promo_banners', JSON.stringify(banners))
    
    // Trigger refresh in other tabs and same tab
    window.dispatchEvent(new Event('bannersUpdated'))
    
    setTimeout(() => {
      setSaving(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }, 500)
  }

  const addNewBanner = () => {
    const newBanner: PromoBanner = {
      id: Date.now().toString(),
      message: 'New promotional banner',
      code: '',
      preset: 'sunset',
      icon: 'sparkles',
      enabled: true,
      order: banners.length,
      size: 'normal',
      fontSize: 'base',
      padding: 'normal'
    }
    setBanners([...banners, newBanner])
    setEditingBanner(newBanner)
  }

  const updateBanner = (id: string, updates: Partial<PromoBanner>) => {
    setBanners(banners.map(b => b.id === id ? { ...b, ...updates } : b))
    if (editingBanner?.id === id) {
      setEditingBanner({ ...editingBanner, ...updates })
    }
  }

  const deleteBanner = (id: string) => {
    setBanners(banners.filter(b => b.id !== id))
    if (editingBanner?.id === id) {
      setEditingBanner(null)
    }
  }

  const toggleBanner = (id: string) => {
    setBanners(banners.map(b => b.id === id ? { ...b, enabled: !b.enabled } : b))
  }

  const handleReorder = (newOrder: PromoBanner[]) => {
    setBanners(newOrder.map((b, i) => ({ ...b, order: i })))
  }

  const resetToDefaults = () => {
    if (confirm('Reset all banners to defaults? This will delete your custom banners.')) {
      const defaults = getDefaultBanners()
      setBanners(defaults)
      localStorage.setItem('ctg_promo_banners', JSON.stringify(defaults))
      window.dispatchEvent(new Event('bannersUpdated'))
    }
  }

  const getIconComponent = (iconName: string) => {
    const icons: Record<string, any> = {
      gift: Gift, sparkles: Sparkles, tag: Tag, percent: Percent,
      zap: Zap, star: Star, heart: Heart, flame: Flame
    }
    const IconComp = icons[iconName] || Sparkles
    return <IconComp className="w-5 h-5" />
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/admin" className="text-blue-600 hover:underline text-sm mb-2 inline-flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" /> Back to Admin
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">🎨 Banner Control Panel</h1>
            <p className="text-gray-600">Full control over your promotional banners</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={resetToDefaults}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            <Button onClick={addNewBanner}>
              <Plus className="w-4 h-4 mr-2" />
              Add Banner
            </Button>
            <Button 
              onClick={saveBanners} 
              disabled={saving}
              className={saved ? 'bg-green-600 hover:bg-green-700' : ''}
            >
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : saved ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Saved!
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save All
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Banners List */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Active Banners</CardTitle>
                <CardDescription>Drag to reorder. Click to edit.</CardDescription>
              </CardHeader>
              <CardContent>
                <Reorder.Group axis="y" values={banners} onReorder={handleReorder} className="space-y-3">
                  {banners.map((banner) => (
                    <Reorder.Item 
                      key={banner.id} 
                      value={banner}
                      className="cursor-grab active:cursor-grabbing"
                    >
                      <motion.div
                        whileHover={{ scale: 1.01 }}
                        className={`p-4 rounded-lg border-2 transition ${
                          editingBanner?.id === banner.id 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        } ${!banner.enabled ? 'opacity-50' : ''}`}
                        onClick={() => setEditingBanner(banner)}
                      >
                        <div className="flex items-center gap-3">
                          <GripVertical className="w-5 h-5 text-gray-400" />
                          
                          <div 
                            className={`w-10 h-10 rounded-full bg-gradient-to-r ${
                              GRADIENT_PRESETS[banner.preset as keyof typeof GRADIENT_PRESETS]
                            } flex items-center justify-center text-white`}
                          >
                            {getIconComponent(banner.icon)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{banner.message}</p>
                            {banner.code && (
                              <p className="text-sm text-gray-500">
                                Code: <span className="font-mono font-bold">{banner.code}</span>
                              </p>
                            )}
                          </div>
                          
                          <Switch
                            checked={banner.enabled}
                            onCheckedChange={() => toggleBanner(banner.id)}
                            onClick={(e) => e.stopPropagation()}
                          />
                          
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteBanner(banner.id)
                            }}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </motion.div>
                    </Reorder.Item>
                  ))}
                </Reorder.Group>

                {banners.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <Palette className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No banners yet. Add one to get started!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Edit Panel */}
          <div>
            {editingBanner ? (
              <Card>
                <CardHeader>
                  <CardTitle>Edit Banner</CardTitle>
                  <CardDescription>Customize your promotional banner</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Preview */}
                  <div className={`p-4 rounded-lg bg-gradient-to-r ${
                    GRADIENT_PRESETS[editingBanner.preset as keyof typeof GRADIENT_PRESETS]
                  } text-white`}>
                    <div className="flex items-center justify-center gap-3 flex-wrap">
                      {getIconComponent(editingBanner.icon)}
                      <span className="font-bold">{editingBanner.message}</span>
                      {editingBanner.code && (
                        <span className="bg-white text-gray-900 px-3 py-1 rounded-full font-bold text-sm">
                          {editingBanner.code}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Message */}
                  <div className="space-y-2">
                    <Label>Banner Message</Label>
                    <Input
                      value={editingBanner.message}
                      onChange={(e) => updateBanner(editingBanner.id, { message: e.target.value })}
                      placeholder="Your promotional message..."
                    />
                    <p className="text-xs text-gray-500">Use emojis for more impact! 🔥 ✨ 🎁</p>
                  </div>

                  {/* Coupon Code */}
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Coupon Code (optional)</Label>
                      <Input
                        value={editingBanner.code || ''}
                        onChange={(e) => updateBanner(editingBanner.id, { code: e.target.value.toUpperCase() })}
                        placeholder="WELCOME10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Discount % (optional)</Label>
                      <Input
                        type="number"
                        value={editingBanner.discount || ''}
                        onChange={(e) => updateBanner(editingBanner.id, { discount: parseInt(e.target.value) || undefined })}
                        placeholder="10"
                      />
                    </div>
                  </div>

                  {/* End Time */}
                  <div className="space-y-2">
                    <Label>Countdown End Time (optional)</Label>
                    <Input
                      type="datetime-local"
                      value={editingBanner.endTime ? new Date(editingBanner.endTime).toISOString().slice(0, 16) : ''}
                      onChange={(e) => updateBanner(editingBanner.id, { 
                        endTime: e.target.value ? new Date(e.target.value).toISOString() : undefined 
                      })}
                    />
                    <p className="text-xs text-gray-500">Leave empty for no countdown timer</p>
                  </div>

                  {/* Design Preset */}
                  <div className="space-y-2">
                    <Label>Design Preset</Label>
                    <div className="grid grid-cols-3 gap-2 md:grid-cols-5">
                      {Object.entries(GRADIENT_PRESETS).map(([name, gradient]) => (
                        <button
                          key={name}
                          onClick={() => updateBanner(editingBanner.id, { preset: name })}
                          className={`h-12 rounded-lg bg-gradient-to-r ${gradient} relative ${
                            editingBanner.preset === name ? 'ring-2 ring-offset-2 ring-blue-500' : ''
                          }`}
                          title={name}
                        >
                          {editingBanner.preset === name && (
                            <Check className="w-4 h-4 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                          )}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 capitalize">{editingBanner.preset}</p>
                  </div>

                  {/* Icon */}
                  <div className="space-y-2">
                    <Label>Icon</Label>
                    <div className="grid grid-cols-4 gap-2 md:grid-cols-8">
                      {ICON_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => updateBanner(editingBanner.id, { icon: opt.value })}
                          className={`h-10 rounded-lg flex items-center justify-center border-2 transition ${
                            editingBanner.icon === opt.value 
                              ? 'border-blue-500 bg-blue-50 text-blue-600' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          title={opt.label}
                        >
                          <opt.icon className="w-5 h-5" />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Size Controls */}
                  <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-gray-700">Size Controls</h4>
                    
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      {/* Banner Height */}
                      <div className="space-y-2">
                        <Label className="text-xs">Banner Height</Label>
                        <div className="flex flex-col gap-1">
                          {(['compact', 'normal', 'large'] as const).map((size) => (
                            <button
                              key={size}
                              onClick={() => updateBanner(editingBanner.id, { size })}
                              className={`py-1 px-2 text-xs rounded border transition capitalize ${
                                (editingBanner.size || 'normal') === size
                                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              {size}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Font Size */}
                      <div className="space-y-2">
                        <Label className="text-xs">Text Size</Label>
                        <div className="flex flex-col gap-1">
                          {(['sm', 'base', 'lg', 'xl'] as const).map((fs) => (
                            <button
                              key={fs}
                              onClick={() => updateBanner(editingBanner.id, { fontSize: fs })}
                              className={`py-1 px-2 text-xs rounded border transition uppercase ${
                                (editingBanner.fontSize || 'base') === fs
                                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              {fs}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Padding */}
                      <div className="space-y-2">
                        <Label className="text-xs">Padding</Label>
                        <div className="flex flex-col gap-1">
                          {(['tight', 'normal', 'relaxed'] as const).map((pad) => (
                            <button
                              key={pad}
                              onClick={() => updateBanner(editingBanner.id, { padding: pad })}
                              className={`py-1 px-2 text-xs rounded border transition capitalize ${
                                (editingBanner.padding || 'normal') === pad
                                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              {pad}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-4 border-t">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setEditingBanner(null)}
                    >
                      Done Editing
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => deleteBanner(editingBanner.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="h-full flex items-center justify-center">
                <CardContent className="text-center py-16">
                  <Palette className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500 text-lg">Select a banner to edit</p>
                  <p className="text-gray-400 text-sm mt-2">Or create a new one</p>
                  <Button className="mt-4" onClick={addNewBanner}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Banner
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Quick Tips */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-lg">💡 Quick Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="font-semibold text-blue-800">Use Emojis</p>
                <p className="text-blue-600">Emojis like 🔥 ✨ 🎁 make banners more eye-catching</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="font-semibold text-green-800">Set Countdown</p>
                <p className="text-green-600">Urgency increases conversions - add end times to flash sales</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="font-semibold text-purple-800">Drag to Reorder</p>
                <p className="text-purple-600">The first banner shows first - reorder for priority</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
