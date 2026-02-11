'use client'

import { ReactNode, useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Logo } from '@/components/Logo'
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
  Wallet,
  Sparkles,
  TrendingUp,
  Bot,
  Eye
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import AdminNotificationBell from '@/components/AdminNotificationBell'
import RoleBadge from '@/components/RoleBadge'
import RoleSwitcher from '@/components/RoleSwitcher'
import { getDefaultPermissionsForRole } from '@/lib/permissions-config'
import { haptics } from '@/lib/haptics'
import { SilkGuardOverlay } from '@/components/admin/SilkGuardOverlay'

// Menu items - filtered by role and permissions
const getMenuItems = (role: string, permissions: string[] = []) => {
  const isSuperAdmin = role === 'superadmin'
  const isAdmin = role === 'admin'
  const isSeller = role === 'seller'
  const isAdminOrSuper = isSuperAdmin || isAdmin
  
  const hasPerm = (perm: string) => isSuperAdmin || permissions.includes(perm)
  
  // Check for seller-specific permissions
  const hasSellerProductPerms = hasPerm('seller_add_products') || hasPerm('seller_edit_products') || hasPerm('seller_delete_products')
  const hasSellerOrderPerms = hasPerm('seller_view_orders') || hasPerm('seller_update_orders')

  return [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
    
    // E-commerce Core - Admin permissions OR Seller product permissions
    ...((hasPerm('manage_products') || hasSellerProductPerms) ? [
      { icon: Package, label: 'Products', href: '/admin/products' },
    ] : []),
    
    ...(hasPerm('manage_products') ? [
      { icon: FolderTree, label: 'Categories', href: '/admin/categories' },
      { icon: Package, label: 'Inventory History', href: '/admin/inventory' },
      { icon: TrendingUp, label: 'Stock Forecast', href: '/admin/inventory/forecast' },
    ] : []),
    
    // Orders - Admin or Seller order permissions
    ...((hasPerm('manage_orders') || hasSellerOrderPerms) ? [
      { icon: ShoppingCart, label: 'Orders', href: '/admin/orders' }
    ] : []),
    
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
    
    // Marketing - Admin or seller coupons
    ...((hasPerm('manage_marketing') || hasPerm('seller_create_coupons')) ? [
      { icon: Tag, label: 'Coupons', href: '/admin/coupons' },
    ] : []),
    
    ...(hasPerm('manage_marketing') ? [
      { icon: Crown, label: 'Loyalty & Referrals', href: '/admin/loyalty' },
      { icon: Bot, label: 'AI Hub', href: '/admin/ai-tools' },
      { icon: Sparkles, label: 'Marketing AI', href: '/admin/marketing/ai' },
    ] : []),
    
    // Content
    ...(hasPerm('manage_content') ? [
      { icon: Megaphone, label: 'Announcements', href: '/admin/announcements' },
      { icon: Palette, label: 'Banners', href: '/admin/banners' },
    ] : []),
    
    // Comms - Admin or seller reply permissions
    ...((hasPerm('manage_communications') || hasPerm('seller_reply_reviews') || hasPerm('seller_answer_questions')) ? [
      { icon: MessageCircle, label: 'Live Chat', href: '/admin/chat' },
    ] : []),
    
    ...(hasPerm('manage_communications') ? [
      { icon: Mail, label: 'Messages', href: '/admin/messages' },
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
  const isRoleSwitched = user?.isRoleSwitched || false
  const originalRole = user?.originalRole || user?.role
  
  // When superadmin switches roles, determine effective permissions:
  // 1. If testPermissions are provided (from Super Console tester), use those
  // 2. Otherwise, use default permissions for that role
  let effectivePermissions = user?.permissions || []
  if (isRoleSwitched && originalRole === 'superadmin' && (user?.role === 'admin' || user?.role === 'seller')) {
    // Check for custom test permissions first
    if (user?.testPermissions && Array.isArray(user.testPermissions) && user.testPermissions.length > 0) {
      effectivePermissions = user.testPermissions
    } else {
      effectivePermissions = getDefaultPermissionsForRole(user.role as 'admin' | 'seller')
    }
  }
  
  const menuItems = getMenuItems(user?.role || 'admin', effectivePermissions)

  return (
    <div className="min-h-screen bg-gray-50/50">
      <SilkGuardOverlay user={user} />
      {/* Top Header - Ultra-Luxury Glassmorphism */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-white/20 dark:border-white/10 sticky top-0 z-40 shadow-sm">
        <div className="px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          {/* Left side - Menu toggle + Logo */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Mobile Menu Toggle */}
            <button
              onClick={() => {
                haptics.soft()
                setSidebarOpen(!sidebarOpen)
              }}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-200/50 transition active:scale-90"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            <div className="flex items-center justify-center">
              <Logo 
                width={40} 
                height={40}
                className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
                priority
              />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg sm:text-xl font-bold">Silk Mart</h1>
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
            <div className="hidden sm:flex items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href="/" target="_blank">
                  <Eye className="w-4 h-4 mr-2" />
                  View Store
                </Link>
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-red-600 hover:bg-red-50"
              onClick={() => {
                haptics.heavy()
                handleLogout()
              }}
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
          w-64 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-r border-white/20 dark:border-white/10 h-screen lg:h-[calc(100vh-65px)]
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          overflow-y-auto
        `}>
          {/* Mobile Header in Sidebar */}
          <div className="lg:hidden p-4 border-b border-white/20 flex items-center justify-between">
            <span className="font-bold">Menu</span>
            <button 
              onClick={() => {
                haptics.soft()
                setSidebarOpen(false)
              }} 
              className="p-1 hover:bg-gray-100 rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
 
          <nav className="p-3 sm:p-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon
              
              const isExactMatch = pathname === item.href
              const isPrefixMatch = item.href !== '/admin' && pathname?.startsWith(item.href)
              const isBestMatch = isExactMatch || (isPrefixMatch && !menuItems.some(other => 
                other !== item && 
                other.href.length > item.href.length && 
                pathname?.startsWith(other.href)
              ))
 
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => haptics.rigid()}
                  className={`flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl transition-all duration-300 active:scale-95 group text-sm sm:text-base ${
                    isBestMatch
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                      : 'hover:bg-blue-50/50 dark:hover:bg-blue-900/20 text-gray-600 dark:text-gray-400 hover:text-blue-600'
                  }`}
                >
                  <Icon className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 transition-transform duration-300 ${isBestMatch ? 'scale-110' : 'group-hover:scale-110'}`} />
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
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 min-h-screen bg-transparent pb-32 lg:pb-8">
          {children}
        </main>
      </div>
    </div>
  )
}
