'use client'

import { ReactNode, useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { User, Package, MapPin, Heart, Settings, LogOut, Loader2, Shield, ArrowLeft, Crown, MessageSquare, Wallet } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import RoleBadge from '@/components/RoleBadge'
import RoleSwitcher from '@/components/RoleSwitcher'

const menuItems = [
  { icon: User, label: 'Profile', href: '/dashboard/profile' },
  { icon: Package, label: 'Orders', href: '/dashboard/orders' },
  { icon: MapPin, label: 'Addresses', href: '/dashboard/addresses' },
  { icon: Heart, label: 'Wishlist', href: '/dashboard/wishlist' },
  { icon: Crown, label: 'Loyalty', href: '/dashboard/loyalty' },
  { icon: Wallet, label: 'Wallet', href: '/dashboard/wallet' },
  { icon: MessageSquare, label: 'Messages', href: '/dashboard/chat' },
]

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        if (data.authenticated && data.user) {
          setUser(data.user)
        } else {
          router.push('/login?redirect=' + encodeURIComponent(pathname))
        }
      } else {
        router.push('/login?redirect=' + encodeURIComponent(pathname))
      }
    } catch (error) {
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/me', { method: 'POST', credentials: 'include' })
      localStorage.removeItem('auth-storage')
      router.push('/')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (!user) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Mobile: Horizontal scrollable nav */}
        <div className="lg:hidden mb-4">
          {/* User info card - compact for mobile */}
          <Card className="p-3 sm:p-4 mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                {user.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-bold text-sm truncate">{user.name}</h2>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
              <RoleBadge role={user.role} tier={user.tier} size="sm" />
            </div>
          </Card>
          
          {/* Scrollable nav */}
          <div className="overflow-x-auto -mx-3 px-3">
            <div className="flex gap-2 pb-2 min-w-max">
              {menuItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link key={item.href} href={item.href}>
                    <div className={`flex items-center gap-2 px-4 py-2.5 rounded-full whitespace-nowrap text-sm font-medium transition ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border hover:bg-gray-50'
                    }`}>
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </div>
                  </Link>
                )
              })}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full whitespace-nowrap text-sm font-medium bg-white border text-red-600 hover:bg-red-50 transition"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-8">
          {/* Desktop Sidebar - hidden on mobile */}
          <aside className="hidden lg:block lg:col-span-1">
            <Card className="p-6 sticky top-20">
              {/* User Info */}
              <div className="mb-6 pb-4 border-b">
                  <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg">
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div>
                    <h2 className="font-bold">{user.name}</h2>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                
                {/* Role/Tier Badge for ALL users */}
                <div className="mt-3">
                  <RoleBadge role={user.role} tier={user.tier} size="sm" />
                </div>
                
                {/* Role Switcher */}
                <RoleSwitcher currentRole={user.role} />
                
                {/* Admin/Seller Link */}
                {(user.role === 'admin' || user.role === 'superadmin' || user.role === 'seller') && (
                  <div className="mt-3">
                    <Link href="/admin">
                      <Button variant="outline" size="sm" className="w-full gap-2 text-purple-600 border-purple-200 hover:bg-purple-50">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Admin Panel
                      </Button>
                    </Link>
                  </div>
                )}
              </div>

              <nav className="space-y-2">
                {menuItems.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  
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

                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 px-4 py-3 text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={handleLogout}
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Logout</span>
                </Button>
              </nav>
            </Card>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-3">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
