import { useState, useEffect, useCallback } from 'react'
import { haptics } from '@/lib/haptics'

interface PushNotificationPayload {
  title: string
  body: string
  icon?: string
  badge?: string
  data?: {
    url?: string
    type?: string
  }
}

interface PushNotificationState {
  isSupported: boolean
  permission: NotificationPermission
  isSubscribed: boolean
}

export function usePushNotifications() {
  const [state, setState] = useState<PushNotificationState>({
    isSupported: false,
    permission: 'default',
    isSubscribed: false,
  })

  useEffect(() => {
    const isSupported = 'Notification' in window && 'serviceWorker' in navigator
    const permission = isSupported ? Notification.permission : 'denied'

    setState(prev => ({
      ...prev,
      isSupported,
      permission,
    }))

    if (isSupported && permission === 'granted') {
      checkSubscription()
    }
  }, [])

  const checkSubscription = useCallback(async () => {
    if (!('serviceWorker' in navigator)) return

    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()
      setState(prev => ({ ...prev, isSubscribed: !!subscription }))
    } catch (error) {
      console.error('Error checking push subscription:', error)
    }
  }, [])

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      return 'denied' as NotificationPermission
    }

    try {
      const permission = await Notification.requestPermission()
      haptics[permission === 'granted' ? 'success' : 'error']()
      setState(prev => ({ ...prev, permission }))
      return permission
    } catch (error) {
      console.error('Error requesting notification permission:', error)
      return 'denied' as NotificationPermission
    }
  }, [])

  const subscribe = useCallback(async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      throw new Error('Push notifications not supported')
    }

    try {
      const permission = await requestPermission()
      if (permission !== 'granted') {
        throw new Error('Notification permission denied')
      }

      // Register service worker if not already registered
      const registration = await navigator.serviceWorker.register('/sw.js')
      await navigator.serviceWorker.ready

      // Subscribe to push
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      })

      // Send subscription to server
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription),
      })

      setState(prev => ({ ...prev, isSubscribed: true }))
      haptics.success()
      return subscription
    } catch (error) {
      console.error('Error subscribing to push:', error)
      haptics.error()
      throw error
    }
  }, [requestPermission])

  const unsubscribe = useCallback(async () => {
    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()

      if (subscription) {
        await subscription.unsubscribe()

        // Notify server
        await fetch('/api/push/unsubscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        })

        setState(prev => ({ ...prev, isSubscribed: false }))
        haptics.success()
      }
    } catch (error) {
      console.error('Error unsubscribing from push:', error)
      haptics.error()
    }
  }, [])

  const showLocalNotification = useCallback(async (payload: PushNotificationPayload) => {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      return
    }

    try {
      const registration = await navigator.serviceWorker.ready

      registration.showNotification(payload.title, {
        body: payload.body,
        icon: payload.icon || '/icon-192.png',
        badge: payload.badge || '/badge-72.png',
        data: payload.data,
        requireInteraction: true,
      })
    } catch (error) {
      console.error('Error showing notification:', error)
      // Fallback to browser notification
      new Notification(payload.title, {
        body: payload.body,
        icon: payload.icon,
      })
    }
  }, [])

  return {
    ...state,
    requestPermission,
    subscribe,
    unsubscribe,
    showLocalNotification,
  }
}

export default usePushNotifications
