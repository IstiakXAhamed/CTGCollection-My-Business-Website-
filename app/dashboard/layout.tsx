'use client'

import { ReactNode, useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { User, Package, MapPin, Heart, Settings, LogOut, Loader2, Shield, ArrowLeft, Crown } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import RoleBadge from '@/components/RoleBadge'
import RoleSwitcher from '@/components/RoleSwitcher'

const menuItems = [
  { icon: User, label: 'Profile', href: '/dashboard/profile' },
  { icon: Package, label: 'Orders', href: '/dashboard/orders' },
  { icon: MapPin, label: 'Addresses', href: '/dashboard/addresses' },
  { icon: Heart, label: 'Wishlist', href: '/dashboard/wishlist' },
  { icon: Crown, label: 'Loyalty & Referrals', href: '/dashboard/loyalty' },
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
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
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
                
                {/* Role Switcher for role-switched SuperAdmins */}
                {(user.originalRole === 'superadmin' || user.isRoleSwitched) && (
                  <div className="mt-3">
                    <RoleSwitcher currentRole={user.role} />
                  </div>
                )}
                
                {/* Admin/Seller Link to Panel - also show for role-switched users */}
                {(user.role === 'admin' || user.role === 'superadmin' || user.role === 'seller' || user.originalRole === 'superadmin') && (
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
