'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, ShoppingBag, Search, ShoppingCart, User, Heart, Sparkles, Bell, Compass } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStandalone } from '@/hooks/useAppStandalone'
import { useCartStore } from '@/store/cart'
import { useWishlistStore } from '@/store/wishlist'
import { haptics } from '@/lib/haptics'
import { useState, useEffect } from 'react'

export default function BottomNav() {
  const pathname = usePathname()
  const isStandalone = useAppStandalone()
  const cartItems = useCartStore((state) => state.items)
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0)
  const wishlistCount = useWishlistStore((state) => state.getItemCount())
  const [lastTap, setLastTap] = useState<string | null>(null)
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  // Hide bottom nav when scrolling down, show when scrolling up
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false)
      } else {
        setIsVisible(true)
      }
      
      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

  // Only render in Standalone (Installed App) mode
  if (!isStandalone) return null

  // Hide on admin pages
  if (pathname?.startsWith('/admin')) return null

  const navItems = [
    { 
      name: 'Home', 
      href: '/', 
      icon: Home,
      activeColor: 'from-blue-500 to-blue-600'
    },
    { 
      name: 'Explore', 
      href: '/shop', 
      icon: Compass,
      activeColor: 'from-purple-500 to-purple-600'
    },
    { 
      name: 'Cart', 
      href: '/cart', 
      icon: ShoppingCart, 
      count: cartCount,
      activeColor: 'from-orange-500 to-red-500',
      isCenter: true
    },
    {
      name: 'Wishlist',
      href: '/wishlist',
      icon: Heart,
      count: wishlistCount,
      activeColor: 'from-pink-500 to-rose-500'
    },
    { 
      name: 'Profile', 
      href: '/dashboard', 
      icon: User,
      activeColor: 'from-emerald-500 to-teal-500'
    },
  ]

  const handleTap = (name: string, href: string) => {
    haptics.rigid()
    
    // Double tap to scroll to top
    if (lastTap === name && pathname === href) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      haptics.success()
    }
    
    setLastTap(name)
    setTimeout(() => setLastTap(null), 300)
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 z-[100]"
        >
          {/* Gradient fade overlay */}
          <div className="absolute bottom-full left-0 right-0 h-8 bg-gradient-to-t from-white/80 dark:from-black/80 to-transparent pointer-events-none" />
          
          {/* Main Navigation Bar */}
          <nav className="relative mx-auto bg-white/80 dark:bg-gray-950/80 backdrop-blur-2xl border-t border-gray-200/50 dark:border-gray-800/50">
            {/* Subtle top glow */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
            
            <div className="flex items-end justify-around px-2 pt-2 pb-safe">
              {navItems.map((item) => {
                const isActive = item.href === '/' 
                  ? pathname === '/'
                  : pathname?.startsWith(item.href)
                const Icon = item.icon
                
                // Center item (Cart) gets special treatment
                if (item.isCenter) {
                  return (
                    <Link 
                      key={item.href} 
                      href={item.href}
                      onClick={() => handleTap(item.name, item.href)}
                      className="relative -mt-6 group"
                    >
                      <motion.div
                        whileTap={{ scale: 0.9 }}
                        className={`relative w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg ${
                          isActive 
                            ? `bg-gradient-to-br ${item.activeColor} shadow-orange-500/30`
                            : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700'
                        }`}
                      >
                        <Icon className={`w-7 h-7 ${isActive ? 'text-white' : 'text-gray-600 dark:text-gray-400'}`} />
                        
                        {/* Cart Badge */}
                        {item.count !== undefined && item.count > 0 && (
                          <motion.div 
                            key={item.count}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute -top-1 -right-1 min-w-[22px] h-[22px] bg-red-500 text-white text-[11px] font-bold flex items-center justify-center rounded-full px-1.5 shadow-lg border-2 border-white dark:border-gray-900"
                          >
                            {item.count > 99 ? '99+' : item.count}
                          </motion.div>
                        )}
                        
                        {/* Pulse animation for cart */}
                        {item.count !== undefined && item.count > 0 && (
                          <motion.div 
                            className="absolute inset-0 rounded-2xl bg-orange-500"
                            initial={{ opacity: 0.3, scale: 1 }}
                            animate={{ opacity: 0, scale: 1.2 }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          />
                        )}
                      </motion.div>
                    </Link>
                  )
                }
                
                return (
                  <Link 
                    key={item.href} 
                    href={item.href}
                    onClick={() => handleTap(item.name, item.href)}
                    className="relative flex flex-col items-center justify-center py-2 px-4 group min-w-[64px]"
                  >
                    {/* Active Background Pill */}
                    <AnimatePresence>
                      {isActive && (
                        <motion.div
                          layoutId="nav-active-bg"
                          className={`absolute top-1 inset-x-2 h-12 rounded-2xl bg-gradient-to-br ${item.activeColor} opacity-10`}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 0.15, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ type: 'spring', damping: 20 }}
                        />
                      )}
                    </AnimatePresence>

                    {/* Icon Container */}
                    <motion.div
                      className="relative"
                      whileTap={{ scale: 0.85 }}
                    >
                      <Icon
                        className={`w-6 h-6 transition-all duration-300 ${
                          isActive
                            ? `text-transparent bg-gradient-to-br ${item.activeColor} bg-clip-text`
                            : 'text-gray-400 dark:text-gray-500'
                        }`}
                        style={isActive ? {
                          stroke: 'url(#gradient-' + item.name + ')',
                          fill: 'none'
                        } : undefined}
                      />

                      {/* Count Badge */}
                      {item.count !== undefined && item.count > 0 && (
                        <motion.div
                          key={item.count}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-1 -right-2 min-w-[18px] h-[18px] bg-gradient-to-r from-pink-500 to-rose-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full px-1 shadow-lg"
                        >
                          {item.count > 99 ? '99+' : item.count}
                        </motion.div>
                      )}

                      {/* Active Dot Indicator */}
                      <AnimatePresence>
                        {isActive && (
                          <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-gradient-to-r ${item.activeColor}`}
                          />
                        )}
                      </AnimatePresence>
                    </motion.div>

                    {/* Label */}
                    <motion.span 
                      className={`text-[10px] mt-1 font-semibold transition-all duration-300 ${
                        isActive 
                          ? 'text-gray-900 dark:text-white opacity-100' 
                          : 'text-gray-400 dark:text-gray-500 opacity-70'
                      }`}
                    >
                      {item.name}
                    </motion.span>
                  </Link>
                )
              })}
            </div>
            
            {/* Home Indicator Line (iOS style) */}
            <div className="flex justify-center pb-1">
              <div className="w-32 h-1 bg-gray-300 dark:bg-gray-700 rounded-full" />
            </div>
          </nav>

          {/* SVG Gradients for Icons */}
          <svg className="absolute w-0 h-0">
            <defs>
              <linearGradient id="gradient-Home" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="100%" stopColor="#2563EB" />
              </linearGradient>
              <linearGradient id="gradient-Explore" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8B5CF6" />
                <stop offset="100%" stopColor="#7C3AED" />
              </linearGradient>
              <linearGradient id="gradient-Wishlist" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#EC4899" />
                <stop offset="100%" stopColor="#F43F5E" />
              </linearGradient>
              <linearGradient id="gradient-Profile" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10B981" />
                <stop offset="100%" stopColor="#14B8A6" />
              </linearGradient>
            </defs>
          </svg>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
