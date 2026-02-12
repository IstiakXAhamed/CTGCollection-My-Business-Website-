'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Bell, BellOff, Check, Settings, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { usePushNotifications } from '@/hooks/usePushNotifications'
import { haptics } from '@/lib/haptics'

interface NotificationSettingsProps {
  compact?: boolean
}

export function NotificationSettings({ compact = false }: NotificationSettingsProps) {
  const {
    isSupported,
    permission,
    isSubscribed,
    requestPermission,
    subscribe,
    unsubscribe,
  } = usePushNotifications()
  const [isLoading, setIsLoading] = useState(false)

  const handleToggle = async () => {
    if (!isSupported) {
      haptics.error()
      return
    }

    setIsLoading(true)
    haptics.medium()

    try {
      if (isSubscribed) {
        await unsubscribe()
      } else {
        if (permission !== 'granted') {
          const perm = await requestPermission()
          if (perm !== 'granted') {
            setIsLoading(false)
            return
          }
        }
        await subscribe()
      }
    } catch (error) {
      console.error('Toggle error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusText = () => {
    if (!isSupported) return 'Not supported'
    if (permission === 'denied') return 'Blocked'
    if (isSubscribed) return 'Enabled'
    return 'Off'
  }

  if (compact) {
    return (
      <Button
        variant={isSubscribed ? 'default' : 'outline'}
        size="sm"
        onClick={handleToggle}
        disabled={!isSupported || isLoading || permission === 'denied'}
        className="gap-2"
      >
        {isSubscribed ? (
          <Bell className="w-4 h-4" />
        ) : (
          <BellOff className="w-4 h-4" />
        )}
        {isLoading ? 'Loading...' : getStatusText()}
      </Button>
    )
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-500" />
          Push Notifications
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="font-medium">Stay Updated</p>
            <p className="text-sm text-muted-foreground">
              Get notified about orders, offers, and price drops
            </p>
          </div>
          <motion.div whileTap={{ scale: 0.95 }}>
            <Button
              variant={isSubscribed ? 'default' : 'outline'}
              onClick={handleToggle}
              disabled={!isSupported || isLoading || permission === 'denied'}
              className="min-w-[120px]"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Wait
                </span>
              ) : isSubscribed ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Enabled
                </>
              ) : permission === 'denied' ? (
                'Blocked'
              ) : (
                'Enable'
              )}
            </Button>
          </motion.div>
        </div>

        {/* Status indicators */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t">
          <div className="text-center">
            <motion.div
              animate={{
                scale: isSupported ? [1, 1.1, 1] : 1
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center ${
                isSupported
                  ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
              }`}
            >
              {isSupported ? <Check className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
            </motion.div>
            <p className="text-xs mt-1">Supported</p>
          </div>
          <div className="text-center">
            <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center ${
              permission === 'granted'
                ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400'
            }`}>
              {permission === 'granted' ? <Check className="w-4 h-4" /> : <Settings className="w-4 h-4" />}
            </div>
            <p className="text-xs mt-1">Permission</p>
          </div>
          <div className="text-center">
            <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center ${
              isSubscribed
                ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
            }`}>
              <Bell className={`w-4 h-4 ${isSubscribed ? '' : 'opacity-50'}`} />
            </div>
            <p className="text-xs mt-1">Subscribed</p>
          </div>
        </div>

        {permission === 'denied' && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-sm text-red-600 dark:text-red-400">
            Notifications are blocked. Please enable them in your browser settings.
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default NotificationSettings
