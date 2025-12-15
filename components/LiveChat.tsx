'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Send, Minimize2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Message {
  id: string
  message: string
  senderType: 'customer' | 'admin' | 'support' | 'system'
  senderName: string
  createdAt: string
}

// Generate unique session ID PER BROWSER (not shared across users)
const getSessionId = () => {
  if (typeof window === 'undefined') return ''
  
  // Create a truly unique session ID that includes timestamp and random
  let sessionId = sessionStorage.getItem('chat_session_id')
  if (!sessionId) {
    sessionId = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 12)}`
    sessionStorage.setItem('chat_session_id', sessionId)
  }
  return sessionId
}

export function LiveChat() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [isAdmin, setIsAdmin] = useState(false)
  const [chatStatus, setChatStatus] = useState<'online' | 'away' | 'offline'>('online')
  const [sessionId, setSessionId] = useState('')
  const [customerName, setCustomerName] = useState('Guest')
  const [customerEmail, setCustomerEmail] = useState('')
  const [lastMessageTime, setLastMessageTime] = useState<string | null>(null)
  const [initialized, setInitialized] = useState(false)
  const [cooldownEnd, setCooldownEnd] = useState<number | null>(null)
  const [cooldownTimeLeft, setCooldownTimeLeft] = useState<string | null>(null)
  const [adminRestriction, setAdminRestriction] = useState<{ until: number; reason?: string } | null>(null)
  const [restrictionTimeLeft, setRestrictionTimeLeft] = useState<string | null>(null)
  // Activity-based polling
  const [hasChatStarted, setHasChatStarted] = useState(false)
  const [lastActivityTime, setLastActivityTime] = useState<number>(Date.now())
  const INACTIVITY_TIMEOUT = 5 * 60 * 1000 // 5 minutes
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const pollingRef = useRef<NodeJS.Timeout | null>(null)

  // Hide chat on admin routes - check AFTER all hooks
  const isAdminRoute = pathname?.startsWith('/admin')

  // Check cooldown on mount
  useEffect(() => {
    const cooldownTimestamp = localStorage.getItem('chat_cooldown_end')
    if (cooldownTimestamp) {
      const endTime = parseInt(cooldownTimestamp)
      if (endTime > Date.now()) {
        setCooldownEnd(endTime)
      } else {
        localStorage.removeItem('chat_cooldown_end')
      }
    }
  }, [])

  // Cooldown timer
  useEffect(() => {
    if (!cooldownEnd) {
      setCooldownTimeLeft(null)
      return
    }

    const updateCooldown = () => {
      const remaining = cooldownEnd - Date.now()
      if (remaining <= 0) {
        setCooldownEnd(null)
        setCooldownTimeLeft(null)
        localStorage.removeItem('chat_cooldown_end')
        // Generate new session ID
        sessionStorage.removeItem('chat_session_id')
        return
      }
      const minutes = Math.floor(remaining / 60000)
      const seconds = Math.floor((remaining % 60000) / 1000)
      setCooldownTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`)
    }

    updateCooldown()
    const timer = setInterval(updateCooldown, 1000)
    return () => clearInterval(timer)
  }, [cooldownEnd])

  // Check for admin restrictions
  useEffect(() => {
    if (!sessionId) return

    const checkRestriction = async () => {
      try {
        const res = await fetch(`/api/admin/chat/restrict?sessionId=${sessionId}`)
        if (res.ok) {
          const data = await res.json()
          if (data.restricted) {
            const until = new Date(data.restrictedUntil).getTime()
            setAdminRestriction({ until, reason: data.reason })
          } else {
            setAdminRestriction(null)
            setRestrictionTimeLeft(null)
          }
        }
      } catch (error) {
        console.log('Restriction check failed')
      }
    }

    checkRestriction()
    const interval = setInterval(checkRestriction, 10000) // Check every 10 seconds
    return () => clearInterval(interval)
  }, [sessionId])

  // Admin restriction timer
  useEffect(() => {
    if (!adminRestriction) {
      setRestrictionTimeLeft(null)
      return
    }

    const updateTimer = () => {
      const remaining = adminRestriction.until - Date.now()
      if (remaining <= 0) {
        setAdminRestriction(null)
        setRestrictionTimeLeft(null)
        return
      }
      const minutes = Math.floor(remaining / 60000)
      const seconds = Math.floor((remaining % 60000) / 1000)
      setRestrictionTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`)
    }

    updateTimer()
    const timer = setInterval(updateTimer, 1000)
    return () => clearInterval(timer)
  }, [adminRestriction])

  // Initialize - get user info and session
  useEffect(() => {
    const init = async () => {
      // Check if admin - don't show chat for admins
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' })
        if (res.ok) {
          const data = await res.json()
          if (data.authenticated && data.user) {
            if (data.user.role === 'admin' || data.user.role === 'superadmin') {
              setIsAdmin(true)
              return
            }
            // Use logged-in user's name and email
            setCustomerName(data.user.name || 'Customer')
            setCustomerEmail(data.user.email || '')
          }
        }
      } catch (error) {
        console.log('Auth check failed')
      }
      
      // Generate unique session ID for this browser tab
      const sid = getSessionId()
      setSessionId(sid)
      
      // Fetch chat status from database API
      try {
        const settingsRes = await fetch('/api/settings')
        if (settingsRes.ok) {
          const settingsData = await settingsRes.json()
          setChatStatus(settingsData.chatStatus as 'online' | 'away' | 'offline')
        }
      } catch (error) {
        console.log('Using default chat status')
      }

      // Add welcome message
      setMessages([{
        id: 'welcome',
        message: 'Hello! 👋 Welcome to CTG Collection. How can we help you today?',
        senderType: 'support',
        senderName: 'Support',
        createdAt: new Date().toISOString()
      }])

      setInitialized(true)
    }
    
    init()
  }, [])

  // Poll for admin replies ONLY for this session
  const fetchMessages = useCallback(async () => {
    if (!sessionId || isAdmin || cooldownEnd) return
    
    try {
      const url = lastMessageTime 
        ? `/api/chat/${sessionId}?after=${encodeURIComponent(lastMessageTime)}`
        : `/api/chat/${sessionId}`
      
      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        if (data.messages && data.messages.length > 0) {
          // Check for system close message (session closed by admin)
          const systemMsgs = data.messages.filter((m: Message) => m.senderType === 'system')
          if (systemMsgs.length > 0) {
            // Session was closed - add goodbye message and start cooldown
            setMessages(prev => {
              const existingIds = new Set(prev.map(m => m.id))
              const newMsgs = systemMsgs.filter((m: Message) => !existingIds.has(m.id))
              if (newMsgs.length > 0) {
                return [...prev, ...newMsgs]
              }
              return prev
            })
            
            // Start 5 minute cooldown
            const cooldownEndTime = Date.now() + 5 * 60 * 1000 // 5 minutes
            localStorage.setItem('chat_cooldown_end', cooldownEndTime.toString())
            setCooldownEnd(cooldownEndTime)
            
            // Stop polling
            if (pollingRef.current) {
              clearInterval(pollingRef.current)
            }
            return
          }
          
          // Only get admin messages for THIS session
          setMessages(prev => {
            const existingIds = new Set(prev.map(m => m.id))
            const newMsgs = data.messages.filter((m: Message) => 
              !existingIds.has(m.id) && m.senderType === 'admin'
            )
            
            if (newMsgs.length > 0) {
              if (!isOpen || isMinimized) {
                setUnreadCount(p => p + newMsgs.length)
              }
              // Update activity time when receiving admin messages
              setLastActivityTime(Date.now())
              return [...prev, ...newMsgs]
            }
            return prev
          })
          
          // Update last message time
          const adminMsgs = data.messages.filter((m: Message) => m.senderType === 'admin')
          if (adminMsgs.length > 0) {
            setLastMessageTime(adminMsgs[adminMsgs.length - 1].createdAt)
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch messages')
    }
  }, [sessionId, lastMessageTime, isAdmin, isOpen, isMinimized, cooldownEnd])

  // Start polling for admin responses - ONLY when chat has started and there's activity
  useEffect(() => {
    // Don't poll if:
    // - No session ID
    // - User is admin
    // - Not initialized
    // - Chat hasn't started (no customer messages sent)
    // - Been inactive for more than 5 minutes
    if (!sessionId || isAdmin || !initialized || !hasChatStarted) {
      if (pollingRef.current) {
        clearInterval(pollingRef.current)
        pollingRef.current = null
      }
      return
    }

    // Check for inactivity
    const checkInactivity = () => {
      const timeSinceLastActivity = Date.now() - lastActivityTime
      if (timeSinceLastActivity > INACTIVITY_TIMEOUT) {
        // Stop polling due to inactivity
        if (pollingRef.current) {
          clearInterval(pollingRef.current)
          pollingRef.current = null
        }
        console.log('Chat polling stopped due to inactivity')
        return true
      }
      return false
    }

    // Only start polling if not inactive
    if (!checkInactivity()) {
      pollingRef.current = setInterval(() => {
        // Check inactivity on each poll
        if (!checkInactivity()) {
          fetchMessages()
        }
      }, 3000) // Poll every 3 seconds when active
    }
    
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current)
    }
  }, [sessionId, isAdmin, initialized, fetchMessages, hasChatStarted, lastActivityTime, INACTIVITY_TIMEOUT])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom()
    }
  }, [messages.length])

  const handleSend = async () => {
    if (!inputValue.trim() || !sessionId) return

    const messageText = inputValue
    const tempId = `temp_${Date.now()}`
    
    // Mark chat as started and update activity time (enables polling)
    setHasChatStarted(true)
    setLastActivityTime(Date.now())
    
    // Add message to UI immediately
    const newMessage: Message = {
      id: tempId,
      message: messageText,
      senderType: 'customer',
      senderName: customerName,
      createdAt: new Date().toISOString()
    }

    setMessages(prev => [...prev, newMessage])
    setInputValue('')
    setIsTyping(true)

    // Send to server with user's real name
    try {
      const res = await fetch(`/api/chat/${sessionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          message: messageText,
          senderType: 'customer',
          senderName: customerName,
          customerEmail: customerEmail
        })
      })
      
      if (res.ok) {
        const data = await res.json()
        // Update with real ID from server
        setMessages(prev => 
          prev.map(m => m.id === tempId ? { ...m, id: data.message.id } : m)
        )
      }
    } catch (error) {
      console.error('Failed to send message:', error)
    }

    // Show auto-response
    setTimeout(() => {
      const autoResponses = [
        "Thank you for your message! Our team will get back to you shortly.",
        "Got it! We're looking into this for you.",
        "Thanks for reaching out! A support agent will respond soon."
      ]
      const randomResponse = autoResponses[Math.floor(Math.random() * autoResponses.length)]
      
      setMessages(prev => [...prev, {
        id: `auto_${Date.now()}`,
        message: randomResponse,
        senderType: 'support',
        senderName: 'Support',
        createdAt: new Date().toISOString()
      }])
      setIsTyping(false)
    }, 1500)
  }

  const handleOpen = () => {
    setIsOpen(true)
    setIsMinimized(false)
    setUnreadCount(0)
  }

  // Don't show for admins or on admin routes
  if (isAdmin || isAdminRoute) return null
  
  // Don't show if offline
  if (chatStatus === 'offline') return null

  const getStatusColor = () => {
    switch (chatStatus) {
      case 'online': return 'bg-green-400'
      case 'away': return 'bg-yellow-400'
      default: return 'bg-gray-400'
    }
  }

  const getStatusText = () => {
    switch (chatStatus) {
      case 'online': return 'Online'
      case 'away': return 'Away - Slow response'
      default: return 'Offline'
    }
  }

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <>
      {/* Floating Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleOpen}
            className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full shadow-lg flex items-center justify-center text-white hover:shadow-xl transition-shadow"
          >
            <MessageCircle className="w-7 h-7" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full text-xs flex items-center justify-center font-bold">
                {unreadCount}
              </span>
            )}
            <span className="absolute w-full h-full rounded-full bg-blue-600 animate-ping opacity-25" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1, height: isMinimized ? 'auto' : '500px' }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold">Live Support</h3>
                  <p className="text-xs text-white/80 flex items-center gap-1">
                    <span className={`w-2 h-2 ${getStatusColor()} rounded-full`} />
                    {getStatusText()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setIsMinimized(!isMinimized)} className="p-2 hover:bg-white/10 rounded-lg transition">
                  <Minimize2 className="w-4 h-4" />
                </button>
                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-lg transition">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${msg.senderType === 'customer' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[80%] p-3 rounded-2xl ${
                        msg.senderType === 'customer'
                          ? 'bg-blue-600 text-white rounded-br-none'
                          : 'bg-white shadow-sm rounded-bl-none'
                      }`}>
                        {msg.senderType !== 'customer' && (
                          <p className="text-xs font-semibold text-blue-600 mb-1">{msg.senderName}</p>
                        )}
                        <p className="text-sm">{msg.message}</p>
                        <p className={`text-xs mt-1 ${msg.senderType === 'customer' ? 'text-white/70' : 'text-gray-400'}`}>
                          {formatTime(msg.createdAt)}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                  
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-white shadow-sm p-3 rounded-2xl rounded-bl-none">
                        <div className="flex items-center gap-1">
                          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t bg-white">
                  {cooldownEnd && cooldownTimeLeft ? (
                    <div className="text-center py-4">
                      <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-2xl">⏳</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">Chat session ended</p>
                      <p className="text-xs text-gray-500">You can start a new chat in</p>
                      <p className="text-2xl font-bold text-blue-600 mt-1">{cooldownTimeLeft}</p>
                    </div>
                  ) : adminRestriction && restrictionTimeLeft ? (
                    <div className="text-center py-4">
                      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-2xl">🚫</span>
                      </div>
                      <p className="text-sm text-red-600 font-medium mb-1">Your chat has been restricted</p>
                      <p className="text-xs text-gray-500">{adminRestriction.reason || 'Policy violation'}</p>
                      <p className="text-xs text-gray-500 mt-2">You can send messages again in</p>
                      <p className="text-2xl font-bold text-red-600 mt-1">{restrictionTimeLeft}</p>
                    </div>
                  ) : (
                    <>
                      {chatStatus === 'away' && (
                        <p className="text-xs text-yellow-600 mb-2 text-center">⚠️ We're currently away. Expect delayed responses.</p>
                      )}
                      <div className="flex gap-2">
                        <Input
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                          placeholder="Type your message..."
                          className="flex-1 rounded-full"
                        />
                        <Button onClick={handleSend} size="icon" className="rounded-full bg-blue-600 hover:bg-blue-700" disabled={!inputValue.trim()}>
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-center text-gray-400 mt-2">
                        Chatting as {customerName}
                      </p>
                    </>
                  )}
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default LiveChat
