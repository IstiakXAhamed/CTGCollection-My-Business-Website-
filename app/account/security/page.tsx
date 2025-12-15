'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Shield, Mail, Phone, Check, X, Loader2, Lock, ChevronRight, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import Link from 'next/link'

export default function SecuritySettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [twoFactorMethod, setTwoFactorMethod] = useState<'email' | 'sms'>('email')
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [actionType, setActionType] = useState<'enable' | 'disable'>('enable')
  const [verificationCode, setVerificationCode] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    fetchUserSettings()
  }, [])

  const fetchUserSettings = async () => {
    try {
      const res = await fetch('/api/auth/me')
      if (res.ok) {
        const data = await res.json()
        setUser(data.user)
        setTwoFactorEnabled(data.user.twoFactorEnabled || false)
        setTwoFactorMethod(data.user.twoFactorMethod || 'email')
      } else {
        router.push('/login')
      }
    } catch (error) {
      console.error('Failed to fetch user:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggle2FA = async () => {
    if (twoFactorEnabled) {
      // Disable 2FA
      setActionType('disable')
      setShowConfirmModal(true)
    } else {
      // Enable 2FA - send verification code first
      setActionType('enable')
      setSaving(true)
      try {
        const res = await fetch('/api/user/settings/2fa', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'send-code', method: twoFactorMethod })
        })
        const data = await res.json()
        if (res.ok) {
          setShowConfirmModal(true)
          setMessage({ type: 'success', text: 'Verification code sent to your email' })
        } else {
          setMessage({ type: 'error', text: data.message })
        }
      } catch (error) {
        setMessage({ type: 'error', text: 'Failed to send verification code' })
      } finally {
        setSaving(false)
      }
    }
  }

  const handleConfirm = async () => {
    setVerifying(true)
    try {
      const res = await fetch('/api/user/settings/2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: actionType,
          method: twoFactorMethod,
          code: verificationCode
        })
      })
      const data = await res.json()
      if (res.ok) {
        setTwoFactorEnabled(actionType === 'enable')
        setShowConfirmModal(false)
        setVerificationCode('')
        setMessage({ 
          type: 'success', 
          text: actionType === 'enable' 
            ? 'Two-factor authentication enabled successfully!' 
            : 'Two-factor authentication disabled'
        })
        fetchUserSettings()
      } else {
        setMessage({ type: 'error', text: data.message })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Operation failed' })
    } finally {
      setVerifying(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/account" className="text-blue-600 hover:underline text-sm mb-2 inline-block">
            ← Back to Account
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Security Settings</h1>
          <p className="text-gray-600 mt-1">Manage your account security and two-factor authentication</p>
        </div>

        {/* Message */}
        {message.text && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 p-4 rounded-lg ${
              message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            {message.text}
          </motion.div>
        )}

        {/* Email Verified Status */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  user?.emailVerified ? 'bg-green-100' : 'bg-yellow-100'
                }`}>
                  <Mail className={`w-6 h-6 ${user?.emailVerified ? 'text-green-600' : 'text-yellow-600'}`} />
                </div>
                <div>
                  <h3 className="font-semibold">Email Verification</h3>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                </div>
              </div>
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                user?.emailVerified 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-yellow-100 text-yellow-700'
              }`}>
                {user?.emailVerified ? (
                  <>
                    <Check className="w-4 h-4" />
                    Verified
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4" />
                    Not Verified
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Two-Factor Authentication */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              Two-Factor Authentication
            </CardTitle>
            <CardDescription>
              Add an extra layer of security to your account by requiring a verification code when you sign in.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Toggle */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium">Enable 2FA</h4>
                <p className="text-sm text-gray-500">
                  {twoFactorEnabled 
                    ? 'Your account is protected with 2FA' 
                    : 'Protect your account with two-factor authentication'}
                </p>
              </div>
              <Switch
                checked={twoFactorEnabled}
                onCheckedChange={handleToggle2FA}
                disabled={saving}
              />
            </div>

            {/* Method Selection */}
            <div className="space-y-3">
              <h4 className="font-medium">Verification Method</h4>
              
              <button
                onClick={() => setTwoFactorMethod('email')}
                className={`w-full p-4 rounded-lg border-2 flex items-center justify-between transition ${
                  twoFactorMethod === 'email' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Mail className={`w-5 h-5 ${twoFactorMethod === 'email' ? 'text-blue-600' : 'text-gray-400'}`} />
                  <div className="text-left">
                    <p className="font-medium">Email</p>
                    <p className="text-sm text-gray-500">Receive codes via email</p>
                  </div>
                </div>
                {twoFactorMethod === 'email' && (
                  <Check className="w-5 h-5 text-blue-600" />
                )}
              </button>

              <button
                onClick={() => setTwoFactorMethod('sms')}
                className={`w-full p-4 rounded-lg border-2 flex items-center justify-between transition ${
                  twoFactorMethod === 'sms' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                } ${!user?.phone ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={!user?.phone}
              >
                <div className="flex items-center gap-3">
                  <Phone className={`w-5 h-5 ${twoFactorMethod === 'sms' ? 'text-blue-600' : 'text-gray-400'}`} />
                  <div className="text-left">
                    <p className="font-medium">SMS</p>
                    <p className="text-sm text-gray-500">
                      {user?.phone ? `Receive codes via SMS to ${user.phone}` : 'Add phone number to enable'}
                    </p>
                  </div>
                </div>
                {twoFactorMethod === 'sms' && user?.phone && (
                  <Check className="w-5 h-5 text-blue-600" />
                )}
              </button>
            </div>

            {/* Security Tip */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <h4 className="font-medium text-blue-800 mb-1">🔐 Security Tip</h4>
              <p className="text-sm text-blue-700">
                Two-factor authentication helps protect your account even if someone knows your password. 
                We'll send a verification code each time you sign in from a new device.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Confirmation Modal */}
        {showConfirmModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl"
            >
              <h3 className="text-xl font-bold mb-4">
                {actionType === 'enable' ? 'Enable 2FA' : 'Disable 2FA'}
              </h3>
              
              {actionType === 'enable' ? (
                <>
                  <p className="text-gray-600 mb-4">
                    Enter the 6-digit code sent to your email to enable two-factor authentication.
                  </p>
                  <input
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={verificationCode}
                    onChange={e => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full px-4 py-3 border-2 rounded-lg text-center text-2xl tracking-widest font-mono mb-4"
                    maxLength={6}
                  />
                </>
              ) : (
                <p className="text-gray-600 mb-4">
                  Are you sure you want to disable two-factor authentication? Your account will be less secure.
                </p>
              )}

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowConfirmModal(false)
                    setVerificationCode('')
                  }}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleConfirm}
                  disabled={verifying || (actionType === 'enable' && verificationCode.length !== 6)}
                >
                  {verifying ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Confirm'
                  )}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}
