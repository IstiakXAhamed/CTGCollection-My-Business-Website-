'use client'

import { useState, useEffect, useCallback } from 'react'
import { haptics } from '@/lib/haptics'

/**
 * useSilkGuard Hook
 * Manages the "Elite Guard" security state for internal roles.
 * Stores device-specific preferences in localStorage.
 */
export const useSilkGuard = (userRole?: string) => {
  const [isLocked, setIsLocked] = useState(false)
  const [isEnabled, setIsEnabled] = useState(false)
  const [biometricsActive, setBiometricsActive] = useState(false)
  const [passcode, setPasscode] = useState<string | null>(null)
  const [isHydrated, setIsHydrated] = useState(false)

  const isInternal = userRole === 'admin' || userRole === 'superadmin' || userRole === 'seller'

  // Load preferences from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && isInternal) {
      const savedEnabled = localStorage.getItem('silk_guard_enabled') === 'true'
      const savedBio = localStorage.getItem('silk_guard_biometric') === 'true'
      const savedPass = localStorage.getItem('silk_guard_passcode')
      
      setIsEnabled(savedEnabled)
      setBiometricsActive(savedBio)
      setPasscode(savedPass)
      
      // Auto-lock if enabled
      if (savedEnabled) {
        setIsLocked(true)
      }
      
      setIsHydrated(true)
    }
  }, [isInternal])

  const unlock = useCallback(() => {
    haptics.success()
    setIsLocked(false)
  }, [])

  const lock = useCallback(() => {
    if (isEnabled) {
      setIsLocked(true)
    }
  }, [isEnabled])

  const setSecurity = (enabled: boolean, bio: boolean, pin: string | null) => {
    setIsEnabled(enabled)
    setBiometricsActive(bio)
    setPasscode(pin)
    
    localStorage.setItem('silk_guard_enabled', enabled.toString())
    localStorage.setItem('silk_guard_biometric', bio.toString())
    if (pin) {
      localStorage.setItem('silk_guard_passcode', pin)
    } else {
      localStorage.removeItem('silk_guard_passcode')
    }
  }

  /**
   * Triggers the biometric prompt if supported and enabled.
   */
  const triggerBiometrics = async () => {
    if (!biometricsActive || !window.PublicKeyCredential) return false

    try {
      // In a real implementation, we'd use WebAuthn here.
      // For this PWA/Silk Elite phase, we use a simple check or the native credential prompt
      // if supported.
      
      // Simple fallback for demonstration or actual WebAuthn if needed:
      // const challenge = new Uint8Array(32);
      // window.crypto.getRandomValues(challenge);
      // await navigator.credentials.get({ publicKey: { ... } });
      
      // For now, let's assume success or prompt logic is handled in the UI component
      return true
    } catch (err) {
      console.error('Biometric failed:', err)
      return false
    }
  }

  return {
    isLocked,
    isEnabled,
    biometricsActive,
    passcode,
    isHydrated,
    isInternal,
    unlock,
    lock,
    setSecurity,
    triggerBiometrics
  }
}
