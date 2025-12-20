
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { 
  Shield, ShieldAlert, Check, X, Loader2, UserCog, Lock, Key,
  ChevronRight, AlertTriangle
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { GamificationSettings } from "@/components/admin/GamificationSettings"
import { InternalChat } from "@/components/admin/InternalChat"
import { CommissionSettings } from "@/components/admin/CommissionSettings"
import { FeatureToggles } from "@/components/admin/FeatureToggles"

interface User {
  id: string
  name: string
  email: string
  role: string
  permissions: string[]
  createdAt: string
}


const PERMISSIONS_LIST = [
  // ========== ADMIN ABILITIES ==========
  { id: 'manage_shops', label: 'Manage Shops (Multi-Vendor)', category: 'admin', description: 'শপ অ্যাপ্রুভ ও ম্যানেজ' },
  { id: 'approve_sellers', label: 'Approve Seller Applications', category: 'admin', description: 'সেলার আবেদন অনুমোদন' },
  { id: 'manage_products', label: 'Manage Products & Inventory', category: 'admin', description: 'সব পণ্য ও স্টক ম্যানেজ' },
  { id: 'manage_orders', label: 'Manage Orders', category: 'admin', description: 'অর্ডার স্ট্যাটাস আপডেট' },
  { id: 'manage_users', label: 'Manage Customers & Reviews', category: 'admin', description: 'কাস্টমার অ্যাকাউন্ট ও রিভিউ' },
  { id: 'manage_marketing', label: 'Manage Marketing (Coupons, Banners)', category: 'admin', description: 'কুপন ও প্রমো ব্যানার' },
  { id: 'manage_content', label: 'Manage Content (Announcements)', category: 'admin', description: 'অ্যানাউন্সমেন্ট পোস্ট' },
  { id: 'manage_settings', label: 'Manage Site Settings', category: 'admin', description: 'সাইট সেটিংস এডিট' },
  { id: 'manage_admins', label: 'Manage Other Admins', category: 'admin', description: 'অ্যাডমিন তৈরি/এডিট' },
  { id: 'manage_communications', label: 'Manage Messages & Chat', category: 'admin', description: 'চ্যাট ও মেসেজ রিপ্লাই' },
  { id: 'manage_storage', label: 'Manage File Storage', category: 'admin', description: 'ফাইল আপলোড ও মুছা' },
  { id: 'manage_payouts', label: 'Process Payout Requests', category: 'admin', description: 'সেলার পেআউট প্রসেস' },
  { id: 'manage_refunds', label: 'Process Refund Requests', category: 'admin', description: 'রিফান্ড অনুমোদন' },
  
  // ========== SELLER ABILITIES ==========
  { id: 'seller_add_products', label: 'Add New Products', category: 'seller', description: 'নতুন পণ্য যোগ করা' },
  { id: 'seller_edit_products', label: 'Edit Own Products', category: 'seller', description: 'নিজের পণ্য এডিট' },
  { id: 'seller_delete_products', label: 'Delete Own Products', category: 'seller', description: 'নিজের পণ্য মুছা' },
  { id: 'seller_view_orders', label: 'View Own Orders', category: 'seller', description: 'নিজের অর্ডার দেখা' },
  { id: 'seller_update_orders', label: 'Update Order Status', category: 'seller', description: 'অর্ডার স্ট্যাটাস পরিবর্তন' },
  { id: 'seller_request_payout', label: 'Request Payouts', category: 'seller', description: 'টাকা উত্তোলন আবেদন' },
  { id: 'seller_create_coupons', label: 'Create Shop Coupons', category: 'seller', description: 'নিজের শপের কুপন তৈরি' },
  { id: 'seller_reply_reviews', label: 'Reply to Reviews', category: 'seller', description: 'রিভিউতে উত্তর দেওয়া' },
  { id: 'seller_answer_questions', label: 'Answer Product Questions', category: 'seller', description: 'Q&A তে উত্তর দেওয়া' },
  
  // ========== RESTRICTED FEATURES (Can be enabled/disabled per user) ==========
  { id: 'access_loyalty_dashboard', label: 'Access Loyalty Dashboard', category: 'feature', description: 'লয়্যালটি প্রোগ্রাম দেখা' },
  { id: 'access_analytics', label: 'Access Analytics & Reports', category: 'feature', description: 'বিক্রয় রিপোর্ট দেখা' },
  { id: 'access_internal_chat', label: 'Use Internal Chat', category: 'feature', description: 'ইন্টারনাল চ্যাট ব্যবহার' },
  { id: 'access_flash_sales', label: 'Create Flash Sales', category: 'feature', description: 'ফ্ল্যাশ সেল তৈরি' },
  { id: 'access_bulk_upload', label: 'Bulk Product Upload', category: 'feature', description: 'বাল্ক প্রোডাক্ট আপলোড' },
  { id: 'access_export_data', label: 'Export Data (CSV/PDF)', category: 'feature', description: 'ডেটা এক্সপোর্ট' },
  { id: 'access_api_keys', label: 'Manage API Keys', category: 'feature', description: 'এপিআই কি ম্যানেজ' },
]


export default function SuperAdminPage() {
  const { toast } = useToast()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  
  // Modals
  const [transferTarget, setTransferTarget] = useState<User | null>(null)
  const [password, setPassword] = useState('')
  const [permissionTarget, setPermissionTarget] = useState<User | null>(null)
  const [selectedPerms, setSelectedPerms] = useState<string[]>([])

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/super-admin/users')
      if (res.ok) {
        const data = await res.json()
        setUsers(data.users || [])
      }
    } catch (error) {
      console.error('Fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTransfer = async () => {
    if (!transferTarget || !password) return
    
    setProcessing(true)
    try {
      const res = await fetch('/api/admin/super-admin/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId: transferTarget.id, password })
      })
      
      const data = await res.json()
      
      if (res.ok) {
        toast({
          title: 'Role Transferred',
          description: 'You have been demoted to Admin. Redirecting...',
        })
        setTimeout(() => window.location.href = '/admin', 2000)
      } else {
        toast({ title: 'Transfer Failed', description: data.error, variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Action failed', variant: 'destructive' })
    } finally {
      setProcessing(false)
    }
  }

  const handleSavePermissions = async () => {
    if (!permissionTarget || !password) return

    setProcessing(true)
    try {
      const res = await fetch('/api/admin/super-admin/permissions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: permissionTarget.id, permissions: selectedPerms, password })
      })
      
      const data = await res.json()
             
      if (res.ok) {
        toast({ title: 'Permissions Updated', description: `Updated for ${permissionTarget.name}` })
        fetchUsers() // Refresh list
        setPermissionTarget(null)
        setPassword('')
      } else {
        toast({ title: 'Error', description: data.error || 'Failed to update permissions', variant: 'destructive' })
      }
    } finally {
      setProcessing(false)
    }
  }

  const openPermissionModal = (user: User) => {
    setPermissionTarget(user)
    setSelectedPerms(user.permissions || [])
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2 text-purple-700">
            <ShieldAlert className="w-8 h-8" />
            Super Admin Console
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage granular permissions and roles. Use with caution.
          </p>
        </div>
      </div>

      <Card className="border-purple-200 shadow-sm">
        <CardHeader>
          <CardTitle>Privileged Users</CardTitle>
          <CardDescription>Admins and Sellers with special access</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.map(user => (
              <div key={user.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg bg-gray-50 gap-4">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-full ${user.role === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                    {user.role === 'SUPER_ADMIN' ? <ShieldAlert className="w-5 h-5" /> : <UserCog className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="font-semibold">{user.name}</h3>
                    <p className="text-sm text-gray-500">{user.email}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge variant={user.role === 'SUPER_ADMIN' ? 'default' : 'secondary'}>
                        {user.role}
                      </Badge>
                      {user.permissions?.map(p => (
                        <Badge key={p} variant="outline" className="text-xs bg-white text-gray-600">
                          {p.replace(/_/g, ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {user.role !== 'SUPER_ADMIN' && (
                    <>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => openPermissionModal(user)}
                        className="gap-2"
                      >
                        <Key className="w-4 h-4" /> Permissions
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive" 
                        onClick={() => setTransferTarget(user)}
                        className="gap-2 bg-red-100 text-red-700 hover:bg-red-200 border-red-200"
                      >
                         Make Super Admin
                      </Button>
                    </>
                  )}
                  {user.role === 'SUPER_ADMIN' && (
                    <span className="text-xs text-muted-foreground italic px-3">Cannot modify self here</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Feature Toggles */}
      <div className="mt-8">
        <FeatureToggles />
      </div>

      <div className="mt-8 mb-8">
         <CommissionSettings canEdit={true} />
      </div>

      <GamificationSettings />

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4 text-purple-800">Direct Command Chat</h2>
        <InternalChat />
      </div>

      {/* Permission Modal */}
      <Dialog open={!!permissionTarget} onOpenChange={(open) => !open && setPermissionTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="w-5 h-5 text-blue-600" />
              Edit Permissions
            </DialogTitle>
            <DialogDescription>
              Grant specific capabilities to {permissionTarget?.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4 max-h-80 overflow-y-auto">
            {/* Admin Abilities */}
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-blue-700 border-b pb-1">🔷 অ্যাডমিন ক্ষমতা</h4>
              {PERMISSIONS_LIST.filter(p => p.category === 'admin').map(perm => (
                <div key={perm.id} className="flex items-start space-x-2 p-2 rounded hover:bg-blue-50">
                  <Checkbox 
                    id={perm.id} 
                    checked={selectedPerms.includes(perm.id)}
                    onCheckedChange={(checked) => {
                      if (checked) setSelectedPerms([...selectedPerms, perm.id])
                      else setSelectedPerms(selectedPerms.filter(p => p !== perm.id))
                    }}
                    className="mt-0.5"
                  />
                  <div>
                    <Label htmlFor={perm.id} className="cursor-pointer text-sm font-medium">{perm.label}</Label>
                    <p className="text-xs text-gray-500">{perm.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Seller Abilities */}
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-green-700 border-b pb-1">🏪 সেলার ক্ষমতা</h4>
              {PERMISSIONS_LIST.filter(p => p.category === 'seller').map(perm => (
                <div key={perm.id} className="flex items-start space-x-2 p-2 rounded hover:bg-green-50">
                  <Checkbox 
                    id={perm.id} 
                    checked={selectedPerms.includes(perm.id)}
                    onCheckedChange={(checked) => {
                      if (checked) setSelectedPerms([...selectedPerms, perm.id])
                      else setSelectedPerms(selectedPerms.filter(p => p !== perm.id))
                    }}
                    className="mt-0.5"
                  />
                  <div>
                    <Label htmlFor={perm.id} className="cursor-pointer text-sm font-medium">{perm.label}</Label>
                    <p className="text-xs text-gray-500">{perm.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Restricted Features */}
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-purple-700 border-b pb-1">🔒 বিশেষ ফিচার অ্যাক্সেস</h4>
              {PERMISSIONS_LIST.filter(p => p.category === 'feature').map(perm => (
                <div key={perm.id} className="flex items-start space-x-2 p-2 rounded hover:bg-purple-50">
                  <Checkbox 
                    id={perm.id} 
                    checked={selectedPerms.includes(perm.id)}
                    onCheckedChange={(checked) => {
                      if (checked) setSelectedPerms([...selectedPerms, perm.id])
                      else setSelectedPerms(selectedPerms.filter(p => p !== perm.id))
                    }}
                    className="mt-0.5"
                  />
                  <div>
                    <Label htmlFor={perm.id} className="cursor-pointer text-sm font-medium">{perm.label}</Label>
                    <p className="text-xs text-gray-500">{perm.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="border-t pt-4">
            <Label className="flex items-center gap-2 text-amber-600">
              <Lock className="w-4 h-4" />
              Confirm with Password
            </Label>
            <Input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1"
              placeholder="Your current password"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setPermissionTarget(null); setPassword('') }}>Cancel</Button>
            <Button onClick={handleSavePermissions} disabled={processing || !password}>
              {processing && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Transfer Role Modal */}
      <Dialog open={!!transferTarget} onOpenChange={(open) => !open && setTransferTarget(null)}>
        <DialogContent className="border-red-200">
          <DialogHeader>
            <DialogTitle className="text-red-700 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Transfer Super Admin Role?
            </DialogTitle>
            <DialogDescription>
              This action is IRREVERSIBLE. You will be demoted to a regular Admin immediately.
              <br/>
              Please enter your password to confirm.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
             <Label>Confirm Password</Label>
             <Input 
               type="password" 
               value={password}
               onChange={(e) => setPassword(e.target.value)}
               className="mt-1"
               placeholder="Current password"
             />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setTransferTarget(null)}>Cancel</Button>
            <Button 
               variant="destructive" 
               onClick={handleTransfer} 
               disabled={processing || !password}
            >
              {processing && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Confirm Transfer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
