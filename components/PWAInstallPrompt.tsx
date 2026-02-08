'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Smartphone, X, Download, Share, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [settings, setSettings] = useState<{ pwaEnabled: boolean, pwaPromptDelay: number } | null>(null)

  useEffect(() => {
    // Fetch settings
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.settings) {
          setSettings(data.settings)
        }
      })
      .catch(err => console.error('Error fetching settings for PWA:', err))

    // Check if already dismissed
    const dismissed = localStorage.getItem('pwa_prompt_dismissed')
    if (dismissed) return

    // Check if in standalone mode (already installed)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      return
    }

    // Check for iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent)
    setIsIOS(isIOSDevice)

    // Listen for beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // Listen for manual install requests
    const handleManualRequest = () => {
      setIsVisible(true)
    }
    window.addEventListener('pwa-install-requested', handleManualRequest)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('pwa-install-requested', handleManualRequest)
    }
  }, [])

  // Secondary effect to handle visibility once settings are loaded
  useEffect(() => {
    if (!settings || settings.pwaEnabled === false || isInstalled) return

    const delay = (settings.pwaPromptDelay || 30) * 1000
    
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, delay)

    return () => clearTimeout(timer)
  }, [settings, isInstalled])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      
      if (outcome === 'accepted') {
        setIsInstalled(true)
      }
      setIsVisible(false)
      setDeferredPrompt(null)
    } catch (error) {
      console.error('Install error:', error)
    }
  }

  const handleDismiss = () => {
    setIsVisible(false)
    localStorage.setItem('pwa_prompt_dismissed', 'true')
  }

  if (!isVisible || isInstalled) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-50"
      >
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold">Add to Home Screen</h3>
                  <p className="text-sm text-white/80">Quick access anytime</p>
                </div>
              </div>
              <button
                onClick={handleDismiss}
                className="p-1 hover:bg-white/20 rounded-full transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            {isIOS ? (
              // iOS Instructions
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Install CTG Collection app on your iPhone:
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xs font-bold">1</span>
                    <span>Tap <Share className="w-4 h-4 inline" /> Share button</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xs font-bold">2</span>
                    <span>Scroll and tap "Add to Home Screen"</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xs font-bold">3</span>
                    <span>Tap "Add" to confirm</span>
                  </div>
                </div>
              </div>
            ) : (
              // Android / Desktop
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Install our app for faster shopping and offline access!
                </p>
                <div className="flex gap-2">
                  <Button onClick={handleInstall} className="flex-1 gap-2">
                    <Download className="w-4 h-4" />
                    Install App
                  </Button>
                  <Button onClick={handleDismiss} variant="ghost">
                    Later
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
