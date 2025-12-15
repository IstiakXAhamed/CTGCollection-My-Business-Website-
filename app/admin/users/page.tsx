'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Search, 
  Shield, 
  ShieldCheck, 
  User as UserIcon, 
  RefreshCw, 
  UserCog,
  Ban,
  CheckCircle,
  Trash2,
  Store,
  BadgeCheck
} from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useToast } from '@/hooks/use-toast'
import RoleBadge from '@/components/RoleBadge'

const roleConfig: Record<string, { icon: any, color: string, label: string }> = {
  superadmin: { icon: ShieldCheck, color: 'bg-purple-100 text-purple-800', label: 'Super Admin' },
  admin: { icon: Shield, color: 'bg-indigo-100 text-indigo-800', label: 'Admin' },
  seller: { icon: BadgeCheck, color: 'bg-blue-100 text-blue-800', label: 'Seller' },
  customer: { icon: UserIcon, color: 'bg-gray-100 text-gray-800', label: 'Customer' }
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [dialogAction, setDialogAction] = useState<'promote_admin' | 'promote_seller' | 'demote' | 'delete' | 'toggle'>('promote_admin')
  const { toast } = useToast()

  useEffect(() => {
    fetchUsers()
  }, [roleFilter])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (roleFilter !== 'all') params.set('role', roleFilter)
      
      const res = await fetch(`/api/admin/users?${params}`, { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setUsers(data.users || [])
        setIsSuperAdmin(data.isSuperAdmin || false)
      } else if (res.status === 403) {
        toast({ title: 'Access Denied', description: 'You do not have permission to view this page', variant: 'destructive' })
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ userId, role: newRole })
      })
      
      if (res.ok) {
        toast({ title: 'Success', description: `User role updated to ${newRole}` })
        fetchUsers()
      } else {
        const data = await res.json()
        toast({ title: 'Error', description: data.error, variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update role', variant: 'destructive' })
    }
    setDialogOpen(false)
  }

  const handleToggleActive = async (userId: string, isActive: boolean) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ userId, isActive })
      })
      
      if (res.ok) {
        toast({ title: 'Success', description: `User ${isActive ? 'activated' : 'deactivated'}` })
        fetchUsers()
      } else {
        const data = await res.json()
        toast({ title: 'Error', description: data.error, variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update user', variant: 'destructive' })
    }
    setDialogOpen(false)
  }

  const handleDelete = async (userId: string) => {
    try {
      const res = await fetch(`/api/admin/users?userId=${userId}`, {
        method: 'DELETE',
        credentials: 'include'
      })
      
      if (res.ok) {
        toast({ title: 'Success', description: 'User deleted successfully' })
        fetchUsers()
      } else {
        const data = await res.json()
        toast({ title: 'Error', description: data.error, variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete user', variant: 'destructive' })
    }
    setDialogOpen(false)
  }

  const openDialog = (user: any, action: typeof dialogAction) => {
    setSelectedUser(user)
    setDialogAction(action)
    setDialogOpen(true)
  }

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <UserCog className="w-8 h-8" />
            User Management
          </h1>
          <p className="text-muted-foreground">
            {isSuperAdmin ? 'Manage user roles and permissions' : 'View registered users'}
          </p>
        </div>
        <Button onClick={fetchUsers} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="h-10 px-4 rounded-md border bg-background"
        >
          <option value="all">All Roles</option>
          <option value="superadmin">Super Admin</option>
          <option value="admin">Admin</option>
          <option value="seller">Seller</option>
          <option value="customer">Customer</option>
        </select>
      </div>

      {/* Role Legend */}
      <div className="flex gap-4 text-sm flex-wrap">
        <div className="flex items-center gap-2">
           <span className="text-muted-foreground">Badges:</span>
           <RoleBadge role="superadmin" size="sm" />
           <RoleBadge role="admin" size="sm" />
           <RoleBadge role="seller" size="sm" />
           <RoleBadge role="customer" size="sm" />
        </div>
      </div>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left py-3 px-4">User</th>
                  <th className="text-left py-3 px-4">Role</th>
                  <th className="text-left py-3 px-4">Orders</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Joined</th>
                  {isSuperAdmin && <th className="text-right py-3 px-4">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => {
                  const roleInfo = roleConfig[user.role] || roleConfig.customer
                  const Icon = roleInfo.icon
                  
                  return (
                    <tr key={user.id} className="border-b hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-semibold">{user.name}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <RoleBadge role={user.role} tier={user.loyaltyPoints?.tier?.name} size="sm" />
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm">{user._count?.orders || 0}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          user.isActive !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {user.isActive !== false ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm text-muted-foreground">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      {isSuperAdmin && (
                        <td className="py-4 px-4">
                          <div className="flex justify-end gap-2">
                            {user.role !== 'superadmin' && (
                              <>
                                {user.role === 'customer' ? (
                                  <>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => openDialog(user, 'promote_admin')}
                                      className="text-indigo-600"
                                      title="Make Admin"
                                    >
                                      <Shield className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => openDialog(user, 'promote_seller')}
                                      className="text-blue-600"
                                      title="Make Seller"
                                    >
                                      <BadgeCheck className="w-4 h-4" />
                                    </Button>
                                  </>
                                ) : (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => openDialog(user, 'demote')}
                                    className="text-orange-600"
                                    title="Demote to Customer"
                                  >
                                    <UserIcon className="w-4 h-4 mr-1" />
                                    Demote
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openDialog(user, 'toggle')}
                                  className={user.isActive !== false ? 'text-orange-600' : 'text-green-600'}
                                >
                                  {user.isActive !== false ? (
                                    <><Ban className="w-4 h-4" /></>
                                  ) : (
                                    <><CheckCircle className="w-4 h-4" /></>
                                  )}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openDialog(user, 'delete')}
                                  className="text-red-600"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                            {user.role === 'superadmin' && (
                              <span className="text-xs text-muted-foreground italic">Protected</span>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {dialogAction === 'promote_admin' && 'Promote to Admin'}
              {dialogAction === 'promote_seller' && 'Promote to Seller'}
              {dialogAction === 'demote' && 'Remove Privileges'}
              {dialogAction === 'toggle' && (selectedUser?.isActive !== false ? 'Deactivate User' : 'Activate User')}
              {dialogAction === 'delete' && 'Delete User'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {dialogAction === 'promote_admin' && `Make ${selectedUser?.name} an Admin? They will have full access except superadmin features.`}
              {dialogAction === 'promote_seller' && `Make ${selectedUser?.name} a Seller? They will have restricted access (Orders, Products, Messages only).`}
              {dialogAction === 'demote' && `Remove privileges from ${selectedUser?.name}? They will become a regular customer.`}
              {dialogAction === 'toggle' && (selectedUser?.isActive !== false 
                ? `Deactivate ${selectedUser?.name}? They won't be able to login.`
                : `Activate ${selectedUser?.name}? They will be able to login again.`
              )}
              {dialogAction === 'delete' && `Permanently delete ${selectedUser?.name}? This action cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (dialogAction === 'promote_admin') handleRoleChange(selectedUser.id, 'admin')
                else if (dialogAction === 'promote_seller') handleRoleChange(selectedUser.id, 'seller')
                else if (dialogAction === 'demote') handleRoleChange(selectedUser.id, 'customer')
                else if (dialogAction === 'toggle') handleToggleActive(selectedUser.id, selectedUser.isActive === false)
                else if (dialogAction === 'delete') handleDelete(selectedUser.id)
              }}
              className={dialogAction === 'delete' ? 'bg-red-600 hover:bg-red-700' : ''}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
