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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-1 flex items-center gap-2">
            <UserCog className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
            User Management
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {isSuperAdmin ? 'Manage user roles and permissions' : 'View registered users'}
          </p>
        </div>
        <Button onClick={fetchUsers} variant="outline" size="sm" className="w-fit">
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
      <div className="bg-white/50 p-3 rounded-lg border border-dashed text-xs sm:text-sm">
        <div className="flex items-center gap-2 flex-wrap">
           <span className="text-muted-foreground font-medium">Badges:</span>
           <div className="flex gap-2 flex-wrap">
             <RoleBadge role="superadmin" size="sm" />
             <RoleBadge role="admin" size="sm" />
             <RoleBadge role="seller" size="sm" />
             <RoleBadge role="customer" size="sm" />
           </div>
        </div>
      </div>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          
          {/* Mobile Card View */}
          <div className="grid grid-cols-1 gap-3 md:hidden p-3">
            {filteredUsers.map((user) => (
              <div key={user.id} className="bg-white p-4 rounded-xl border shadow-sm space-y-3">
                <div className="flex justify-between items-start gap-2">
                  <div className="min-w-0">
                    <h3 className="font-bold text-gray-900 truncate">{user.name}</h3>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <RoleBadge role={user.role} tier={user.loyaltyPoints?.tier?.name} size="sm" />
                </div>
                
                <div className="flex justify-between items-center text-xs border-t pt-3 border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Status:</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      user.isActive !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {user.isActive !== false ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="text-gray-600">
                    <span className="text-muted-foreground">Orders:</span> <span className="font-bold">{user._count?.orders || 0}</span>
                  </div>
                </div>

                {isSuperAdmin && user.role !== 'superadmin' && (
                  <div className="pt-3 flex flex-wrap gap-2 border-t border-gray-100 justify-end">
                    {user.role === 'customer' ? (
                      <div className="flex gap-2 w-full sm:w-auto">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openDialog(user, 'promote_admin')}
                          className="h-8 text-[10px] sm:text-xs flex-1 sm:flex-none text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                        >
                          <Shield className="w-3.5 h-3.5 mr-1" /> Admin
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openDialog(user, 'promote_seller')}
                          className="h-8 text-[10px] sm:text-xs flex-1 sm:flex-none text-blue-600 border-blue-200 hover:bg-blue-50"
                        >
                          <BadgeCheck className="w-3.5 h-3.5 mr-1" /> Seller
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openDialog(user, 'demote')}
                        className="h-8 text-xs text-orange-600 border-orange-200 hover:bg-orange-50"
                      >
                        <UserIcon className="w-3.5 h-3.5 mr-1" /> Demote
                      </Button>
                    )}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openDialog(user, 'toggle')}
                        className={`h-8 w-8 p-0 ${user.isActive !== false ? 'text-orange-600 border-orange-200' : 'text-green-600 border-green-200'}`}
                      >
                        {user.isActive !== false ? <Ban className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5" />}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openDialog(user, 'delete')}
                        className="h-8 w-8 p-0 text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
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
