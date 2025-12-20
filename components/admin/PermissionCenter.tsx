'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Shield, Search, Loader2, Save, User, Lock, Unlock,
  ChevronRight, CheckCircle2, XCircle, RefreshCw, History,
  Crown, UserCog, Store, AlertTriangle
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import {
  ALL_PERMISSIONS,
  PERMISSION_CATEGORIES,
  PERMISSION_TEMPLATES,
  getPermissionsByCategory,
  getCategoryInfo,
  type Permission
} from '@/lib/permissions-config'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface User {
  id: string
  name: string
  email: string
  role: string
  permissions: string[]
  createdAt: string
  isActive: boolean
}

export function PermissionCenter() {
  const { toast } = useToast()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [userPermissions, setUserPermissions] = useState<string[]>([])
  const [lockedPermissions, setLockedPermissions] = useState<string[]>([])
  const [password, setPassword] = useState('')

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
      console.error('Failed to fetch users:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filter users based on search and role
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesRole = roleFilter === 'all' || user.role.toLowerCase() === roleFilter
      return matchesSearch && matchesRole
    })
  }, [users, searchTerm, roleFilter])

  // Select a user
  const handleSelectUser = (user: User) => {
    setSelectedUser(user)
    setUserPermissions(user.permissions || [])
    setLockedPermissions([]) // Would load from user.accessRestrictions in future
    setPassword('')
  }

  // Toggle permission
  const handleTogglePermission = (permId: string) => {
    setUserPermissions(prev => 
      prev.includes(permId) 
        ? prev.filter(p => p !== permId)
        : [...prev, permId]
    )
  }

  // Toggle lock on permission
  const handleToggleLock = (permId: string) => {
    setLockedPermissions(prev => 
      prev.includes(permId) 
        ? prev.filter(p => p !== permId)
        : [...prev, permId]
    )
  }

  // Apply template
  const handleApplyTemplate = (templateId: string) => {
    const template = Object.values(PERMISSION_TEMPLATES).find(t => t.id === templateId)
    if (template) {
      setUserPermissions(template.permissions)
      toast({
        title: 'Template Applied',
        description: `Applied "${template.name}" template. Click Save to confirm.`,
      })
    }
  }

  // Save permissions
  const handleSave = async () => {
    if (!selectedUser || !password) {
      toast({ title: 'Error', description: 'Please enter your password to confirm', variant: 'destructive' })
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/admin/super-admin/permissions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetUserId: selectedUser.id,
          permissions: userPermissions,
          lockedPermissions: lockedPermissions,
          password: password,
        })
      })

      if (res.ok) {
        toast({ title: 'Success', description: 'Permissions updated successfully!' })
        // Update local state
        setUsers(prev => prev.map(u => 
          u.id === selectedUser.id ? { ...u, permissions: userPermissions } : u
        ))
        setSelectedUser(prev => prev ? { ...prev, permissions: userPermissions } : null)
        setPassword('')
      } else {
        const data = await res.json()
        toast({ title: 'Error', description: data.error || 'Failed to update permissions', variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to save permissions', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  // Get role badge
  const getRoleBadge = (role: string) => {
    const roleConfig: Record<string, { color: string; icon: any; label: string }> = {
      superadmin: { color: 'bg-purple-100 text-purple-700 border-purple-200', icon: Crown, label: 'Super Admin' },
      admin: { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Shield, label: 'Admin' },
      seller: { color: 'bg-green-100 text-green-700 border-green-200', icon: Store, label: 'Seller' },
      customer: { color: 'bg-gray-100 text-gray-700 border-gray-200', icon: User, label: 'Customer' },
    }
    const config = roleConfig[role.toLowerCase()] || roleConfig.customer
    const Icon = config.icon
    return (
      <Badge className={`${config.color} border flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    )
  }

  // Render permission category
  const renderPermissionCategory = (categoryId: keyof typeof PERMISSION_CATEGORIES) => {
    const category = getCategoryInfo(categoryId)
    const permissions = getPermissionsByCategory(categoryId)
    const Icon = category.icon

    return (
      <div className="space-y-2">
        <div className={`flex items-center gap-2 ${category.textColor} font-semibold border-b ${category.borderColor} pb-2`}>
          <Icon className="w-4 h-4" />
          <span>{category.label}</span>
          <Badge variant="outline" className="ml-auto text-xs">
            {permissions.filter(p => userPermissions.includes(p.id)).length}/{permissions.length}
          </Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {permissions.map(perm => {
            const isGranted = userPermissions.includes(perm.id)
            const isLocked = lockedPermissions.includes(perm.id)
            const PermIcon = perm.icon || Shield

            return (
              <div 
                key={perm.id}
                className={`flex items-center justify-between p-2 rounded-lg border transition-all ${
                  isGranted 
                    ? `${category.bgColor} ${category.borderColor}` 
                    : 'bg-gray-50 border-gray-200 opacity-60'
                } ${isLocked ? 'ring-2 ring-red-300' : ''}`}
              >
                <div className="flex items-center gap-2">
                  <Checkbox 
                    id={perm.id}
                    checked={isGranted}
                    onCheckedChange={() => handleTogglePermission(perm.id)}
                    disabled={isLocked}
                  />
                  <div className="flex items-center gap-1">
                    <PermIcon className="w-3 h-3 text-gray-500" />
                    <Label htmlFor={perm.id} className="text-sm cursor-pointer">
                      {perm.label}
                    </Label>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`p-1 h-6 w-6 ${isLocked ? 'text-red-500' : 'text-gray-400'}`}
                  onClick={() => handleToggleLock(perm.id)}
                  title={isLocked ? 'Unlock this permission' : 'Lock this permission'}
                >
                  {isLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                </Button>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <Card className="border-purple-200">
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-purple-200 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50">
        <CardTitle className="flex items-center gap-2 text-purple-800">
          <Shield className="w-6 h-6" />
          Permission Management Center
        </CardTitle>
        <CardDescription>
          Dynamically manage roles, permissions, and feature access for all users
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left Panel - User List */}
          <div className="lg:col-span-1 space-y-3">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-28">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="seller">Seller</SelectItem>
                  <SelectItem value="customer">Customer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <ScrollArea className="h-[400px] border rounded-lg">
              <div className="p-2 space-y-1">
                {filteredUsers.map(user => (
                  <div
                    key={user.id}
                    onClick={() => user.role.toLowerCase() !== 'superadmin' && handleSelectUser(user)}
                    className={`p-3 rounded-lg cursor-pointer transition-all ${
                      selectedUser?.id === user.id 
                        ? 'bg-purple-100 border-purple-300 border-2' 
                        : 'bg-white hover:bg-gray-50 border border-gray-200'
                    } ${user.role.toLowerCase() === 'superadmin' ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                          user.role.toLowerCase() === 'superadmin' ? 'bg-purple-500' :
                          user.role.toLowerCase() === 'admin' ? 'bg-blue-500' :
                          user.role.toLowerCase() === 'seller' ? 'bg-green-500' : 'bg-gray-400'
                        }`}>
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{user.name}</p>
                          <p className="text-xs text-gray-500 truncate max-w-[150px]">{user.email}</p>
                        </div>
                      </div>
                      <ChevronRight className={`w-4 h-4 text-gray-400 ${selectedUser?.id === user.id ? 'text-purple-600' : ''}`} />
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      {getRoleBadge(user.role)}
                      <span className="text-xs text-gray-500">
                        {user.permissions?.length || 0} perms
                      </span>
                    </div>
                  </div>
                ))}
                {filteredUsers.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <User className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p>No users found</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Right Panel - Permission Details */}
          <div className="lg:col-span-2">
            {selectedUser ? (
              <div className="space-y-4">
                {/* Selected User Header */}
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-lg font-bold ${
                      selectedUser.role.toLowerCase() === 'admin' ? 'bg-blue-500' :
                      selectedUser.role.toLowerCase() === 'seller' ? 'bg-green-500' : 'bg-gray-400'
                    }`}>
                      {selectedUser.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold">{selectedUser.name}</p>
                      <p className="text-sm text-gray-600">{selectedUser.email}</p>
                    </div>
                  </div>
                  {getRoleBadge(selectedUser.role)}
                </div>

                {/* Permission Tabs */}
                <Tabs defaultValue="abilities" className="w-full">
                  <TabsList className="grid w-full grid-cols-4 mb-4">
                    <TabsTrigger value="abilities" className="text-xs sm:text-sm">
                      <Shield className="w-3 h-3 mr-1" />
                      Abilities
                    </TabsTrigger>
                    <TabsTrigger value="restricted" className="text-xs sm:text-sm">
                      <Lock className="w-3 h-3 mr-1" />
                      Restricted
                    </TabsTrigger>
                    <TabsTrigger value="features" className="text-xs sm:text-sm">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Features
                    </TabsTrigger>
                    <TabsTrigger value="templates" className="text-xs sm:text-sm">
                      <RefreshCw className="w-3 h-3 mr-1" />
                      Templates
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="abilities" className="space-y-4">
                    <ScrollArea className="h-[280px] pr-4">
                      <div className="space-y-4">
                        {renderPermissionCategory('admin')}
                        {renderPermissionCategory('seller')}
                      </div>
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent value="restricted" className="space-y-4">
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
                      <div className="flex items-center gap-2 text-red-700">
                        <AlertTriangle className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          These abilities are restricted by default. Only Super Admin can grant them.
                        </span>
                      </div>
                    </div>
                    <ScrollArea className="h-[240px] pr-4">
                      {renderPermissionCategory('restricted')}
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent value="features" className="space-y-4">
                    <ScrollArea className="h-[280px] pr-4">
                      {renderPermissionCategory('feature')}
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent value="templates" className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {Object.values(PERMISSION_TEMPLATES).map(template => (
                        <Button
                          key={template.id}
                          variant="outline"
                          className="h-auto py-3 px-4 justify-start"
                          onClick={() => handleApplyTemplate(template.id)}
                        >
                          <div className="text-left">
                            <p className="font-medium">{template.name}</p>
                            <p className="text-xs text-gray-500">{template.description}</p>
                            <Badge variant="secondary" className="mt-1 text-xs">
                              {template.permissions.length} permissions
                            </Badge>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>

                {/* Save Section */}
                <div className="border-t pt-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-amber-600" />
                    <Label className="text-amber-600 font-medium">Confirm with your password</Label>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="flex-1"
                    />
                    <Button 
                      onClick={handleSave} 
                      disabled={saving || !password}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      {saving ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      Apply Instantly
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">
                    Changes take effect immediately. No code changes or redeployment required.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-16 text-gray-500">
                <UserCog className="w-16 h-16 mb-4 opacity-20" />
                <p className="text-lg font-medium">Select a User</p>
                <p className="text-sm">Choose a user from the list to manage their permissions</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
