
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

interface User {
  id: string
  name: string
  email: string
  role: string
  permissions: string[]
  createdAt: string
}

const PERMISSIONS_LIST = [
  // Multi-Vendor
  { id: 'manage_shops', label: 'Manage Shops (Multi-Vendor)' },
  { id: 'approve_sellers', label: 'Approve Seller Applications' },
  
  // E-commerce Core
  { id: 'manage_products', label: 'Manage Products & Inventory' },
  { id: 'manage_orders', label: 'Manage Orders' },
  { id: 'manage_users', label: 'Manage Customers & Reviews' },
  
  // Marketing & Content
  { id: 'manage_marketing', label: 'Manage Marketing (Coupons, Banners)' },
  { id: 'manage_content', label: 'Manage Content (Announcements)' },
  
  // System
  { id: 'manage_settings', label: 'Manage Site Settings' },
  { id: 'manage_admins', label: 'Manage Other Admins' },
  { id: 'manage_communications', label: 'Manage Messages & Chat' },
  { id: 'manage_storage', label: 'Manage File Storage (Documents)' },
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
    if (!permissionTarget) return

    setProcessing(true)
    try {
      const res = await fetch('/api/admin/super-admin/permissions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: permissionTarget.id, permissions: selectedPerms })
      })
             
      if (res.ok) {
        toast({ title: 'Permissions Updated', description: `Updated for ${permissionTarget.name}` })
        fetchUsers() // Refresh list
        setPermissionTarget(null)
      } else {
        toast({ title: 'Error', description: 'Failed to update permissions', variant: 'destructive' })
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
            <DialogTitle>Edit Permissions</DialogTitle>
            <DialogDescription>
              Grant specific capabilities to {permissionTarget?.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-3">
            {PERMISSIONS_LIST.map(perm => (
              <div key={perm.id} className="flex items-center space-x-2 p-2 rounded hover:bg-gray-100">
                <Checkbox 
                  id={perm.id} 
                  checked={selectedPerms.includes(perm.id)}
                  onCheckedChange={(checked) => {
                    if (checked) setSelectedPerms([...selectedPerms, perm.id])
                    else setSelectedPerms(selectedPerms.filter(p => p !== perm.id))
                  }}
                />
                <Label htmlFor={perm.id} className="cursor-pointer flex-1">
                  {perm.label}
                </Label>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPermissionTarget(null)}>Cancel</Button>
            <Button onClick={handleSavePermissions} disabled={processing}>
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
