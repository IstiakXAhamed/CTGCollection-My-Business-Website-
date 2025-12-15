'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  MessageCircle, Send, VolumeX, Volume2, 
  Clock, XCircle, RefreshCw, Loader2, Ban, ChevronDown 
} from 'lucide-react'

interface ChatSession {
  id: string
  sessionId: string
  customerName: string
  status: string
  lastMessage: string
  unreadCount: number
  createdAt: string
  updatedAt: string
}

interface ChatMessage {
  id: string
  senderType: string
  senderName: string
  message: string
  createdAt: string
}

export default function AdminChatPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [lastMessageTime, setLastMessageTime] = useState<string | null>(null)
  const [showRestrictMenu, setShowRestrictMenu] = useState(false)
  const [restricting, setRestricting] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const pollingRef = useRef<NodeJS.Timeout | null>(null)
  const sessionPollingRef = useRef<NodeJS.Timeout | null>(null)

  // Fetch sessions
  const fetchSessions = useCallback(async () => {
    try {
      const res = await fetch('/api/chat/sessions', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setSessions(data.sessions || [])
      }
    } catch (error) {
      console.error('Failed to fetch sessions:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch messages for selected session
  const fetchMessages = useCallback(async () => {
    if (!selectedSession) return
    
    try {
      const url = lastMessageTime 
        ? `/api/chat/${selectedSession.sessionId}?after=${encodeURIComponent(lastMessageTime)}`
        : `/api/chat/${selectedSession.sessionId}`
      
      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        if (data.messages && data.messages.length > 0) {
          if (lastMessageTime) {
            // Add only new messages
            setMessages(prev => {
              const existingIds = new Set(prev.map(m => m.id))
              const newMsgs = data.messages.filter((m: ChatMessage) => !existingIds.has(m.id))
              return [...prev, ...newMsgs]
            })
          } else {
            setMessages(data.messages)
          }
          
          const lastMsg = data.messages[data.messages.length - 1]
          setLastMessageTime(lastMsg.createdAt)
        }
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error)
    }
  }, [selectedSession, lastMessageTime])

  // Initial load and polling for sessions
  useEffect(() => {
    fetchSessions()
    
    // Poll sessions every 3 seconds
    sessionPollingRef.current = setInterval(fetchSessions, 3000)
    
    return () => {
      if (sessionPollingRef.current) clearInterval(sessionPollingRef.current)
    }
  }, [fetchSessions])

  // Fetch messages when session selected and poll
  useEffect(() => {
    if (selectedSession) {
      setMessages([])
      setLastMessageTime(null)
      
      // Clear old polling
      if (pollingRef.current) clearInterval(pollingRef.current)
      
      // Fetch immediately, then poll every 2 seconds
      const fetchFirstTime = async () => {
        try {
          const res = await fetch(`/api/chat/${selectedSession.sessionId}`)
          if (res.ok) {
            const data = await res.json()
            if (data.messages) {
              setMessages(data.messages)
              if (data.messages.length > 0) {
                setLastMessageTime(data.messages[data.messages.length - 1].createdAt)
              }
            }
          }
        } catch (error) {
          console.error('Failed to fetch messages:', error)
        }
      }
      
      fetchFirstTime()
      pollingRef.current = setInterval(fetchMessages, 2000)
      
      // Mark as read
      fetch(`/api/chat/${selectedSession.sessionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAsRead: true, senderType: 'admin' })
      })
    }
    
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current)
    }
  }, [selectedSession?.sessionId])

  // Only scroll when admin sends a message (not on polling)
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !selectedSession) return

    const messageText = inputValue
    setInputValue('')
    setSending(true)

    try {
      const res = await fetch(`/api/chat/${selectedSession.sessionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          message: messageText,
          senderType: 'admin',
          senderName: 'Support'
        })
      })

      if (res.ok) {
        const data = await res.json()
        setMessages(prev => [...prev, data.message])
        setLastMessageTime(data.message.createdAt)
        scrollToBottom() // Scroll after sending
        
        // Update session in list
        setSessions(prev => prev.map(s => 
          s.id === selectedSession.id 
            ? { ...s, lastMessage: messageText, unreadCount: 0 }
            : s
        ))
      }
    } catch (error) {
      console.error('Failed to send message:', error)
    } finally {
      setSending(false)
    }
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const totalUnread = sessions.reduce((acc, s) => acc + s.unreadCount, 0)

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <MessageCircle className="w-8 h-8 text-blue-600" />
          Live Chat Dashboard
          {totalUnread > 0 && (
            <Badge variant="destructive" className="text-sm animate-pulse">
              {totalUnread} new
            </Badge>
          )}
        </h1>
        <p className="text-muted-foreground mt-1">
          Real-time customer conversations • Auto-refresh every 2 seconds
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
        {/* Sessions List */}
        <Card className="lg:col-span-1 overflow-hidden flex flex-col">
          <CardHeader className="border-b bg-gray-50 flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Conversations</CardTitle>
            <Button variant="ghost" size="sm" onClick={fetchSessions}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              </div>
            ) : sessions.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No conversations yet</p>
                <p className="text-sm mt-2">Waiting for customer messages...</p>
              </div>
            ) : (
              sessions.map((session) => (
                <div
                  key={session.id}
                  onClick={() => setSelectedSession(session)}
                  className={`p-4 border-b cursor-pointer transition hover:bg-gray-50 ${
                    selectedSession?.id === session.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                        {session.customerName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold">{session.customerName}</p>
                        <p className="text-sm text-muted-foreground truncate max-w-[150px]">
                          {session.lastMessage}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">
                        {formatTime(session.updatedAt)}
                      </p>
                      {session.unreadCount > 0 && (
                        <Badge className="mt-1 animate-pulse">{session.unreadCount}</Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Chat Window */}
        <Card className="lg:col-span-2 overflow-hidden flex flex-col">
          {selectedSession ? (
            <>
              <CardHeader className="border-b bg-gray-50 flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                    {selectedSession.customerName.charAt(0)}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{selectedSession.customerName}</CardTitle>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      Live • Auto-refreshing
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {/* Restrict User Dropdown */}
                  <div className="relative">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-orange-500 text-orange-600 hover:bg-orange-50"
                      onClick={() => setShowRestrictMenu(!showRestrictMenu)}
                      disabled={restricting}
                    >
                      {restricting ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-1" />
                      ) : (
                        <Ban className="w-4 h-4 mr-1" />
                      )}
                      Restrict
                      <ChevronDown className="w-3 h-3 ml-1" />
                    </Button>
                    
                    {showRestrictMenu && (
                      <div className="absolute right-0 top-full mt-1 bg-white border rounded-lg shadow-lg z-50 min-w-[150px]">
                        {[
                          { label: '5 minutes', value: '5min' },
                          { label: '15 minutes', value: '15min' },
                          { label: '1 hour', value: '1hr' },
                          { label: '24 hours', value: '24hr' }
                        ].map(option => (
                          <button
                            key={option.value}
                            className="w-full text-left px-4 py-2 text-sm hover:bg-orange-50 text-gray-700"
                            onClick={async () => {
                              setShowRestrictMenu(false)
                              setRestricting(true)
                              try {
                                const res = await fetch('/api/admin/chat/restrict', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  credentials: 'include',
                                  body: JSON.stringify({
                                    sessionId: selectedSession.sessionId,
                                    duration: option.value,
                                    reason: 'Restricted by admin'
                                  })
                                })
                                if (res.ok) {
                                  alert(`User restricted for ${option.label}`)
                                  fetchMessages()
                                }
                              } catch (error) {
                                console.error('Failed to restrict:', error)
                              } finally {
                                setRestricting(false)
                              }
                            }}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={async () => {
                      if (confirm('Close this chat session? The customer will be notified.')) {
                        try {
                          await fetch(`/api/chat/${selectedSession.sessionId}`, {
                            method: 'DELETE',
                            credentials: 'include'
                          })
                          setSessions(prev => prev.filter(s => s.id !== selectedSession.id))
                          setSelectedSession(null)
                          setMessages([])
                        } catch (error) {
                          console.error('Failed to close session:', error)
                          alert('Failed to close session. Please try again.')
                        }
                      }
                    }}
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    Close Session
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messages.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin opacity-50" />
                    <p>Loading messages...</p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.senderType === 'admin' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[70%] p-3 rounded-2xl ${
                        msg.senderType === 'admin'
                          ? 'bg-blue-600 text-white rounded-br-none'
                          : 'bg-white shadow-sm rounded-bl-none'
                      }`}>
                        {msg.senderType !== 'admin' && (
                          <p className="text-xs font-semibold text-blue-600 mb-1">{msg.senderName}</p>
                        )}
                        <p className="text-sm">{msg.message}</p>
                        <p className={`text-xs mt-1 ${msg.senderType === 'admin' ? 'text-white/70' : 'text-gray-400'}`}>
                          {formatTime(msg.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </CardContent>

              <div className="p-4 border-t bg-white">
                <div className="flex gap-2">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type your reply..."
                    className="flex-1"
                    disabled={sending}
                  />
                  <Button onClick={handleSendMessage} disabled={!inputValue.trim() || sending}>
                    {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 mr-1" />}
                    Send
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg">Select a conversation to start chatting</p>
                <p className="text-sm mt-2">Messages will appear in real-time</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
