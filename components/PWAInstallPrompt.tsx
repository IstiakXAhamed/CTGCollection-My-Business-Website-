'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Share, X } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function PWAInstallPrompt() {
  const deferredPromptRef = useRef<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [showIOSGuide, setShowIOSGuide] = useState(false)
  const [isIOS, setIsIOS] = useState(false)

  useEffect(() => {
    // Register service worker — REQUIRED for beforeinstallprompt to fire
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(err => {
        console.log('SW registration failed:', err)
      })
    }

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      return
    }

    // Check for iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent)
    setIsIOS(isIOSDevice)

    // Capture the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      deferredPromptRef.current = e as BeforeInstallPromptEvent
      console.log('beforeinstallprompt captured')
    }
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // Listen for install requests from banner/navbar — trigger native prompt directly
    const handleManualRequest = async () => {
      console.log('PWA Install Requested')
      
      if (deferredPromptRef.current) {
        // Directly trigger the native browser install prompt — no custom popup
        try {
          await deferredPromptRef.current.prompt()
          const { outcome } = await deferredPromptRef.current.userChoice
          if (outcome === 'accepted') {
            setIsInstalled(true)
          }
          deferredPromptRef.current = null
        } catch (err) {
          console.error('Install prompt error:', err)
        }
      } else if (isIOSDevice) {
        // iOS has no native prompt — show instructions
        setShowIOSGuide(true)
      } else {
        // No deferred prompt available yet — may not meet PWA criteria
        console.log('No install prompt available yet')
      }
    }
    window.addEventListener('pwa-install-requested', handleManualRequest)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('pwa-install-requested', handleManualRequest)
    }
  }, [])

  if (isInstalled) return null

  // Only render iOS instructions overlay when needed
  if (!showIOSGuide) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-72 z-[200]"
      >
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-sm">Install Silk Mart</h3>
            <button onClick={() => setShowIOSGuide(false)} className="p-1 hover:bg-gray-100 rounded-full">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-2 text-xs text-gray-600">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-[10px] font-bold">1</span>
              <span>Tap <Share className="w-3 h-3 inline" /> Share button</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-[10px] font-bold">2</span>
              <span>Tap "Add to Home Screen"</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-[10px] font-bold">3</span>
              <span>Tap "Add" to confirm</span>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
