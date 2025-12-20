'use client'

import { useState, useEffect } from 'react'
import { 
  Settings, Save, Loader2, Store, Mail, Phone, MapPin, Clock,
  Facebook, Instagram, Twitter, Youtube, Linkedin, Globe, FileText
} from 'lucide-react'
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'

export default function SiteSettingsPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState<any>({})

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/site-settings', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setSettings(data.settings || {})
      }
    } catch (err) {
      console.error('Failed to fetch settings:', err)
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/site-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(settings)
      })
      if (res.ok) {
        toast({ title: 'Settings saved!', description: 'Your site settings have been updated.' })
      } else {
        toast({ title: 'Error', description: 'Failed to save settings', variant: 'destructive' })
      }
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to save settings', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const update = (field: string, value: string) => {
    setSettings((prev: any) => ({ ...prev, [field]: value }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Globe className="w-8 h-8 text-blue-600" />
            Site Settings
          </h1>
          <p className="text-gray-600 mt-1">Manage your website content and information</p>
        </div>
        <Button onClick={saveSettings} disabled={saving} className="gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save All Changes
        </Button>
      </div>

      {/* Store Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Store className="w-5 h-5" /> Store Information</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Store Name</Label>
            <Input value={settings.storeName || ''} onChange={(e) => update('storeName', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Tagline</Label>
            <Input value={settings.storeTagline || ''} onChange={(e) => update('storeTagline', e.target.value)} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Store Description</Label>
            <Textarea value={settings.storeDescription || ''} onChange={(e) => update('storeDescription', e.target.value)} rows={3} />
          </div>
        </CardContent>
      </Card>

      {/* Contact Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Mail className="w-5 h-5" /> Contact Information</CardTitle>
          <CardDescription>This appears on the Contact page and Footer</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Primary Email</Label>
            <Input value={settings.storeEmail || ''} onChange={(e) => update('storeEmail', e.target.value)} placeholder="support@example.com" />
          </div>
          <div className="space-y-2">
            <Label>Secondary Email</Label>
            <Input value={settings.email2 || ''} onChange={(e) => update('email2', e.target.value)} placeholder="sales@example.com" />
          </div>
          <div className="space-y-2">
            <Label>Primary Phone</Label>
            <Input value={settings.storePhone || ''} onChange={(e) => update('storePhone', e.target.value)} placeholder="+880 1234 567890" />
          </div>
          <div className="space-y-2">
            <Label>Secondary Phone</Label>
            <Input value={settings.phone2 || ''} onChange={(e) => update('phone2', e.target.value)} placeholder="+880 9876 543210" />
          </div>
          <div className="space-y-2">
            <Label>Address Line 1</Label>
            <Input value={settings.storeAddress || ''} onChange={(e) => update('storeAddress', e.target.value)} placeholder="Chittagong, Bangladesh" />
          </div>
          <div className="space-y-2">
            <Label>Address Line 2</Label>
            <Input value={settings.addressLine2 || ''} onChange={(e) => update('addressLine2', e.target.value)} placeholder="GEC Circle, 4000" />
          </div>
        </CardContent>
      </Card>

      {/* Working Hours */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Clock className="w-5 h-5" /> Working Hours</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Working Days</Label>
            <Input value={settings.workingDays || ''} onChange={(e) => update('workingDays', e.target.value)} placeholder="Sat - Thu" />
          </div>
          <div className="space-y-2">
            <Label>Working Hours</Label>
            <Input value={settings.workingHours || ''} onChange={(e) => update('workingHours', e.target.value)} placeholder="9AM - 9PM" />
          </div>
          <div className="space-y-2">
            <Label>Off Days / Special Hours</Label>
            <Input value={settings.offDays || ''} onChange={(e) => update('offDays', e.target.value)} placeholder="Friday: 3PM - 9PM" />
          </div>
        </CardContent>
      </Card>

      {/* Social Links */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Globe className="w-5 h-5" /> Social Media Links</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2"><Facebook className="w-4 h-4 text-blue-600" /> Facebook</Label>
            <Input value={settings.facebook || ''} onChange={(e) => update('facebook', e.target.value)} placeholder="https://facebook.com/..." />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2"><Instagram className="w-4 h-4 text-pink-600" /> Instagram</Label>
            <Input value={settings.instagram || ''} onChange={(e) => update('instagram', e.target.value)} placeholder="https://instagram.com/..." />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2"><Twitter className="w-4 h-4 text-blue-400" /> Twitter</Label>
            <Input value={settings.twitter || ''} onChange={(e) => update('twitter', e.target.value)} placeholder="https://twitter.com/..." />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2"><Youtube className="w-4 h-4 text-red-600" /> YouTube</Label>
            <Input value={settings.youtube || ''} onChange={(e) => update('youtube', e.target.value)} placeholder="https://youtube.com/..." />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2"><Linkedin className="w-4 h-4 text-blue-700" /> LinkedIn</Label>
            <Input value={settings.linkedin || ''} onChange={(e) => update('linkedin', e.target.value)} placeholder="https://linkedin.com/..." />
          </div>
          <div className="space-y-2">
            <Label>WhatsApp Number</Label>
            <Input value={settings.whatsapp || ''} onChange={(e) => update('whatsapp', e.target.value)} placeholder="+8801991523289" />
          </div>
        </CardContent>
      </Card>

      {/* About Page */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><FileText className="w-5 h-5" /> About Page Content</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>About Title</Label>
            <Input value={settings.aboutTitle || ''} onChange={(e) => update('aboutTitle', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>About Content</Label>
            <Textarea value={settings.aboutContent || ''} onChange={(e) => update('aboutContent', e.target.value)} rows={5} placeholder="Main about page content..." />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Our Mission</Label>
              <Textarea value={settings.aboutMission || ''} onChange={(e) => update('aboutMission', e.target.value)} rows={3} />
            </div>
            <div className="space-y-2">
              <Label>Our Vision</Label>
              <Textarea value={settings.aboutVision || ''} onChange={(e) => update('aboutVision', e.target.value)} rows={3} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <Card>
        <CardHeader>
          <CardTitle>Footer Content</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Footer About Text</Label>
            <Textarea value={settings.footerAbout || ''} onChange={(e) => update('footerAbout', e.target.value)} rows={3} placeholder="Short description for footer..." />
          </div>
          <div className="space-y-2">
            <Label>Copyright Text</Label>
            <Input value={settings.copyrightText || ''} onChange={(e) => update('copyrightText', e.target.value)} />
          </div>
        </CardContent>
      </Card>

      {/* SEO */}
      <Card>
        <CardHeader>
          <CardTitle>SEO Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Meta Title</Label>
            <Input value={settings.metaTitle || ''} onChange={(e) => update('metaTitle', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Meta Description</Label>
            <Textarea value={settings.metaDescription || ''} onChange={(e) => update('metaDescription', e.target.value)} rows={2} />
          </div>
          <div className="space-y-2">
            <Label>Meta Keywords (comma separated)</Label>
            <Input value={settings.metaKeywords || ''} onChange={(e) => update('metaKeywords', e.target.value)} />
          </div>
        </CardContent>
      </Card>

      {/* Map */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><MapPin className="w-5 h-5" /> Google Maps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label>Google Maps Embed Code</Label>
            <Textarea 
              value={settings.googleMapsEmbed || ''} 
              onChange={(e) => update('googleMapsEmbed', e.target.value)} 
              rows={4} 
              placeholder='<iframe src="https://www.google.com/maps/embed?..." ...></iframe>'
            />
          </div>
        </CardContent>
      </Card>

      {/* Login Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">🔐 Login Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-semibold">Unified Login Page</p>
              <p className="text-sm text-muted-foreground">
                When ON: Single login page auto-detects if user is admin/customer and redirects accordingly.
                <br />
                When OFF: Admins must use the separate /admin/login page.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSettings((prev: any) => ({ ...prev, unifiedLogin: !prev.unifiedLogin }))}
              className={`relative w-14 h-8 rounded-full transition-colors ${
                settings.unifiedLogin ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                  settings.unifiedLogin ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            💡 Tip: The /admin/login page always works as a backup for administrators.
          </p>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={saveSettings} disabled={saving} size="lg" className="gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save All Changes
        </Button>
      </div>
    </div>
  )
}
