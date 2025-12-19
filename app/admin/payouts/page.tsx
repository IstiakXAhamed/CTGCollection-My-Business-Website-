'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { formatPrice } from '@/lib/utils'
import { MoreVertical, Search, Filter, CheckCircle, XCircle, Clock, Loader2, ArrowUpRight } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function PayoutsPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [payouts, setPayouts] = useState<any[]>([])
  const [filter, setFilter] = useState('all')

  // Action Modal
  const [selectedPayout, setSelectedPayout] = useState<any>(null)
  const [actionType, setActionType] = useState<string>('')
  const [note, setNote] = useState('')
  const [processing, setProcessing] = useState(false)

  const fetchPayouts = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/admin/payouts?status=${filter}`)
      if (res.ok) {
        const data = await res.json()
        setPayouts(data.payouts || [])
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPayouts()
  }, [filter])

  const openAction = (payout: any, action: string) => {
    setSelectedPayout(payout)
    setActionType(action)
    setNote('')
  }

  const handleAction = async () => {
    if (!selectedPayout || !actionType) return

    setProcessing(true)
    try {
      const res = await fetch('/api/admin/payouts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedPayout.id,
          action: actionType,
          note
        })
      })

      if (res.ok) {
        toast({ title: 'Success', description: `Request ${actionType}ed successfully` })
        fetchPayouts()
        setSelectedPayout(null)
      } else {
        toast({ title: 'Failed', variant: 'destructive' })
      }
    } catch (error) {
       toast({ title: 'Error', variant: 'destructive' })
    } finally {
      setProcessing(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-700'
      case 'approved': return 'bg-blue-100 text-blue-700'
      case 'rejected': return 'bg-red-100 text-red-700'
      default: return 'bg-orange-100 text-orange-700'
    }
  }

  return (
    <div className="space-y-6">
       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Payout Requests</h1>
          <p className="text-muted-foreground">Manage seller withdrawal requests</p>
        </div>
        
        <div className="flex items-center gap-2 bg-white p-1 rounded-lg border">
          {['all', 'pending', 'approved', 'paid', 'rejected'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-sm rounded-md capitalize transition ${filter === f ? 'bg-gray-100 font-medium text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
             <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-gray-400" /></div>
          ) : payouts.length === 0 ? (
             <div className="p-12 text-center text-gray-500">No requests found</div>
          ) : (
            <div className="divide-y">
              {payouts.map(payout => (
                <div key={payout.id} className="p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center hover:bg-gray-50 transition">
                  {/* Status Icon */}
                  <div className={`p-2 rounded-full hidden sm:block ${getStatusColor(payout.status)}`}>
                    <ArrowUpRight className="w-5 h-5" />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold text-gray-900 truncate">{payout.user?.name || 'Seller'}</p>
                      <span className="sm:hidden text-sm font-bold">{formatPrice(payout.amount)}</span>
                    </div>
                    <p className="text-sm text-gray-500 truncate">{payout.user?.email} • {payout.user?.shop?.name}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-gray-500">
                      <Badge variant="secondary" className="uppercase">{payout.method}</Badge>
                      <span>{new Date(payout.createdAt).toLocaleDateString()}</span>
                      {payout.details && <span className="font-mono bg-gray-100 px-1 rounded">{JSON.parse(payout.details).accountNumber || payout.details}</span>}
                    </div>
                  </div>

                  {/* Desktop Amount & Status */}
                  <div className="hidden sm:block text-right">
                    <p className="font-bold text-lg">{formatPrice(payout.amount)}</p>
                    <Badge className={`capitalize mt-1 ${getStatusColor(payout.status)} hover:bg-opacity-80`}>
                      {payout.status}
                    </Badge>
                  </div>

                  {/* Actions mobile/desktop */}
                  <div className="flex sm:hidden items-center justify-between w-full mt-2 pt-2 border-t">
                     <Badge className={`capitalize ${getStatusColor(payout.status)}`}>{payout.status}</Badge>
                     {payout.status === 'pending' && (
                        <Button size="sm" variant="outline" onClick={() => openAction(payout, 'approve')}>Review</Button>
                     )}
                  </div>

                  {/* Desktop Menu */}
                  <div className="hidden sm:block">
                     <DropdownMenu>
                       <DropdownMenuTrigger asChild>
                         <Button variant="ghost" size="icon"><MoreVertical className="w-4 h-4" /></Button>
                       </DropdownMenuTrigger>
                       <DropdownMenuContent align="end">
                         <DropdownMenuLabel>Actions</DropdownMenuLabel>
                         <DropdownMenuSeparator />
                         {payout.status === 'pending' && (
                           <>
                             <DropdownMenuItem onClick={() => openAction(payout, 'approve')}>Approve Request</DropdownMenuItem>
                             <DropdownMenuItem onClick={() => openAction(payout, 'reject')} className="text-red-600">Reject Request</DropdownMenuItem>
                           </>
                         )}
                         {payout.status === 'approved' && (
                           <DropdownMenuItem onClick={() => openAction(payout, 'mark_paid')}>Mark as Paid</DropdownMenuItem>
                         )}
                         <DropdownMenuItem onClick={() => navigator.clipboard.writeText(payout.id)}>Copy ID</DropdownMenuItem>
                       </DropdownMenuContent>
                     </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Dialog */}
      <Dialog open={!!selectedPayout} onOpenChange={(open) => !open && setSelectedPayout(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="capitalize">{actionType && actionType.replace('_', ' ')} Request</DialogTitle>
            <DialogDescription>
              {actionType === 'approve' ? 'Approve this request for payment processing?' :
               actionType === 'mark_paid' ? 'Confirm that you have sent the money?' :
               'Reject this payout request?'}
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
             <Label>Admin Note (Optional)</Label>
             <Textarea 
                value={note} 
                onChange={e => setNote(e.target.value)} 
                placeholder="Transaction ID or reason..."
                className="mt-2"
             />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedPayout(null)}>Cancel</Button>
            <Button 
               onClick={handleAction} 
               disabled={processing}
               variant={actionType === 'reject' ? 'destructive' : 'default'}
               className={actionType === 'mark_paid' ? 'bg-green-600 hover:bg-green-700' : ''}
            >
              {processing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
