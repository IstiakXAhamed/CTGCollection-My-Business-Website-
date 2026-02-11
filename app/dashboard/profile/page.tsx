'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { User, Mail, Phone, Edit2, Save, X, Crown, Settings, Shield, Store, BarChart3, Package, Users } from 'lucide-react'

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({ name: '', phone: '' })
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const isAdmin = profile?.role === 'admin' || profile?.role === 'superadmin'
  const isSeller = profile?.role === 'seller' || profile?.role === 'superadmin'

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/user/profile', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setProfile(data)
        setFormData({ name: data.name, phone: data.phone || '' })
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        const updated = await res.json()
        setProfile(updated)
        setIsEditing(false)
      }
    } catch (error) {
      console.error('Failed to update profile:', error)
    }
  }

  if (loading) return <div className="text-center py-12">Loading...</div>

  return (
    <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 animate-fade-in-up">
      {/* Page Header - Compact on Mobile */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h1 className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-white leading-tight">My Profile</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">Manage your personal settings</p>
        </div>
      </div>

      {/* Profile Hero Card - Premium feel */}
      <Card className="overflow-hidden border-none shadow-md bg-gradient-to-r from-blue-600/5 to-purple-600/5 dark:from-blue-900/10 dark:to-purple-900/10">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <div className="relative group">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg transform transition group-hover:scale-105">
                <span className="text-2xl sm:text-3xl font-bold">{profile?.name?.charAt(0).toUpperCase() || 'U'}</span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-green-500 border-2 border-white rounded-full" />
            </div>
            
            <div className="flex-1 space-y-1">
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <h2 className="text-lg sm:text-2xl font-bold">{profile?.name}</h2>
                <div className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-[10px] sm:text-xs font-semibold uppercase tracking-wider">
                  {profile?.role || 'Customer'}
                </div>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1.5 justify-center sm:justify-start">
                <Mail className="w-3 h-3" /> {profile?.email}
              </p>
            </div>

            <div className="flex items-center gap-2 mt-2 sm:mt-0">
               {!isEditing ? (
                 <Button onClick={() => setIsEditing(true)} variant="outline" size="sm" className="h-8 sm:h-9 text-xs sm:text-sm font-medium border-blue-200 hover:bg-blue-50 dark:border-blue-800">
                   <Edit2 className="w-3.5 h-3.5 mr-1.5" /> Edit Profile
                 </Button>
               ) : (
                 <div className="flex gap-2">
                   <Button onClick={handleSave} size="sm" className="h-8 sm:h-9 text-xs sm:text-sm font-medium bg-blue-600 hover:bg-blue-700">
                     <Save className="w-3.5 h-3.5 mr-1.5" /> Save
                   </Button>
                   <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 sm:h-9 text-xs sm:text-sm font-medium text-gray-500 hover:bg-gray-100"
                    onClick={() => {
                       setIsEditing(false)
                       setFormData({ name: profile.name, phone: profile.phone || '' })
                    }}
                   >
                     Cancel
                   </Button>
                 </div>
               )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Information Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Personal Details */}
        <Card className="border-gray-100 dark:border-gray-800 shadow-sm">
          <CardHeader className="p-4 sm:p-5 border-b border-gray-50 dark:border-gray-800/50">
            <h3 className="text-sm sm:text-base font-bold flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600" /> Personal Details
            </h3>
          </CardHeader>
          <CardContent className="p-4 sm:p-5 space-y-4">
            <div className="space-y-1.5">
              <Label className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-widest">Full Name</Label>
              {isEditing ? (
                <Input
                  className="h-9 sm:h-10 text-sm focus-visible:ring-blue-600"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              ) : (
                <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-gray-100">
                  {profile?.name || 'Not set'}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-widest">Phone Number</Label>
              {isEditing ? (
                <Input
                  className="h-9 sm:h-10 text-sm focus-visible:ring-blue-600"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+880 1XXX-XXXXXX"
                />
              ) : (
                <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-gray-100">
                  {profile?.phone || 'Not provided'}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Account Metadata */}
        <Card className="border-gray-100 dark:border-gray-800 shadow-sm">
          <CardHeader className="p-4 sm:p-5 border-b border-gray-50 dark:border-gray-800/50">
            <h3 className="text-sm sm:text-base font-bold flex items-center gap-2 text-purple-600">
              < Crown className="w-4 h-4" /> Account Status
            </h3>
          </CardHeader>
          <CardContent className="p-4 sm:p-5">
            <div className="grid grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-1">
                <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-widest">Member Since</p>
                <p className="text-sm font-bold">
                  {profile?.createdAt 
                    ? new Date(profile.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short'
                      })
                    : '---'}
                </p>
              </div>
              <div className="space-y-1 text-right sm:text-left">
                <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-widest">Account Type</p>
                <p className="text-sm font-bold text-blue-600 capitalize">
                  {profile?.role || 'Customer'}
                </p>
              </div>
              <div className="col-span-2 pt-2">
                <div className="bg-gray-50 dark:bg-gray-800/50 p-2.5 rounded-lg border border-dashed border-gray-200 dark:border-gray-700">
                   <p className="text-[10px] text-muted-foreground italic leading-relaxed">
                     Your email <b>{profile?.email}</b> is currently verified and secure.
                   </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Admin/Seller Panel Access */}
      {(isAdmin || isSeller) && (
        <Card className="border-gray-100 dark:border-gray-800 shadow-sm">
          <CardHeader className="p-4 sm:p-5 border-b border-gray-50 dark:border-gray-800/50">
            <h3 className="text-sm sm:text-base font-bold flex items-center gap-2">
              <Shield className="w-4 h-4 text-purple-600" />
              {isAdmin ? 'Admin Panel' : 'Seller Panel'}
            </h3>
          </CardHeader>
          <CardContent className="p-4 sm:p-5">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {/* Superadmin gets everything */}
              {profile?.role === 'superadmin' && (
                <>
                  <AdminLink href="/admin" icon={BarChart3} label="Dashboard" />
                  <AdminLink href="/admin/products" icon={Package} label="Products" />
                  <AdminLink href="/admin/orders" icon={Users} label="Orders" />
                  <AdminLink href="/admin/users" icon={Users} label="Users" />
                  <AdminLink href="/admin/settings" icon={Settings} label="Settings" />
                </>
              )}

              {/* Admin gets most features */}
              {isAdmin && profile?.role !== 'superadmin' && (
                <>
                  <AdminLink href="/admin" icon={BarChart3} label="Dashboard" />
                  <AdminLink href="/admin/products" icon={Package} label="Products" />
                  <AdminLink href="/admin/orders" icon={Users} label="Orders" />
                  <AdminLink href="/admin/settings" icon={Settings} label="Settings" />
                </>
              )}

              {/* Seller gets seller features */}
              {isSeller && profile?.role !== 'superadmin' && profile?.role !== 'admin' && (
                <>
                  <AdminLink href="/seller" icon={BarChart3} label="Dashboard" />
                  <AdminLink href="/seller/products" icon={Package} label="My Products" />
                  <AdminLink href="/seller/orders" icon={Package} label="Orders" />
                  <AdminLink href="/seller/shop" icon={Store} label="My Shop" />
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Admin link component
function AdminLink({ href, icon: Icon, label }: { href: string; icon: any; label: string }) {
  return (
    <Link href={href}>
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        <Icon className="w-6 h-6 text-blue-600" />
        <span className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center">{label}</span>
      </motion.div>
    </Link>
  )
}

// Add Crown to imports at the top (Line 8)
