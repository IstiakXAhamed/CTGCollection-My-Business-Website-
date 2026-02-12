'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Bell,
  Send,
  Users,
  Clock,
  AlertCircle,
  RefreshCw,
  Globe,
  Target,
  Zap
} from 'lucide-react'
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAutoRefresh } from '@/hooks/useAutoRefresh'
import { cn } from '@/lib/utils'

interface NotificationLog {
  id: string
  userId: string
  type: string
  title: string
  message: string
  data: string | null
  sentAt: string
  user: {
    name: string | null
    email: string
  }
}

export default function NotificationsPage() {
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [isConfigured, setIsConfigured] = useState(false)
  const [stats, setStats] = useState({
    totalSubscribers: 0,
    activeSubscribers: 0,
    totalNotifications: 0,
  })
  const [recentLogs, setRecentLogs] = useState<NotificationLog[]>([])
  const [formData, setFormData] = useState({
    action: 'broadcast' as 'broadcast' | 'send',
    title: '',
    message: '',
    url: '',
    type: 'promotion' as 'promotion' | 'flash_sale' | 'order' | 'stock',
    userId: '',
  })
  const [sendResult, setSendResult] = useState<{
    success: boolean
    message: string
    details?: any
  } | null>(null)

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/notifications', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setIsConfigured(data.isConfigured ?? false)
        setStats({
          totalSubscribers: data.totalSubscribers ?? 0,
          activeSubscribers: data.activeSubscribers ?? 0,
          totalNotifications: data.totalNotifications ?? 0,
        })
        setRecentLogs(data.recentNotifications ?? [])
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useAutoRefresh(fetchData, { interval: 30000 })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    setSendResult(null)

    try {
      const res = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        credentials: 'include',
      })

      const result = await res.json()
      setSendResult({
        success: res.ok,
        message: res.ok
          ? `Notification sent! ${result.sent ?? 0} delivered, ${result.failed ?? 0} failed`
          : result.error || 'Failed to send notification',
        details: result,
      })

      if (res.ok) {
        setFormData({
          action: 'broadcast',
          title: '',
          message: '',
          url: '',
          type: 'promotion',
          userId: '',
        })
        fetchData()
      }
    } catch (error) {
      setSendResult({
        success: false,
        message: 'Network error. Please try again.',
      })
    } finally {
      setSending(false)
    }
  }

  const statCards = [
    {
      title: 'Total Subscribers',
      value: stats.totalSubscribers,
      icon: Users,
      color: 'blue',
      description: 'All time registrations',
    },
    {
      title: 'Active Subscribers',
      value: stats.activeSubscribers,
      icon: Bell,
      color: 'green',
      description: 'Currently subscribed',
    },
    {
      title: 'Notifications Sent',
      value: stats.totalNotifications,
      icon: Send,
      color: 'purple',
      description: 'Push notifications delivered',
    },
  ]

  const typeColors: Record<string, string> = {
    order: 'bg-blue-100 text-blue-700',
    price_drop: 'bg-green-100 text-green-700',
    flash_sale: 'bg-purple-100 text-purple-700',
    promotion: 'bg-orange-100 text-orange-700',
    stock: 'bg-red-100 text-red-700',
  }

  if (!isConfigured) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Push Notifications</h1>
          <p className="text-muted-foreground mt-1">Manage your push notification system</p>
        </div>

        <Card className="border-orange-200 dark:border-orange-900/30 bg-orange-50/50 dark:bg-orange-950/20">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-8 h-8 text-orange-500 mt-0.5" />
              <div>
                <h3 className="font-semibold text-orange-700 dark:text-orange-400">Push Notifications Not Configured</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  VAPID keys are not set in your environment variables. Add these to your <code className="bg-orange-100 dark:bg-orange-900/30 px-1.5 py-0.5 rounded text-xs">.env</code> file:
                </p>
                <div className="mt-3 space-y-2 text-sm">
                  <p><code className="bg-orange-100 dark:bg-orange-900/30 px-1.5 py-0.5 rounded">NEXT_PUBLIC_VAPID_PUBLIC_KEY</code> - Your VAPID public key</p>
                  <p><code className="bg-orange-100 dark:bg-orange-900/30 px-1.5 py-0.5 rounded">VAPID_PRIVATE_KEY</code> - Your VAPID private key</p>
                </div>
                <p className="text-sm text-muted-foreground mt-3">
                  Generate keys using: <code className="bg-orange-100 dark:bg-orange-900/30 px-1.5 py-0.5 rounded text-xs">npx web-push generate-vapid-keys</code>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Push Notifications</h1>
          <p className="text-muted-foreground mt-1">Send broadcast notifications and manage subscriber activity</p>
        </div>
        <Button onClick={fetchData} variant="outline" className="gap-2" disabled={loading}>
          <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                  </div>
                  <div className={cn(
                    "p-3 rounded-xl",
                    stat.color === 'blue' && "bg-blue-100 dark:bg-blue-900/30",
                    stat.color === 'green' && "bg-green-100 dark:bg-green-900/30",
                    stat.color === 'purple' && "bg-purple-100 dark:bg-purple-900/30",
                  )}>
                    <stat.icon className={cn(
                      "w-6 h-6",
                      stat.color === 'blue' && "text-blue-600",
                      stat.color === 'green' && "text-green-600",
                      stat.color === 'purple' && "text-purple-600",
                    )} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Send Notification Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Send Notification
            </CardTitle>
            <CardDescription>Broadcast a push notification to all subscribers or target specific users</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Action Toggle */}
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={formData.action === 'broadcast' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFormData({ ...formData, action: 'broadcast', userId: '' })}
                  className="gap-2"
                >
                  <Globe className="w-4 h-4" />
                  Broadcast All
                </Button>
                <Button
                  type="button"
                  variant={formData.action === 'send' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFormData({ ...formData, action: 'send' })}
                  className="gap-2"
                >
                  <Target className="w-4 h-4" />
                  Target User
                </Button>
              </div>

              {formData.action === 'send' && (
                <div>
                  <Label htmlFor="userId">User ID</Label>
                  <Input
                    id="userId"
                    placeholder="Enter user ID to target specific user"
                    value={formData.userId}
                    onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                    required={formData.action === 'send'}
                  />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="Notification title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    maxLength={100}
                  />
                </div>
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(v: any) => setFormData({ ...formData, type: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="promotion">Promotion</SelectItem>
                      <SelectItem value="flash_sale">Flash Sale</SelectItem>
                      <SelectItem value="order">Order Update</SelectItem>
                      <SelectItem value="stock">Stock Alert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Enter your notification message..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                  rows={3}
                  maxLength={255}
                />
                <p className="text-xs text-muted-foreground mt-1 text-right">
                  {formData.message.length}/255
                </p>
              </div>

              <div>
                <Label htmlFor="url">Deep Link (Optional)</Label>
                <Input
                  id="url"
                  placeholder="/product/slug or leave empty for home"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                />
              </div>

              {sendResult && (
                <div className={cn(
                  "p-4 rounded-lg text-sm",
                  sendResult.success
                    ? "bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400"
                    : "bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400"
                )}>
                  {sendResult.message}
                </div>
              )}

              <Button type="submit" disabled={sending} className="w-full gap-2">
                {sending ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    {formData.action === 'broadcast' ? 'Send to All Subscribers' : 'Send to User'}
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Notifications */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Recent Notifications
            </CardTitle>
            <CardDescription>Latest push notifications sent to users</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse flex items-center gap-4">
                    <div className="h-10 w-10 bg-gray-200 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/3" />
                      <div className="h-3 bg-gray-200 rounded w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentLogs.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="w-12 h-12 mx-auto text-muted-foreground/50" />
                <p className="text-muted-foreground mt-4">No notifications sent yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Send your first broadcast notification above
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-shrink-0">
                      <Badge className={cn("gap-1", typeColors[log.type] || 'bg-gray-100 text-gray-700')}>
                        {log.type.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{log.title}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {log.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {log.user?.name || log.user?.email || 'System'} • {new Date(log.sentAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
