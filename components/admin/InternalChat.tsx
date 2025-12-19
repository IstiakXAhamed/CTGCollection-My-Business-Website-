'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, Send, Plus, User as UserIcon, MoreVertical, Paperclip, CheckCheck, Loader2, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { formatDistanceToNow } from 'date-fns'

interface User {
  id: string
  name: string
  email: string
  role: string
  avatar?: string
}

interface Message {
  id: string
  content: string
  createdAt: string
  senderId: string
  isRead: boolean
  sender?: User
}

interface Conversation {
  user: User
  lastMessage: {
    content: string
    createdAt: string
    isRead: boolean
    amISender: boolean
  }
  unreadCount: number
}

export function InternalChat() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeUser, setActiveUser] = useState<User | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  
  // New Chat Dialog
  const [isNewChatOpen, setIsNewChatOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<User[]>([])
  const [searching, setSearching] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [currentUserId, setCurrentUserId] = useState<string>('')

  // 1. Fetch Conversations & Current User
  const fetchConversations = async () => {
    try {
      const res = await fetch('/api/internal-chat/conversations')
      if (res.ok) {
        const data = await res.json()
        setConversations(data.conversations || [])
      }
    } catch (error) {
      console.error('Failed to fetch conversations')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Get current user ID once
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (d.user) setCurrentUserId(d.user.id)
    })

    fetchConversations()
    const interval = setInterval(fetchConversations, 10000) // Poll conversations every 10s
    return () => clearInterval(interval)
  }, [])

  // 2. Fetch Messages when Active User changes
  const fetchMessages = async () => {
    if (!activeUser) return
    try {
      const res = await fetch(`/api/internal-chat/messages?userId=${activeUser.id}`)
      if (res.ok) {
        const data = await res.json()
        setMessages(data.messages || [])
        // Also refresh conversations to clear unread count
        fetchConversations()
      }
    } catch (error) {
      console.error('Failed to fetch messages')
    }
  }

  useEffect(() => {
    fetchMessages()
    if (activeUser) {
      const interval = setInterval(fetchMessages, 3000) // Poll messages every 3s
      return () => clearInterval(interval)
    }
  }, [activeUser])

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // 3. Send Message
  const handleSend = async () => {
    if (!activeUser || !inputText.trim()) return

    const tempId = Date.now().toString()
    const tempMsg: Message = {
      id: tempId,
      content: inputText,
      createdAt: new Date().toISOString(),
      senderId: currentUserId,
      isRead: false
    }

    // Optimistic update
    setMessages(prev => [...prev, tempMsg])
    setInputText('')
    setSending(true)

    try {
      const res = await fetch('/api/internal-chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiverId: activeUser.id,
          content: tempMsg.content
        })
      })

      if (res.ok) {
        // Refresh to get real ID and status
        fetchMessages()
        // Refresh conversations to show top
        fetchConversations()
      } else {
        // revert if failed? 
      }
    } catch (error) {
      console.error('Send failed')
    } finally {
      setSending(false)
    }
  }

  // 4. Search Users
  useEffect(() => {
    if (!isNewChatOpen || !searchQuery) {
      setSearchResults([])
      return
    }

    const timer = setTimeout(async () => {
      setSearching(true)
      try {
        const res = await fetch(`/api/internal-chat/users?query=${searchQuery}`)
        if (res.ok) {
          const data = await res.json()
          setSearchResults(data.users || [])
        }
      } finally {
        setSearching(false)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [searchQuery, isNewChatOpen])

  const startChat = (user: User) => {
    setActiveUser(user)
    setIsNewChatOpen(false)
    // Add to conversations list immediately if not exists
    if (!conversations.find(c => c.user.id === user.id)) {
      setConversations(prev => [{
        user,
        lastMessage: { content: '', createdAt: new Date().toISOString(), isRead: true, amISender: true },
        unreadCount: 0
      }, ...prev])
    }
  }

  return (
    <div className="flex h-[600px] w-full border rounded-xl overflow-hidden bg-white shadow-sm relative">
      {/* Sidebar - Conversations (Full width on mobile, hidden if chat open) */}
      <div className={`${activeUser ? 'hidden md:flex' : 'flex'} w-full md:w-80 border-r bg-gray-50 flex-col md:flex`}>
        <div className="p-4 border-b flex items-center justify-between bg-white">
          <h2 className="font-semibold text-gray-800">Messages</h2>
          <Dialog open={isNewChatOpen} onOpenChange={setIsNewChatOpen}>
            <DialogTrigger asChild>
              <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full hover:bg-gray-100">
                <Plus className="h-5 w-5 text-blue-600" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New Message</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search people..." 
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <ScrollArea className="h-[300px]">
                  {searching ? (
                    <div className="p-4 text-center text-sm text-gray-500">Searching...</div>
                  ) : searchResults.length > 0 ? (
                    <div className="space-y-2">
                       {searchResults.map(user => (
                         <div 
                           key={user.id} 
                           onClick={() => startChat(user)}
                           className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 cursor-pointer transition select-none"
                         >
                           <Avatar className="h-10 w-10">
                             <AvatarFallback className="bg-blue-100 text-blue-600">
                               {user.name.charAt(0)}
                             </AvatarFallback>
                           </Avatar>
                           <div>
                             <p className="font-medium text-sm">{user.name}</p>
                             <div className="flex gap-2 items-center">
                               <Badge variant="outline" className="text-[10px] py-0 h-4">{user.role}</Badge>
                               <span className="text-xs text-gray-400">{user.email}</span>
                             </div>
                           </div>
                         </div>
                       ))}
                    </div>
                  ) : searchQuery ? (
                    <div className="p-4 text-center text-sm text-gray-500">No users found.</div>
                  ) : (
                    <div className="p-4 text-center text-sm text-gray-400">Type to search admins or sellers.</div>
                  )}
                </ScrollArea>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        {/* Conversation List */}
        <ScrollArea className="flex-1">
          {conversations.length === 0 && !loading ? (
             <div className="p-8 text-center text-sm text-gray-500">
               No messages yet.
               <br/>Start a new chat!
             </div>
          ) : (
            <div className="flex flex-col">
              {conversations.map(conv => (
                <div 
                  key={conv.user.id}
                  onClick={() => setActiveUser(conv.user)}
                  className={`p-4 border-b flex gap-3 cursor-pointer transition hover:bg-gray-100 ${activeUser?.id === conv.user.id ? 'bg-blue-50 border-l-4 border-l-blue-600 hover:bg-blue-50' : 'border-l-4 border-l-transparent'}`}
                >
                  <Avatar>
                    <AvatarFallback className={activeUser?.id === conv.user.id ? 'bg-blue-200 text-blue-800' : 'bg-gray-200'}>
                      {conv.user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <span className={`font-medium truncate ${conv.unreadCount > 0 ? 'text-black' : 'text-gray-700'}`}>
                        {conv.user.name}
                      </span>
                      {conv.lastMessage.createdAt && (
                        <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">
                           {formatDistanceToNow(new Date(conv.lastMessage.createdAt), { addSuffix: false })}
                        </span>
                      )}
                    </div>
                    <div className="flex justify-between items-center">
                      <p className={`text-xs truncate max-w-[140px] ${conv.unreadCount > 0 ? 'font-semibold text-gray-900' : 'text-gray-500'}`}>
                        {conv.lastMessage.amISender && 'You: '}{conv.lastMessage.content}
                      </p>
                      {conv.unreadCount > 0 && (
                        <span className="h-5 w-5 bg-blue-600 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Main Chat Area (Full width on mobile, hidden if no chat active) */}
      <div className={`${!activeUser ? 'hidden md:flex' : 'flex'} flex-1 flex-col bg-slate-50 w-full`}>
        {activeUser ? (
          <>
            {/* Header */}
            <div className="h-16 border-b bg-white flex items-center justify-between px-6 shadow-sm">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" className="md:hidden -ml-2" onClick={() => setActiveUser(null)}>
                   <ArrowLeft className="h-5 w-5" />
                </Button>
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-blue-600 text-white">
                    {activeUser.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-gray-800">{activeUser.name}</h3>
                  <div className="flex items-center gap-2">
                     <div className="h-2 w-2 rounded-full bg-green-500"></div>
                     <span className="text-xs text-gray-500 capitalize">{activeUser.role}</span>
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-5 w-5 text-gray-500" />
              </Button>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="flex flex-col gap-4">
                {messages.map((msg, idx) => {
                  const isMe = msg.senderId === currentUserId
                  return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div 
                        className={`max-w-[70%] p-3 rounded-2xl shadow-sm text-sm ${
                          isMe 
                            ? 'bg-blue-600 text-white rounded-br-none' 
                            : 'bg-white text-gray-800 border rounded-bl-none'
                        }`}
                      >
                        <p>{msg.content}</p>
                        <div className={`text-[10px] mt-1 flex items-center justify-end gap-1 ${isMe ? 'text-blue-200' : 'text-gray-400'}`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {isMe && (
                             msg.isRead ? <CheckCheck className="h-3 w-3" /> : <span className="text-[10px]">✓</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="p-4 bg-white border-t">
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-600">
                  <Paperclip className="h-5 w-5" />
                </Button>
                <Input 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                  placeholder="Type a message..."
                  className="flex-1 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                />
                <Button onClick={handleSend} disabled={!inputText.trim()} className="bg-blue-600 hover:bg-blue-700 text-white w-10 h-10 p-0 rounded-lg">
                  <Send className="h-5 w-5 ml-0.5" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <UserIcon className="h-10 w-10 text-gray-300" />
            </div>
            <p className="font-medium">Select a conversation to start chatting</p>
          </div>
        )}
      </div>
    </div>
  )
}
