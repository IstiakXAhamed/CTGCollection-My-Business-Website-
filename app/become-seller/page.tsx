'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Store, ArrowLeft, Loader2, Check, Upload, BadgeCheck, 
  Clock, X, Rocket, ShieldCheck
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useToast } from '@/hooks/use-toast'

export default function BecomeSellerPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [currentStatus, setCurrentStatus] = useState<any>(null)
  const [step, setStep] = useState(1) // 1: Basic, 2: Documents, 3: Review
  
  const [form, setForm] = useState({
    shopName: '',
    shopDescription: '',
    category: '',
    phone: '',
    address: '',
    city: '',
    nidNumber: '',
    nidImage: '',
    passportNumber: '',
    passportImage: '',
    bankName: '',
    bankAccountNo: '',
    bankBranch: ''
  })

  useEffect(() => {
    checkStatus()
  }, [])

  const checkStatus = async () => {
    try {
      const res = await fetch('/api/seller/apply', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setCurrentStatus(data)
      }
    } catch (error) {
      console.error('Check status error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!form.shopName || !form.phone) {
      toast({ title: 'Error', description: 'Shop name and phone are required', variant: 'destructive' })
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/seller/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form)
      })

      const data = await res.json()
      if (res.ok) {
        toast({ title: '🎉 Application Submitted!', description: 'We will review it within 24 hours' })
        checkStatus()
      } else {
        toast({ title: 'Error', description: data.error, variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to submit', variant: 'destructive' })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    )
  }

  // Already has a shop
  if (currentStatus?.hasShop) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-8 px-4">
        <div className="max-w-md mx-auto">
          <Card className="text-center">
            <CardContent className="pt-8 pb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Store className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-green-700">You Already Have a Shop!</h2>
              <p className="text-gray-600 mt-2">{currentStatus.shop?.name}</p>
              <Link href="/seller/dashboard">
                <Button className="mt-6">Go to Seller Dashboard</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Has pending/rejected application
  if (currentStatus?.application) {
    const app = currentStatus.application
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-8 px-4">
        <div className="max-w-md mx-auto">
          <Card>
            <CardContent className="pt-8 pb-6 text-center">
              {app.status === 'pending' ? (
                <>
                  <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-8 h-8 text-yellow-600" />
                  </div>
                  <h2 className="text-xl font-bold text-yellow-700">Application Under Review</h2>
                  <p className="text-gray-600 mt-2">
                    We're reviewing your application for <strong>{app.shopName}</strong>
                  </p>
                  <p className="text-sm text-gray-500 mt-4">Usually takes 24-48 hours</p>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <X className="w-8 h-8 text-red-600" />
                  </div>
                  <h2 className="text-xl font-bold text-red-700">Application Rejected</h2>
                  <p className="text-gray-600 mt-2">{app.rejectionReason}</p>
                  <p className="text-sm text-gray-500 mt-4">Contact support for more info</p>
                </>
              )}
              <Link href="/">
                <Button variant="outline" className="mt-6">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Application form
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-6 sm:py-10 px-3 sm:px-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-purple-600 mb-4">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Become a Seller
          </h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">Start selling on our marketplace today!</p>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6 sm:mb-8">
          {[
            { icon: Rocket, label: 'Quick Start', desc: 'List in 24hrs' },
            { icon: ShieldCheck, label: 'Secure', desc: 'Protected sales' },
            { icon: Store, label: '0% Fee', desc: 'First month free' }
          ].map((item, i) => (
            <div key={i} className="text-center p-3 bg-white rounded-lg shadow-sm">
              <item.icon className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600 mx-auto" />
              <p className="font-semibold text-xs sm:text-sm mt-1">{item.label}</p>
              <p className="text-[10px] sm:text-xs text-gray-500">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Steps */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                step >= s ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {step > s ? <Check className="w-4 h-4" /> : s}
              </div>
              {s < 3 && <div className={`w-8 sm:w-12 h-1 ${step > s ? 'bg-purple-600' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg sm:text-xl">
              {step === 1 && '📝 Shop Details'}
              {step === 2 && '📄 Verification Documents'}
              {step === 3 && '✅ Review & Submit'}
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              {step === 1 && 'Tell us about your shop'}
              {step === 2 && 'Upload documents for verification (optional for basic tier)'}
              {step === 3 && 'Review your information before submitting'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {step === 1 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm">Shop Name *</Label>
                  <Input 
                    value={form.shopName}
                    onChange={(e) => setForm(f => ({ ...f, shopName: e.target.value }))}
                    placeholder="My Awesome Shop"
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">What will you sell?</Label>
                  <Input 
                    value={form.category}
                    onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))}
                    placeholder="e.g. Electronics, Clothing, Handicrafts"
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Shop Description</Label>
                  <Textarea 
                    value={form.shopDescription}
                    onChange={(e) => setForm(f => ({ ...f, shopDescription: e.target.value }))}
                    placeholder="Tell customers about your shop..."
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-sm">Phone *</Label>
                    <Input 
                      value={form.phone}
                      onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))}
                      placeholder="01XXXXXXXXX"
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">City</Label>
                    <Input 
                      value={form.city}
                      onChange={(e) => setForm(f => ({ ...f, city: e.target.value }))}
                      placeholder="Chittagong"
                      className="h-11"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Address</Label>
                  <Input 
                    value={form.address}
                    onChange={(e) => setForm(f => ({ ...f, address: e.target.value }))}
                    placeholder="Shop/Business address"
                    className="h-11"
                  />
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
                  <p className="font-semibold text-blue-800">🔵 Basic Tier: Just NID</p>
                  <p className="text-blue-600 text-xs mt-1">Can list products immediately</p>
                </div>
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm">
                  <p className="font-semibold text-green-800">🟢 Verified Tier: NID + Passport + Bank</p>
                  <p className="text-green-600 text-xs mt-1">Gets blue checkmark + priority listing</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">NID Number</Label>
                  <Input 
                    value={form.nidNumber}
                    onChange={(e) => setForm(f => ({ ...f, nidNumber: e.target.value }))}
                    placeholder="National ID number"
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">NID Image URL (Cloudinary)</Label>
                  <Input 
                    value={form.nidImage}
                    onChange={(e) => setForm(f => ({ ...f, nidImage: e.target.value }))}
                    placeholder="https://res.cloudinary.com/..."
                    className="h-11"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-sm">Passport Number (Optional)</Label>
                    <Input 
                      value={form.passportNumber}
                      onChange={(e) => setForm(f => ({ ...f, passportNumber: e.target.value }))}
                      placeholder="Passport number"
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Passport Image URL</Label>
                    <Input 
                      value={form.passportImage}
                      onChange={(e) => setForm(f => ({ ...f, passportImage: e.target.value }))}
                      placeholder="https://..."
                      className="h-11"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label className="text-sm">Bank Name</Label>
                    <Input 
                      value={form.bankName}
                      onChange={(e) => setForm(f => ({ ...f, bankName: e.target.value }))}
                      placeholder="e.g. DBBL"
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Account Number</Label>
                    <Input 
                      value={form.bankAccountNo}
                      onChange={(e) => setForm(f => ({ ...f, bankAccountNo: e.target.value }))}
                      placeholder="Account #"
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Branch</Label>
                    <Input 
                      value={form.bankBranch}
                      onChange={(e) => setForm(f => ({ ...f, bankBranch: e.target.value }))}
                      placeholder="Branch name"
                      className="h-11"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shop Name</span>
                    <span className="font-semibold">{form.shopName || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Category</span>
                    <span>{form.category || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phone</span>
                    <span>{form.phone || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">City</span>
                    <span>{form.city || '-'}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="text-gray-600">Verification Tier</span>
                    {form.nidImage && form.passportImage && form.bankAccountNo ? (
                      <span className="flex items-center gap-1 text-green-600 font-semibold">
                        <BadgeCheck className="w-4 h-4" /> Verified
                      </span>
                    ) : (
                      <span className="text-blue-600">🔵 Basic</span>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Navigation */}
            <div className="flex gap-3 pt-4">
              {step > 1 && (
                <Button variant="outline" onClick={() => setStep(s => s - 1)} className="flex-1">
                  Back
                </Button>
              )}
              {step < 3 ? (
                <Button onClick={() => setStep(s => s + 1)} className="flex-1">
                  Next
                </Button>
              ) : (
                <Button 
                  onClick={handleSubmit} 
                  disabled={submitting || !form.shopName || !form.phone}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600"
                >
                  {submitting ? (
                    <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Submitting...</>
                  ) : (
                    <>🚀 Submit Application</>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
