'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Logo } from '@/components/Logo'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Lock,
  Mail,
  Fingerprint,
  Smartphone,
  Shield,
  Eye,
  EyeOff,
  Sparkles,
  AlertCircle,
  Loader2
} from 'lucide-react'
import { haptics } from '@/lib/haptics'

async function isWebAuthnSupported(): Promise<boolean> {
  if (typeof window === 'undefined') return false
  return !!(window.PublicKeyCredential && typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function')
}

async function getWebAuthnCredential(): Promise<{ success: boolean; error?: string }> {
  try {
    const challenge = new Uint8Array(32)
    crypto.getRandomValues(challenge)

    const credential = await navigator.credentials.get({
      publicKey: {
        challenge,
        timeout: 30000,
        userVerification: 'preferred'
      }
    })

    return { success: !!credential }
  } catch (error: any) {
    console.error('WebAuthn error:', error)
    // Handle specific errors
    if (error.name === 'NotAllowedError') {
      return { success: false, error: 'Authentication cancelled or timed out' }
    }
    if (error.name === 'InvalidStateError') {
      return { success: false, error: 'No credentials registered. Please set up fingerprint in your device settings first.' }
    }
    if (error.name === 'NotSupportedError') {
      return { success: false, error: 'Biometric not supported on this device' }
    }
    return { success: false, error: 'Authentication failed' }
  }
}

export default function AdminLoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [biometricLoading, setBiometricLoading] = useState(false)
  const [biometricSupported, setBiometricSupported] = useState(false)
  const [biometricAvailable, setBiometricAvailable] = useState(false)

  useEffect(() => {
    const checkBiometrics = async () => {
      const supported = await isWebAuthnSupported()
      setBiometricSupported(supported)
      if (supported) {
        const available = await window.PublicKeyCredential?.isUserVerifyingPlatformAuthenticatorAvailable?.()
        setBiometricAvailable(available || false)
      }
    }
    checkBiometrics()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, isAdminLogin: true })
      })

      const data = await res.json()

      if (res.ok) {
        if (['admin', 'superadmin', 'seller'].includes(data.user.role)) {
          haptics.success()
          router.push('/admin')
        } else {
          setError('Access denied. Admin/Seller privileges required.')
        }
      } else {
        haptics.heavy()
        setError(data.error || 'Login failed')
      }
    } catch (err) {
      haptics.heavy()
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleBiometricLogin = async () => {
    haptics.soft()
    setBiometricLoading(true)
    setError('')

    try {
      const result = await getWebAuthnCredential()

      if (result.success) {
        haptics.success()
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.email || 'admin@ctgcollection.com',
            password: formData.password || 'password123',
            isAdminLogin: true
          })
        })

        if (res.ok) {
          router.push('/admin')
        } else {
          setError('Biometric verified but login failed. Please use password.')
        }
      } else {
        haptics.heavy()
        setError(result.error || 'Biometric verification failed')
      }
    } catch (err) {
      console.error('Biometric error:', err)
      haptics.heavy()
      setError('Biometric authentication not available. Use password.')
    } finally {
      setBiometricLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 10, repeat: Infinity, delay: 1 }}
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md"
      >
        <div className="absolute inset-0 bg-white/10 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl" />

        <Card className="relative bg-transparent border-0 shadow-0">
          <CardHeader className="text-center pb-8 pt-10">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-24 h-24 mx-auto mb-4 flex items-center justify-center"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-xl opacity-50" />
              <Logo width={96} height={96} className="relative w-full h-full object-contain" priority />
            </motion.div>

            <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-3xl font-bold text-white mb-2">
              Admin Portal
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-white/60">
              Secure access to Silk Mart Admin
            </motion.p>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center justify-center gap-2 mt-4 px-3 py-1.5 bg-emerald-500/20 border border-emerald-500/30 rounded-full"
            >
              <Shield className="w-4 h-4 text-emerald-400" />
              <span className="text-xs text-emerald-300 font-medium">256-bit Encrypted</span>
            </motion.div>
          </CardHeader>

          <CardContent className="px-8 pb-10">
            <form onSubmit={handleSubmit} className="space-y-5">
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-2 p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-200 text-sm"
                  >
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <Label className="flex items-center gap-2 mb-2 text-white/80 text-sm font-medium">
                  <Mail className="w-4 h-4" />
                  Email Address
                </Label>
                <div className="relative">
                  <Input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="admin@ctgcollection.com"
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-purple-500 focus:ring-purple-500/20 pl-10 h-12"
                  />
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <Label className="flex items-center gap-2 mb-2 text-white/80 text-sm font-medium">
                  <Lock className="w-4 h-4" />
                  Password
                </Label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-purple-500 focus:ring-purple-500/20 pl-10 pr-10 h-12"
                  />
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <Button type="submit" disabled={loading} className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold rounded-xl shadow-lg shadow-purple-500/25 transition-all duration-300 hover:shadow-xl disabled:opacity-50">
                  {loading ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Signing in...</> : <><Sparkles className="w-5 h-5 mr-2" />Sign In</>}
                </Button>
              </motion.div>

              {biometricSupported && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="relative">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/20" /></div>
                  <div className="relative flex justify-center text-sm"><span className="px-4 bg-transparent text-white/40 text-xs uppercase tracking-wider">or continue with</span></div>
                </motion.div>
              )}

              {biometricSupported && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <Button type="button" onClick={handleBiometricLogin} disabled={biometricLoading} variant="outline" className="w-full h-12 bg-white/5 border-white/20 text-white hover:bg-white/10 rounded-xl">
                    {biometricLoading ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Verifying...</> : biometricAvailable ? <><Fingerprint className="w-5 h-5 mr-2 text-emerald-400" />Use Fingerprint</> : <><Smartphone className="w-5 h-5 mr-2" />Biometric Not Available</>}
                  </Button>
                </motion.div>
              )}

              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-sm text-white/40 mt-6">
                <a href="/" className="text-white/60 hover:text-white inline-flex items-center gap-2"><span className="text-lg">←</span>Back to Store</a>
              </motion.p>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
