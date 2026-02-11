'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Zap, Gift, Percent, Star, Clock, TrendingUp, 
  Truck, Shield, Headphones, CreditCard
} from 'lucide-react'
import Link from 'next/link'
import { useAppStandalone } from '@/hooks/useAppStandalone'
import { usePathname } from 'next/navigation'
import { haptics } from '@/lib/haptics'

interface QuickAction {
  id: string
  icon: React.ElementType
  label: string
  href: string
  color: string
  bgColor: string
}

const quickActions: QuickAction[] = [
  { 
    id: 'flash', 
    icon: Zap, 
    label: 'Flash Sale', 
    href: '/shop?sale=true',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50 dark:bg-amber-950/30'
  },
  { 
    id: 'new', 
    icon: Star, 
    label: 'New In', 
    href: '/shop?sort=newest',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 dark:bg-purple-950/30'
  },
  { 
    id: 'trending', 
    icon: TrendingUp, 
    label: 'Trending', 
    href: '/shop?featured=true',
    color: 'text-rose-600',
    bgColor: 'bg-rose-50 dark:bg-rose-950/30'
  },
  { 
    id: 'deals', 
    icon: Percent, 
    label: 'Deals', 
    href: '/shop?sale=true',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/30'
  },
]

export function MobileQuickActions() {
  const isStandalone = useAppStandalone()
  const pathname = usePathname()
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  // Hide when scrolling down
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      
      if (currentScrollY > lastScrollY && currentScrollY > 200) {
        setIsVisible(false)
      } else if (currentScrollY < lastScrollY) {
        setIsVisible(true)
      }
      
      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

  // Only show in standalone mode on home page
  if (!isStandalone || pathname !== '/') return null

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="sticky top-[calc(56px+env(safe-area-inset-top,0px))] z-40 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50"
        >
          <div className="flex justify-around py-3 px-2">
            {quickActions.map((action, index) => (
              <motion.div
                key={action.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  href={action.href}
                  onClick={() => haptics.light()}
                  className="flex flex-col items-center gap-1.5 group"
                >
                  <motion.div
                    whileTap={{ scale: 0.9 }}
                    className={`w-12 h-12 rounded-2xl ${action.bgColor} flex items-center justify-center transition-transform group-active:scale-95`}
                  >
                    <action.icon className={`w-5 h-5 ${action.color}`} />
                  </motion.div>
                  <span className="text-[10px] font-semibold text-gray-600 dark:text-gray-400">
                    {action.label}
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default MobileQuickActions
