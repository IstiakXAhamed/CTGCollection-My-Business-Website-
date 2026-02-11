'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Download, Zap, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSiteSettings } from '@/hooks/useSiteSettings'

export function PWAInstallBanner() {
  const { settings, loading } = useSiteSettings()
  const [isStandalone, setIsStandalone] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    if (typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches) {
      setIsStandalone(true)
    }
  }, [])

  const handleInstallClick = () => {
    window.dispatchEvent(new CustomEvent('pwa-install-requested'))
  }

  // Don't render during SSR, or if already installed, or if disabled in admin
  if (!isClient || loading || isStandalone || !settings?.pwaShowInstallLink) return null

  return (
    <section className="py-4 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 px-5 py-4 sm:px-8 sm:py-5 text-white"
        >
          {/* Background Decoration */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          
          <div className="relative z-10 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex-1 min-w-0">
              <h2 className="text-base sm:text-lg font-bold leading-tight">
                Shop Faster with the{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-cyan-200">
                  Silk Mart App
                </span>
              </h2>
              
              <div className="flex gap-3 mt-1.5">
                <span className="flex items-center gap-1 text-[10px] sm:text-xs text-white/80">
                  <Zap className="w-3 h-3 text-yellow-400" /> Instant Access
                </span>
                <span className="flex items-center gap-1 text-[10px] sm:text-xs text-white/80">
                  <Zap className="w-3 h-3 text-yellow-400" /> No App Store
                </span>
              </div>
            </div>

            <Button 
              onClick={handleInstallClick}
              size="sm"
              className="h-9 px-4 bg-white text-blue-600 hover:bg-gray-50 border-0 rounded-xl font-bold text-sm shadow-lg hover:shadow-xl transition-all active:scale-95 flex-shrink-0"
            >
              <Download className="w-4 h-4 mr-1.5" />
              Install
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
