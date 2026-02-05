'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ShoppingCart, User, Search, Menu, Heart, LogOut, Settings, Package, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import NotificationBell from '@/components/NotificationBell'
import { useCartStore } from '@/store/cart'

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

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Fixed width container - same on all pages */}
      <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo - Fixed width */}
          <Link href="/" className="flex items-center space-x-2 flex-shrink-0">
            <Image 
              src="/logo.png" 
              alt="Silk Mart" 
              width={48} 
              height={48}
              className="object-contain"
            />
            <span className="text-lg font-bold hidden sm:block">Silk Mart</span>
          </Link>

          {/* Desktop Navigation - Fixed width */}
          <div className="hidden md:flex items-center space-x-6 flex-shrink-0">
            <Link 
              href="/shop" 
              className={`text-sm font-medium transition-colors whitespace-nowrap ${
                pathname === '/shop' && !pathname.includes('?') 
                  ? 'text-blue-600 font-semibold' 
                  : 'hover:text-blue-600'
              }`}
            >
              Shop
            </Link>
            <Link 
              href="/shop?featured=true" 
              className={`text-sm font-medium transition-colors whitespace-nowrap ${
                pathname.includes('featured=true') 
                  ? 'text-blue-600 font-semibold' 
                  : 'hover:text-blue-600'
              }`}
            >
              Featured
            </Link>
            <Link 
              href="/shop?sale=true" 
              className={`text-sm font-medium transition-colors whitespace-nowrap ${
                pathname.includes('sale=true') 
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
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        {(user.role === 'admin' || user.role === 'superadmin') && (
                          <span className={`inline-block mt-1 px-2 py-0.5 text-xs rounded-full ${user.role === 'superadmin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                            {user.role === 'superadmin' ? 'Super Admin' : 'Admin'}
                          </span>
                        )}
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
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
