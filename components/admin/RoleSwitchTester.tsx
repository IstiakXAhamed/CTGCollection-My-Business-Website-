'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { 
  Shuffle, Loader2, RefreshCw, Eye, Package, ShoppingCart, 
  Tag, Sparkles, Users, Crown, Store, Settings, ChevronDown
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { 
  ALL_PERMISSIONS,
  PERMISSION_TEMPLATES,
  getDefaultPermissionsForRole,
  Permission
} from '@/lib/permissions-config'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function RoleSwitchTester() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [testRole, setTestRole] = useState<'admin' | 'seller'>('seller')
  const [testPermissions, setTestPermissions] = useState<string[]>([])
  const [currentRoleStatus, setCurrentRoleStatus] = useState<any>(null)
  const [showCustomize, setShowCustomize] = useState(false)
  
  // Fetch current role status
  useEffect(() => {
    fetchRoleStatus()
  }, [])
  
  // Set default permissions when role changes
  useEffect(() => {
    setTestPermissions(getDefaultPermissionsForRole(testRole))
  }, [testRole])
  
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
      // ALWAYS send testPermissions - this is critical!
      const res = await fetch('/api/auth/role-switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          targetRole: testRole,
          testPermissions: testPermissions // Always send the permissions
        })
      })
      
      const data = await res.json()
      
      if (res.ok) {
        toast({
          title: `Switched to ${testRole.toUpperCase()}`,
          description: `Testing with ${testPermissions.length} permissions`,
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
  
  // Apply a template
  const applyTemplate = (templateId: string) => {
    const templates: Record<string, string[]> = {
      'full_admin': PERMISSION_TEMPLATES.fullAdmin.permissions,
      'limited_admin': PERMISSION_TEMPLATES.limitedAdmin.permissions,
      'full_seller': PERMISSION_TEMPLATES.fullSeller.permissions,
      'restricted_seller': PERMISSION_TEMPLATES.restrictedSeller.permissions,
      'empty': [],
    }
    
    if (templates[templateId]) {
      setTestPermissions(templates[templateId])
      toast({
        title: 'Template Applied',
        description: `Loaded ${templateId.replace('_', ' ')} permissions`,
      })
    }
  }

  // Get permissions filtered by role category
  const roleCategory = testRole === 'seller' ? 'seller' : 'admin'
  const permissionsToShow = ALL_PERMISSIONS.filter((p: Permission) => 
    p.category === roleCategory || p.category === 'feature'
  )
  
  // Templates for the current role
  const roleTemplates = testRole === 'seller' 
    ? [
        { id: 'full_seller', name: 'Full Seller', desc: 'All seller permissions' },
        { id: 'restricted_seller', name: 'Restricted Seller', desc: 'View only access' },
        { id: 'empty', name: 'No Permissions', desc: 'Empty slate' },
      ]
    : [
        { id: 'full_admin', name: 'Full Admin', desc: 'All admin permissions' },
        { id: 'limited_admin', name: 'Limited Admin', desc: 'Basic access only' },
        { id: 'empty', name: 'No Permissions', desc: 'Empty slate' },
      ]
  
  return (
    <Card className="border-indigo-200 shadow-sm">
      <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
        <CardTitle className="flex items-center gap-2 text-indigo-700">
          <Shuffle className="w-5 h-5" />
          Role Switch Testing
        </CardTitle>
        <CardDescription>
          Test the platform as different roles with specific permissions
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        {/* Current Status */}
        {currentRoleStatus?.isSwitched && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between">
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
        <div className="flex items-center gap-4">
          <Label className="font-medium min-w-[80px]">Test as:</Label>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant={testRole === 'seller' ? 'default' : 'outline'}
              onClick={() => setTestRole('seller')}
              className="gap-1"
            >
              <Store className="w-4 h-4" />
              Seller
            </Button>
            <Button 
              size="sm"
              variant={testRole === 'admin' ? 'default' : 'outline'}
              onClick={() => setTestRole('admin')}
              className="gap-1"
            >
              <Crown className="w-4 h-4" />
              Admin
            </Button>
          </div>
        </div>
        
        {/* Quick Templates */}
        <div className="flex items-center gap-4">
          <Label className="font-medium min-w-[80px]">Template:</Label>
          <Select onValueChange={applyTemplate}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select a template..." />
            </SelectTrigger>
            <SelectContent>
              {roleTemplates.map(t => (
                <SelectItem key={t.id} value={t.id}>
                  <span className="font-medium">{t.name}</span>
                  <span className="text-xs text-gray-500 ml-2">({t.desc})</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Summary of current permissions */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-blue-800">
                {testPermissions.length} Permissions Selected
              </span>
            </div>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => setShowCustomize(!showCustomize)}
              className="gap-1 text-blue-700"
            >
              <ChevronDown className={`w-4 h-4 transition-transform ${showCustomize ? 'rotate-180' : ''}`} />
              {showCustomize ? 'Hide Details' : 'Customize'}
            </Button>
          </div>
          <div className="flex flex-wrap gap-1">
            {testPermissions.slice(0, 5).map(p => (
              <Badge key={p} variant="outline" className="text-xs bg-white">
                {p.replace('seller_', '').replace('manage_', '').replace(/_/g, ' ')}
              </Badge>
            ))}
            {testPermissions.length > 5 && (
              <Badge variant="outline" className="text-xs bg-white">
                +{testPermissions.length - 5} more
              </Badge>
            )}
            {testPermissions.length === 0 && (
              <span className="text-xs text-gray-500 italic">No permissions - will see minimal menu</span>
            )}
          </div>
        </div>
        
        {/* Custom Permission Selection (expandable) */}
        {showCustomize && (
          <div className="border rounded-lg p-3 max-h-48 overflow-y-auto bg-gray-50">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">
                {testRole === 'seller' ? 'Seller' : 'Admin'} Permissions:
              </span>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => setTestPermissions(permissionsToShow.map(p => p.id))}
                  className="text-xs h-7"
                >
                  Select All
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => setTestPermissions([])}
                  className="text-xs h-7"
                >
                  Clear All
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-1">
              {permissionsToShow.map((perm: Permission) => (
                <label 
                  key={perm.id}
                  className="flex items-center gap-2 text-sm p-1.5 rounded hover:bg-white cursor-pointer"
                >
                  <Checkbox 
                    checked={testPermissions.includes(perm.id)}
                    onCheckedChange={() => togglePermission(perm.id)}
                  />
                  <span className="truncate text-xs">{perm.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}
        
        {/* Action Button */}
        <Button 
          onClick={handleSwitchRole} 
          disabled={loading}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
        >
          {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          <Shuffle className="w-4 h-4 mr-2" />
          Switch to {testRole.charAt(0).toUpperCase() + testRole.slice(1)} with {testPermissions.length} Permissions
        </Button>
      </CardContent>
    </Card>
  )
}
