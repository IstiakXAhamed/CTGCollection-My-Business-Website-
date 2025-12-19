'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Store, Plus, Search, Edit2, Trash2, Loader2, X, Check, 
  Users, Package, BadgeCheck, AlertTriangle
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useToast } from '@/hooks/use-toast'

interface Shop {
  id: string
  name: string
  slug: string
  description?: string
  logo?: string
  banner?: string
  phone?: string
  email?: string
  address?: string
  city?: string
  isVerified: boolean
  isActive: boolean
  rating: number
  totalSales: number
  createdAt: string
  owner?: {
    id: string
    name: string
    email: string
    phone?: string
  }
  _count?: {
    products: number
  }
}

interface User {
  id: string
  name: string
  email: string
  role: string
}

export default function ShopsPage() {
  const { toast } = useToast()
  const [shops, setShops] = useState<Shop[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Shop | null>(null)
  const [saving, setSaving] = useState(false)
  const [multiVendorEnabled, setMultiVendorEnabled] = useState(false)
  
  const [form, setForm] = useState({
    ownerId: '',
    name: '',
    slug: '',
    description: '',
    logo: '',
    banner: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    isVerified: false
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch shops
      const shopsRes = await fetch('/api/admin/shops?includeOwner=true', { credentials: 'include' })
      if (shopsRes.ok) {
        const data = await shopsRes.json()
        setShops(data.shops || [])
      }

      // Fetch users for owner selection
      const usersRes = await fetch('/api/admin/users?limit=100', { credentials: 'include' })
      if (usersRes.ok) {
        const data = await usersRes.json()
        setUsers(data.users || [])
      }

      // Check multi-vendor status
      const settingsRes = await fetch('/api/admin/site-settings', { credentials: 'include' })
      if (settingsRes.ok) {
        const data = await settingsRes.json()
        setMultiVendorEnabled(data.settings?.multiVendorEnabled || false)
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const openCreateModal = () => {
    setEditing(null)
    setForm({
      ownerId: '',
      name: '',
      slug: '',
      description: '',
      logo: '',
      banner: '',
      phone: '',
      email: '',
      address: '',
      city: '',
      isVerified: false
    })
    setShowModal(true)
  }

  const openEditModal = (shop: Shop) => {
    setEditing(shop)
    setForm({
      ownerId: shop.owner?.id || '',
      name: shop.name,
      slug: shop.slug,
      description: shop.description || '',
      logo: shop.logo || '',
      banner: shop.banner || '',
      phone: shop.phone || '',
      email: shop.email || '',
      address: shop.address || '',
      city: shop.city || '',
      isVerified: shop.isVerified
    })
    setShowModal(true)
  }

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  }

  const handleSave = async () => {
    if (!form.name || (!editing && !form.ownerId)) {
      toast({ title: 'Error', description: 'Name and owner are required', variant: 'destructive' })
      return
    }

    setSaving(true)
    try {
      const url = editing ? `/api/admin/shops/${editing.id}` : '/api/admin/shops'
      const method = editing ? 'PUT' : 'POST'
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...form,
          slug: form.slug || generateSlug(form.name)
        })
      })

      if (res.ok) {
        toast({ title: 'Success', description: editing ? 'Shop updated!' : 'Shop created!' })
        setShowModal(false)
        fetchData()
      } else {
        const data = await res.json()
        toast({ title: 'Error', description: data.error, variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to save shop', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (shopId: string) => {
    if (!confirm('Delete this shop? This cannot be undone.')) return

    try {
      const res = await fetch(`/api/admin/shops/${shopId}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (res.ok) {
        toast({ title: 'Deleted', description: 'Shop deleted successfully' })
        fetchData()
      } else {
        const data = await res.json()
        toast({ title: 'Error', description: data.error, variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete shop', variant: 'destructive' })
    }
  }

  const toggleVerified = async (shop: Shop) => {
    try {
      const res = await fetch(`/api/admin/shops/${shop.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ isVerified: !shop.isVerified })
      })

      if (res.ok) {
        toast({ title: 'Updated', description: shop.isVerified ? 'Verification removed' : 'Shop verified!' })
        fetchData()
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update', variant: 'destructive' })
    }
  }

  const filteredShops = shops.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.owner?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.owner?.email?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Get users who don't already have a shop
  const availableOwners = users.filter(u => 
    !shops.some(s => s.owner?.id === u.id)
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Store className="w-8 h-8 text-purple-600" />
            Shops Management
          </h1>
          <p className="text-gray-600 mt-1">
            {shops.length} shops • Multi-vendor: {multiVendorEnabled ? '✅ Enabled' : '❌ Disabled'}
          </p>
        </div>
        <Button onClick={openCreateModal} className="gap-2 bg-purple-600 hover:bg-purple-700">
          <Plus className="w-4 h-4" /> Create Shop
        </Button>
      </div>

      {!multiVendorEnabled && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600" />
          <div>
            <p className="font-medium text-yellow-800">Multi-Vendor Mode is Disabled</p>
            <p className="text-sm text-yellow-700">
              Enable it in <strong>Site Settings</strong> to show shop info on products and enable shop pages.
            </p>
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search by shop name or owner..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          {filteredShops.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Store className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No shops yet. Create your first shop!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredShops.map((shop) => (
                <div
                  key={shop.id}
                  className="p-4 border rounded-lg hover:border-purple-200 transition"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center">
                        {shop.logo ? (
                          <img src={shop.logo} alt={shop.name} className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <Store className="w-7 h-7 text-purple-600" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg">{shop.name}</h3>
                          {shop.isVerified && (
                            <BadgeCheck className="w-5 h-5 text-blue-500" />
                          )}
                          {!shop.isActive && (
                            <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded">Inactive</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">/{shop.slug}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          Owner: <strong>{shop.owner?.name}</strong> ({shop.owner?.email})
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-purple-600">{shop._count?.products || 0}</p>
                        <p className="text-xs text-gray-500">Products</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleVerified(shop)}
                          title={shop.isVerified ? 'Remove verification' : 'Verify shop'}
                        >
                          {shop.isVerified ? <Check className="w-4 h-4 text-green-600" /> : <BadgeCheck className="w-4 h-4" />}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => openEditModal(shop)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-600" onClick={() => handleDelete(shop.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setShowModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-lg bg-white rounded-xl shadow-2xl z-50 max-h-[90vh] overflow-y-auto"
            >
              <div className="p-4 border-b bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-xl flex items-center justify-between">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Store className="w-5 h-5" />
                  {editing ? 'Edit Shop' : 'Create Shop'}
                </h3>
                <button onClick={() => setShowModal(false)} className="p-1 hover:bg-white/20 rounded">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {!editing && (
                  <div className="space-y-2">
                    <Label>Shop Owner *</Label>
                    <select
                      value={form.ownerId}
                      onChange={(e) => setForm(f => ({ ...f, ownerId: e.target.value }))}
                      className="w-full border rounded-lg px-3 py-2"
                    >
                      <option value="">Select a user...</option>
                      {availableOwners.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.name} ({user.email}) - {user.role}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500">User will be promoted to seller role</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Shop Name *</Label>
                    <Input
                      value={form.name}
                      onChange={(e) => setForm(f => ({ 
                        ...f, 
                        name: e.target.value,
                        slug: f.slug || generateSlug(e.target.value)
                      }))}
                      placeholder="My Awesome Shop"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Slug</Label>
                    <Input
                      value={form.slug}
                      onChange={(e) => setForm(f => ({ ...f, slug: e.target.value }))}
                      placeholder="my-awesome-shop"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={form.description}
                    onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="Tell customers about this shop..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input
                      value={form.phone}
                      onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))}
                      placeholder="+880..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      value={form.email}
                      onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                      placeholder="shop@example.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>City</Label>
                    <Input
                      value={form.city}
                      onChange={(e) => setForm(f => ({ ...f, city: e.target.value }))}
                      placeholder="Chittagong"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Address</Label>
                    <Input
                      value={form.address}
                      onChange={(e) => setForm(f => ({ ...f, address: e.target.value }))}
                      placeholder="Shop location"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Logo URL</Label>
                  <Input
                    value={form.logo}
                    onChange={(e) => setForm(f => ({ ...f, logo: e.target.value }))}
                    placeholder="https://..."
                  />
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isVerified}
                    onChange={(e) => setForm(f => ({ ...f, isVerified: e.target.checked }))}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Verified Shop</span>
                  <BadgeCheck className="w-4 h-4 text-blue-500" />
                </label>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
                  <Button onClick={handleSave} disabled={saving} className="bg-purple-600 hover:bg-purple-700">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    {editing ? 'Update Shop' : 'Create Shop'}
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
