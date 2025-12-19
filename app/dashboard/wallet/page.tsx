'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from '@/components/ui/badge'
import { formatPrice } from '@/lib/utils'
import { Wallet, TrendingUp, Clock, CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function WalletPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<any>(null)
  const [payouts, setPayouts] = useState<any[]>([])
  
  // Request Modal
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState('bkash')
  const [details, setDetails] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fetchWallet = async () => {
    try {
      const res = await fetch('/api/seller/payouts')
      if (res.ok) {
        const data = await res.json()
        setStats(data.stats)
        setPayouts(data.payouts || [])
      }
    } catch (error) {
      console.error('Fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWallet()
  }, [])

  const handleRequest = async () => {
    if (!amount || parseFloat(amount) < 500) {
      toast({ title: 'Invalid Amount', description: 'Minimum withdrawal is 500 BDT', variant: 'destructive' })
      return
    }
    if (!details) {
      toast({ title: 'Missing Details', description: 'Please provide account number', variant: 'destructive' })
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/seller/payouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(amount),
          method,
          details: { accountNumber: details } // Store as object
        })
      })

      if (res.ok) {
        toast({ title: 'Request Submitted', description: 'Admin will review shortly.' })
        setIsModalOpen(false)
        setAmount('')
        fetchWallet()
      } else {
        const d = await res.json()
        toast({ title: 'Failed', description: d.error, variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Something went wrong', variant: 'destructive' })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-blue-600" /></div>

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Wallet className="w-8 h-8 text-blue-600" />
            My Wallet
          </h1>
          <p className="text-gray-500">Manage your earnings and withdrawals</p>
        </div>
        
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700">
              Request Withdrawal
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Request Payout</DialogTitle>
              <DialogDescription>
                Available Balance: <span className="font-bold text-green-600">{formatPrice(stats?.availableBalance || 0)}</span>
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Withdrawal Amount (Min 500)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-500">৳</span>
                  <Input 
                    type="number" 
                    className="pl-8" 
                    value={amount} 
                    onChange={e => setAmount(e.target.value)}
                    max={stats?.availableBalance}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Method</Label>
                <Select value={method} onValueChange={setMethod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bkash">bKash</SelectItem>
                    <SelectItem value="nagad">Nagad</SelectItem>
                    <SelectItem value="rocket">Rocket</SelectItem>
                    <SelectItem value="bank">Bank Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Account Details / Number</Label>
                <Input 
                  placeholder="e.g 01xxxxxxxxx" 
                  value={details}
                  onChange={e => setDetails(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button onClick={handleRequest} disabled={submitting}>
                {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Submit Request
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards - Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-full text-green-600">
                <Wallet className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Available Balance</p>
                <p className="text-2xl font-bold">{formatPrice(stats?.availableBalance || 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-full text-blue-600">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Net Earnings</p>
                <p className="text-2xl font-bold">{formatPrice(stats?.netEarnings || 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-full text-orange-600">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Pending</p>
                <p className="text-2xl font-bold">{formatPrice(stats?.pendingWithdrawals || 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-full text-purple-600">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Withdrawn</p>
                <p className="text-2xl font-bold">{formatPrice(stats?.totalWithdrawn || 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payout History */}
      <Card>
        <CardHeader>
          <CardTitle>Payout History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {payouts.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No payout history yet.</p>
            ) : (
              payouts.map((payout: any) => (
                <div key={payout.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg gap-3">
                  <div className="flex items-start gap-3">
                    <div className={`mt-1 p-2 rounded-full ${
                      payout.status === 'paid' ? 'bg-green-100 text-green-600' :
                      payout.status === 'pending' ? 'bg-orange-100 text-orange-600' :
                      payout.status === 'approved' ? 'bg-blue-100 text-blue-600' :
                      'bg-red-100 text-red-600'
                    }`}>
                      {payout.status === 'paid' ? <CheckCircle className="w-4 h-4" /> :
                       payout.status === 'pending' ? <Clock className="w-4 h-4" /> :
                       payout.status === 'approved' ? <TrendingUp className="w-4 h-4" /> :
                       <XCircle className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="font-semibold text-lg">{formatPrice(payout.amount)}</p>
                      <div className="flex flex-wrap gap-2 text-sm text-gray-500">
                        <span className="capitalize">{payout.method}</span>
                        <span>•</span>
                        <span>{new Date(payout.createdAt).toLocaleDateString()}</span>
                      </div>
                      {payout.adminNote && (
                        <p className="text-xs text-blue-600 mt-1">Note: {payout.adminNote}</p>
                      )}
                    </div>
                  </div>
                  <Badge className={`self-start sm:self-center capitalize ${
                     payout.status === 'paid' ? 'bg-green-600' :
                     payout.status === 'pending' ? 'bg-orange-500' :
                     payout.status === 'approved' ? 'bg-blue-600' :
                     'bg-red-600'
                  }`}>
                    {payout.status}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
