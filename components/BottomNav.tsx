'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, ShoppingBag, ShoppingCart, User, MessageSquareText } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStandalone } from '@/hooks/useAppStandalone'
import { useCartStore } from '@/store/cart'
import { haptics } from '@/lib/haptics'

export default function BottomNav() {
  const pathname = usePathname()
  const isStandalone = useAppStandalone()
  const cartItems = useCartStore((state) => state.items)
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0)

  // Only render in Standalone (Installed App) mode
  if (!isStandalone) return null

  const navItems = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Shop', href: '/products', icon: ShoppingBag },
    { name: 'AI Chat', href: '#', icon: MessageSquareText, isAI: true },
    { name: 'Cart', href: '/cart', icon: ShoppingCart, count: cartCount },
    { name: 'Profile', href: '/dashboard', icon: User },
  ]

  const handleAIClick = (e: React.MouseEvent) => {
    e.preventDefault()
    // Trigger existing AI Chat Assistant
    window.dispatchEvent(new CustomEvent('open-ai-chat'))
  }

  return (
    <motion.div 
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ damping: 20, stiffness: 100 }}
      className="fixed bottom-0 left-0 right-0 z-[100] px-4 pb-6 pt-2"
    >
      <nav className="mx-auto max-w-lg bg-white/70 dark:bg-black/70 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-2xl rounded-full px-2 py-2 flex items-center justify-around overflow-hidden">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          
          return (
            <Link 
              key={item.href} 
              href={item.href}
              onClick={(e) => {
                haptics.rigid();
                if (item.isAI) {
                  handleAIClick(e);
                }
              }}
              className="relative flex flex-col items-center justify-center p-2 group"
            >
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    layoutId="active-pill"
                    className="absolute inset-0 bg-blue-600/10 dark:bg-blue-400/10 rounded-full"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                  />
                )}
              </AnimatePresence>

              <div className="relative">
                <Icon 
                  className={`w-6 h-6 transition-all duration-300 ${
                    isActive 
                      ? 'text-blue-600 dark:text-blue-400 scale-110' 
                      : 'text-gray-500 dark:text-gray-400'
                  }`} 
                />
                
                {item.count !== undefined && item.count > 0 && (
                  <motion.span 
                    key={item.count}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute top-1 right-2 bg-red-500 text-white text-[10px] font-bold min-w-[16px] h-4 flex items-center justify-center rounded-full px-1 shadow-sm border border-white dark:border-gray-900"
                  >
                    {item.count}
                  </motion.span>
                )}
              </div>

              <span className={`text-[10px] mt-1 font-medium transition-all duration-300 ${
                isActive 
                  ? 'text-blue-600 dark:text-blue-400 opacity-100' 
                  : 'text-gray-500 dark:text-gray-400 opacity-0 h-0 hidden'
              }`}>
                {item.name}
              </span>

              {item.isAI && (
                <div className="absolute -top-1 -right-1">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                  </span>
                </div>
              )}
            </Link>
          )
        })}
      </nav>
      
      {/* Safe Area Padding for mobile browsers/homescreen */}
      <div className="h-safe" />
    </motion.div>
  )
}
