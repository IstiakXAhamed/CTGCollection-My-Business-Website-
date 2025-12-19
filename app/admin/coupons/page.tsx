'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Search, Trash2, Clock, Timer } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

// Countdown Timer Component
function CountdownTimer({ endDate }: { endDate: string }) {
  const [timeLeft, setTimeLeft] = useState('')
  const [isExpired, setIsExpired] = useState(false)

  useEffect(() => {
    const calculateTime = () => {
      const end = new Date(endDate).getTime()
      const now = Date.now()
      const diff = end - now

      if (diff <= 0) {
        setIsExpired(true)
        setTimeLeft('Expired')
        return
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h ${minutes}m`)
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`)
      } else {
        setTimeLeft(`${minutes}m ${seconds}s`)
      }
    }

    calculateTime()
    const interval = setInterval(calculateTime, 1000)
    return () => clearInterval(interval)
  }, [endDate])

  return (
    <div className={`flex items-center gap-1.5 text-sm font-mono ${isExpired ? 'text-red-600' : 'text-green-600'}`}>
      <Timer className="w-4 h-4" />
      <span>{timeLeft}</span>
    </div>
  )
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showDialog, setShowDialog] = useState(false)
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'percentage',
    discountValue: '',
    minOrderValue: '',
    maxDiscount: '',
    usageLimit: '',
    validFrom: new Date().toISOString().split('T')[0],
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    durationHours: '', // Quick duration option
    autoApply: false, // Auto-apply at checkout
    targetAudience: 'all' // User category targeting
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchCoupons()
  }, [])

  const fetchCoupons = async () => {
    try {
      const res = await fetch('/api/admin/coupons', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setCoupons(data.coupons || [])
      }
    } catch (error) {
      console.error('Failed to fetch coupons:', error)
    } finally {
      setLoading(false)
    }
  }

  // Set duration in hours for quick flash sales
  const setDuration = (hours: number) => {
    const endDate = new Date(Date.now() + hours * 60 * 60 * 1000)
    setFormData({
      ...formData,
      validFrom: new Date().toISOString().split('T')[0],
      validUntil: endDate.toISOString().split('T')[0],
      durationHours: hours.toString()
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    // Calculate validUntil based on duration if set
    let validUntil = formData.validUntil
    if (formData.durationHours) {
      const hours = parseInt(formData.durationHours)
      validUntil = new Date(Date.now() + hours * 60 * 60 * 1000).toISOString()
    }

    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          code: formData.code,
          description: formData.description,
          discountType: formData.discountType,
          discountValue: formData.discountType === 'free_shipping' ? 0 : parseFloat(formData.discountValue),
          minOrderValue: formData.minOrderValue ? parseFloat(formData.minOrderValue) : null,
          maxDiscount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : null,
          usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
          validFrom: new Date(formData.validFrom).toISOString(),
          validUntil: validUntil,
          autoApply: formData.autoApply,
          targetAudience: formData.targetAudience
        })
      })

      if (res.ok) {
        setShowDialog(false)
        setFormData({
          code: '',
          description: '',
          discountType: 'percentage',
          discountValue: '',
          minOrderValue: '',
          maxDiscount: '',
          usageLimit: '',
          validFrom: new Date().toISOString().split('T')[0],
          validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          durationHours: '',
          autoApply: false,
          targetAudience: 'all'
        })
        fetchCoupons()
        alert('Coupon created successfully!')
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to create coupon')
      }
    } catch (error) {
      alert('An error occurred')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return

    try {
      const res = await fetch(`/api/admin/coupons/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (res.ok) {
        fetchCoupons()
        alert('Coupon deleted successfully!')
      } else {
        alert('Failed to delete coupon')
      }
    } catch (error) {
      alert('An error occurred')
    }
  }

  if (loading) return <div className="text-center py-12">Loading coupons...</div>

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1">Coupons</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">{coupons.length} total</p>
        </div>
        <Button size="sm" onClick={() => setShowDialog(true)}>
          <Plus className="w-4 h-4 sm:mr-2" />
          <span className="hidden sm:inline">Add Coupon</span>
        </Button>
      </div>

      <Card>
        <CardHeader className="p-3 sm:p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search..." className="pl-9 h-10 text-sm" />
          </div>
        </CardHeader>
        <CardContent className="p-2 sm:p-4">
          {/* Mobile Card View */}
          <div className="lg:hidden space-y-2">
            {coupons.map((coupon) => (
              <div key={coupon.id} className="border rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono font-semibold text-sm text-blue-600">{coupon.code}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] ${coupon.isActive && new Date(coupon.validUntil) > new Date() ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {coupon.isActive && new Date(coupon.validUntil) > new Date() ? 'Active' : 'Expired'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-medium">
                    {coupon.discountType === 'free_shipping' ? '🚚 Free Ship' : coupon.discountType === 'percentage' ? `${coupon.discountValue}% OFF` : `৳${coupon.discountValue} OFF`}
                  </span>
                  <span className="text-muted-foreground">{coupon.usedCount}/{coupon.usageLimit || '∞'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <CountdownTimer endDate={coupon.validUntil} />
                  <Button size="sm" variant="outline" className="h-7 w-7 p-0 text-red-600" onClick={() => handleDelete(coupon.id)}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Code</th>
                  <th className="text-left py-3 px-4">Discount</th>
                  <th className="text-left py-3 px-4">Used</th>
                  <th className="text-left py-3 px-4">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      Time Left
                    </div>
                  </th>
                  <th className="text-left py-3 px-4">Target</th>
                  <th className="text-left py-3 px-4">Auto-Apply</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-right py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((coupon) => (
                  <tr key={coupon.id} className="border-b hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="font-semibold text-blue-600">{coupon.code}</div>
                      <div className="text-xs text-muted-foreground">{coupon.description}</div>
                    </td>
                    <td className="py-4 px-4 font-medium">
                      {coupon.discountType === 'free_shipping' 
                        ? '🚚 Free Shipping'
                        : coupon.discountType === 'percentage' 
                          ? `${coupon.discountValue}%` 
                          : `৳${coupon.discountValue}`}
                    </td>
                    <td className="py-4 px-4">{coupon.usedCount} / {coupon.usageLimit || '∞'}</td>
                    <td className="py-4 px-4">
                      <CountdownTimer endDate={coupon.validUntil} />
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        coupon.targetAudience === 'all' 
                          ? 'bg-gray-100 text-gray-600'
                          : 'bg-orange-100 text-orange-700'
                      }`}>
                        {coupon.targetAudience === 'all' ? '🌍 All' 
                          : coupon.targetAudience === 'new_customers' ? '🆕 New'
                          : coupon.targetAudience === 'returning' ? '🔄 Returning'
                          : coupon.targetAudience === 'vip' ? '⭐ VIP'
                          : coupon.targetAudience?.startsWith('loyalty_') ? '🏅 Loyalty'
                          : coupon.targetAudience || 'All'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        coupon.autoApply 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {coupon.autoApply ? '✓ Auto' : 'Manual'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        coupon.isActive && new Date(coupon.validUntil) > new Date() 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {coupon.isActive && new Date(coupon.validUntil) > new Date() ? 'Active' : 'Expired'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleDelete(coupon.id)} className="text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add Coupon Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Coupon</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Coupon Code *</Label>
                <Input
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                  placeholder="FLASH50"
                  required
                />
              </div>
              <div>
                <Label>Discount Type *</Label>
                <select
                  value={formData.discountType}
                  onChange={(e) => setFormData({...formData, discountType: e.target.value})}
                  className="w-full h-10 px-3 border rounded-md"
                  required
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (৳)</option>
                  <option value="free_shipping">🚚 Free Shipping</option>
                </select>
              </div>
            </div>

            <div>
              <Label>Description</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Flash sale - 50% off for limited time!"
              />
            </div>

            {/* Discount Value & Min Order - Only show value field if not free shipping */}
            <div className="grid grid-cols-2 gap-4">
              {formData.discountType !== 'free_shipping' && (
                <div>
                  <Label>Discount Value * {formData.discountType === 'percentage' ? '(%)' : '(BDT)'}</Label>
                  <Input
                    type="number"
                    value={formData.discountValue}
                    onChange={(e) => setFormData({...formData, discountValue: e.target.value})}
                    placeholder="50"
                    required
                    min="0"
                  />
                </div>
              )}
              <div className={formData.discountType === 'free_shipping' ? 'col-span-2' : ''}>
                <Label>Min Order Value (BDT)</Label>
                <Input
                  type="number"
                  value={formData.minOrderValue}
                  onChange={(e) => setFormData({...formData, minOrderValue: e.target.value})}
                  placeholder="1000"
                  min="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {formData.discountType !== 'free_shipping' && (
                <div>
                  <Label>Max Discount (BDT)</Label>
                  <Input
                    type="number"
                    value={formData.maxDiscount}
                    onChange={(e) => setFormData({...formData, maxDiscount: e.target.value})}
                    placeholder="500"
                    min="0"
                  />
                </div>
              )}
              <div className={formData.discountType === 'free_shipping' ? '' : ''}>
                <Label>Usage Limit</Label>
                <Input
                  type="number"
                  value={formData.usageLimit}
                  onChange={(e) => setFormData({...formData, usageLimit: e.target.value})}
                  placeholder="100"
                  min="1"
                />
              </div>
            </div>

            {/* Target Audience */}
            <div className="bg-orange-50 p-4 rounded-lg space-y-3">
              <Label className="text-orange-800 font-semibold flex items-center gap-2">
                👥 Target Audience
              </Label>
              <select
                value={formData.targetAudience}
                onChange={(e) => setFormData({...formData, targetAudience: e.target.value})}
                className="w-full h-10 px-3 border rounded-md bg-white"
              >
                <option value="all">🌍 All Customers</option>
                <option value="new_customers">🆕 New Customers (First Order)</option>
                <option value="returning">🔄 Returning Customers</option>
                <option value="vip">⭐ VIP Customers (5+ orders)</option>
                <option value="loyalty_bronze">🥉 Bronze Tier Members</option>
                <option value="loyalty_silver">🥈 Silver Tier Members</option>
                <option value="loyalty_gold">🥇 Gold Tier Members</option>
                <option value="loyalty_platinum">💎 Platinum Tier Members</option>
              </select>
              <p className="text-xs text-orange-600">
                Only users matching this category will see and can use this coupon
              </p>
            </div>

            {/* Quick Duration Buttons */}
            <div className="bg-blue-50 p-4 rounded-lg space-y-3">
              <Label className="text-blue-800 font-semibold flex items-center gap-2">
                <Timer className="w-4 h-4" />
                Quick Duration (Flash Sale)
              </Label>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: '1 Hour', hours: 1 },
                  { label: '3 Hours', hours: 3 },
                  { label: '6 Hours', hours: 6 },
                  { label: '12 Hours', hours: 12 },
                  { label: '24 Hours', hours: 24 },
                  { label: '2 Days', hours: 48 },
                  { label: '3 Days', hours: 72 },
                  { label: '7 Days', hours: 168 }
                ].map(opt => (
                  <Button
                    key={opt.hours}
                    type="button"
                    size="sm"
                    variant={formData.durationHours === opt.hours.toString() ? 'default' : 'outline'}
                    onClick={() => setDuration(opt.hours)}
                  >
                    {opt.label}
                  </Button>
                ))}
              </div>
              {formData.durationHours && (
                <p className="text-sm text-blue-600">
                  Expires: {new Date(Date.now() + parseInt(formData.durationHours) * 60 * 60 * 1000).toLocaleString()}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Valid From *</Label>
                <Input
                  type="date"
                  value={formData.validFrom}
                  onChange={(e) => setFormData({...formData, validFrom: e.target.value, durationHours: ''})}
                  required
                />
              </div>
              <div>
                <Label>Valid Until * {!formData.durationHours && '(or use Quick Duration)'}</Label>
                <Input
                  type="date"
                  value={formData.validUntil}
                  onChange={(e) => setFormData({...formData, validUntil: e.target.value, durationHours: ''})}
                  required
                  disabled={!!formData.durationHours}
                />
              </div>
            </div>

            {/* Auto-Apply Toggle */}
            <div className="bg-purple-50 p-4 rounded-lg">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.autoApply}
                  onChange={(e) => setFormData({...formData, autoApply: e.target.checked})}
                  className="w-5 h-5 rounded border-purple-300 text-purple-600 focus:ring-purple-500"
                />
                <div>
                  <p className="font-semibold text-purple-800">Auto-Apply at Checkout</p>
                  <p className="text-xs text-purple-600">When enabled, this coupon will be automatically applied to customer carts if it gives the best discount</p>
                </div>
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Creating...' : 'Create Coupon'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
