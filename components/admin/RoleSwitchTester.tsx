'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { 
  Shuffle, Loader2, RefreshCw, Eye, Package, ShoppingCart, 
  Tag
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { 
  ALL_PERMISSIONS,
  PERMISSION_CATEGORIES,
  getDefaultPermissionsForRole,
  Permission
} from '@/lib/permissions-config'

export function RoleSwitchTester() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [testRole, setTestRole] = useState<'admin' | 'seller'>('seller')
  const [testPermissions, setTestPermissions] = useState<string[]>([])
  const [useCustomPermissions, setUseCustomPermissions] = useState(false)
  const [currentRoleStatus, setCurrentRoleStatus] = useState<any>(null)
  
  // Fetch current role status
  useEffect(() => {
    fetchRoleStatus()
  }, [])
  
  // Set default permissions when role changes
  useEffect(() => {
    if (!useCustomPermissions) {
      setTestPermissions(getDefaultPermissionsForRole(testRole))
    }
  }, [testRole, useCustomPermissions])
  
  const fetchRoleStatus = async () => {
    try {
      const res = await fetch('/api/auth/role-switch')
      if (res.ok) {
        const data = await res.json()
        setCurrentRoleStatus(data)
      }
    } catch (error) {
      console.error('Failed to fetch role status:', error)
    }
  }
  
  const handleSwitchRole = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/auth/role-switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          targetRole: testRole,
          testPermissions: useCustomPermissions ? testPermissions : undefined 
        })
      })
      
      const data = await res.json()
      
      if (res.ok) {
        toast({
          title: `Switched to ${testRole.toUpperCase()}`,
          description: useCustomPermissions 
            ? `Testing with ${testPermissions.length} custom permissions`
            : 'Using default permissions for this role',
        })
        // Reload to apply role switch
        setTimeout(() => window.location.reload(), 500)
      } else {
        toast({ title: 'Error', description: data.error, variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to switch role', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }
  
  const handleRevertRole = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/auth/role-switch', {
        method: 'DELETE'
      })
      
      if (res.ok) {
        toast({ title: 'Reverted', description: 'Back to Super Admin' })
        setTimeout(() => window.location.reload(), 500)
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to revert', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }
  
  const togglePermission = (permId: string) => {
    if (testPermissions.includes(permId)) {
      setTestPermissions(testPermissions.filter(p => p !== permId))
    } else {
      setTestPermissions([...testPermissions, permId])
    }
  }
  
  const selectAllForRole = () => {
    const rolePerms = ALL_PERMISSIONS
      .filter((p: Permission) => p.category === (testRole === 'seller' ? 'seller' : 'admin'))
      .map((p: Permission) => p.id)
    setTestPermissions(rolePerms)
  }
  
  const clearAll = () => {
    setTestPermissions([])
  }

  // Get permissions to display based on test role
  const roleCategory = testRole === 'seller' ? 'seller' : 'admin'
  const permissionsToShow = ALL_PERMISSIONS.filter((p: Permission) => 
    p.category === roleCategory || p.category === 'feature'
  )

  
  return (
    <Card className="border-indigo-200 shadow-sm">
      <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
        <CardTitle className="flex items-center gap-2 text-indigo-700">
          <Shuffle className="w-5 h-5" />
          Role Switch Testing
        </CardTitle>
        <CardDescription>
          Test the platform as different roles with customizable permissions
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        {/* Current Status */}
        {currentRoleStatus?.isRoleSwitched && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between">
            <div>
              <span className="text-amber-800 font-medium">Currently viewing as: </span>
              <Badge variant="secondary" className="ml-2 bg-amber-100">{currentRoleStatus.currentRole}</Badge>
            </div>
            <Button size="sm" variant="outline" onClick={handleRevertRole} disabled={loading}>
              <RefreshCw className="w-4 h-4 mr-1" />
              Revert to Super Admin
            </Button>
          </div>
        )}
        
        {/* Role Selection */}
        <div className="flex items-center gap-4 mb-4">
          <Label className="font-medium">Test as:</Label>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant={testRole === 'seller' ? 'default' : 'outline'}
              onClick={() => setTestRole('seller')}
            >
              Seller
            </Button>
            <Button 
              size="sm"
              variant={testRole === 'admin' ? 'default' : 'outline'}
              onClick={() => setTestRole('admin')}
            >
              Admin
            </Button>
          </div>
        </div>
        
        {/* Custom Permissions Toggle */}
        <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
          <Switch 
            checked={useCustomPermissions}
            onCheckedChange={setUseCustomPermissions}
          />
          <div>
            <Label className="font-medium">Use Custom Permissions</Label>
            <p className="text-xs text-muted-foreground">
              {useCustomPermissions 
                ? 'Select specific permissions to test' 
                : `Using default ${testRole} permissions`}
            </p>
          </div>
        </div>
        
        {/* Permission Selection (when custom is enabled) */}
        {useCustomPermissions && (
          <div className="border rounded-lg p-4 mb-4 max-h-64 overflow-y-auto">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-medium text-gray-700">Select Permissions:</span>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={selectAllForRole}>
                  Select All {testRole}
                </Button>
                <Button size="sm" variant="ghost" onClick={clearAll}>
                  Clear
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              {permissionsToShow.map((perm: Permission) => (
                <label 
                  key={perm.id}
                  className="flex items-center gap-2 text-sm p-1 rounded hover:bg-gray-100 cursor-pointer"
                >
                  <Checkbox 
                    checked={testPermissions.includes(perm.id)}
                    onCheckedChange={() => togglePermission(perm.id)}
                  />
                  <span className="truncate">{perm.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}
        
        {/* Preview */}
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Eye className="w-4 h-4 text-blue-600" />
            <span className="font-medium text-blue-800">Preview: Menu items you'll see</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline"><Package className="w-3 h-3 mr-1" /> Dashboard</Badge>
            {(testPermissions.some(p => p.includes('product')) || !useCustomPermissions) && (
              <Badge variant="outline"><Package className="w-3 h-3 mr-1" /> Products</Badge>
            )}
            {(testPermissions.some(p => p.includes('order')) || !useCustomPermissions) && (
              <Badge variant="outline"><ShoppingCart className="w-3 h-3 mr-1" /> Orders</Badge>
            )}
            {testPermissions.includes('seller_create_coupons') && (
              <Badge variant="outline"><Tag className="w-3 h-3 mr-1" /> Coupons</Badge>
            )}
            <Badge variant="outline">Receipt Lookup</Badge>
          </div>
        </div>
        
        {/* Action Button */}
        <Button 
          onClick={handleSwitchRole} 
          disabled={loading}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
        >
          {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          <Shuffle className="w-4 h-4 mr-2" />
          Switch to {testRole.charAt(0).toUpperCase() + testRole.slice(1)} Role
        </Button>
      </CardContent>
    </Card>
  )
}
