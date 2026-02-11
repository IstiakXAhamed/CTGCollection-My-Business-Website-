'use client'

import { useState, useEffect, useCallback } from 'react'
import { haptics } from '@/lib/haptics'

/**
 * WebAuthn Helper Functions
 * These handle the actual biometric authentication via Web Credentials API
 */

// Check if WebAuthn/platform authenticator is available
const isWebAuthnSupported = async (): Promise<boolean> => {
  if (typeof window === 'undefined') return false
  if (!window.PublicKeyCredential) return false
  
  try {
    // Check if platform authenticator (Face ID, Touch ID, Windows Hello) is available
    const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
    return available
  } catch {
    return false
  }
}

// Generate a random challenge
const generateChallenge = (): Uint8Array => {
  const challenge = new Uint8Array(32)
  window.crypto.getRandomValues(challenge)
  return challenge
}

// Convert ArrayBuffer to Base64 string for storage
const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

// Convert Base64 string to ArrayBuffer
const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes.buffer
}

// Relying Party configuration (our app)
const RP_ID = typeof window !== 'undefined' ? window.location.hostname : 'silkmartbd.com'
const RP_NAME = 'Silk Mart Security'

/**
 * useSilkGuard Hook
 * Manages the "Elite Guard" security state for internal roles.
 * Implements proper WebAuthn biometric authentication.
 * Stores device-specific preferences in localStorage.
 */
export const useSilkGuard = (userRole?: string) => {
  const [isLocked, setIsLocked] = useState(false)
  const [isEnabled, setIsEnabled] = useState(false)
  const [biometricsActive, setBiometricsActive] = useState(false)
  const [biometricsSupported, setBiometricsSupported] = useState(false)
  const [passcode, setPasscode] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)
  const [credentialId, setCredentialId] = useState<string | null>(null)

  const isInternal = userRole === 'admin' || userRole === 'superadmin' || userRole === 'seller'

  // Check WebAuthn support and load preferences on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && isInternal) {
      const init = async () => {
        // Check if biometrics are supported
        const supported = await isWebAuthnSupported()
        setBiometricsSupported(supported)

        // Load saved preferences
        const savedEnabled = localStorage.getItem('silk_guard_enabled') === 'true'
        const savedBio = localStorage.getItem('silk_guard_biometric') === 'true'
        const savedPass = localStorage.getItem('silk_guard_passcode')
        const savedCredential = localStorage.getItem('silk_guard_credential_id')
        
        // Detect mobile device (screen size or touch capability)
        const mobileCheck = window.matchMedia("(max-width: 768px)").matches || 
                            ('ontouchstart' in window) ||
                            (navigator.maxTouchPoints > 0)
        setIsMobile(mobileCheck)
        
        setIsEnabled(savedEnabled)
        setBiometricsActive(savedBio && supported) // Only active if supported
        setPasscode(savedPass)
        setCredentialId(savedCredential)
        
        // Auto-lock if enabled AND on mobile
        if (savedEnabled && mobileCheck) {
          setIsLocked(true)
        }
        
        setIsHydrated(true)
      }

      init()
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

  /**
   * Register a new biometric credential
   * This should be called when the user enables biometric auth in settings
   */
  const registerBiometric = useCallback(async (userId: string, userName: string): Promise<boolean> => {
    if (!biometricsSupported) {
      console.warn('Biometrics not supported on this device')
      return false
    }

    try {
      haptics.light()

      const challenge = generateChallenge()
      
      // Create credential options for registration
      const createOptions: CredentialCreationOptions = {
        publicKey: {
          challenge: challenge as BufferSource,
          rp: {
            id: RP_ID,
            name: RP_NAME,
          },
          user: {
            id: new TextEncoder().encode(userId) as BufferSource,
            name: userName,
            displayName: `Silk Mart Admin (${userName})`,
          },
          pubKeyCredParams: [
            { alg: -7, type: 'public-key' },   // ES256
            { alg: -257, type: 'public-key' }, // RS256
          ],
          authenticatorSelection: {
            authenticatorAttachment: 'platform', // Use built-in authenticator (Face ID, Touch ID, etc.)
            userVerification: 'required',        // Must verify user
            residentKey: 'preferred',
          },
          timeout: 60000,
          attestation: 'none', // We don't need attestation for local auth
        },
      }

      // Create the credential
      const credential = await navigator.credentials.create(createOptions) as PublicKeyCredential
      
      if (!credential) {
        throw new Error('Failed to create credential')
      }

      // Store the credential ID for later authentication
      const credId = arrayBufferToBase64(credential.rawId)
      setCredentialId(credId)
      localStorage.setItem('silk_guard_credential_id', credId)
      
      haptics.success()
      return true
    } catch (error) {
      console.error('Biometric registration failed:', error)
      haptics.error()
      return false
    }
  }, [biometricsSupported])

  /**
   * Authenticate using biometrics
   * Returns true if authentication succeeds
   */
  const authenticateWithBiometric = useCallback(async (): Promise<boolean> => {
    if (!biometricsSupported || !biometricsActive) {
      return false
    }

    try {
      haptics.light()

      const challenge = generateChallenge()
      
      // Build allowed credentials list
      const allowCredentials: PublicKeyCredentialDescriptor[] = credentialId
        ? [{
            id: base64ToArrayBuffer(credentialId),
            type: 'public-key',
            transports: ['internal'],
          }]
        : []

      // Authentication options
      const getOptions: CredentialRequestOptions = {
        publicKey: {
          challenge: challenge as BufferSource,
          rpId: RP_ID,
          userVerification: 'required',
          timeout: 60000,
          allowCredentials: allowCredentials.length > 0 ? allowCredentials : undefined,
        },
      }

      // Authenticate
      const assertion = await navigator.credentials.get(getOptions) as PublicKeyCredential
      
      if (!assertion) {
        throw new Error('Authentication failed')
      }

      // Success - the user was verified by the platform authenticator
      return true
    } catch (error) {
      console.error('Biometric authentication failed:', error)
      return false
    }
  }, [biometricsSupported, biometricsActive, credentialId])

  /**
   * Legacy trigger function for compatibility
   * Now properly implements WebAuthn
   */
  const triggerBiometrics = useCallback(async (): Promise<boolean> => {
    const result = await authenticateWithBiometric()
    if (result) {
      haptics.success()
    } else {
      haptics.error()
    }
    return result
  }, [authenticateWithBiometric])

  /**
   * Set security preferences
   */
  const setSecurity = useCallback(async (
    enabled: boolean, 
    bio: boolean, 
    pin: string | null,
    userId?: string,
    userName?: string
  ): Promise<boolean> => {
    // If enabling biometrics, register the credential first
    if (bio && !biometricsActive && userId && userName) {
      const registered = await registerBiometric(userId, userName)
      if (!registered) {
        // Failed to register biometrics, disable it
        bio = false
      }
    }

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

    return true
  }, [biometricsActive, registerBiometric])

  /**
   * Clear all security settings (for logout)
   */
  const clearSecurity = useCallback(() => {
    setIsEnabled(false)
    setBiometricsActive(false)
    setPasscode(null)
    setCredentialId(null)
    setIsLocked(false)
    
    localStorage.removeItem('silk_guard_enabled')
    localStorage.removeItem('silk_guard_biometric')
    localStorage.removeItem('silk_guard_passcode')
    localStorage.removeItem('silk_guard_credential_id')
  }, [])

  return {
    // State
    isLocked,
    isEnabled,
    biometricsActive,
    biometricsSupported,
    passcode,
    isMobile,
    isHydrated,
    isInternal,
    credentialId,
    
    // Actions
    unlock,
    lock,
    setSecurity,
    clearSecurity,
    triggerBiometrics,
    registerBiometric,
    authenticateWithBiometric,
  }
}
