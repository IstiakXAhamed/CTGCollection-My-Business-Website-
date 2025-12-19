'use client'

import { ReactNode, useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingCart,
  Users,
  Tag,
  Settings,
  LogOut,
  Loader2,
  UserCog,
  ShieldCheck,
  MessageCircle,
  Mail,
  Palette,
  Crown,
  Gift,
  Megaphone,
  BadgeCheck,
  Shield,
  Star,
  Search,
  Store,
  Menu,
  X,
  ShieldAlert,
  Wallet
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import AdminNotificationBell from '@/components/AdminNotificationBell'
import RoleBadge from '@/components/RoleBadge'
import RoleSwitcher from '@/components/RoleSwitcher'

// Menu items - filtered by role and permissions
const getMenuItems = (role: string, permissions: string[] = []) => {
  const isSuperAdmin = role === 'superadmin'
  const isAdmin = role === 'admin'
  const isSeller = role === 'seller'
  const isAdminOrSuper = isSuperAdmin || isAdmin
  
  const hasPerm = (perm: string) => isSuperAdmin || permissions.includes(perm)

  return [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
    // E-commerce Core
    ...(hasPerm('manage_products') ? [
      { icon: Package, label: 'Products', href: '/admin/products' },
      { icon: FolderTree, label: 'Categories', href: '/admin/categories' },
      { icon: Package, label: 'Inventory History', href: '/admin/inventory' },
    ] : []),
    
    ...(hasPerm('manage_orders') ? [{ icon: ShoppingCart, label: 'Orders', href: '/admin/orders' }] : []),
    
    ...(hasPerm('manage_users') ? [
      { icon: Users, label: 'Customers', href: '/admin/customers' },
      { icon: Star, label: 'Reviews', href: '/admin/reviews' },
      { icon: Wallet, label: 'Payouts', href: '/admin/payouts' },
    ] : []),

    // Super Admin & Permitted features
    ...(isSuperAdmin ? [{ icon: ShieldAlert, label: 'Super Console', href: '/admin/super-admin' }] : []),
    
    ...(isSuperAdmin ? [{ icon: UserCog, label: 'User Management', href: '/admin/users' }] : []),
    
    // Shops: Super Admin OR 'manage_shops' permission
    ...(hasPerm('manage_shops') ? [{ icon: Store, label: 'Shops', href: '/admin/shops' }] : []),
    
    // Marketing
    ...(hasPerm('manage_marketing') ? [
      { icon: Tag, label: 'Coupons', href: '/admin/coupons' },
      { icon: Crown, label: 'Loyalty & Referrals', href: '/admin/loyalty' },
    ] : []),
    
    // Content
    ...(hasPerm('manage_content') ? [
      { icon: Megaphone, label: 'Announcements', href: '/admin/announcements' },
      { icon: Palette, label: 'Banners', href: '/admin/banners' },
    ] : []),
    
    // Comms
    ...(hasPerm('manage_communications') ? [
      { icon: Mail, label: 'Messages', href: '/admin/messages' },
      { icon: MessageCircle, label: 'Live Chat', href: '/admin/chat' },
    ] : []),
    
    // Site Settings: Super Admin OR 'manage_settings'
    ...(hasPerm('manage_settings') ? [
      { icon: Settings, label: 'Site Settings', href: '/admin/site-settings' },
      { icon: Settings, label: 'App Settings', href: '/admin/settings' },
    ] : []),
    
    { icon: Search, label: 'Receipt Lookup', href: '/admin/receipt-lookup' },
    ...(isSuperAdmin ? [{ icon: Settings, label: 'Receipt Templates', href: '/admin/receipt-templates' }] : []),
    
    // Seller Applications: Super Admin OR 'approve_sellers'
    ...(hasPerm('approve_sellers') ? [{ icon: UserCog, label: 'Seller Apps', href: '/admin/seller-applications' }] : []),
  ]
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const isPublicPage = pathname === '/admin/login' || pathname === '/admin/setup'

  useEffect(() => {
    if (!isPublicPage) {
      checkAuth()
    } else {
      setLoading(false)
    }
  }, [pathname])

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        if (data.authenticated && data.user) {
          if (data.user.role !== 'admin' && data.user.role !== 'superadmin' && data.user.role !== 'seller') {
            router.push('/')
            return
          }
          setUser(data.user)
        } else {
          router.push('/admin/login')
          return
        }
      } else {
        router.push('/admin/login')
        return
      }
    } catch (error) {
      router.push('/admin/login')
      return
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/me', { method: 'POST', credentials: 'include' })
      localStorage.removeItem('auth-storage')
      router.push('/admin/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  if (isPublicPage) {
    return <>{children}</>
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  const isSuperAdmin = user?.role === 'superadmin'
  const menuItems = getMenuItems(user?.role || 'admin')

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Header */}
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          {/* Left side - Menu toggle + Logo */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-lg sm:text-xl font-bold text-white">C</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg sm:text-xl font-bold">CTG Collection</h1>
              <div className="mt-0.5">
                <RoleBadge role={isSuperAdmin ? 'superadmin' : user?.role || 'admin'} size="sm" />
              </div>
            </div>
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            <span className="text-sm text-muted-foreground hidden md:block">
              Welcome, <span className="font-semibold">{user?.name}</span>
            </span>
            {(user?.role === 'superadmin' || user?.originalRole === 'superadmin') && (
              <div className="hidden sm:block">
                <RoleSwitcher currentRole={user?.role || 'superadmin'} />
              </div>
            )}
            <AdminNotificationBell />
            <Button variant="outline" size="sm" asChild className="hidden sm:flex">
              <Link href="/" target="_blank">View Store</Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-red-600"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline ml-2">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex relative">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar - Hidden on mobile, toggle with overlay */}
        <aside className={`
          fixed lg:sticky top-0 lg:top-[65px] left-0 z-40 lg:z-0
          w-64 bg-white border-r h-screen lg:h-[calc(100vh-65px)]
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          overflow-y-auto
        `}>
          {/* Mobile Header in Sidebar */}
          <div className="lg:hidden p-4 border-b flex items-center justify-between">
            <span className="font-bold">Menu</span>
            <button onClick={() => setSidebarOpen(false)} className="p-1 hover:bg-gray-100 rounded">
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="p-3 sm:p-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || (item.href !== '/admin' && pathname?.startsWith(item.href))
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg transition text-sm sm:text-base ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  <span className="font-medium truncate">{item.label}</span>
                </Link>
              )
            })}
          </nav>
          
          {/* Role Badge at bottom */}
          <div className="p-3 sm:p-4 border-t mt-auto">
            <div className="flex items-center gap-3 p-2 rounded-lg bg-gray-50/50">
              <div className="flex-1 min-w-0">
                <RoleBadge role={user?.role} size="sm" className="mb-1" />
                <p className="text-xs text-muted-foreground truncate font-medium">{user?.email}</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content - Full width on mobile */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          {children}
        </main>
      </div>
    </div>
  )
}
