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
  Search
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import AdminNotificationBell from '@/components/AdminNotificationBell'
import RoleBadge from '@/components/RoleBadge'
import RoleSwitcher from '@/components/RoleSwitcher'

// Menu items - filtered by role
const getMenuItems = (role: string) => {
  const isSuperAdmin = role === 'superadmin'
  const isAdmin = role === 'admin'
  const isSeller = role === 'seller'
  const isAdminOrSuper = isSuperAdmin || isAdmin  // Admin + SuperAdmin
  
  return [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
    { icon: Package, label: 'Products', href: '/admin/products' },
    { icon: FolderTree, label: 'Categories', href: '/admin/categories' },
    { icon: ShoppingCart, label: 'Orders', href: '/admin/orders' },
    { icon: Users, label: 'Customers', href: '/admin/customers' },
    { icon: Star, label: 'Reviews', href: '/admin/reviews' },
    // Superadmin only
    ...(isSuperAdmin ? [{ icon: UserCog, label: 'User Management', href: '/admin/users' }] : []),
    // Coupons - Admin + SuperAdmin (NOT sellers)
    ...(isAdminOrSuper ? [{ icon: Tag, label: 'Coupons', href: '/admin/coupons' }] : []),
    // Loyalty - Admin + SuperAdmin (NOT sellers)
    ...(isAdminOrSuper ? [{ icon: Crown, label: 'Loyalty & Referrals', href: '/admin/loyalty' }] : []),
    { icon: Megaphone, label: 'Announcements', href: '/admin/announcements' },
    { icon: Package, label: 'Inventory History', href: '/admin/inventory' },
    // Banners - Admin + SuperAdmin (NOT sellers)
    ...(isAdminOrSuper ? [{ icon: Palette, label: 'Banners', href: '/admin/banners' }] : []),
    { icon: Mail, label: 'Messages', href: '/admin/messages' },
    { icon: MessageCircle, label: 'Live Chat', href: '/admin/chat' },
    // Settings - superadmin only for security
    ...(isSuperAdmin ? [
      { icon: Settings, label: 'Site Settings', href: '/admin/site-settings' },
      { icon: Settings, label: 'App Settings', href: '/admin/settings' },
    ] : []),
    // Receipt Lookup - all roles can access
    { icon: Search, label: 'Receipt Lookup', href: '/admin/receipt-lookup' },
    // Receipt Templates - superadmin only
    ...(isSuperAdmin ? [{ icon: Settings, label: 'Receipt Templates', href: '/admin/receipt-templates' }] : []),
  ]
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  // Don't show layout on login and setup pages
  const isPublicPage = pathname === '/admin/login' || pathname === '/admin/setup'

  useEffect(() => {
    if (!isPublicPage) {
      checkAuth()
    } else {
      setLoading(false)
    }
  }, [pathname])

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        if (data.authenticated && data.user) {
          // Check if user has admin, superadmin, or seller role
          if (data.user.role !== 'admin' && data.user.role !== 'superadmin' && data.user.role !== 'seller') {
            // Not authorized, redirect to home
            router.push('/')
            return
          }
          setUser(data.user)
        } else {
          // Not authenticated, redirect to admin login
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

  // No layout on public pages
  if (isPublicPage) {
    return <>{children}</>
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  // Not authenticated
  if (!user) {
    return null
  }

  const isSuperAdmin = user?.role === 'superadmin'
  const menuItems = getMenuItems(user?.role || 'admin')

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Header */}
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-xl font-bold text-white">C</span>
            </div>
            <div>
              <h1 className="text-xl font-bold">CTG Collection</h1>
              <div className="mt-1">
                <RoleBadge role={isSuperAdmin ? 'superadmin' : user?.role || 'admin'} size="sm" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:block">
              Welcome, <span className="font-semibold">{user?.name}</span>
            </span>
            {/* Role Switcher - Only for SuperAdmin */}
            {(user?.role === 'superadmin' || user?.originalRole === 'superadmin') && (
              <RoleSwitcher currentRole={user?.role || 'superadmin'} />
            )}
            <AdminNotificationBell />
            <Button variant="outline" asChild>
              <Link href="/" target="_blank">View Store</Link>
            </Button>
            <Button
              variant="ghost"
              className="text-red-600"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r min-h-[calc(100vh-73px)] sticky top-[73px]">
          <nav className="p-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || (item.href !== '/admin' && pathname?.startsWith(item.href))
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              )
            })}
          </nav>
          
            {/* Role Badge */}
            <div className="p-4 border-t mt-4">
              <div className="flex items-center gap-3 p-2 rounded-lg bg-gray-50/50">
                <div className="flex-1 min-w-0">
                  <RoleBadge role={user?.role} size="sm" className="mb-1" />
                  <p className="text-xs text-muted-foreground truncate font-medium">{user?.email}</p>
                </div>
              </div>
            </div>

        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
