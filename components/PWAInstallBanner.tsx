'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Smartphone, Download, Sparkles, ArrowRight, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function PWAInstallBanner() {
  const [isVisible, setIsVisible] = useState(false)
  const [settings, setSettings] = useState<any>(null)

  useEffect(() => {
    // Check if in standalone mode (already installed)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return
    }

    // Fetch settings to check if link should be shown
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        setSettings(data.settings)
        if (data.settings?.pwaShowInstallLink) {
          setIsVisible(true)
        }
      })
      .catch(err => console.error('PWA Banner settings fetch error:', err))
  }, [])

  const handleInstallClick = () => {
    window.dispatchEvent(new CustomEvent('pwa-install-requested'))
  }

  if (!isVisible) return null

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-6 sm:p-10 text-white"
        >
          {/* Background Decorations */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-pink-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full border border-white/20 mb-4">
                <Sparkles className="w-4 h-4 text-yellow-300" />
                <span className="text-xs font-bold uppercase tracking-wider">Fast & Reliable</span>
              </div>
              
              <h2 className="text-2xl sm:text-4xl font-bold mb-4 leading-tight">
                Shop Faster with the<br className="hidden sm:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-white to-cyan-200">
                  Silk Mart Mobile App
                </span>
              </h2>
              
              <p className="text-blue-100 text-sm sm:text-base max-w-lg mb-6 leading-relaxed">
                Install our app on your device for one-tap access, lightning-fast browsing, 
                and exclusive app-only deals. No App Store needed!
              </p>
              
              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                <div className="flex items-center gap-2 text-xs font-medium text-white/80">
                  <Zap className="w-4 h-4 text-yellow-400" /> Instant Access
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-white/80">
                  <Zap className="w-4 h-4 text-yellow-400" /> Low Data Usage
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-white/80">
                  <Zap className="w-4 h-4 text-yellow-400" /> Secure Checkout
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center gap-4 flex-shrink-0">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 to-pink-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
                <Button 
                  onClick={handleInstallClick}
                  size="lg" 
                  className="relative h-14 px-8 bg-white text-blue-600 hover:bg-gray-50 border-0 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all group active:scale-95"
                >
                  <Download className="w-5 h-5 mr-2 group-hover:bounce transition-transform" />
                  Install App
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
              <p className="text-[10px] sm:text-xs text-blue-200/70 font-medium">
                Works on iOS, Android, and PC
              </p>
            </div>
          </div>

          {/* Device Mockup Icon Background */}
          <div className="absolute top-1/2 right-10 -translate-y-1/2 opacity-10 pointer-events-none hidden lg:block">
            <Smartphone className="w-64 h-64 rotate-12" />
          </div>
        </motion.div>
      </div>
    </section>
  )
}
