'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check, FileText, Loader2, Eye, X, CheckCircle2, XCircle, Tag, Star, Trash2, EyeOff, RotateCcw } from 'lucide-react'

// Quality Grades
type Grade = 'exceptional' | 'excellent' | 'great' | 'good'

const GRADE_INFO = {
  exceptional: { label: 'Exceptional', color: 'bg-gradient-to-r from-yellow-400 to-amber-500', icon: '👑', stars: 5 },
  excellent: { label: 'Excellent', color: 'bg-gradient-to-r from-purple-500 to-pink-500', icon: '⭐', stars: 4 },
  great: { label: 'Great', color: 'bg-gradient-to-r from-blue-500 to-cyan-500', icon: '✨', stars: 3 },
  good: { label: 'Good', color: 'bg-gradient-to-r from-green-500 to-emerald-500', icon: '👍', stars: 2 },
}

// Templates with grades and proper logo background colors
const RECEIPT_TEMPLATES = [
  // EXCEPTIONAL - Top tier, stunning designs
  { id: '36', name: 'Classic Purple Gradient', description: 'Your favorite! Purple gradient with emojis', category: 'Brand', grade: 'exceptional' as Grade, preview: { header: '#667eea', body: '#fff', text: '#fff', logoBg: 'transparent' } },
  { id: '1', name: 'Classic Professional', description: 'Clean blue business invoice with premium layout', category: 'Professional', grade: 'exceptional' as Grade, preview: { header: '#1a365d', body: '#fff', text: '#fff', logoBg: '#fff' } },
  { id: '6', name: 'Dark Luxury', description: 'Elegant black with gold accents - Premium feel', category: 'Luxury', grade: 'exceptional' as Grade, preview: { header: '#0a0a0a', body: '#1a1a1a', text: '#d4af37', logoBg: '#1a1a1a' } },
  { id: '24', name: 'Luxury Serif', description: 'High-end boutique elegance - Dark & Gold', category: 'Luxury', grade: 'exceptional' as Grade, preview: { header: '#111', body: '#1a1a1a', text: '#d4af37', logoBg: '#111' } },
  { id: '26', name: 'Signature Brand', description: 'Artistic layout with signature style', category: 'Creative', grade: 'exceptional' as Grade, preview: { header: '#fff', body: '#fff', text: '#e74c3c', logoBg: '#fff' } },
  { id: '20', name: 'Signature CTG', description: 'Premium brand signature with gold details', category: 'Brand', grade: 'exceptional' as Grade, preview: { header: '#0f172a', body: '#fff', text: '#d4af37', logoBg: '#fff' } },
  
  // EXCELLENT - Beautiful and professional
  { id: '22', name: 'Editorial Minimalist', description: 'High-fashion editorial layout', category: 'Elegant', grade: 'excellent' as Grade, preview: { header: '#fff', body: '#f9f9f9', text: '#111', logoBg: '#fff' } },
  { id: '25', name: 'Warranty Shield', description: 'Trust-focused with verified badge details', category: 'Professional', grade: 'excellent' as Grade, preview: { header: '#0e7490', body: '#f3f6f8', text: '#fff', logoBg: '#0e7490' } },
  { id: '3', name: 'Elegant Cream', description: 'Warm ivory with gold accents - Sophisticated', category: 'Elegant', grade: 'excellent' as Grade, preview: { header: '#92400e', body: '#fffbeb', text: '#fff', logoBg: '#fffbeb' } },
  { id: '13', name: 'Ocean Blue', description: 'Deep blue professional - Trusted feel', category: 'Professional', grade: 'excellent' as Grade, preview: { header: '#0369a1', body: '#f0f9ff', text: '#fff', logoBg: '#f0f9ff' } },
  { id: '16', name: 'Purple Reign', description: 'Royal purple - Premium elegance', category: 'Elegant', grade: 'excellent' as Grade, preview: { header: '#5b21b6', body: '#f5f3ff', text: '#fff', logoBg: '#f5f3ff' } },
  { id: '15', name: 'Emerald Pro', description: 'Rich green - Fresh and professional', category: 'Professional', grade: 'excellent' as Grade, preview: { header: '#047857', body: '#ecfdf5', text: '#fff', logoBg: '#ecfdf5' } },
  { id: '21', name: 'Premium Minimal', description: 'Clean, elegant, monochrome with warranty focus', category: 'Professional', grade: 'excellent' as Grade, preview: { header: '#0f172a', body: '#fff', text: '#0f172a', logoBg: '#fff' } },
  
  // GREAT - Very good designs
  { id: '23', name: 'Architectural Grid', description: 'Technical blueprint aesthetic', category: 'Creative', grade: 'great' as Grade, preview: { header: '#333', body: '#f0f2f5', text: '#fff', logoBg: '#333' } },
  { id: '9', name: 'Split Invoice', description: 'Formal invoice style - Business ready', category: 'Professional', grade: 'great' as Grade, preview: { header: '#1e293b', body: '#f8fafc', text: '#fff', logoBg: '#f8fafc' } },
  { id: '14', name: 'Rose Elegant', description: 'Soft pink elegance - Feminine touch', category: 'Elegant', grade: 'great' as Grade, preview: { header: '#be185d', body: '#fdf2f8', text: '#fff', logoBg: '#fdf2f8' } },
  { id: '12', name: 'Executive Gray', description: 'Sophisticated gray - Corporate feel', category: 'Professional', grade: 'great' as Grade, preview: { header: '#374151', body: '#f9fafb', text: '#fff', logoBg: '#f9fafb' } },
  { id: '11', name: 'Gradient Banner', description: 'Vibrant gradient header - Modern style', category: 'Creative', grade: 'great' as Grade, preview: { header: '#3b82f6', body: '#f8fafc', text: '#fff', logoBg: '#f8fafc' } },
  { id: '4', name: 'Corporate Bold', description: 'Strong navy header - Executive style', category: 'Professional', grade: 'great' as Grade, preview: { header: '#0f172a', body: '#fff', text: '#fff', logoBg: '#fff' } },
  
  // GOOD - Solid designs
  { id: '5', name: 'Soft Luxe', description: 'Pink-purple gradients - Gentle luxury', category: 'Luxury', grade: 'good' as Grade, preview: { header: '#c026d3', body: '#fdf4ff', text: '#fff', logoBg: '#fdf4ff' } },
  { id: '8', name: 'Retro Dotted', description: 'Classic dotted borders - Vintage charm', category: 'Classic', grade: 'good' as Grade, preview: { header: '#a16207', body: '#fefce8', text: '#fff', logoBg: '#fefce8' } },
  { id: '10', name: 'Monogram', description: 'Large CTG watermark - Brand focused', category: 'Brand', grade: 'good' as Grade, preview: { header: '#1e3a5f', body: '#fff', text: '#fff', logoBg: '#fff' } },
  { id: '17', name: 'Amber Warm', description: 'Warm orange theme - Friendly feel', category: 'Creative', grade: 'good' as Grade, preview: { header: '#b45309', body: '#fffbeb', text: '#fff', logoBg: '#fffbeb' } },
  { id: '19', name: 'Teal Fresh', description: 'Fresh teal - Clean modern', category: 'Creative', grade: 'good' as Grade, preview: { header: '#0d9488', body: '#f0fdfa', text: '#fff', logoBg: '#f0fdfa' } },
]

const CATEGORIES = ['All', 'Professional', 'Elegant', 'Luxury', 'Creative', 'Classic', 'Brand']
const GRADES = ['all', 'exceptional', 'excellent', 'great', 'good'] as const

type Notification = { type: 'success' | 'error'; message: string } | null
type TierAssignment = { [tierId: string]: string }

export default function ReceiptTemplatesPage() {
  const [selectedTemplate, setSelectedTemplate] = useState('1')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [previewTemplate, setPreviewTemplate] = useState<string | null>(null)
  const [notification, setNotification] = useState<Notification>(null)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedGrade, setSelectedGrade] = useState<typeof GRADES[number]>('all')
  const [hiddenTemplates, setHiddenTemplates] = useState<Set<string>>(new Set())
  const [showHidden, setShowHidden] = useState(false)
  const [tiers, setTiers] = useState<any[]>([])
  const [tierAssignments, setTierAssignments] = useState<TierAssignment>({})
  const [savingTier, setSavingTier] = useState<string | null>(null)

  useEffect(() => {
    fetchCurrentTemplate()
    fetchTiers()
    // Load hidden templates from localStorage
    const saved = localStorage.getItem('hiddenReceiptTemplates')
    if (saved) setHiddenTemplates(new Set(JSON.parse(saved)))
  }, [])

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [notification])

  const fetchCurrentTemplate = async () => {
    try {
      const res = await fetch('/api/admin/settings/receipt-template', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setSelectedTemplate(data.templateId || '1')
      }
    } catch (error) {
      console.error('Failed to fetch template:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTiers = async () => {
    try {
      const res = await fetch('/api/admin/loyalty/tiers', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setTiers(data.tiers || [])
        const assignments: TierAssignment = {}
        data.tiers?.forEach((tier: any) => {
          assignments[tier.id] = tier.receiptTemplateId || '1'
        })
        setTierAssignments(assignments)
      }
    } catch { /* Tiers might not exist */ }
  }

  const showNotification = (type: 'success' | 'error', message: string) => setNotification({ type, message })

  const saveTemplate = async (templateId: string) => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/settings/receipt-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ templateId })
      })
      
      if (res.ok) {
        setSelectedTemplate(templateId)
        const template = RECEIPT_TEMPLATES.find(t => t.id === templateId)
        showNotification('success', `✓ Template changed to "${template?.name}"`)
      } else {
        showNotification('error', 'Failed to update template')
      }
    } catch {
      showNotification('error', 'Error saving template')
    } finally {
      setSaving(false)
    }
  }

  const hideTemplate = (templateId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const newHidden = new Set(hiddenTemplates)
    newHidden.add(templateId)
    setHiddenTemplates(newHidden)
    localStorage.setItem('hiddenReceiptTemplates', JSON.stringify(Array.from(newHidden)))
    const template = RECEIPT_TEMPLATES.find(t => t.id === templateId)
    showNotification('success', `"${template?.name}" hidden`)
  }

  const unhideTemplate = (templateId: string) => {
    const newHidden = new Set(hiddenTemplates)
    newHidden.delete(templateId)
    setHiddenTemplates(newHidden)
    localStorage.setItem('hiddenReceiptTemplates', JSON.stringify(Array.from(newHidden)))
  }

  const unhideAll = () => {
    setHiddenTemplates(new Set())
    localStorage.removeItem('hiddenReceiptTemplates')
    showNotification('success', 'All templates restored')
  }

  const saveTierTemplate = async (tierId: string, templateId: string) => {
    setSavingTier(tierId)
    try {
      const res = await fetch('/api/admin/loyalty/tiers/' + tierId, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ receiptTemplateId: templateId })
      })
      
      if (res.ok) {
        setTierAssignments(prev => ({ ...prev, [tierId]: templateId }))
        const tier = tiers.find(t => t.id === tierId)
        const template = RECEIPT_TEMPLATES.find(t => t.id === templateId)
        showNotification('success', `✓ ${tier?.name} tier now uses "${template?.name}"`)
      } else {
        showNotification('error', 'Failed to update tier template')
      }
    } catch {
      showNotification('error', 'Error saving tier template')
    } finally {
      setSavingTier(null)
    }
  }

  // Filter templates
  let filteredTemplates = RECEIPT_TEMPLATES.filter(t => !hiddenTemplates.has(t.id) || showHidden)
  if (selectedCategory !== 'All') filteredTemplates = filteredTemplates.filter(t => t.category === selectedCategory)
  if (selectedGrade !== 'all') filteredTemplates = filteredTemplates.filter(t => t.grade === selectedGrade)

  const hiddenCount = hiddenTemplates.size

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg animate-in slide-in-from-top-2 ${
          notification.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {notification.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
          <span className="font-medium">{notification.message}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Receipt Templates</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">Choose a receipt design. Hover/Tap to manage templates.</p>
        </div>
        {hiddenCount > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowHidden(!showHidden)} className="flex-1 sm:flex-none">
              <EyeOff className="w-4 h-4 mr-1" />
              {showHidden ? 'Hide' : 'Show'} ({hiddenCount})
            </Button>
            <Button variant="ghost" size="sm" onClick={unhideAll} className="flex-1 sm:flex-none">
              <RotateCcw className="w-4 h-4 mr-1" />
              Restore
            </Button>
          </div>
        )}
      </div>

      {/* Grade Filter */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-600">Filter by Quality:</p>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedGrade === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedGrade('all')}
          >
            All Grades
          </Button>
          {(Object.keys(GRADE_INFO) as Grade[]).map(grade => (
            <Button
              key={grade}
              variant={selectedGrade === grade ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedGrade(grade)}
              className={selectedGrade === grade ? GRADE_INFO[grade].color + ' border-0 text-white' : ''}
            >
              {GRADE_INFO[grade].icon} {GRADE_INFO[grade].label}
              <span className="ml-1 text-xs opacity-75">
                {'★'.repeat(GRADE_INFO[grade].stars)}
              </span>
            </Button>
          ))}
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map(cat => (
          <Button
            key={cat}
            variant={selectedCategory === cat ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(cat)}
          >
            <Tag className="w-3 h-3 mr-1" />
            {cat}
          </Button>
        ))}
      </div>

      {/* Templates Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            {filteredTemplates.length} Templates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredTemplates.map((template) => {
              const gradeInfo = GRADE_INFO[template.grade]
              const isHidden = hiddenTemplates.has(template.id)
              
              return (
                <div
                  key={template.id}
                  className={`relative rounded-xl border-2 transition-all overflow-hidden cursor-pointer group ${
                    isHidden ? 'opacity-50' :
                    selectedTemplate === template.id
                      ? 'border-blue-500 ring-2 ring-blue-200'
                      : 'border-gray-200 hover:border-gray-400 hover:shadow-lg'
                  }`}
                  onClick={() => !isHidden && saveTemplate(template.id)}
                >
                  {/* Grade Badge */}
                  <div className={`absolute top-0 left-0 right-0 h-1 ${gradeInfo.color}`} />
                  
                  {/* Fake Receipt Preview */}
                  <div className="aspect-[3/4] overflow-hidden">
                    {/* Header with Logo on proper background */}
                    <div 
                      className="h-1/3 flex flex-col items-center justify-center p-2"
                      style={{ background: template.preview.header }}
                    >
                      {/* Logo with matching background */}
                      <div 
                        className="rounded-lg p-1 mb-1"
                        style={{ background: template.preview.logoBg }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src="/logo.png"
                          alt="CTG"
                          className="h-6 w-auto object-contain"
                        />
                      </div>
                      <span 
                        className="text-[7px] font-bold tracking-wider"
                        style={{ color: template.preview.text }}
                      >
                        CTG COLLECTION
                      </span>
                    </div>
                    
                    {/* Body */}
                    <div 
                      className="h-1/2 p-2 space-y-1"
                      style={{ background: template.preview.body }}
                    >
                      <div className="flex justify-between text-[6px] text-gray-500">
                        <span>Order #CTG-12345</span>
                        <span>Dec 16, 2024</span>
                      </div>
                      <div className="border-t border-dashed my-1 border-gray-300" />
                      <div className="space-y-0.5">
                        <div className="flex justify-between text-[5px] text-gray-600">
                          <span>Premium T-Shirt x1</span>
                          <span>৳1,299</span>
                        </div>
                        <div className="flex justify-between text-[5px] text-gray-600">
                          <span>Designer Jeans x1</span>
                          <span>৳2,499</span>
                        </div>
                      </div>
                      <div className="border-t border-dashed border-gray-300 pt-1" />
                      <div className="flex justify-between text-[6px] font-bold text-gray-800">
                        <span>TOTAL</span>
                        <span>৳3,798</span>
                      </div>
                    </div>
                    
                    {/* Footer */}
                    <div 
                      className="h-1/6 flex items-center justify-center"
                      style={{ background: template.preview.header }}
                    >
                      <span className="text-[5px]" style={{ color: template.preview.text }}>
                        Thank you for shopping!
                      </span>
                    </div>
                  </div>
                  
                  {/* Info */}
                  <div className="p-2 bg-white border-t">
                    <div className="flex items-center gap-1 mb-0.5">
                      <span className="text-[10px]">{gradeInfo.icon}</span>
                      <h3 className="font-semibold text-xs truncate flex-1">{template.name}</h3>
                    </div>
                    <p className="text-[10px] text-muted-foreground truncate">{template.description}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <span className={`text-[8px] px-1.5 py-0.5 rounded text-white ${gradeInfo.color}`}>
                        {gradeInfo.label}
                      </span>
                      <span className="text-[8px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">
                        {template.category}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setPreviewTemplate(template.id)
                      }}
                      className="p-1.5 bg-black/60 rounded-full text-white hover:bg-black/80"
                      title="Preview"
                    >
                      <Eye className="w-3 h-3" />
                    </button>
                    {!isHidden ? (
                      <button
                        onClick={(e) => hideTemplate(template.id, e)}
                        className="p-1.5 bg-red-500/80 rounded-full text-white hover:bg-red-600"
                        title="Hide template"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          unhideTemplate(template.id)
                        }}
                        className="p-1.5 bg-green-500/80 rounded-full text-white hover:bg-green-600"
                        title="Restore template"
                      >
                        <RotateCcw className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  
                  {/* Selected Badge */}
                  {selectedTemplate === template.id && (
                    <div className="absolute top-3 left-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center shadow-md">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}

                  {/* Saving Overlay */}
                  {saving && (
                    <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
                      <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Tier-Based Template Assignment */}
      {tiers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5" />
              Template by Customer Tier
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Assign different receipt templates to different customer tiers.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tiers.map(tier => (
                <div key={tier.id} className="p-4 rounded-lg border bg-gray-50">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: tier.color || '#gray' }} />
                    <span className="font-semibold">{tier.name}</span>
                  </div>
                  <select
                    value={tierAssignments[tier.id] || '1'}
                    onChange={(e) => saveTierTemplate(tier.id, e.target.value)}
                    disabled={savingTier === tier.id}
                    className="w-full p-2 rounded border text-sm"
                  >
                    {RECEIPT_TEMPLATES.filter(t => !hiddenTemplates.has(t.id)).map(t => (
                      <option key={t.id} value={t.id}>
                        {GRADE_INFO[t.grade].icon} {t.name} ({t.category})
                      </option>
                    ))}
                  </select>
                  {savingTier === tier.id && (
                    <div className="flex items-center gap-1 mt-1 text-xs text-blue-600">
                      <Loader2 className="w-3 h-3 animate-spin" />Saving...
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Selection */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Default Template</p>
              <div className="flex items-center gap-2">
                {RECEIPT_TEMPLATES.find(t => t.id === selectedTemplate) && (
                  <span className="text-lg">{GRADE_INFO[RECEIPT_TEMPLATES.find(t => t.id === selectedTemplate)!.grade].icon}</span>
                )}
                <p className="text-xl font-bold">
                  {RECEIPT_TEMPLATES.find(t => t.id === selectedTemplate)?.name || 'Classic Professional'}
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={() => setPreviewTemplate(selectedTemplate)}>
              <Eye className="w-4 h-4 mr-2" />Preview Full Receipt
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="flex flex-col gap-4 border-b p-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-2">
                {RECEIPT_TEMPLATES.find(t => t.id === previewTemplate) && (
                  <span className={`px-2 py-1 rounded text-white text-sm ${GRADE_INFO[RECEIPT_TEMPLATES.find(t => t.id === previewTemplate)!.grade].color}`}>
                    {GRADE_INFO[RECEIPT_TEMPLATES.find(t => t.id === previewTemplate)!.grade].icon} {GRADE_INFO[RECEIPT_TEMPLATES.find(t => t.id === previewTemplate)!.grade].label}
                  </span>
                )}
                <h3 className="font-bold text-lg">
                  {RECEIPT_TEMPLATES.find(t => t.id === previewTemplate)?.name}
                </h3>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    saveTemplate(previewTemplate)
                    setPreviewTemplate(null)
                  }}
                  disabled={saving}
                  size="sm"
                >
                  <Check className="w-4 h-4 mr-1" />Use This Template
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setPreviewTemplate(null)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="p-2 sm:p-4 bg-gray-100 overflow-hidden flex items-center justify-center min-h-[400px]">
              <div className="relative w-full max-w-[380px] origin-top scale-[0.7] sm:scale-95 md:scale-100 transition-transform">
                <iframe
                  src={`/api/admin/preview-receipt?template=${previewTemplate}`}
                  className="w-full h-[600px] rounded-lg border bg-white shadow-2xl"
                  title="Receipt Preview"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
