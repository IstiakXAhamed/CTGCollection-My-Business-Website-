'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShieldCheck, Fingerprint, Lock, X, AlertCircle, Smartphone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { haptics } from '@/lib/haptics'
import { useSilkGuard } from '@/hooks/useSilkGuard'

/**
 * SilkGuardOverlay Component
 * A premium security gate for Admin/Sellers on mobile PWA.
 * Implements proper WebAuthn biometric authentication.
 */
export const SilkGuardOverlay = ({ user }: { user: any }) => {
  const { 
    isLocked, 
    passcode, 
    biometricsActive, 
    biometricsSupported,
    unlock, 
    authenticateWithBiometric, 
    isHydrated, 
    isInternal, 
    isMobile 
  } = useSilkGuard(user?.role)
  
  const [pinInput, setPinInput] = useState('')
  const [error, setError] = useState(false)
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [showPinFallback, setShowPinFallback] = useState(false)

  // Auto-trigger biometrics on mount/lock
  useEffect(() => {
    if (isLocked && biometricsActive && isHydrated && !showPinFallback) {
      const timer = setTimeout(() => {
        handleBiometricAuth()
      }, 800)
      return () => clearTimeout(timer)
    }
  }, [isLocked, biometricsActive, isHydrated, showPinFallback])

  const handleBiometricAuth = useCallback(async () => {
    if (isAuthenticating) return
    
    setIsAuthenticating(true)
    setAuthError(null)
    haptics.pulse()

    try {
      const success = await authenticateWithBiometric()
      
      if (success) {
        unlock()
      } else {
        setAuthError('Authentication failed. Try again or use PIN.')
        haptics.error()
        // Show PIN fallback after failed attempt
        setTimeout(() => setShowPinFallback(true), 1500)
      }
    } catch (err) {
      console.error('Biometric auth error:', err)
      setAuthError('Biometric authentication unavailable')
      haptics.error()
      setShowPinFallback(true)
    } finally {
      setIsAuthenticating(false)
    }
  }, [isAuthenticating, authenticateWithBiometric, unlock])

  const handlePinInput = (num: string) => {
    haptics.soft()
    setAuthError(null)
    
    if (pinInput.length < 6) {
      const newPin = pinInput + num
      setPinInput(newPin)
      
      if (newPin.length === 6) {
        verifyPin(newPin)
      }
    }
  }

  const verifyPin = (pin: string) => {
    if (pin === passcode) {
      unlock()
      setPinInput('')
      setShowPinFallback(false)
    } else {
      haptics.error()
      setError(true)
      setPinInput('')
      setAuthError('Incorrect PIN')
      setTimeout(() => {
        setError(false)
        setAuthError(null)
      }, 1500)
    }
  }

  const deletePin = () => {
    haptics.light()
    setPinInput(pinInput.slice(0, -1))
    setAuthError(null)
  }

  const switchToBiometric = () => {
    haptics.light()
    setShowPinFallback(false)
    setPinInput('')
    setAuthError(null)
    // Trigger biometric after a short delay
    setTimeout(() => handleBiometricAuth(), 300)
  }

  if (!isHydrated || !isLocked || !isInternal || !isMobile) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] bg-white/95 dark:bg-gray-950/95 backdrop-blur-2xl flex flex-col items-center justify-center p-6 select-none"
      >
        {/* Elite Brand Header */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-8"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-blue-500/30">
            <ShieldCheck className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            Silk Guard
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {isAuthenticating 
              ? 'Verifying identity...' 
              : showPinFallback 
                ? 'Enter your PIN' 
                : 'Admin Security Active'}
          </p>
        </motion.div>

        {/* Error Message */}
        <AnimatePresence>
          {authError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-2 px-4 py-2 mb-6 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm"
            >
              <AlertCircle className="w-4 h-4" />
              {authError}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Biometric Auth View */}
        {!showPinFallback && biometricsActive && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center mb-8"
          >
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleBiometricAuth}
              disabled={isAuthenticating}
              className={`relative w-28 h-28 rounded-full flex items-center justify-center transition-all ${
                isAuthenticating 
                  ? 'bg-blue-100 dark:bg-blue-900/30' 
                  : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {isAuthenticating && (
                <motion.div
                  className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
              )}
              <Fingerprint className={`w-14 h-14 ${
                isAuthenticating ? 'text-blue-500 animate-pulse' : 'text-gray-500'
              }`} />
            </motion.button>
            
            <p className="text-sm text-muted-foreground mt-4">
              {isAuthenticating ? 'Touch sensor to verify' : 'Tap to authenticate'}
            </p>

            {/* Fallback to PIN option */}
            {passcode && (
              <button
                onClick={() => { setShowPinFallback(true); haptics.light() }}
                className="mt-6 text-sm text-blue-600 dark:text-blue-400 font-medium hover:underline"
              >
                Use PIN instead
              </button>
            )}
          </motion.div>
        )}

        {/* PIN Entry View */}
        {(showPinFallback || !biometricsActive) && passcode && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-[320px]"
          >
            {/* PIN Indicators */}
            <div className={`flex gap-4 justify-center mb-8 ${error ? 'animate-shake' : ''}`}>
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ 
                    scale: i < pinInput.length ? 1.2 : 1,
                    backgroundColor: error 
                      ? '#ef4444' 
                      : i < pinInput.length 
                        ? '#2563eb' 
                        : 'rgba(0,0,0,0.1)'
                  }}
                  className="w-3.5 h-3.5 rounded-full"
                />
              ))}
            </div>

            {/* Number Pad */}
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <Button
                  key={num}
                  variant="ghost"
                  className="h-16 w-16 mx-auto rounded-full text-xl font-semibold hover:bg-black/5 dark:hover:bg-white/5 active:scale-90 transition-all"
                  onClick={() => handlePinInput(num.toString())}
                >
                  {num}
                </Button>
              ))}
              
              {/* Bottom row: Biometric / 0 / Delete */}
              {biometricsActive && biometricsSupported ? (
                <Button
                  variant="ghost"
                  className="h-16 w-16 mx-auto rounded-full flex items-center justify-center text-blue-600 active:scale-90 transition-all"
                  onClick={switchToBiometric}
                >
                  <Fingerprint className="w-7 h-7" />
                </Button>
              ) : (
                <div className="h-16 w-16" /> // Empty spacer
              )}
              
              <Button
                variant="ghost"
                className="h-16 w-16 mx-auto rounded-full text-xl font-semibold hover:bg-black/5 active:scale-90"
                onClick={() => handlePinInput('0')}
              >
                0
              </Button>
              
              <Button
                variant="ghost"
                className="h-16 w-16 mx-auto rounded-full flex items-center justify-center text-red-500 active:scale-90"
                onClick={deletePin}
              >
                <X className="w-6 h-6" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* No Auth Method Configured */}
        {!passcode && !biometricsActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
          >
            <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Smartphone className="w-8 h-8 text-amber-600" />
            </div>
            <p className="text-muted-foreground mb-4">
              No security method configured.<br />
              Please set up a PIN or biometrics in settings.
            </p>
            <Button
              onClick={unlock}
              variant="outline"
              className="rounded-xl"
            >
              Continue without security
            </Button>
          </motion.div>
        )}

        {/* Footer Info */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="absolute bottom-8 left-0 right-0 text-center"
        >
          <p className="text-xs text-muted-foreground flex items-center gap-2 justify-center">
            <Lock className="w-3 h-3" /> 
            {biometricsActive ? 'WebAuthn Secured' : 'PIN Protected'}
          </p>
        </motion.div>

        <style jsx global>{`
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-10px); }
            75% { transform: translateX(10px); }
          }
          .animate-shake {
            animation: shake 0.2s ease-in-out 0s 2;
          }
        `}</style>
      </motion.div>
    </AnimatePresence>
  )
}
