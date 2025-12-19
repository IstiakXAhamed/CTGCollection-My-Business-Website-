'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  UserCog, Shield, ShieldCheck, Users, User, 
  ChevronDown, ArrowLeftRight, X, Loader2 
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface RoleSwitcherProps {
  currentRole: string
  onRoleChange?: (newRole: string, isSwitched: boolean) => void
}

const roleConfig = {
  superadmin: { 
    label: 'Super Admin', 
    icon: ShieldCheck, 
    color: 'bg-gradient-to-r from-red-500 to-orange-500',
    textColor: 'text-white'
  },
  admin: { 
    label: 'Admin', 
    icon: Shield, 
    color: 'bg-gradient-to-r from-yellow-500 to-amber-500',
    textColor: 'text-white'
  },
  seller: { 
    label: 'Seller', 
    icon: Users, 
    color: 'bg-gradient-to-r from-blue-500 to-cyan-500',
    textColor: 'text-white'
  },
  customer: { 
    label: 'Customer', 
    icon: User, 
    color: 'bg-gradient-to-r from-green-500 to-emerald-500',
    textColor: 'text-white'
  }
}

export default function RoleSwitcher({ currentRole, onRoleChange }: RoleSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [switching, setSwitching] = useState(false)
  const [activeRole, setActiveRole] = useState(currentRole)
  const [originalRole, setOriginalRole] = useState<string | null>(null)
  const [isSwitched, setIsSwitched] = useState(false)
  const [canSwitch, setCanSwitch] = useState(false)

  useEffect(() => {
    // Check initial role switch status
    fetchRoleStatus()
  }, [])

  const fetchRoleStatus = async () => {
    try {
      const res = await fetch('/api/auth/role-switch', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setActiveRole(data.currentRole)
        setOriginalRole(data.originalRole)
        setIsSwitched(data.isSwitched)
        setCanSwitch(data.canSwitch)
      }
    } catch (error) {
      console.error('Failed to fetch role status:', error)
    }
  }

  const switchRole = async (targetRole: string) => {
    setSwitching(true)
    try {
      const res = await fetch('/api/auth/role-switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ targetRole })
      })

      if (res.ok) {
        const data = await res.json()
        setActiveRole(data.currentRole)
        setIsSwitched(data.isSwitched)
        setIsOpen(false)
        
        // Notify parent and reload to apply changes
        onRoleChange?.(data.currentRole, data.isSwitched)
        
        // Reload page to apply role changes
        window.location.reload()
      }
    } catch (error) {
      console.error('Failed to switch role:', error)
    } finally {
      setSwitching(false)
    }
  }

  // Don't show if user can't switch roles
  if (!canSwitch && !isSwitched) return null

  const currentConfig = roleConfig[activeRole as keyof typeof roleConfig] || roleConfig.customer

  return (
    <div className="mt-3">
      {/* Switcher Button */}
      <div className="relative">
        <Button
          variant="ghost"
          onClick={() => setIsOpen(!isOpen)}
          className={`gap-2 ${currentConfig.color} ${currentConfig.textColor} hover:opacity-90`}
          disabled={switching}
        >
          {switching ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <currentConfig.icon className="w-4 h-4" />
          )}
          <span className="hidden sm:inline">{currentConfig.label}</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </Button>

        {/* Dropdown */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50"
            >
              <div className="p-3 border-b bg-gray-50">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <ArrowLeftRight className="w-4 h-4" />
                  <span>Switch Role (Testing)</span>
                </div>
                {isSwitched && (
                  <p className="text-xs text-orange-600 mt-1">
                    Currently viewing as {currentConfig.label}
                  </p>
                )}
              </div>

              <div className="p-2">
                {Object.entries(roleConfig).map(([role, config]) => {
                  const Icon = config.icon
                  const isActive = activeRole === role
                  
                  return (
                    <button
                      key={role}
                      onClick={() => switchRole(role)}
                      disabled={switching || isActive}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                        isActive 
                          ? 'bg-gray-100 cursor-default' 
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className={`p-1.5 rounded-lg ${config.color}`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <span className={`font-medium ${isActive ? 'text-gray-400' : 'text-gray-700'}`}>
                        {config.label}
                      </span>
                      {isActive && (
                        <span className="ml-auto text-xs text-gray-400">Current</span>
                      )}
                    </button>
                  )
                })}
              </div>

              {isSwitched && (
                <div className="p-2 border-t bg-orange-50">
                  <button
                    onClick={() => switchRole('superadmin')}
                    disabled={switching}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Exit to Super Admin</span>
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Floating Banner when Role is Switched */}
      <AnimatePresence>
        {isSwitched && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-0 left-0 right-0 z-[100] bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-2 flex items-center justify-center gap-4 shadow-lg"
          >
            <div className="flex items-center gap-2">
              <UserCog className="w-5 h-5" />
              <span className="font-medium">
                You are viewing as <strong>{currentConfig.label}</strong>
              </span>
              <span className="text-orange-100 text-sm">
                (Auto-reverts in 4 hours)
              </span>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => switchRole('superadmin')}
              disabled={switching}
              className="bg-white/20 border-white/30 text-white hover:bg-white/30 gap-1"
            >
              {switching ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <X className="w-4 h-4" />
                  Exit
                </>
              )}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
