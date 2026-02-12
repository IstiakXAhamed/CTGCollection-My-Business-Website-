'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Fingerprint,
  CheckCircle,
  XCircle,
  Smartphone,
  Shield,
  ArrowLeft,
  Loader2
} from 'lucide-react'
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { haptics } from '@/lib/haptics'

export default function BiometricSetupPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'registering' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    // Check if user is logged in
    fetch('/api/auth/me')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.user) {
          setUser(data.user)
        } else {
          router.push('/admin/login')
        }
      })
      .catch(() => router.push('/admin/login'))
  }, [router])

  const handleSetupBiometric = async () => {
    if (!user) return

    setLoading(true)
    setStatus('registering')
    setErrorMessage('')
    haptics.pulse()

    try {
      // Check if WebAuthn is supported
      if (!window.PublicKeyCredential) {
        throw new Error('Biometric authentication is not supported on this browser')
      }

      // Check if platform authenticator is available (fingerprint/face)
      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable?.()
      if (!available) {
        throw new Error('No biometric hardware found. Please set up fingerprint/face in your device settings first.')
      }

      // Generate a challenge
      const challenge = new Uint8Array(32)
      crypto.getRandomValues(challenge)

      // Create credential
      const credential = await navigator.credentials.create({
        publicKey: {
          challenge: challenge as BufferSource,
          rp: {
            id: window.location.hostname,
            name: 'Silk Mart Admin',
          },
          user: {
            id: new TextEncoder().encode(user.id) as BufferSource,
            name: user.email,
            displayName: user.name,
          },
          pubKeyCredParams: [
            { alg: -7, type: 'public-key' },
            { alg: -257, type: 'public-key' },
          ],
          authenticatorSelection: {
            authenticatorAttachment: 'platform',
            userVerification: 'required',
            residentKey: 'preferred',
          },
          timeout: 60000,
          attestation: 'none',
        },
      }) as PublicKeyCredential

      if (!credential) {
        throw new Error('Failed to create biometric credential')
      }

      // Store credential ID locally
      const rawId = bufferToBase64(credential.rawId)
      localStorage.setItem('silk_guard_credential_id', rawId)
      localStorage.setItem('silk_guard_biometric', 'true')
      
      haptics.success()
      setStatus('success')
    } catch (error: any) {
      console.error('Biometric setup error:', error)
      haptics.error()
      setStatus('error')
      setErrorMessage(error.message || 'Failed to set up biometric authentication')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="bg-white/10 backdrop-blur-xl border-white/20">
          <CardHeader className="text-center pb-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg"
            >
              <Shield className="w-10 h-10 text-white" />
            </motion.div>
            <CardTitle className="text-white text-2xl">Setup Biometric Login</CardTitle>
            <CardDescription className="text-white/60">
              Register your fingerprint or face for quick, secure login
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {status === 'success' ? (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center space-y-4"
              >
                <div className="w-20 h-20 mx-auto bg-green-500/20 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-green-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg">Biometric Setup Complete!</h3>
                  <p className="text-white/60 text-sm mt-2">
                    You can now use fingerprint/face to login to the admin panel.
                  </p>
                </div>
                <Button
                  onClick={() => router.push('/admin')}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white"
                >
                  Go to Admin Panel
                </Button>
              </motion.div>
            ) : status === 'error' ? (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center space-y-4"
              >
                <div className="w-20 h-20 mx-auto bg-red-500/20 rounded-full flex items-center justify-center">
                  <XCircle className="w-10 h-10 text-red-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg">Setup Failed</h3>
                  <p className="text-white/60 text-sm mt-2">{errorMessage}</p>
                </div>
                <Button
                  onClick={() => setStatus('idle')}
                  variant="outline"
                  className="w-full border-white/20 text-white hover:bg-white/10"
                >
                  Try Again
                </Button>
              </motion.div>
            ) : (
              <>
                {/* Info Section */}
                <div className="bg-white/5 rounded-xl p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <Smartphone className="w-5 h-5 text-purple-400 mt-0.5" />
                    <div>
                      <p className="text-white text-sm font-medium">How it works</p>
                      <p className="text-white/60 text-xs mt-1">
                        Your device's fingerprint sensor or face recognition will be used to verify your identity when logging in.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-green-400 mt-0.5" />
                    <div>
                      <p className="text-white text-sm font-medium">Secure</p>
                      <p className="text-white/60 text-xs mt-1">
                        Your biometric data never leaves your device. It's stored securely by your phone.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Setup Button */}
                <Button
                  onClick={handleSetupBiometric}
                  disabled={loading}
                  className="w-full h-14 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold text-lg rounded-xl shadow-lg shadow-purple-500/25 transition-all duration-300"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Setting up...
                    </>
                  ) : (
                    <>
                      <Fingerprint className="w-5 h-5 mr-2" />
                      Register Fingerprint
                    </>
                  )}
                </Button>

                {/* Cancel */}
                <Button
                  onClick={() => router.back()}
                  variant="ghost"
                  className="w-full text-white/60 hover:text-white"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}
