'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Store, Search, Loader2, Check, X, Clock, Eye, BadgeCheck, 
  FileText, Phone, MapPin, Building
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useToast } from '@/hooks/use-toast'

interface Application {
  id: string
  shopName: string
  shopDescription?: string
  category?: string
  phone: string
  address?: string
  city?: string
  nidNumber?: string
  nidImage?: string
  passportNumber?: string
  passportImage?: string
  bankName?: string
  bankAccountNo?: string
  bankBranch?: string
  verificationTier: string
  status: string
  rejectionReason?: string
  createdAt: string
  user: { id: string; name: string; email: string; phone?: string }
}

export default function SellerApplicationsPage() {
  const { toast } = useToast()
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [counts, setCounts] = useState({ pending: 0, approved: 0, rejected: 0 })
  const [filter, setFilter] = useState<string>('pending')
  const [search, setSearch] = useState('')
  const [selectedApp, setSelectedApp] = useState<Application | null>(null)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    fetchApplications()
  }, [filter])

  const fetchApplications = async () => {
    try {
      const res = await fetch(`/api/admin/seller-applications?status=${filter}`, { 
        credentials: 'include' 
      })
      if (res.ok) {
        const data = await res.json()
        setApplications(data.applications || [])
        setCounts(data.counts || { pending: 0, approved: 0, rejected: 0 })
      }
    } catch (error) {
      console.error('Fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (action: 'approve' | 'reject', reason?: string) => {
    if (!selectedApp) return

    setProcessing(true)
    try {
      const res = await fetch(`/api/admin/seller-applications/${selectedApp.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action, rejectionReason: reason })
      })

      const data = await res.json()
      if (res.ok) {
        toast({ 
          title: action === 'approve' ? '✅ Approved!' : '❌ Rejected',
          description: data.message
        })
        setSelectedApp(null)
        fetchApplications()
      } else {
        toast({ title: 'Error', description: data.error, variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Action failed', variant: 'destructive' })
    } finally {
      setProcessing(false)
    }
  }

  const filtered = applications.filter(a => 
    a.shopName.toLowerCase().includes(search.toLowerCase()) ||
    a.user.name.toLowerCase().includes(search.toLowerCase()) ||
    a.user.email.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold flex items-center gap-2">
            <FileText className="w-5 h-5 sm:w-7 sm:h-7 text-purple-600" />
            Seller Applications
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            {counts.pending} pending • {counts.approved} approved • {counts.rejected} rejected
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {[
          { key: 'pending', label: 'Pending', icon: Clock, count: counts.pending, color: 'yellow' },
          { key: 'approved', label: 'Approved', icon: Check, count: counts.approved, color: 'green' },
          { key: 'rejected', label: 'Rejected', icon: X, count: counts.rejected, color: 'red' }
        ].map((tab) => (
          <Button
            key={tab.key}
            variant={filter === tab.key ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(tab.key)}
            className={`gap-1.5 text-xs sm:text-sm ${
              filter === tab.key 
                ? tab.color === 'yellow' ? 'bg-yellow-600' : tab.color === 'green' ? 'bg-green-600' : 'bg-red-600'
                : ''
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
            <Badge variant="secondary" className="ml-1 text-[10px] h-4">{tab.count}</Badge>
          </Button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by shop name or applicant..."
          className="pl-9 h-10"
        />
      </div>

      {/* Applications List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No {filter} applications</p>
          </div>
        ) : (
          filtered.map((app) => (
            <Card 
              key={app.id} 
              className="cursor-pointer hover:border-purple-300 transition"
              onClick={() => setSelectedApp(app)}
            >
              <CardContent className="p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Store className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-sm sm:text-base truncate">{app.shopName}</h3>
                        {app.verificationTier === 'verified' ? (
                          <Badge className="bg-green-100 text-green-700 text-[10px]">
                            <BadgeCheck className="w-3 h-3 mr-0.5" /> Verified Tier
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-[10px]">Basic</Badge>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600 truncate">{app.user.name} • {app.user.email}</p>
                      <div className="flex items-center gap-3 mt-1 text-[10px] sm:text-xs text-gray-500">
                        <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {app.phone}</span>
                        {app.city && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {app.city}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {app.status === 'pending' && (
                      <div className="flex gap-1.5">
                        <Button 
                          size="sm" 
                          className="bg-green-600 hover:bg-green-700 h-8 text-xs gap-1"
                          onClick={(e) => { e.stopPropagation(); setSelectedApp(app); handleAction('approve'); }}
                        >
                          <Check className="w-3.5 h-3.5" /> Approve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="text-red-600 h-8 text-xs gap-1"
                          onClick={(e) => { e.stopPropagation(); setSelectedApp(app); }}
                        >
                          <X className="w-3.5 h-3.5" /> Reject
                        </Button>
                      </div>
                    )}
                    {app.status === 'approved' && (
                      <Badge className="bg-green-100 text-green-700">Approved</Badge>
                    )}
                    {app.status === 'rejected' && (
                      <Badge className="bg-red-100 text-red-700">Rejected</Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedApp && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setSelectedApp(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[95vw] max-w-lg bg-white rounded-xl shadow-2xl z-50 max-h-[90vh] overflow-y-auto"
            >
              <div className="p-4 border-b bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-xl flex items-center justify-between">
                <h3 className="font-bold">{selectedApp.shopName}</h3>
                <button onClick={() => setSelectedApp(null)} className="p-1 hover:bg-white/20 rounded">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-500 text-xs">Applicant</p>
                    <p className="font-medium">{selectedApp.user.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Email</p>
                    <p className="font-medium truncate">{selectedApp.user.email}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Phone</p>
                    <p className="font-medium">{selectedApp.phone}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Category</p>
                    <p className="font-medium">{selectedApp.category || '-'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">City</p>
                    <p className="font-medium">{selectedApp.city || '-'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Verification Tier</p>
                    <Badge className={selectedApp.verificationTier === 'verified' ? 'bg-green-100 text-green-700' : ''}>
                      {selectedApp.verificationTier === 'verified' ? '🟢 Verified' : '🔵 Basic'}
                    </Badge>
                  </div>
                </div>
                
                {selectedApp.nidNumber && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">NID</p>
                    <p className="text-sm font-mono">{selectedApp.nidNumber}</p>
                    {selectedApp.nidImage && (
                      <a href={selectedApp.nidImage} target="_blank" className="text-xs text-purple-600 hover:underline">
                        View Image →
                      </a>
                    )}
                  </div>
                )}

                {selectedApp.bankAccountNo && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Bank Details</p>
                    <p className="text-sm">{selectedApp.bankName} - {selectedApp.bankAccountNo}</p>
                    <p className="text-xs text-gray-500">{selectedApp.bankBranch}</p>
                  </div>
                )}

                {selectedApp.status === 'pending' && (
                  <div className="flex gap-3 pt-4 border-t">
                    <Button 
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      onClick={() => handleAction('approve')}
                      disabled={processing}
                    >
                      {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 mr-1" />}
                      Approve
                    </Button>
                    <Button 
                      variant="outline"
                      className="flex-1 text-red-600 border-red-200"
                      onClick={() => {
                        const reason = prompt('Rejection reason:')
                        if (reason) handleAction('reject', reason)
                      }}
                      disabled={processing}
                    >
                      <X className="w-4 h-4 mr-1" /> Reject
                    </Button>
                  </div>
                )}

                {selectedApp.rejectionReason && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-xs text-red-500 mb-1">Rejection Reason</p>
                    <p className="text-sm text-red-700">{selectedApp.rejectionReason}</p>
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
