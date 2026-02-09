'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ShoppingCart, User, Search, Menu, Heart, LogOut, Settings, Package, ChevronDown, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/Logo'
import { useState, useEffect } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useSiteSettings } from '@/hooks/useSiteSettings'
import NotificationBell from '@/components/NotificationBell'
import { useCartStore } from '@/store/cart'
import RoleBadge from '@/components/RoleBadge'

interface UserData {
  id: string
  name: string
  email: string
  role: string
}

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [isHydrated, setIsHydrated] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { settings } = useSiteSettings()

  const handleManualInstall = () => {
    window.dispatchEvent(new CustomEvent('pwa-install-requested'))
    setIsMenuOpen(false)
  }
  
  // Use cart store for reactive cart count
  const storeCartCount = useCartStore((state) => state.getTotalItems())
  // Only show cart count after hydration to avoid SSR mismatch
  const cartCount = isHydrated ? storeCartCount : 0

  useEffect(() => {
    setIsHydrated(true) // Mark as hydrated after mount
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        if (data.authenticated && data.user) {
          setUser(data.user)
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/me', { 
        method: 'POST', 
        credentials: 'include' 
      })
      setUser(null)
      setIsUserMenuOpen(false)
      localStorage.removeItem('auth-storage')
      router.push('/')
      router.refresh()
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
    }
  }

  // Active state helpers
  const isShopActive = pathname === '/shop' && !searchParams.has('featured') && !searchParams.has('sale')
  const isFeaturedActive = pathname === '/shop' && searchParams.get('featured') === 'true'
  const isSaleActive = pathname === '/shop' && searchParams.get('sale') === 'true'

  return (
    <nav className="sticky top-0 z-50 w-full max-w-[100vw] border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Fixed width container - same on all pages */}
      <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo - Fixed width */}
          <Link href="/" className="flex items-center space-x-2 flex-shrink-0">
            <Logo 
              width={56} 
              height={56}
              className="w-10 h-10 sm:w-14 sm:h-14"
              priority
            />
            <span className="text-base sm:text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Silk Mart
            </span>
          </Link>

          {/* Desktop Navigation - Fixed width */}
          <div className="hidden md:flex items-center space-x-6 flex-shrink-0">
            <Link 
              href="/shop" 
              className={`text-sm font-medium transition-colors whitespace-nowrap ${
                isShopActive 
                  ? 'text-blue-600 font-semibold' 
                  : 'hover:text-blue-600'
              }`}
            >
              Shop
            </Link>
            <Link 
              href="/shop?featured=true" 
              className={`text-sm font-medium transition-colors whitespace-nowrap ${
                isFeaturedActive 
                  ? 'text-blue-600 font-semibold' 
                  : 'hover:text-blue-600'
              }`}
            >
              Featured
            </Link>
            <Link 
              href="/shop?sale=true" 
              className={`text-sm font-medium transition-colors whitespace-nowrap ${
                isSaleActive 
                  ? 'text-blue-600 font-semibold' 
                  : 'hover:text-blue-600'
              }`}
            >
              Sale
            </Link>
            <Link 
              href="/about" 
              className={`text-sm font-medium transition-colors whitespace-nowrap ${
                pathname === '/about' 
                  ? 'text-blue-600 font-semibold' 
                  : 'hover:text-blue-600'
              }`}
            >
              About
            </Link>
            <Link 
              href="/contact" 
              className={`text-sm font-medium transition-colors whitespace-nowrap ${
                pathname === '/contact' 
                  ? 'text-blue-600 font-semibold' 
                  : 'hover:text-blue-600'
              }`}
            >
              Contact
            </Link>
          </div>

          {/* Search Bar - Flexible width with working search */}
          <form onSubmit={handleSearch} className="hidden lg:flex flex-1 max-w-sm min-w-[200px] mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="h-10 w-full rounded-full border bg-muted/50 pl-10 pr-4 text-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>
          </form>

          {/* Actions - Fixed width */}
          <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
            {/* Notifications - Only show for customers (admin has own bell in admin layout) */}
            {user && user.role !== 'admin' && user.role !== 'superadmin' && user.role !== 'seller' && <NotificationBell />}
            
            <Button variant="ghost" size="icon" className="hidden sm:flex" asChild>
              <Link href="/dashboard/wishlist">
                <Heart className="h-5 w-5" />
              </Link>
            </Button>

            {/* Desktop PWA Install - Minimal & Sleek */}
            {settings?.pwaShowInstallLink && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="hidden lg:flex text-gray-500 hover:text-blue-600 hover:bg-blue-50/50" 
                onClick={handleManualInstall}
                title="Install App"
              >
                <Download className="h-4 w-4" />
              </Button>
            )}
            
            {/* Cart */}
            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
                  {cartCount}
                </span>
              </Button>
            </Link>

            {/* User Menu - Auth Aware */}
            {loading ? (
              <Button variant="ghost" size="icon" disabled>
                <User className="h-5 w-5 animate-pulse" />
              </Button>
            ) : user ? (
              <div className="relative">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex items-center gap-2"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                >
                  <User className="h-4 w-4" />
                  <span className="hidden sm:block max-w-[100px] truncate">{user.name}</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>

                {isUserMenuOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setIsUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 rounded-lg bg-white border shadow-lg z-50">
                      <div className="p-3 border-b">
                        <p className="font-semibold">{user.name}</p>
                        <p className="text-sm text-muted-foreground mb-2">{user.email}</p>
                        <RoleBadge role={user.role} size="sm" />
                      </div>
                      <div className="py-2">
                        <Link 
                          href="/dashboard/profile" 
                          className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <User className="h-4 w-4" />
                          My Profile
                        </Link>
                        <Link 
                          href="/dashboard/orders" 
                          className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <Package className="h-4 w-4" />
                          My Orders
                        </Link>
                        {(user.role === 'admin' || user.role === 'superadmin') && (
                          <Link 
                            href="/admin" 
                            className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 text-purple-600 font-semibold"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <Settings className="h-4 w-4" />
                            Admin Panel
                          </Link>
                        )}
                      </div>
                      <div className="border-t py-2">
                        <button 
                          onClick={handleLogout}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full"
                        >
                          <LogOut className="h-4 w-4" />
                          Logout
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link href="/login">
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:block">Login</span>
                </Button>
              </Link>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="border-t py-4 md:hidden">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="px-3 pb-4 border-b mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="h-12 w-full rounded-xl border bg-muted/50 pl-11 pr-4 text-base focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                />
              </div>
            </form>
            
            <div className="flex flex-col space-y-1 px-1">
              <Link
                href="/shop"
                className="rounded-xl px-4 py-3 text-base font-medium hover:bg-muted active:bg-muted/80 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Shop
              </Link>
              <Link
                href="/shop?featured=true"
                className="rounded-xl px-4 py-3 text-base font-medium hover:bg-muted active:bg-muted/80 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                ⭐ Featured
              </Link>
              <Link
                href="/shop?sale=true"
                className="rounded-xl px-4 py-3 text-base font-medium hover:bg-muted active:bg-muted/80 transition-colors text-red-600"
                onClick={() => setIsMenuOpen(false)}
              >
                🏷️ Sale
              </Link>
              <Link
                href="/dashboard/wishlist"
                className="rounded-xl px-4 py-3 text-base font-medium hover:bg-muted active:bg-muted/80 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                ❤️ Wishlist
              </Link>
              
              <div className="my-2 border-t" />
              
              {user ? (
                <>
                  <Link
                    href="/dashboard/profile"
                    className="rounded-xl px-4 py-3 text-base font-medium hover:bg-muted active:bg-muted/80 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    👤 My Profile
                  </Link>
                  <Link
                    href="/dashboard/orders"
                    className="rounded-xl px-4 py-3 text-base font-medium hover:bg-muted active:bg-muted/80 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    📦 My Orders
                  </Link>
                  {(user.role === 'admin' || user.role === 'superadmin') && (
                    <Link
                      href="/admin"
                      className="rounded-xl px-4 py-3 text-base font-medium text-purple-600 hover:bg-purple-50 active:bg-purple-100 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      ⚙️ Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="rounded-xl px-4 py-3 text-base font-medium text-red-600 hover:bg-red-50 active:bg-red-100 text-left transition-colors w-full"
                  >
                    🚪 Logout
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="rounded-xl px-4 py-3 text-base font-medium text-blue-600 hover:bg-blue-50 active:bg-blue-100 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  🔐 Login / Register
                </Link>
              )}

              {/* Repositioned PWA Install Trigger - Now at the Bottom */}
              {settings?.pwaShowInstallLink && (
                <div className="mt-4 pt-4 border-t px-2">
                  <button 
                    onClick={handleManualInstall}
                    className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-blue-600/10 to-purple-600/10 hover:from-blue-600/20 hover:to-purple-600/20 rounded-2xl border border-blue-100 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200 group-active:scale-95 transition-transform">
                        <Download className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-blue-900">Install Silk Mart App</p>
                        <p className="text-xs text-blue-700/70">Faster access & offline shopping</p>
                      </div>
                    </div>
                    <ChevronDown className="w-5 h-5 -rotate-90 text-blue-400 opacity-50" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
