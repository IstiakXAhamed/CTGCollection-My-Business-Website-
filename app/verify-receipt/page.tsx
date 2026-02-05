'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ShieldCheck, Search, CheckCircle, XCircle, Loader2, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import Link from 'next/link'

export default function VerifyReceiptPage() {
  const { toast } = useToast()
  const [orderId, setOrderId] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [searched, setSearched] = useState(false)

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!orderId || !code) {
      toast({
        title: "Missing Information",
        description: "Please enter both Order ID and Verification Code",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    setSearched(false)
    setResult(null)

    try {
      const res = await fetch(`/api/verify-receipt?orderId=${encodeURIComponent(orderId)}&code=${encodeURIComponent(code)}`)
      const data = await res.json()

      if (res.ok) {
        setResult(data)
        toast({
          title: "Verification Successful",
          description: "This receipt is valid.",
          className: "bg-green-600 text-white border-none"
        })
      } else {
        setResult({ valid: false, message: data.message || 'Verification failed' })
        toast({
          title: "Verification Failed",
          description: data.message || "Invalid credentials",
          variant: "destructive"
        })
      }
    } catch (error) {
      setResult({ valid: false, message: 'Connection error' })
    } finally {
      setLoading(false)
      setSearched(true)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 py-12">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-200">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Verify Receipt</h1>
          <p className="text-slate-500">
            Enter the Order ID and Verification Code found on your invoice to check its authenticity.
          </p>
        </div>

        {/* Verification Form */}
        <Card className="border-slate-200 shadow-sm overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-6">
            <CardTitle className="text-lg">Verification Details</CardTitle>
            <CardDescription>All fields are required</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleVerify} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="orderId">Order Number (e.g. #INV-1234)</Label>
                <div className="relative">
                  <Input
                    id="orderId"
                    placeholder="#INV-..."
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value.toUpperCase())}
                    className="pl-10 font-mono"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="code">Verification Code</Label>
                <div className="relative">
                  <Input
                    id="code"
                    placeholder="e.g. 123456"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="pl-10 font-mono tracking-widest"
                    maxLength={6}
                  />
                  <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                </div>
              </div>

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 h-11" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : 'Verify Now'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Result Display */}
        {searched && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className={`border-l-4 ${result?.valid ? 'border-l-green-500' : 'border-l-red-500'} shadow-lg`}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className={`mt-0.5 p-2 rounded-full ${result?.valid ? 'bg-green-100' : 'bg-red-100'}`}>
                    {result?.valid ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">
                      {result?.valid ? 'Official Receipt Confirmed' : 'Verification Failed'}
                    </h3>
                    <p className="text-slate-600 text-sm mb-4">
                      {result?.valid 
                        ? 'This receipt was issued by Silk Mart and is valid.' 
                        : 'We could not verify this receipt. Please check your details.'}
                    </p>

                    {result?.valid && result.order && (
                      <div className="bg-slate-50 rounded-lg p-3 text-sm space-y-2 border border-slate-100">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Issued On:</span>
                          <span className="font-medium">{new Date(result.order.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Customer:</span>
                          <span className="font-medium">{result.order.customerName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Amount:</span>
                          <span className="font-medium">৳{result.order.total.toLocaleString()}</span>
                        </div>
                        <div className="border-t pt-2 mt-2">
                          <p className="text-xs text-slate-500 mb-1">Items ({result.order.itemCount}):</p>
                          <ul className="space-y-1">
                            {result.order.items.map((item: any, i: number) => (
                              <li key={i} className="flex justify-between text-xs">
                                <span className="truncate max-w-[150px]">{item.name}</span>
                                <span className="text-slate-500">x{item.quantity}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
        
        <div className="text-center pt-8">
            <Link href="/" className="text-sm text-slate-500 hover:text-blue-600 flex items-center justify-center gap-1">
                Back to Store <ArrowRight className="w-3 h-3" />
            </Link>
        </div>
      </div>
    </div>
  )
}
