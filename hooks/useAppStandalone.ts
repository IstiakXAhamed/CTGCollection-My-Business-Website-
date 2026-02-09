'use client'

import { useState, useEffect } from 'react'

/**
 * Hook to detect if the application is running in "Standalone" (installed PWA) mode.
 * This allows us to trigger "Silk Elite" exclusive features only for app users.
 */
export function useAppStandalone() {
  const [isStandalone, setIsStandalone] = useState<boolean>(false)

  useEffect(() => {
    // Check if the window object is available (client-side)
    if (typeof window !== 'undefined') {
      const checkStandalone = () => {
        const isStandaloneMode = 
          window.matchMedia('(display-mode: standalone)').matches ||
          (window as any).navigator.standalone === true || // iOS Safari check
          document.referrer.includes('android-app://') // Android TWA check

        setIsStandalone(isStandaloneMode)
      }

      // Initial check
      checkStandalone()

      // Listen for changes (e.g., if user installs while app is open)
      const mediaQuery = window.matchMedia('(display-mode: standalone)')
      
      // Modern browsers
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', checkStandalone)
        return () => mediaQuery.removeEventListener('change', checkStandalone)
      } else {
        // Legacy support
        mediaQuery.addListener(checkStandalone)
        return () => mediaQuery.removeListener(checkStandalone)
      }
    }
  }, [])

  return isStandalone
}
