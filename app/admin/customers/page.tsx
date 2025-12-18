'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Users as UsersIcon, ChevronLeft, ChevronRight, Loader2, Crown, X, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAutoRefresh } from '@/hooks/useAutoRefresh'

interface User {
  id: string
  name: string
  email: string
  phone?: string
  role: string
  createdAt: string
  _count?: { orders: number }
  loyaltyPoints?: {
    tierId?: string
    tier?: { id: string; displayName: string; color: string }
    totalPoints: number
  }
}

interface LoyaltyTier {
  id: string
  name: string
  displayName: string
  color: string
  minSpending: number
}

export default function CustomersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [tiers, setTiers] = useState<LoyaltyTier[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showTierModal, setShowTierModal] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [currentUserRole, setCurrentUserRole] = useState<string>('')
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 1
  })

  const fetchAllData = useCallback(async () => {
    await fetchUsers(pagination.page)
    await fetchTiers()
  }, [pagination.page])

  // Auto-refresh every 30 seconds
  useAutoRefresh(fetchAllData)

  useEffect(() => {
    fetchUsers(pagination.page)
    fetchTiers()
    // Get current user role (use active role, not realRole for role-switching)
    fetch('/api/auth/me', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          // Use the active role (which respects role switching)
          setCurrentUserRole(data.user.role)
        }
      })
  }, [pagination.page])

  const fetchUsers = async (page = 1) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/users?page=${page}&limit=${pagination.limit}&includeLoyalty=true`, { 
        credentials: 'include' 
      })
      if (res.ok) {
        const data = await res.json()
        setUsers(data.users || [])
        if (data.pagination) {
          setPagination(prev => ({
            ...prev,
            page: data.pagination.page,
            total: data.pagination.total,
            totalPages: data.pagination.totalPages
          }))
        }
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTiers = async () => {
    try {
      const res = await fetch('/api/admin/loyalty/tiers', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setTiers(data.tiers || [])
      }
    } catch (error) {
      console.error('Failed to fetch tiers:', error)
    }
  }

  const assignTier = async (tierId: string | null) => {
    if (!selectedUser) return
    setUpdating(true)
    try {
      const res = await fetch('/api/admin/users/assign-tier', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ userId: selectedUser.id, tierId })
      })
      
      if (res.ok) {
        // Refresh users
        await fetchUsers(pagination.page)
        setShowTierModal(false)
        setSelectedUser(null)
      }
    } catch (error) {
      console.error('Failed to assign tier:', error)
    } finally {
      setUpdating(false)
    }
  }

  const nextPage = () => {
    if (pagination.page < pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: prev.page + 1 }))
    }
  }

  const prevPage = () => {
    if (pagination.page > 1) {
      setPagination(prev => ({ ...prev, page: prev.page - 1 }))
    }
  }

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getTierBadge = (user: User) => {
    if (user.loyaltyPoints?.tier) {
      return (
        <span 
          className="px-2 py-1 rounded-full text-xs font-semibold text-white"
          style={{ backgroundColor: user.loyaltyPoints.tier.color }}
        >
          {user.loyaltyPoints.tier.displayName}
        </span>
      )
    }
    return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">No Tier</span>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Customers</h1>
        <p className="text-muted-foreground">
          {pagination.total} total customers • Page {pagination.page} of {pagination.totalPages}
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Customer</th>
                      <th className="text-left py-3 px-4">Email</th>
                      <th className="text-left py-3 px-4">Phone</th>
                      <th className="text-left py-3 px-4">Orders</th>
                      <th className="text-left py-3 px-4">Role</th>
                      <th className="text-left py-3 px-4">Membership Tier</th>
                      <th className="text-left py-3 px-4">Joined</th>
                      {currentUserRole === 'superadmin' && (
                        <th className="text-left py-3 px-4">Actions</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="border-b hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <UsersIcon className="w-5 h-5 text-blue-600" />
                            </div>
                            <span className="font-semibold">{user.name}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-sm">{user.email}</td>
                        <td className="py-4 px-4 text-sm">{user.phone || 'N/A'}</td>
                        <td className="py-4 px-4">{user._count?.orders || 0} orders</td>
                        <td className="py-4 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 
                            user.role === 'superadmin' ? 'bg-red-100 text-red-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          {getTierBadge(user)}
                        </td>
                        <td className="py-4 px-4 text-sm text-muted-foreground">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        {currentUserRole === 'superadmin' && (
                          <td className="py-4 px-4">
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1"
                              onClick={() => {
                                setSelectedUser(user)
                                setShowTierModal(true)
                              }}
                            >
                              <Crown className="w-4 h-4" />
                              Set Tier
                            </Button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-6 pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  Showing {(pagination.page - 1) * pagination.limit + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} customers
                </p>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={prevPage}
                    disabled={pagination.page <= 1}
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                  </Button>
                  <span className="px-3 py-1 bg-gray-100 rounded text-sm font-medium">
                    {pagination.page}
                  </span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={nextPage}
                    disabled={pagination.page >= pagination.totalPages}
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Tier Assignment Modal */}
      <AnimatePresence>
        {showTierModal && selectedUser && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setShowTierModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed left-1/2 -translate-x-1/2 w-[90vw] max-w-md bg-white rounded-xl shadow-2xl z-50"
              style={{ top: '60px', maxHeight: 'calc(100vh - 80px)' }}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-xl">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Crown className="w-5 h-5" />
                  Assign Membership Tier
                </h3>
                <button onClick={() => setShowTierModal(false)} className="p-1 hover:bg-white/20 rounded">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {/* Scrollable Content */}
              <div className="p-6 space-y-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
                {/* User Info at top */}
                <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <p className="text-xs text-gray-500 mb-1">Assigning tier to:</p>
                  <p className="font-semibold">{selectedUser.name}</p>
                  <p className="text-sm text-gray-500">{selectedUser.email}</p>
                  {selectedUser.loyaltyPoints?.tier && (
                    <p className="text-sm mt-2">
                      Current tier: <span className="font-semibold" style={{ color: selectedUser.loyaltyPoints.tier.color }}>
                        {selectedUser.loyaltyPoints.tier.displayName}
                      </span>
                    </p>
                  )}
                </div>

                {/* Tier Selection */}
                <div>
                  <p className="font-semibold text-sm text-gray-700 mb-3">Select Tier:</p>
                  <div className="space-y-2">
                    {/* No Tier Option */}
                    <button
                      onClick={() => assignTier(null)}
                      disabled={updating}
                      className="w-full p-3 border-2 rounded-lg text-left hover:border-gray-400 hover:bg-gray-50 transition flex items-center justify-between"
                    >
                      <div>
                        <span className="font-medium text-gray-600">No Tier</span>
                        <p className="text-xs text-gray-400">Remove membership tier</p>
                      </div>
                      {!selectedUser.loyaltyPoints?.tierId && (
                        <Check className="w-5 h-5 text-green-600" />
                      )}
                    </button>

                    {/* Tier Options */}
                    {tiers.map((tier) => (
                      <button
                        key={tier.id}
                        onClick={() => assignTier(tier.id)}
                        disabled={updating}
                        className="w-full p-3 border-2 rounded-lg text-left hover:border-gray-400 transition flex items-center justify-between"
                        style={{ 
                          borderColor: selectedUser.loyaltyPoints?.tierId === tier.id ? tier.color : undefined,
                          backgroundColor: selectedUser.loyaltyPoints?.tierId === tier.id ? `${tier.color}10` : undefined
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-8 h-8 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: tier.color }}
                          >
                            <Crown className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <span className="font-medium">{tier.displayName}</span>
                            <p className="text-xs text-gray-500">Min spend: ৳{tier.minSpending.toLocaleString()}</p>
                          </div>
                        </div>
                        {selectedUser.loyaltyPoints?.tierId === tier.id && (
                          <Check className="w-5 h-5 text-green-600" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Loading State */}
                {updating && (
                  <div className="flex items-center justify-center gap-2 text-blue-600 py-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Updating...</span>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
