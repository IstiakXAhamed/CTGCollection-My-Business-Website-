'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Bell, Check, Trash2, RefreshCw } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  isRead: boolean
  link?: string
  createdAt: string
}

export default function AdminNotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [prevUnreadCount, setPrevUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [isShaking, setIsShaking] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio('/sounds/notification.mp3')
    audioRef.current.volume = 0.5
  }, [])

  // Trigger notification alert
  const triggerAlert = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0
      audioRef.current.play().catch(() => {})
    }
    setIsShaking(true)
    setTimeout(() => setIsShaking(false), 1000)
  }, [])

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch(`/api/notifications?t=${Date.now()}`, { 
        credentials: 'include',
        cache: 'no-store'
      })
      if (res.ok) {
        const data = await res.json()
        const newUnreadCount = data.unreadCount || 0
        
        if (newUnreadCount > prevUnreadCount && prevUnreadCount !== 0) {
          triggerAlert()
        }
        
        setNotifications(data.notifications || [])
        setUnreadCount(newUnreadCount)
        setPrevUnreadCount(newUnreadCount)
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err)
    }
  }, [prevUnreadCount, triggerAlert])

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 10000)
    return () => clearInterval(interval)
  }, [fetchNotifications])

  useEffect(() => {
    if (isOpen) fetchNotifications()
  }, [isOpen, fetchNotifications])

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

  const getTypeStyle = (type: string) => {
    switch (type) {
      case 'order': return 'bg-green-100 text-green-700'
      case 'user': return 'bg-blue-100 text-blue-700'
      case 'message': return 'bg-purple-100 text-purple-700'
      case 'chat': return 'bg-orange-100 text-orange-700'
      case 'inventory': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) markAsRead(notification.id)
    if (notification.link) window.location.href = notification.link
    setIsOpen(false)
  }

  // Shake animation
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
        className="relative p-2 rounded-lg hover:bg-gray-100 transition"
        animate={isShaking ? 'shake' : ''}
        variants={shakeAnimation}
      >
        <Bell className="w-5 h-5 text-gray-600" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold shadow-lg"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </motion.span>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-xl border z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-gray-50">
              <h3 className="font-bold text-lg">Notifications</h3>
              <div className="flex gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <Check className="w-3 h-3" /> Mark all read
                  </button>
                )}
                <button
                  onClick={fetchNotifications}
                  className="p-1 hover:bg-gray-200 rounded"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-[400px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Bell className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                  <p>No notifications</p>
                </div>
              ) : (
                notifications.slice(0, 10).map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border-b hover:bg-gray-50 cursor-pointer ${
                      !notification.isRead ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`px-2 py-1 rounded text-xs font-medium ${getTypeStyle(notification.type)}`}>
                        {notification.type}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium text-sm ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                          {notification.title}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{notification.message}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(notification.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteNotification(notification.id)
                        }}
                        className="p-1 hover:bg-gray-200 rounded text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {notifications.length > 10 && (
              <div className="p-3 border-t text-center">
                <a href="/admin/notifications" className="text-sm text-blue-600 hover:underline">
                  View all notifications
                </a>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
