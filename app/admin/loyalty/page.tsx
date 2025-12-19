'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAutoRefresh } from '@/hooks/useAutoRefresh'
import { 
  Crown, Star, Settings, Users, Gift, TrendingUp, 
  Edit2, Save, X, RefreshCw, DollarSign, Percent,
  Truck, Clock, Sparkles, Award, Plus, Trash2, Check
} from 'lucide-react'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatPrice } from '@/lib/utils'

interface LoyaltyTier {
  id: string
  name: string
  displayName: string
  minSpending: number
  discountPercent: number
  freeShipping: boolean
  freeShippingMin: number | null
  pointsMultiplier: number
  prioritySupport: boolean
  earlyAccess: boolean
  exclusiveDeals: boolean
  birthdayBonus: number
  color: string
  icon?: string | null
  isActive: boolean
  _count?: { members: number }
}

interface LoyaltySettings {
  id: string
  isEnabled: boolean
  pointsPerTaka: number
  pointsToTakaRatio: number
  referralBonusReferrer: number
  referralBonusReferred: number
  minimumRedeemPoints: number
}

// Icon options for tier badges - matching premium animations
const TIER_ICONS = [
  { name: 'bronze', label: 'Bronze', emoji: '🛡️' },
  { name: 'silver', label: 'Silver', emoji: '🛡️' },
  { name: 'gold', label: 'Gold', emoji: '👑' },
  { name: 'platinum', label: 'Platinum', emoji: '👑' },
  { name: 'diamond', label: 'Diamond', emoji: '💎' },
  { name: 'emerald', label: 'Emerald', emoji: '🌿' },
  { name: 'ruby', label: 'Ruby', emoji: '❤️‍🔥' },
  { name: 'sapphire', label: 'Sapphire', emoji: '💠' },
  { name: 'obsidian', label: 'Obsidian', emoji: '🖤' },
  { name: 'legendary', label: 'Legendary', emoji: '👑' }
]

const defaultTierForm = {
  name: '',
  displayName: '',
  minSpending: 0,
  discountPercent: 0,
  freeShipping: false,
  freeShippingMin: null as number | null,
  pointsMultiplier: 1,
  prioritySupport: false,
  earlyAccess: false,
  exclusiveDeals: false,
  birthdayBonus: 0,
  color: '#CD7F32',
  icon: 'medal' as string | null,
  isActive: true
}

export default function AdminLoyaltyPage() {
  const [settings, setSettings] = useState<LoyaltySettings | null>(null)
  const [tiers, setTiers] = useState<LoyaltyTier[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editMode, setEditMode] = useState(false)
  
  // Tier Modal State
  const [showTierModal, setShowTierModal] = useState(false)
  const [editingTierId, setEditingTierId] = useState<string | null>(null)
  const [tierForm, setTierForm] = useState(defaultTierForm)
  const [tierSaving, setTierSaving] = useState(false)

  const memoizedFetchData = useCallback(() => fetchData(), [])
  
  useEffect(() => {
    fetchData()
  }, [])

  // Auto-refresh every 30 seconds
  useAutoRefresh(memoizedFetchData)

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/loyalty', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setSettings(data.settings)
        setTiers(data.tiers || [])
        setStats(data.stats)
      }
    } catch (err) {
      console.error('Failed to fetch loyalty data:', err)
    } finally {
      setLoading(false)
    }
  }

  const seedTiers = async () => {
    if (!confirm('Create 10 premium loyalty tiers (Bronze to Legendary)?')) return
    try {
      const res = await fetch('/api/admin/loyalty', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action: 'seed_tiers' })
      })
      if (res.ok) {
        await fetchData()
        alert('Premium tiers created!')
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to create tiers')
      }
    } catch (err) {
      alert('Failed to seed tiers')
    }
  }

  const resetTiers = async () => {
    if (!confirm('⚠️ WARNING: This will DELETE all existing tiers and recreate 10 premium tiers with correct values.\n\nAll customer tier assignments will be removed.\n\nContinue?')) return
    try {
      const res = await fetch('/api/admin/loyalty', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action: 'reset_tiers' })
      })
      if (res.ok) {
        await fetchData()
        alert('✅ Tiers reset to premium defaults! All 10 tiers recreated with correct values.')
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to reset tiers')
      }
    } catch (err) {
      alert('Failed to reset tiers')
    }
  }

  // Fix sortOrder ONLY - sorts by minSpending (lowest to highest)
  const fixTierOrder = async () => {
    if (!confirm('This will reorder tiers by their Min Spending values.\n\nLowest spending tier will appear first.\n\nFix order now?')) return
    try {
      const res = await fetch('/api/admin/loyalty', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action: 'fix_tier_order' })
      })
      if (res.ok) {
        await fetchData()
        alert('✅ Tiers reordered by spending! Lowest first.')
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to fix tier order')
      }
    } catch (err) {
      alert('Failed to fix tier order')
    }
  }

  const saveSettings = async () => {
    if (!settings) return
    setSaving(true)
    try {
      const res = await fetch('/api/admin/loyalty', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(settings)
      })
      if (res.ok) {
        setEditMode(false)
        alert('Settings saved!')
      }
    } catch (err) {
      alert('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  // Open tier modal for editing
  const openEditTier = (tier: LoyaltyTier) => {
    setTierForm({
      name: tier.name,
      displayName: tier.displayName,
      minSpending: tier.minSpending,
      discountPercent: tier.discountPercent,
      freeShipping: tier.freeShipping,
      freeShippingMin: tier.freeShippingMin,
      pointsMultiplier: tier.pointsMultiplier,
      prioritySupport: tier.prioritySupport,
      earlyAccess: tier.earlyAccess,
      exclusiveDeals: tier.exclusiveDeals,
      birthdayBonus: tier.birthdayBonus,
      color: tier.color,
      icon: tier.icon || 'bronze',
      isActive: tier.isActive
    })
    setEditingTierId(tier.id)
    setShowTierModal(true)
  }

  // Open tier modal for creating new
  const openCreateTier = () => {
    setTierForm(defaultTierForm)
    setEditingTierId(null)
    setShowTierModal(true)
  }

  // Save tier (create or update)
  const saveTier = async () => {
    if (!tierForm.name || !tierForm.displayName) {
      alert('Name and Display Name are required')
      return
    }
    setTierSaving(true)
    try {
      if (editingTierId) {
        // Update existing
        const res = await fetch(`/api/admin/loyalty/${editingTierId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(tierForm)
        })
        if (res.ok) {
          setShowTierModal(false)
          await fetchData()
        } else {
          const data = await res.json()
          alert(data.error || 'Failed to update tier')
        }
      } else {
        // Create new
        const res = await fetch('/api/admin/loyalty', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ action: 'create_tier', tier: tierForm })
        })
        if (res.ok) {
          setShowTierModal(false)
          await fetchData()
        } else {
          const data = await res.json()
          alert(data.error || 'Failed to create tier')
        }
      }
    } catch (err) {
      alert('Failed to save tier')
    } finally {
      setTierSaving(false)
    }
  }

  // Delete tier
  const deleteTier = async (id: string) => {
    if (!confirm('Delete this tier? Members will lose their tier status.')) return
    try {
      const res = await fetch(`/api/admin/loyalty/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      })
      if (res.ok) {
        await fetchData()
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to delete tier')
      }
    } catch (err) {
      alert('Failed to delete tier')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Tier Edit/Create Modal */}
      <AnimatePresence>
        {showTierModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowTierModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Crown className="w-5 h-5" style={{ color: tierForm.color }} />
                  {editingTierId ? 'Edit Tier' : 'Create New Tier'}
                </h2>
                <button onClick={() => setShowTierModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Preset Templates - only show when creating new tier */}
              {!editingTierId && (
                <div className="mb-6">
                  <Label className="mb-2 block">Quick Presets</Label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { name: 'bronze', displayName: 'Bronze', color: '#CD7F32', icon: 'bronze', minSpending: 0, discountPercent: 0, pointsMultiplier: 1, birthdayBonus: 50 },
                      { name: 'silver', displayName: 'Silver', color: '#C0C0C0', icon: 'silver', minSpending: 5000, discountPercent: 3, pointsMultiplier: 1.5, birthdayBonus: 100 },
                      { name: 'gold', displayName: 'Gold', color: '#FFD700', icon: 'gold', minSpending: 15000, discountPercent: 5, pointsMultiplier: 2, birthdayBonus: 200, freeShipping: true, prioritySupport: true, earlyAccess: true },
                      { name: 'platinum', displayName: 'Platinum', color: '#8C8C8C', icon: 'platinum', minSpending: 35000, discountPercent: 8, pointsMultiplier: 2.5, birthdayBonus: 350, freeShipping: true, prioritySupport: true, earlyAccess: true, exclusiveDeals: true },
                      { name: 'diamond', displayName: 'Diamond', color: '#B9F2FF', icon: 'diamond', minSpending: 60000, discountPercent: 12, pointsMultiplier: 3, birthdayBonus: 500, freeShipping: true, prioritySupport: true, earlyAccess: true, exclusiveDeals: true },
                      { name: 'emerald', displayName: 'Emerald', color: '#50C878', icon: 'emerald', minSpending: 100000, discountPercent: 15, pointsMultiplier: 3.5, birthdayBonus: 750, freeShipping: true, prioritySupport: true, earlyAccess: true, exclusiveDeals: true },
                      { name: 'ruby', displayName: 'Ruby', color: '#E0115F', icon: 'ruby', minSpending: 150000, discountPercent: 18, pointsMultiplier: 4, birthdayBonus: 1000, freeShipping: true, prioritySupport: true, earlyAccess: true, exclusiveDeals: true },
                      { name: 'sapphire', displayName: 'Sapphire', color: '#0F52BA', icon: 'sapphire', minSpending: 250000, discountPercent: 22, pointsMultiplier: 5, birthdayBonus: 1500, freeShipping: true, prioritySupport: true, earlyAccess: true, exclusiveDeals: true },
                      { name: 'obsidian', displayName: 'Obsidian', color: '#1C1C1C', icon: 'obsidian', minSpending: 400000, discountPercent: 25, pointsMultiplier: 6, birthdayBonus: 2000, freeShipping: true, prioritySupport: true, earlyAccess: true, exclusiveDeals: true },
                      { name: 'legendary', displayName: 'Legendary', color: '#FFD700', icon: 'legendary', minSpending: 750000, discountPercent: 30, pointsMultiplier: 10, birthdayBonus: 5000, freeShipping: true, prioritySupport: true, earlyAccess: true, exclusiveDeals: true }
                    ].map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => setTierForm({
                          ...defaultTierForm,
                          ...preset,
                          freeShipping: preset.freeShipping || false,
                          prioritySupport: preset.prioritySupport || false,
                          earlyAccess: preset.earlyAccess || false,
                          exclusiveDeals: preset.exclusiveDeals || false,
                          isActive: true
                        })}
                        className="px-3 py-2 rounded-lg border-2 hover:border-gray-400 transition-all flex items-center gap-2"
                        style={{ borderColor: tierForm.name === preset.name ? preset.color : '#e5e7eb', backgroundColor: tierForm.name === preset.name ? `${preset.color}15` : 'transparent' }}
                      >
                        <span className="w-4 h-4 rounded-full" style={{ backgroundColor: preset.color }} />
                        <span className="font-medium">{preset.displayName}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <Label>Internal Name</Label>
                  <Input
                    value={tierForm.name}
                    onChange={(e) => setTierForm({ ...tierForm, name: e.target.value.toLowerCase().replace(/\s/g, '_') })}
                    placeholder="e.g., diamond"
                  />
                </div>
                <div>
                  <Label>Display Name</Label>
                  <Input
                    value={tierForm.displayName}
                    onChange={(e) => setTierForm({ ...tierForm, displayName: e.target.value })}
                    placeholder="e.g., Diamond"
                  />
                </div>
                <div>
                  <Label>Min Spending (৳)</Label>
                  <Input
                    type="number"
                    value={tierForm.minSpending}
                    onChange={(e) => setTierForm({ ...tierForm, minSpending: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label>Discount %</Label>
                  <Input
                    type="number"
                    value={tierForm.discountPercent}
                    onChange={(e) => setTierForm({ ...tierForm, discountPercent: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label>Points Multiplier</Label>
                  <Input
                    type="number"
                    step="0.5"
                    value={tierForm.pointsMultiplier}
                    onChange={(e) => setTierForm({ ...tierForm, pointsMultiplier: parseFloat(e.target.value) || 1 })}
                  />
                </div>
                <div>
                  <Label>Birthday Bonus Points</Label>
                  <Input
                    type="number"
                    value={tierForm.birthdayBonus}
                    onChange={(e) => setTierForm({ ...tierForm, birthdayBonus: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label>Badge Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={tierForm.color}
                      onChange={(e) => setTierForm({ ...tierForm, color: e.target.value })}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={tierForm.color}
                      onChange={(e) => setTierForm({ ...tierForm, color: e.target.value })}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div>
                  <Label>Badge Icon</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {TIER_ICONS.map((iconOption) => (
                      <button
                        key={iconOption.name}
                        type="button"
                        onClick={() => setTierForm({ ...tierForm, icon: iconOption.name })}
                        className={`px-3 py-2 rounded-lg border-2 transition-all flex items-center gap-2 ${
                          tierForm.icon === iconOption.name 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <span className="text-lg">{iconOption.emoji}</span>
                        <span className="text-sm">{iconOption.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Free Ship Min (৳)</Label>
                  <Input
                    type="number"
                    value={tierForm.freeShippingMin ?? ''}
                    onChange={(e) => setTierForm({ ...tierForm, freeShippingMin: e.target.value ? parseFloat(e.target.value) : null })}
                    placeholder="Leave empty for always free"
                  />
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={tierForm.freeShipping}
                    onChange={(e) => setTierForm({ ...tierForm, freeShipping: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <Truck className="w-4 h-4 text-blue-500" />
                  <span>Free Shipping</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={tierForm.prioritySupport}
                    onChange={(e) => setTierForm({ ...tierForm, prioritySupport: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <Award className="w-4 h-4 text-purple-500" />
                  <span>Priority Support</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={tierForm.earlyAccess}
                    onChange={(e) => setTierForm({ ...tierForm, earlyAccess: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <Clock className="w-4 h-4 text-orange-500" />
                  <span>Early Sale Access</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={tierForm.exclusiveDeals}
                    onChange={(e) => setTierForm({ ...tierForm, exclusiveDeals: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <Sparkles className="w-4 h-4 text-pink-500" />
                  <span>Exclusive Deals</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={tierForm.isActive}
                    onChange={(e) => setTierForm({ ...tierForm, isActive: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span>Active</span>
                </label>
              </div>

              <div className="flex gap-3 mt-8">
                <Button variant="outline" onClick={() => setShowTierModal(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={saveTier} disabled={tierSaving} className="flex-1">
                  {tierSaving ? 'Saving...' : (editingTierId ? 'Update Tier' : 'Create Tier')}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3 md:text-3xl">
            <Crown className="w-8 h-8 text-yellow-500" />
            Loyalty & Referral Program
          </h1>
          <p className="text-gray-600 mt-1">Manage tiers, points, and referral rewards</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          {tiers.length === 0 && (
            <Button onClick={seedTiers} className="bg-gradient-to-r from-yellow-500 to-orange-500">
              <Sparkles className="w-4 h-4 mr-2" />
              Create Default Tiers
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Members</p>
                <p className="text-2xl font-bold">{stats?.totalMembers || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Star className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Active Points</p>
                <p className="text-2xl font-bold">{stats?.totalPointsActive?.toLocaleString() || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Lifetime Points</p>
                <p className="text-2xl font-bold">{stats?.totalPointsEarned?.toLocaleString() || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Spending</p>
                <p className="text-2xl font-bold">{formatPrice(stats?.totalSpending || 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Settings Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Program Settings
          </h2>
          {editMode ? (
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setEditMode(false)}>
                <X className="w-4 h-4 mr-1" /> Cancel
              </Button>
              <Button size="sm" onClick={saveSettings} disabled={saving}>
                <Save className="w-4 h-4 mr-1" /> Save
              </Button>
            </div>
          ) : (
            <Button size="sm" variant="outline" onClick={() => setEditMode(true)}>
              <Edit2 className="w-4 h-4 mr-1" /> Edit
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {settings && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Points per ৳1 spent</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={settings.pointsPerTaka}
                  onChange={(e) => setSettings({ ...settings, pointsPerTaka: parseFloat(e.target.value) })}
                  disabled={!editMode}
                />
              </div>
              <div className="space-y-2">
                <Label>Points to ৳1 Discount</Label>
                <Input
                  type="number"
                  value={settings.pointsToTakaRatio}
                  onChange={(e) => setSettings({ ...settings, pointsToTakaRatio: parseInt(e.target.value) })}
                  disabled={!editMode}
                />
              </div>
              <div className="space-y-2">
                <Label>Min Points to Redeem</Label>
                <Input
                  type="number"
                  value={settings.minimumRedeemPoints}
                  onChange={(e) => setSettings({ ...settings, minimumRedeemPoints: parseInt(e.target.value) })}
                  disabled={!editMode}
                />
              </div>
              <div className="space-y-2">
                <Label>Referrer Bonus Points</Label>
                <Input
                  type="number"
                  value={settings.referralBonusReferrer}
                  onChange={(e) => setSettings({ ...settings, referralBonusReferrer: parseInt(e.target.value) })}
                  disabled={!editMode}
                />
              </div>
              <div className="space-y-2">
                <Label>Referred Bonus Points</Label>
                <Input
                  type="number"
                  value={settings.referralBonusReferred}
                  onChange={(e) => setSettings({ ...settings, referralBonusReferred: parseInt(e.target.value) })}
                  disabled={!editMode}
                />
              </div>
              <div className="flex items-center gap-3 pt-6">
                <input
                  type="checkbox"
                  id="enabled"
                  checked={settings.isEnabled}
                  onChange={(e) => setSettings({ ...settings, isEnabled: e.target.checked })}
                  disabled={!editMode}
                  className="w-5 h-5"
                />
                <Label htmlFor="enabled">Program Enabled</Label>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tiers */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Crown className="w-5 h-5 text-yellow-500" />
            Loyalty Tiers
          </h2>
          <div className="flex gap-2 flex-wrap">
            <Button onClick={openCreateTier} className="gap-2">
              <Plus className="w-4 h-4" />
              Add New Tier
            </Button>
            <Button onClick={fixTierOrder} variant="outline" className="gap-2 border-blue-200 text-blue-600 hover:bg-blue-50">
              <RefreshCw className="w-4 h-4" />
              Fix Tier Order
            </Button>
            <Button onClick={resetTiers} variant="outline" className="gap-2 border-red-200 text-red-600 hover:bg-red-50">
              <RefreshCw className="w-4 h-4" />
              Reset All Tiers
            </Button>
          </div>
        </div>
        
        {tiers.length === 0 ? (
          <Card className="text-center py-12">
            <Crown className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-600 mb-4">No tiers created yet</p>
            <Button onClick={seedTiers}>Create Default Tiers</Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {tiers.map((tier) => (
              <motion.div
                key={tier.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative"
              >
                <Card className="overflow-hidden">
                  <div className="h-3" style={{ backgroundColor: tier.color }} />
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold" style={{ color: tier.color }}>
                        {tier.displayName}
                      </h3>
                      <span className="text-sm text-gray-500">
                        {tier._count?.members || 0} members
                      </span>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Min Spending</span>
                        <span className="font-semibold">{formatPrice(tier.minSpending)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Discount</span>
                        <span className="font-semibold text-green-600">{tier.discountPercent}%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Points</span>
                        <span className="font-semibold text-purple-600">{tier.pointsMultiplier}x</span>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-1">
                      {tier.freeShipping && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                          🚚 Free Ship
                        </span>
                      )}
                      {tier.earlyAccess && (
                        <span className="text-xs bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full">
                          ⏰ Early
                        </span>
                      )}
                    </div>

                    <div className="flex gap-2 mt-4">
                      <Button size="sm" variant="outline" className="flex-1" onClick={() => openEditTier(tier)}>
                        <Edit2 className="w-4 h-4 mr-1" /> Edit
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-600" onClick={() => deleteTier(tier.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
