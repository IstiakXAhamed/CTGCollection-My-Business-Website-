'use client'

import { useState, useEffect } from 'react'
import { 
  Mail, RefreshCw, Search, Eye, EyeOff, Trash2, Reply, Send,
  CheckCircle, Circle, MessageSquare, Clock, Loader2, X
} from 'lucide-react'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { motion, AnimatePresence } from 'framer-motion'
import { useToast } from '@/hooks/use-toast'

interface Message {
  id: string
  name: string
  email: string
  phone?: string
  subject: string
  message: string
  isRead: boolean
  isReplied: boolean
  adminNotes?: string
  createdAt: string
}

export default function AdminMessagesPage() {
  const { toast } = useToast()
  const [messages, setMessages] = useState<Message[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'unread' | 'replied'>('all')
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  
  // Reply modal state
  const [showReplyModal, setShowReplyModal] = useState(false)
  const [replySubject, setReplySubject] = useState('')
  const [replyContent, setReplyContent] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    fetchMessages()
  }, [])

  const fetchMessages = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/messages', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setMessages(data.messages || [])
        setStats(data.stats)
      }
    } catch (err) {
      console.error('Failed to fetch messages:', err)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (id: string, isRead: boolean) => {
    try {
      await fetch('/api/admin/messages', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id, isRead })
      })
      setMessages(prev => prev.map(m => m.id === id ? { ...m, isRead } : m))
      if (selectedMessage?.id === id) {
        setSelectedMessage({ ...selectedMessage, isRead })
      }
    } catch (err) {
      console.error('Failed to update:', err)
    }
  }

  const deleteMessage = async (id: string) => {
    if (!confirm('Delete this message?')) return
    try {
      await fetch(`/api/admin/messages?id=${id}`, {
        method: 'DELETE',
        credentials: 'include'
      })
      setMessages(prev => prev.filter(m => m.id !== id))
      if (selectedMessage?.id === id) setSelectedMessage(null)
    } catch (err) {
      console.error('Failed to delete:', err)
    }
  }

  const openReplyModal = () => {
    if (!selectedMessage) return
    setReplySubject(`Re: ${selectedMessage.subject}`)
    setReplyContent('')
    setShowReplyModal(true)
  }

  const sendReply = async () => {
    if (!selectedMessage || !replyContent.trim()) return
    
    setSending(true)
    try {
      const res = await fetch('/api/admin/messages/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          messageId: selectedMessage.id,
          replySubject,
          replyContent
        })
      })

      const data = await res.json()
      
      if (res.ok) {
        toast({
          title: 'Reply sent!',
          description: data.emailSent 
            ? 'Email sent and message marked as replied.' 
            : 'Message marked as replied. (Email could not be sent - check SMTP settings)'
        })
        
        // Update message state
        setMessages(prev => prev.map(m => 
          m.id === selectedMessage.id ? { ...m, isReplied: true, isRead: true } : m
        ))
        setSelectedMessage({ ...selectedMessage, isReplied: true, isRead: true })
        setShowReplyModal(false)
      } else {
        toast({ title: 'Error', description: data.error, variant: 'destructive' })
      }
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to send reply', variant: 'destructive' })
    } finally {
      setSending(false)
    }
  }

  const filteredMessages = messages.filter(m => {
    if (filter === 'unread' && m.isRead) return false
    if (filter === 'replied' && !m.isReplied) return false
    if (search) {
      const s = search.toLowerCase()
      return m.name.toLowerCase().includes(s) || 
             m.email.toLowerCase().includes(s) ||
             m.subject.toLowerCase().includes(s)
    }
    return true
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Mail className="w-8 h-8 text-blue-600" />
            Contact Messages
          </h1>
          <p className="text-gray-600 mt-1">View and manage messages from contact form</p>
        </div>
        <Button variant="outline" onClick={fetchMessages}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
              <p className="text-sm text-gray-500">Total</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-orange-600">{stats.unread}</p>
              <p className="text-sm text-gray-500">Unread</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-green-600">{stats.replied}</p>
              <p className="text-sm text-gray-500">Replied</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4 flex flex-wrap gap-4 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, subject..."
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            {(['all', 'unread', 'replied'] as const).map((f) => (
              <Button
                key={f}
                size="sm"
                variant={filter === f ? 'default' : 'outline'}
                onClick={() => setFilter(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Messages List */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-2 max-h-[600px] overflow-y-auto">
          {filteredMessages.length === 0 ? (
            <Card className="text-center py-12">
              <Mail className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No messages</p>
            </Card>
          ) : (
            filteredMessages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => {
                  setSelectedMessage(msg)
                  if (!msg.isRead) markAsRead(msg.id, true)
                }}
                className={`p-4 rounded-lg border cursor-pointer transition hover:shadow-md ${
                  selectedMessage?.id === msg.id ? 'border-blue-500 bg-blue-50' : 'bg-white'
                } ${!msg.isRead ? 'border-l-4 border-l-blue-500' : ''}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {!msg.isRead ? (
                    <Circle className="w-3 h-3 fill-blue-500 text-blue-500" />
                  ) : msg.isReplied ? (
                    <CheckCircle className="w-3 h-3 text-green-500" />
                  ) : (
                    <CheckCircle className="w-3 h-3 text-gray-400" />
                  )}
                  <span className="font-semibold truncate">{msg.name}</span>
                  {msg.isReplied && (
                    <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">Replied</span>
                  )}
                </div>
                <p className="text-sm font-medium truncate">{msg.subject}</p>
                <p className="text-xs text-gray-500 truncate">{msg.email}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(msg.createdAt).toLocaleDateString()}
                </p>
              </motion.div>
            ))
          )}
        </div>

        {/* Message Detail */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {selectedMessage ? (
              <motion.div
                key={selectedMessage.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold">{selectedMessage.subject}</h2>
                      <p className="text-sm text-gray-500">
                        From: {selectedMessage.name} ({selectedMessage.email})
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => markAsRead(selectedMessage.id, !selectedMessage.isRead)}
                      >
                        {selectedMessage.isRead ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                      <Button
                        size="sm"
                        onClick={openReplyModal}
                        disabled={selectedMessage.isReplied}
                        className="gap-1"
                      >
                        <Reply className="w-4 h-4" />
                        {selectedMessage.isReplied ? 'Replied' : 'Reply'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600"
                        onClick={() => deleteMessage(selectedMessage.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      {selectedMessage.phone && (
                        <span className="flex items-center gap-1">
                          📞 {selectedMessage.phone}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {new Date(selectedMessage.createdAt).toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="whitespace-pre-wrap">{selectedMessage.message}</p>
                    </div>

                    {selectedMessage.adminNotes && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <p className="text-sm font-semibold text-green-700 mb-1">Admin Notes:</p>
                        <p className="text-sm text-green-600">{selectedMessage.adminNotes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <Card className="h-full flex items-center justify-center py-20">
                <div className="text-center text-gray-500">
                  <MessageSquare className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <p>Select a message to view details</p>
                </div>
              </Card>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Reply Modal */}
      <AnimatePresence>
        {showReplyModal && selectedMessage && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setShowReplyModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="fixed left-4 right-4 top-[10%] md:left-1/2 md:right-auto md:-translate-x-1/2 md:w-full md:max-w-2xl bg-white rounded-xl shadow-2xl z-50 overflow-hidden max-h-[80vh]"
            >
              <div className="flex items-center justify-between p-4 border-b bg-gray-50">
                <h3 className="text-lg font-bold">Reply to {selectedMessage.name}</h3>
                <button onClick={() => setShowReplyModal(false)} className="p-1 hover:bg-gray-200 rounded">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                <div className="bg-gray-50 rounded-lg p-3 text-sm">
                  <p className="font-semibold">Original message:</p>
                  <p className="text-gray-600">{selectedMessage.message.substring(0, 200)}...</p>
                </div>

                <div className="space-y-2">
                  <Label>Subject</Label>
                  <Input
                    value={replySubject}
                    onChange={(e) => setReplySubject(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Reply Message *</Label>
                  <Textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    rows={8}
                    placeholder="Type your reply here..."
                    className="resize-none"
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
                  <p className="text-blue-700">
                    📧 This reply will be sent via email to <strong>{selectedMessage.email}</strong>
                  </p>
                  <p className="text-blue-600 mt-1">
                    🔔 If they're a registered user, they'll also get a website notification
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 p-4 border-t bg-gray-50">
                <Button variant="outline" onClick={() => setShowReplyModal(false)}>
                  Cancel
                </Button>
                <Button onClick={sendReply} disabled={sending || !replyContent.trim()}>
                  {sending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Reply
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
