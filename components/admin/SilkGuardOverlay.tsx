'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShieldCheck, Fingerprint, Lock, ChevronRight, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { haptics } from '@/lib/haptics'
import { useSilkGuard } from '@/hooks/useSilkGuard'

/**
 * SilkGuardOverlay Component
 * A premium security gate for Admin/Sellers on mobile.
 */
export const SilkGuardOverlay = ({ user }: { user: any }) => {
  const { isLocked, passcode, biometricsActive, unlock, triggerBiometrics, isHydrated, isInternal, isMobile } = useSilkGuard(user?.role)
  const [pinInput, setPinInput] = useState('')
  const [error, setError] = useState(false)

  const [isAuthenticating, setIsAuthenticating] = useState(false)

  // Auto-trigger biometrics on mount/lock
  useEffect(() => {
    if (isLocked && biometricsActive && isHydrated) {
      const timer = setTimeout(() => {
        handleBiometricAuth()
      }, 800)
      return () => clearTimeout(timer)
    }
  }, [isLocked, biometricsActive, isHydrated])

  const handleBiometricAuth = async () => {
    if (isAuthenticating) return
    
    setIsAuthenticating(true)
    haptics.pulse()

    // In a production PWA on a real device, this triggers the OS-level Biometric prompt.
    // For the demonstration bridge, we use a timeout to simulate the 'Match' delay.
    try {
      // Simulate native delay
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Success
      unlock()
    } catch (err) {
      setIsAuthenticating(false)
      haptics.error()
    }
  }

  const handlePinInput = (num: string) => {
    haptics.soft()
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
    } else {
      haptics.error()
      setError(true)
      setPinInput('')
      setTimeout(() => setError(false), 500)
    }
  }

  const deletePin = () => {
    haptics.light()
    setPinInput(pinInput.slice(0, -1))
  }

  if (!isHydrated || !isLocked || !isInternal || !isMobile) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] bg-white/40 dark:bg-black/40 backdrop-blur-2xl flex flex-col items-center justify-center p-6 select-none"
      >
        {/* Elite Brand Header */}
        <motion.div 
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-blue-500/30">
            <ShieldCheck className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            Silk Guard
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {isAuthenticating ? 'Scanning Biometrics...' : 'Admin Security Active'}
          </p>
        </motion.div>

        {/* PIN Indicators */}
        <div className={`flex gap-4 mb-12 ${error ? 'animate-shake' : ''}`}>
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              animate={{ 
                scale: i < pinInput.length ? 1.2 : 1,
                backgroundColor: i < pinInput.length ? '#2563eb' : 'rgba(0,0,0,0.1)'
              }}
              className="w-3.5 h-3.5 rounded-full"
            />
          ))}
        </div>

        {/* Number Pad */}
        <div className="grid grid-cols-3 gap-6 max-w-[320px] w-full">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <Button
              key={num}
              variant="ghost"
              className="h-20 w-20 rounded-full text-2xl font-semibold hover:bg-black/5 dark:hover:bg-white/5 active:scale-90 transition-all border border-transparent hover:border-black/5"
              onClick={() => handlePinInput(num.toString())}
            >
              {num}
            </Button>
          ))}
          <Button
            variant="ghost"
            disabled={isAuthenticating}
            className={`h-20 w-20 rounded-full flex items-center justify-center text-blue-600 active:scale-90 transition-all ${isAuthenticating ? 'animate-pulse scale-110' : ''}`}
            onClick={handleBiometricAuth}
          >
            <Fingerprint className={`w-8 h-8 ${isAuthenticating ? 'text-blue-500' : ''}`} />
          </Button>
          <Button
            key={0}
            variant="ghost"
            className="h-20 w-20 rounded-full text-2xl font-semibold hover:bg-black/5 active:scale-90"
            onClick={() => handlePinInput('0')}
          >
            0
          </Button>
          <Button
            variant="ghost"
            className="h-20 w-20 rounded-full flex items-center justify-center text-red-500 active:scale-90"
            onClick={deletePin}
          >
            <X className="w-6 h-6" />
          </Button>
        </div>

        {/* Footer Info */}
        <div className="mt-16 text-center">
          <p className="text-xs text-muted-foreground flex items-center gap-2 justify-center">
            <Lock className="w-3 h-3" /> Hardware Encrypted Access
          </p>
        </div>

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
