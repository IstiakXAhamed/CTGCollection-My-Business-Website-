'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import { usePathname, useRouter } from 'next/navigation'
import { 
  Search, Bell, ShoppingCart, ArrowLeft, Menu, X, 
  Wifi, WifiOff, Battery, Signal, Sparkles, Settings,
  User, Heart, Package, LogOut, ChevronRight
} from 'lucide-react'
import { useAppStandalone } from '@/hooks/useAppStandalone'
import { useCartStore } from '@/store/cart'
import { haptics } from '@/lib/haptics'
import { GestureNavigator } from '@/components/mobile'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface MobileAppShellProps {
  children: React.ReactNode
}

// Page title mapping
const getPageTitle = (pathname: string): string => {
  const routes: Record<string, string> = {
    '/': 'Silk Mart',
    '/shop': 'Explore',
    '/cart': 'My Cart',
    '/dashboard': 'Profile',
    '/dashboard/orders': 'My Orders',
    '/dashboard/wishlist': 'Wishlist',
    '/dashboard/profile': 'Edit Profile',
    '/checkout': 'Checkout',
    '/login': 'Welcome Back',
    '/register': 'Join Us',
    '/contact': 'Contact Us',
    '/about': 'About Us',
  }
  
  // Check for dynamic routes
  if (pathname.startsWith('/product/')) return 'Product Details'
  if (pathname.startsWith('/order/')) return 'Order Details'
  if (pathname.startsWith('/shop/')) return 'Shop'
  
  return routes[pathname] || 'Silk Mart'
}

// Check if page should show back button
const shouldShowBack = (pathname: string): boolean => {
  const rootPages = ['/', '/shop', '/cart', '/dashboard', '/dashboard/wishlist']
  return !rootPages.includes(pathname)
}

export function MobileAppShell({ children }: MobileAppShellProps) {
  const isStandalone = useAppStandalone()
  const pathname = usePathname()
  const router = useRouter()
  const [isOnline, setIsOnline] = useState(true)
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [user, setUser] = useState<any>(null)
  const [showQuickMenu, setShowQuickMenu] = useState(false)
  const cartCount = useCartStore((state) => state.getTotalItems())
  
  const { scrollY } = useScroll()
  const headerOpacity = useTransform(scrollY, [0, 50], [1, 0.95])
  const headerBlur = useTransform(scrollY, [0, 50], [12, 20])
  
  // Check online status
  useEffect(() => {
    setIsOnline(navigator.onLine)
    
    const handleOnline = () => {
      setIsOnline(true)
      haptics.success()
    }
    const handleOffline = () => {
      setIsOnline(false)
      haptics.error()
    }
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Fetch user
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' })
        if (res.ok) {
          const data = await res.json()
          if (data.authenticated) setUser(data.user)
        }
      } catch (e) {}
    }
    checkAuth()
  }, [])

  // Don't render shell for non-standalone mode or admin pages
  if (!isStandalone || pathname?.startsWith('/admin')) {
    return <>{children}</>
  }

  const pageTitle = getPageTitle(pathname || '/')
  const showBack = shouldShowBack(pathname || '/')
  
  const handleBack = () => {
    haptics.light()
    router.back()
  }
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery)}`)
      setSearchQuery('')
      setShowSearch(false)
      haptics.soft()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Offline Indicator */}
      <AnimatePresence>
        {!isOnline && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="fixed top-0 left-0 right-0 z-[200] bg-amber-500 text-amber-950 overflow-hidden"
          >
            <div className="flex items-center justify-center gap-2 py-2 px-4 text-sm font-medium">
              <WifiOff className="w-4 h-4" />
              <span>You&apos;re offline. Some features may be limited.</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* App Header */}
      <motion.header
        style={{ 
          opacity: headerOpacity,
        }}
        className={cn(
          "fixed top-0 left-0 right-0 z-[90] bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50",
          !isOnline && "top-8"
        )}
      >
        {/* Status Bar Spacer for iOS */}
        <div className="h-safe pt-safe" />
        
        <div className="flex items-center justify-between h-14 px-4">
          {/* Left Section */}
          <div className="flex items-center gap-3 min-w-[80px]">
            {showBack ? (
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleBack}
                className="w-11 h-11 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 active:bg-gray-200 dark:active:bg-gray-700 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </motion.button>
            ) : (
              <Link href="/" className="flex items-center gap-2">
                <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
              </Link>
            )}
          </div>

          {/* Center - Title */}
          <motion.h1
            key={pageTitle}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-lg font-bold text-gray-900 dark:text-white absolute left-1/2 -translate-x-1/2"
          >
            {pageTitle}
          </motion.h1>

          {/* Right Section */}
          <div className="flex items-center gap-1 min-w-[80px] justify-end">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => { setShowSearch(true); haptics.light() }}
              className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <Search className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </motion.button>
            
            <Link href="/cart">
              <motion.div
                whileTap={{ scale: 0.9 }}
                className="relative w-11 h-11 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <ShoppingCart className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                {cartCount > 0 && (
                  <motion.span
                    key={cartCount}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full px-1"
                  >
                    {cartCount > 99 ? '99+' : cartCount}
                  </motion.span>
                )}
              </motion.div>
            </Link>
          </div>
        </div>
      </motion.header>

      {/* Search Overlay */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-white dark:bg-gray-950"
          >
            <div className="pt-safe" />
            <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-800">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => { setShowSearch(false); haptics.light() }}
                className="w-11 h-11 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800"
              >
                <ArrowLeft className="w-5 h-5" />
              </motion.button>
              
              <form onSubmit={handleSearch} className="flex-1">
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products, categories..."
                  autoFocus
                  className="w-full h-12 px-4 bg-gray-100 dark:bg-gray-800 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </form>
            </div>
            
            {/* Quick Search Suggestions */}
            <div className="p-4">
              <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">Popular Searches</p>
              <div className="flex flex-wrap gap-2">
                {['Sarees', 'Three Piece', 'Fragrance', 'New Arrivals', 'Sale'].map((term) => (
                  <button
                    key={term}
                    onClick={() => {
                      setSearchQuery(term)
                      router.push(`/shop?search=${term}`)
                      setShowSearch(false)
                      haptics.soft()
                    }}
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Menu Overlay */}
      <AnimatePresence>
        {showQuickMenu && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowQuickMenu(false)}
              className="fixed inset-0 z-[150] bg-black/50"
            />
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="fixed bottom-0 left-0 right-0 z-[160] bg-white dark:bg-gray-900 rounded-t-3xl overflow-hidden"
            >
              <div className="gesture-bar" />
              
              <div className="p-6 pb-safe">
                {user && (
                  <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200 dark:border-gray-800">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                      {user.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{user.name}</h3>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>
                )}
                
                <div className="space-y-2">
                  {[
                    { icon: User, label: 'My Profile', href: '/dashboard/profile' },
                    { icon: Package, label: 'My Orders', href: '/dashboard/orders' },
                    { icon: Heart, label: 'Wishlist', href: '/dashboard/wishlist' },
                    { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
                  ].map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => { setShowQuickMenu(false); haptics.soft() }}
                      className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <item.icon className="w-5 h-5 text-gray-500" />
                      <span className="flex-1 font-medium">{item.label}</span>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </Link>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content with Gesture Navigation */}
      <main className="pt-[calc(56px+env(safe-area-inset-top,0px))] pb-bottom-nav min-h-screen">
        <GestureNavigator 
          enabled={showBack}
          disabledPaths={['/', '/shop', '/cart', '/dashboard', '/dashboard/wishlist', '/checkout']}
        >
          {children}
        </GestureNavigator>
      </main>
    </div>
  )
}

export default MobileAppShell
