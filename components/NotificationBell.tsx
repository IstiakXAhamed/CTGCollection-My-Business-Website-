'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Bell, CheckCheck, Trash2, X, Package, Tag, MessageCircle, Megaphone } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  isRead: boolean
  link?: string
  createdAt: string
}

const typeIcons: Record<string, any> = {
  order: Package,
  promotion: Tag,
  chat: MessageCircle,
  announcement: Megaphone,
  general: Bell
}

const typeColors: Record<string, string> = {
  order: 'bg-blue-100 text-blue-600',
  promotion: 'bg-purple-100 text-purple-600',
  chat: 'bg-green-100 text-green-600',
  announcement: 'bg-orange-100 text-orange-600',
  general: 'bg-gray-100 text-gray-600'
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [prevUnreadCount, setPrevUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isShaking, setIsShaking] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Initialize audio for notification sound
  useEffect(() => {
    audioRef.current = new Audio('/sounds/notification.mp3')
    audioRef.current.volume = 0.5
  }, [])

  // Play sound and shake animation on new notification
  const triggerNotificationAlert = useCallback(() => {
    // Play sound
    if (audioRef.current) {
      audioRef.current.currentTime = 0
      audioRef.current.play().catch(() => {})
    }
    
    // Trigger shake animation
    setIsShaking(true)
    setTimeout(() => setIsShaking(false), 1000)
  }, [])

  // Fetch notifications with cache-busting
  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch(`/api/notifications?t=${Date.now()}`, { 
        credentials: 'include',
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      })
      if (res.ok) {
        const data = await res.json()
        const newUnreadCount = data.unreadCount || 0
        
        // Check if new notification arrived
        if (newUnreadCount > prevUnreadCount && prevUnreadCount !== 0) {
          triggerNotificationAlert()
        }
        
        setNotifications(data.notifications || [])
        setUnreadCount(newUnreadCount)
        setPrevUnreadCount(newUnreadCount)
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err)
    }
  }, [prevUnreadCount, triggerNotificationAlert])

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 10000)
    return () => clearInterval(interval)
  }, [fetchNotifications])

  // Refetch when dropdown opens
  useEffect(() => {
    if (isOpen) fetchNotifications()
  }, [isOpen, fetchNotifications])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const markAsRead = async (id: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action: 'mark_read', notificationId: id })
      })
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (err) {
      console.error('Failed to mark as read:', err)
    }
  }

  const markAllRead = async () => {
    setLoading(true)
    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action: 'mark_all_read' })
      })
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
      setUnreadCount(0)
    } catch (err) {
      console.error('Failed to mark all as read:', err)
    } finally {
      setLoading(false)
    }
  }

  const deleteNotification = async (id: string) => {
    try {
      await fetch(`/api/notifications?id=${id}`, {
        method: 'DELETE',
        credentials: 'include'
      })
      const wasUnread = notifications.find(n => n.id === id)?.isRead === false
      setNotifications(prev => prev.filter(n => n.id !== id))
      if (wasUnread) setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (err) {
      console.error('Failed to delete:', err)
    }
  }

  const formatTime = (date: string) => {
    const d = new Date(date)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return d.toLocaleDateString()
  }

  // Shake animation keyframes
  const shakeAnimation = {
    shake: {
      x: [0, -3, 3, -3, 3, -2, 2, 0],
      rotate: [0, -10, 10, -10, 10, -5, 5, 0],
      transition: { duration: 0.6 }
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        animate={isShaking ? 'shake' : ''}
        variants={shakeAnimation}
      >
        <Bell className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        {unreadCount > 0 && (
          <motion.span 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-lg"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border dark:border-gray-700 z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <h3 className="font-bold text-gray-900 dark:text-white">Notifications</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button size="sm" variant="ghost" onClick={markAllRead} disabled={loading}>
                    <CheckCheck className="w-4 h-4 mr-1" />
                    <span className="text-xs">Read All</span>
                  </Button>
                )}
                <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-[400px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Bell className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                  <p>No notifications</p>
                </div>
              ) : (
                notifications.map((notif) => {
                  const Icon = typeIcons[notif.type] || Bell
                  const colorClass = typeColors[notif.type] || typeColors.general
                  
                  const handleNotificationClick = () => {
                    if (!notif.isRead) {
                      markAsRead(notif.id)
                    }
                    setIsOpen(false)
                  }
                  
                  const content = (
                    <div 
                      className={`p-4 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition ${!notif.isRead ? 'bg-blue-50/50 dark:bg-blue-900/20' : ''}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-sm truncate dark:text-white">{notif.title}</p>
                            {!notif.isRead && (
                              <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{notif.message}</p>
                          <p className="text-xs text-gray-400 mt-1">{formatTime(notif.createdAt)}</p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteNotification(notif.id)
                          }}
                          className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-full text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )

                  return notif.link ? (
                    <Link key={notif.id} href={notif.link} onClick={handleNotificationClick}>
                      {content}
                    </Link>
                  ) : (
                    <div key={notif.id} onClick={handleNotificationClick}>
                      {content}
                    </div>
                  )
                })
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-center">
                <Link 
                  href="/dashboard/notifications" 
                  onClick={() => setIsOpen(false)}
                  className="text-sm text-blue-600 hover:underline"
                >
                  View All Notifications
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
