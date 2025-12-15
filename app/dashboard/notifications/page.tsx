'use client'

import { useState, useEffect } from 'react'
import { Bell, CheckCheck, Trash2, Package, Tag, MessageCircle, Megaphone, Filter, RefreshCw, Trophy, UserCog } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
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
  promo: Tag,
  loyalty: Trophy,
  account: UserCog,
  chat: MessageCircle,
  welcome: Megaphone,
  general: Bell
}

const typeColors: Record<string, string> = {
  order: 'bg-blue-100 text-blue-600',
  promo: 'bg-purple-100 text-purple-600',
  loyalty: 'bg-yellow-100 text-yellow-600',
  account: 'bg-green-100 text-green-600',
  chat: 'bg-teal-100 text-teal-600',
  welcome: 'bg-orange-100 text-orange-600',
  general: 'bg-gray-100 text-gray-600'
}

const typeLabels: Record<string, string> = {
  order: 'Order',
  promo: 'Promotion',
  loyalty: 'Loyalty',
  account: 'Account',
  chat: 'Chat',
  welcome: 'Welcome',
  general: 'General'
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const { toast } = useToast()

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/notifications', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setNotifications(data.notifications || [])
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (id: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ notificationId: id, isRead: true })
      })
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      )
    } catch (error) {
      console.error('Failed to mark as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ markAllRead: true })
      })
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
      toast({ title: 'Success', description: 'All notifications marked as read' })
    } catch (error) {
      console.error('Failed to mark all as read:', error)
    }
  }

  const deleteNotification = async (id: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ notificationId: id })
      })
      setNotifications(prev => prev.filter(n => n.id !== id))
    } catch (error) {
      console.error('Failed to delete notification:', error)
    }
  }

  const deleteAllRead = async () => {
    const readIds = notifications.filter(n => n.isRead).map(n => n.id)
    if (readIds.length === 0) return
    
    try {
      for (const id of readIds) {
        await fetch('/api/notifications', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ notificationId: id })
        })
      }
      setNotifications(prev => prev.filter(n => !n.isRead))
      toast({ title: 'Success', description: `Deleted ${readIds.length} read notifications` })
    } catch (error) {
      console.error('Failed to delete read notifications:', error)
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = (now.getTime() - date.getTime()) / 1000

    if (diff < 60) return 'Just now'
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`
    return date.toLocaleDateString()
  }

  const filteredNotifications = filter === 'all' 
    ? notifications 
    : filter === 'unread' 
      ? notifications.filter(n => !n.isRead)
      : notifications.filter(n => n.type === filter)

  const unreadCount = notifications.filter(n => !n.isRead).length
  const typeOptions = ['all', 'unread', ...Object.keys(typeLabels)]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchNotifications} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              <CheckCheck className="w-4 h-4 mr-2" />
              Mark All Read
            </Button>
          )}
          {notifications.some(n => n.isRead) && (
            <Button variant="outline" size="sm" onClick={deleteAllRead} className="text-red-600">
              <Trash2 className="w-4 h-4 mr-2" />
              Clear Read
            </Button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {typeOptions.map(type => (
          <Button
            key={type}
            variant={filter === type ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(type)}
            className="capitalize"
          >
            {type === 'all' ? 'All' : type === 'unread' ? 'Unread' : typeLabels[type] || type}
          </Button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {loading ? (
          <Card className="p-8 text-center">
            <div className="animate-pulse flex flex-col items-center gap-4">
              <Bell className="w-12 h-12 text-gray-300" />
              <p className="text-muted-foreground">Loading notifications...</p>
            </div>
          </Card>
        ) : filteredNotifications.length === 0 ? (
          <Card className="p-8 text-center">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-muted-foreground">
              {filter === 'all' ? 'No notifications yet' : `No ${filter} notifications`}
            </p>
          </Card>
        ) : (
          filteredNotifications.map(notification => {
            const Icon = typeIcons[notification.type] || Bell
            const colorClass = typeColors[notification.type] || typeColors.general

            return (
              <Card 
                key={notification.id} 
                className={`transition-all hover:shadow-md ${!notification.isRead ? 'border-l-4 border-l-blue-500 bg-blue-50/30' : ''}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-full ${colorClass}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={`font-semibold ${!notification.isRead ? 'text-blue-900' : 'text-gray-700'}`}>
                          {notification.title}
                        </h3>
                        {!notification.isRead && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full" />
                        )}
                        <span className="text-xs text-muted-foreground ml-auto">
                          {formatTime(notification.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
                      
                      <div className="flex items-center gap-2">
                        {notification.link && (
                          <Link href={notification.link}>
                            <Button variant="link" size="sm" className="h-auto p-0 text-blue-600">
                              View Details →
                            </Button>
                          </Link>
                        )}
                        
                        <div className="ml-auto flex gap-1">
                          {!notification.isRead && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => markAsRead(notification.id)}
                              className="text-green-600 hover:text-green-700 h-8"
                            >
                              <CheckCheck className="w-4 h-4" />
                            </Button>
                          )}
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => deleteNotification(notification.id)}
                            className="text-red-600 hover:text-red-700 h-8"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
