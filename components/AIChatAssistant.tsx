'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageSquare, X, Send, Sparkles, Loader2, Minimize2, ArrowLeft, Phone, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
  isAction?: boolean
}

export function AIChatAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [showLiveChat, setShowLiveChat] = useState(false) // New state for internal handoff
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hi! I\'m your Shopping Assistant. Ask me about products, sizing, or order status!',
      timestamp: Date.now()
    }
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isOpen, showLiveChat])

  const handleSend = async () => {
    if (!input.trim()) return

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now()
    }

    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsTyping(true)

    // Simulate AI response
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input })
      })

      if (res.ok) {
        const data = await res.json()
        const aiMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.response,
          timestamp: Date.now()
        }
        setMessages(prev => [...prev, aiMsg])
      } else {
         setTimeout(() => {
            const aiMsg: Message = {
              id: (Date.now() + 1).toString(),
              role: 'assistant',
              content: "I can help with that! We have great options in our latest collection.",
              timestamp: Date.now()
            }
            setMessages(prev => [...prev, aiMsg])
         }, 1000)
      }
    } catch (error) {
       console.error("Chat error", error)
       setTimeout(() => {
          const aiMsg: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: "I'm having trouble connecting right now. Please try again later.",
            timestamp: Date.now()
          }
          setMessages(prev => [...prev, aiMsg])
       }, 1000)
    } finally {
      setIsTyping(false)
      
      const lowerInput = input.toLowerCase()
      if (lowerInput.includes('human') || lowerInput.includes('admin') || lowerInput.includes('support') || lowerInput.includes('chat with person')) {
        setTimeout(() => {
          setMessages(prev => [...prev, {
            id: 'system_' + Date.now(),
            role: 'assistant',
            content: 'Would you like to speak with a human support agent?',
            timestamp: Date.now(),
            isAction: true
          }])
        }, 1500)
      }
    }
  }

  // New Handoff Logic: Switch view internally instead of closing
  const openLiveChat = () => {
    setShowLiveChat(true)
  }

  const handleWhatsAppClick = () => {
    const phoneNumber = '8801991523289'
    const message = encodeURIComponent("Hi! I need to speak with a human agent.")
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank')
  }

  return (
    <div className="fixed bottom-20 md:bottom-24 right-4 md:right-6 z-[45] flex flex-col items-end pointer-events-none">
      <AnimatePresence>
        {isOpen && !isMinimized && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="pointer-events-auto bg-white dark:bg-gray-900 w-[320px] sm:w-[380px] h-[500px] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col mb-4"
          >
            {/* Header */}
            <div className={`p-4 flex items-center justify-between text-white transition-colors duration-300 ${showLiveChat ? 'bg-green-600' : 'bg-gradient-to-r from-blue-600 to-indigo-600'}`}>
              <div className="flex items-center gap-2">
                {showLiveChat ? (
                  <button onClick={() => setShowLiveChat(false)} className="hover:bg-white/20 p-1 rounded-full mr-1">
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                ) : (
                  <div className="bg-white/20 p-1.5 rounded-full">
                    <Sparkles className="w-4 h-4" />
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-sm">{showLiveChat ? 'Live Support Team' : 'Shopping Assistant'}</h3>
                  <p className="text-xs text-blue-100 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                    Online
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setIsMinimized(true)}
                  className="p-1.5 hover:bg-white/20 rounded-lg transition"
                >
                  <Minimize2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:bg-white/20 rounded-lg transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Content Area - Switch between AI Chat and Live Support */}
            {showLiveChat ? (
              <div className="flex-1 flex flex-col p-6 bg-gray-50 dark:bg-gray-900 overflow-y-auto">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">Connect with a Human</h3>
                  <p className="text-sm text-gray-500">Our support team is available on WhatsApp to help you personally.</p>
                </div>

                <div className="space-y-4">
                  <button 
                    onClick={handleWhatsAppClick}
                    className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white p-4 rounded-xl flex items-center justify-center gap-3 transition-all shadow-sm hover:shadow-md group"
                  >
                    <MessageSquare className="w-5 h-5 fill-current" />
                    <span className="font-bold">Chat on WhatsApp</span>
                  </button>
                  
                  <div className="text-center text-xs text-gray-400 my-2">OR CALL US DIRECTLY</div>

                  <a href="tel:+8801991523289" className="w-full bg-white dark:bg-gray-800 border hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 p-4 rounded-xl flex items-center justify-center gap-3 transition-colors">
                    <Phone className="w-5 h-5 text-gray-500" />
                    <span className="font-medium">+880 199 152 3289</span>
                  </a>

                  <a href="mailto:support@silkmartbd.com" className="w-full bg-white dark:bg-gray-800 border hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 p-4 rounded-xl flex items-center justify-center gap-3 transition-colors">
                    <Mail className="w-5 h-5 text-gray-500" />
                    <span className="font-medium">support@silkmartbd.com</span>
                  </a>
                </div>
              </div>
            ) : (
              // Regular AI Chat Interface
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900/50">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex flex-col w-full mb-2",
                        msg.role === 'user' ? "items-end" : "items-start"
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-sm",
                          msg.role === 'user' 
                            ? "bg-blue-600 text-white rounded-tr-none" 
                            : "bg-white dark:bg-gray-800 border text-gray-800 dark:text-gray-200 rounded-tl-none"
                        )}
                      >
                        {msg.content}
                        <span className="text-[10px] opacity-70 block text-right mt-1">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      
                      {/* Action Button for System Messages */}
                      {(msg as any).isAction && (
                        <div className="mt-2 ml-2">
                          <Button 
                            size="sm" 
                            onClick={openLiveChat}
                            className="bg-green-600 hover:bg-green-700 text-white text-xs"
                          >
                            <MessageSquare className="w-3 h-3 mr-1" />
                            Connect to Live Chat
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex justify-start w-full">
                      <div className="bg-white dark:bg-gray-800 border rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
                        <div className="flex gap-1">
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
                <div className="p-3 border-t bg-white dark:bg-gray-900">
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault()
                      handleSend()
                    }}
                    className="flex gap-2"
                  >
                    <Input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Ask about products..."
                      className="rounded-full bg-gray-50 dark:bg-gray-800 border-gray-200 focus-visible:ring-blue-600"
                    />
                    <Button 
                      type="submit" 
                      size="icon" 
                      className="rounded-full bg-blue-600 hover:bg-blue-700 shrink-0"
                      disabled={!input.trim() || isTyping}
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </form>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <div className="pointer-events-auto">
        <AnimatePresence mode="wait">
          {!isOpen || isMinimized ? (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setIsOpen(true)
                setIsMinimized(false)
              }}
              className="w-12 h-12 md:w-14 md:h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg shadow-blue-600/30 flex items-center justify-center relative group"
            >
              <MessageSquare className="w-5 h-5 md:w-6 md:h-6" />
              <span className="absolute right-0 top-0 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
              
              {/* Tooltip */}
              <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs px-3 py-1.5 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none">
                Need help? Chat with AI
              </span>
            </motion.button>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  )
}
