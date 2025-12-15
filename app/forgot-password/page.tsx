'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Mail, ArrowLeft, Loader2, CheckCircle, KeyRound, Lock, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type Step = 'email' | 'verify' | 'password' | 'success'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resendTimer, setResendTimer] = useState(0)

  // Step 1: Request verification code
  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, action: 'request_code' })
      })

      const data = await res.json()

      if (res.ok) {
        setStep('verify')
        startResendTimer()
      } else {
        setError(data.error || 'Failed to send verification code')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Step 2: Verify code
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, action: 'verify_code' })
      })

      const data = await res.json()

      if (res.ok) {
        setStep('password')
      } else {
        setError(data.error || 'Invalid or expired code')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Step 3: Set new password
  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, newPassword })
      })

      const data = await res.json()

      if (res.ok) {
        setStep('success')
      } else {
        setError(data.error || 'Failed to reset password')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const startResendTimer = () => {
    setResendTimer(60)
    const interval = setInterval(() => {
      setResendTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const handleResend = async () => {
    if (resendTimer > 0) return
    setLoading(true)
    try {
      await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, action: 'request_code' })
      })
      startResendTimer()
    } catch (err) {
      setError('Failed to resend code')
    } finally {
      setLoading(false)
    }
  }

  // Success Screen
  if (step === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold mb-4">Password Reset! 🎉</h1>
          <p className="text-gray-600 mb-6">
            Your password has been successfully reset. You can now login with your new password.
          </p>
          <Button 
            className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600"
            onClick={() => router.push('/login')}
          >
            Go to Login
          </Button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full"
      >
        <Link 
          href="/login" 
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Login
        </Link>

        {/* Step Indicator */}
        <div className="flex justify-center gap-2 mb-8">
          {['email', 'verify', 'password'].map((s, i) => (
            <div 
              key={s}
              className={`w-3 h-3 rounded-full transition ${
                step === s ? 'bg-purple-600 scale-125' : 
                ['email', 'verify', 'password'].indexOf(step) > i ? 'bg-green-500' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>

        {/* Step 1: Email */}
        {step === 'email' && (
          <>
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold">Forgot Password?</h1>
              <p className="text-gray-600 mt-2">Enter your email and we'll send you a verification code</p>
            </div>

            <form onSubmit={handleRequestCode} className="space-y-4">
              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600"
                disabled={loading}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send Verification Code'}
              </Button>
            </form>
          </>
        )}

        {/* Step 2: Verify Code */}
        {step === 'verify' && (
          <>
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <KeyRound className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold">Enter Verification Code</h1>
              <p className="text-gray-600 mt-2">We sent a 6-digit code to <strong>{email}</strong></p>
            </div>

            <form onSubmit={handleVerifyCode} className="space-y-4">
              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>
              )}
              <div className="space-y-2">
                <Label htmlFor="code">Verification Code</Label>
                <Input
                  id="code"
                  type="text"
                  placeholder="123456"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  required
                  className="h-12 text-center text-2xl tracking-widest font-mono"
                  maxLength={6}
                />
              </div>
              <Button 
                type="submit" 
                className="w-full h-12 bg-gradient-to-r from-green-600 to-emerald-600"
                disabled={loading || code.length !== 6}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify Code'}
              </Button>
              
              <div className="text-center text-sm text-gray-600">
                Didn't receive code?{' '}
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendTimer > 0}
                  className={`font-medium ${resendTimer > 0 ? 'text-gray-400' : 'text-blue-600 hover:underline'}`}
                >
                  {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend Code'}
                </button>
              </div>
            </form>
          </>
        )}

        {/* Step 3: New Password */}
        {step === 'password' && (
          <>
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold">Set New Password</h1>
              <p className="text-gray-600 mt-2">Choose a strong password for your account</p>
            </div>

            <form onSubmit={handleSetPassword} className="space-y-4">
              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>
              )}
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="h-12 pr-12"
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="h-12"
                  minLength={6}
                />
              </div>
              <Button 
                type="submit" 
                className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600"
                disabled={loading}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Reset Password'}
              </Button>
            </form>
          </>
        )}

        <p className="text-center text-sm text-gray-600 mt-6">
          Remember your password?{' '}
          <Link href="/login" className="text-blue-600 hover:underline font-medium">
            Log in
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
