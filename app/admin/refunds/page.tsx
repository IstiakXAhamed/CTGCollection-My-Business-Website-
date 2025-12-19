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
import { MoreVertical, Search, Filter, CheckCircle, XCircle, Clock, Loader2, ArrowUpRight, Undo2, Image as ImageIcon } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function RefundsPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [refunds, setRefunds] = useState<any[]>([])
  const [filter, setFilter] = useState('all')

  // Action Modal
  const [selectedRefund, setSelectedRefund] = useState<any>(null)
  const [actionType, setActionType] = useState<string>('')
  const [note, setNote] = useState('')
  const [processing, setProcessing] = useState(false)

  const fetchRefunds = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/admin/refunds?status=${filter}`)
      if (res.ok) {
        const data = await res.json()
        setRefunds(data.refunds || [])
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRefunds()
  }, [filter])

  const openAction = (refund: any, action: string) => {
    setSelectedRefund(refund)
    setActionType(action)
    setNote('')
  }

  const handleAction = async () => {
    if (!selectedRefund || !actionType) return

    setProcessing(true)
    try {
      const res = await fetch('/api/admin/refunds', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedRefund.id,
          action: actionType,
          note
        })
      })

      if (res.ok) {
        toast({ title: 'Success', description: `Refund request ${actionType}ed successfully` })
        fetchRefunds()
        setSelectedRefund(null)
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
      case 'refunded': return 'bg-green-100 text-green-700'
      case 'approved': return 'bg-blue-100 text-blue-700'
      case 'rejected': return 'bg-red-100 text-red-700'
      default: return 'bg-orange-100 text-orange-700'
    }
  }

  return (
    <div className="space-y-6">
       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Refund Requests</h1>
          <p className="text-muted-foreground">Manage customer return and refund requests</p>
        </div>
        
        <div className="flex items-center gap-2 bg-white p-1 rounded-lg border">
          {['all', 'pending', 'approved', 'refunded', 'rejected'].map(f => (
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
          ) : refunds.length === 0 ? (
             <div className="p-12 text-center text-gray-500">No requests found</div>
          ) : (
            <div className="divide-y">
              {refunds.map(refund => (
                <div key={refund.id} className="p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center hover:bg-gray-50 transition">
                  {/* Status Icon */}
                  <div className={`p-2 rounded-full hidden sm:block ${getStatusColor(refund.status)}`}>
                    <Undo2 className="w-5 h-5" />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold text-gray-900 truncate">Order #{refund.order?.orderNumber}</p>
                      <span className="sm:hidden text-sm font-bold">{formatPrice(refund.amount)}</span>
                    </div>
                    <p className="text-sm text-gray-500 truncate">Customer: {refund.user?.name} ({refund.user?.email})</p>
                    <div className="mt-2 text-sm bg-gray-100 p-2 rounded-md">
                        <span className="font-semibold text-xs text-gray-500 uppercase block mb-1">Reason:</span>
                        {refund.reason}
                    </div>
                    {refund.images && refund.images !== '[]' && (
                        <div className="mt-2 flex gap-2">
                             <Badge variant="outline" className="text-xs"><ImageIcon className="w-3 h-3 mr-1"/> Check Images</Badge>
                        </div>
                    )}
                  </div>

                  {/* Desktop Amount & Status */}
                  <div className="hidden sm:block text-right">
                    <p className="font-bold text-lg">{formatPrice(refund.amount)}</p>
                    <Badge className={`capitalize mt-1 ${getStatusColor(refund.status)} hover:bg-opacity-80`}>
                      {refund.status}
                    </Badge>
                  </div>

                  {/* Actions mobile/desktop */}
                  <div className="flex sm:hidden items-center justify-between w-full mt-2 pt-2 border-t">
                     <Badge className={`capitalize ${getStatusColor(refund.status)}`}>{refund.status}</Badge>
                     {refund.status === 'pending' && (
                        <Button size="sm" variant="outline" onClick={() => openAction(refund, 'approve')}>Review</Button>
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
                         {refund.status === 'pending' && (
                           <>
                             <DropdownMenuItem onClick={() => openAction(refund, 'approve')}>Approve Request</DropdownMenuItem>
                             <DropdownMenuItem onClick={() => openAction(refund, 'reject')} className="text-red-600">Reject Request</DropdownMenuItem>
                           </>
                         )}
                         {refund.status === 'approved' && (
                           <DropdownMenuItem onClick={() => openAction(refund, 'refund_processed')}>Mark Refunded</DropdownMenuItem>
                         )}
                         <DropdownMenuItem onClick={() => navigator.clipboard.writeText(refund.orderId)}>Copy Order ID</DropdownMenuItem>
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
      <Dialog open={!!selectedRefund} onOpenChange={(open) => !open && setSelectedRefund(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="capitalize">{actionType && actionType.replace('_', ' ')} Request</DialogTitle>
            <DialogDescription>
              {actionType === 'approve' ? 'Approve this refund? This does not auto-refund money, but marks it as Valid.' :
               actionType === 'refund_processed' ? 'Confirm that you have processed the refund transaction?' :
               'Reject this refund request?'}
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
             <Label>Admin Note (Optional)</Label>
             <Textarea 
                value={note} 
                onChange={e => setNote(e.target.value)} 
                placeholder="Reason or transaction ref..."
                className="mt-2"
             />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedRefund(null)}>Cancel</Button>
            <Button 
               onClick={handleAction} 
               disabled={processing}
               variant={actionType === 'reject' ? 'destructive' : 'default'}
               className={actionType === 'refund_processed' ? 'bg-green-600 hover:bg-green-700' : ''}
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
