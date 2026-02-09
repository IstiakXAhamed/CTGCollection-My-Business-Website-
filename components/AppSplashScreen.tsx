'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { useAppStandalone } from '@/hooks/useAppStandalone'

export default function AppSplashScreen() {
  const isStandalone = useAppStandalone()
  const [show, setShow] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    // Check if already shown in this session
    const hasShown = sessionStorage.getItem('splash-shown')
    
    // Only show if in standalone mode and not yet shown in this session
    if (isStandalone && !hasShown && !isDismissed) {
      setShow(true)
      const timer = setTimeout(() => {
        setShow(false)
        setIsDismissed(true)
        sessionStorage.setItem('splash-shown', 'true')
      }, 2200) // Show for 2.2 seconds for luxury feel

      return () => clearTimeout(timer)
    }
  }, [isStandalone, isDismissed])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ 
              duration: 0.8, 
              ease: "easeOut",
              delay: 0.2
            }}
            className="flex flex-col items-center"
          >
            <div className="relative w-24 h-24 mb-6 bg-white rounded-3xl p-4 shadow-2xl overflow-hidden">
               <Image 
                src="/logo.png" 
                alt="Silk Mart" 
                fill
                className="p-4 object-contain"
                priority
              />
              <motion.div 
                className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/30 to-white/0"
                animate={{ x: [-200, 200] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              />
            </div>
            
            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-3xl font-bold text-white tracking-tight"
            >
              Silk Mart
            </motion.h1>
            
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 0.6 }}
               transition={{ delay: 0.8 }}
               className="mt-2 text-white/80 text-sm font-medium tracking-widest uppercase italic"
            >
              The Elite Experience
            </motion.div>
          </motion.div>

          <motion.div 
            className="absolute bottom-12 flex space-x-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-white rounded-full"
                animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
