'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageSquare, X, Send, Sparkles, Loader2, Minimize2, ArrowLeft, Phone, Mail, User, Bot } from 'lucide-react'
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
  action?: {
    type: 'show_product' | 'show_category' | 'open_live_chat'
    payload: any
  }
}

export function AIChatAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hi! I\'m "Silk Lite", your intelligent shopping companion. How can I make your experience amazing today?',
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
    if (isOpen) scrollToBottom()
  }, [messages, isOpen, isTyping])

  const handleSend = async () => {
    if (!input.trim()) return

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now()
    }

    setMessages(prev => [...prev, userMsg])
    const currentInput = input
    setInput('')
    setIsTyping(true)

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: currentInput }),
        credentials: 'include'
      })

      if (res.ok) {
        const data = await res.json()
        const aiMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.response,
          timestamp: Date.now(),
          action: data.action 
        }

        if (data.action?.type === 'open_live_chat') {
           setTimeout(() => openLiveChat(), 3000); 
        }

        setMessages(prev => [...prev, aiMsg])
      } else {
         const errorData = await res.json().catch(() => ({}))
         const aiMsg: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: `⚠️ Assistant encountered a temporary hiccup: ${errorData.error || res.statusText || 'Connection failed'}.`,
            timestamp: Date.now()
          }
          setMessages(prev => [...prev, aiMsg])
      }
    } catch (error) {
       console.error("Chat error", error)
       const aiMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: "I'm having a little trouble connecting to my central brain. Please try again in a moment!",
          timestamp: Date.now()
        }
        setMessages(prev => [...prev, aiMsg])
    } finally {
      setIsTyping(false)
    }
  }

  const openLiveChat = () => {
    const recentHistory = messages.slice(-4).map(m => `${m.role === 'user' ? 'User' : 'AI'}: ${m.content}`).join('\n')
    window.dispatchEvent(new CustomEvent('open-internal-chat', { 
      detail: { context: recentHistory } 
    }))
    setIsOpen(false)
  }

  const addToCart = (product: any) => {
    window.location.href = `/product/${product.slug}`
  }

  return (
    <div className="fixed bottom-20 md:bottom-24 right-4 md:right-6 z-[45] flex flex-col items-end font-sans">
      <AnimatePresence>
        {isOpen && !isMinimized && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 40, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.9, y: 40, filter: 'blur(10px)' }}
            className="pointer-events-auto w-[340px] sm:w-[400px] h-[550px] rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl border border-white/20 dark:border-gray-800/20 overflow-hidden flex flex-col mb-4 ring-1 ring-black/5"
          >
            {/* Elegant Header */}
            <div className="p-5 flex items-center justify-between bg-gradient-to-br from-indigo-600 via-blue-600 to-blue-700 text-white relative overflow-hidden">
               {/* Decorative Circles */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-400/20 rounded-full blur-2xl -ml-12 -mb-12" />
              
               <div className="flex items-center gap-3 relative z-10">
                <div className="relative">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-inner">
                    <Sparkles className="w-5 h-5 text-blue-100" />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-indigo-600 rounded-full animate-pulse" />
                </div>
                <div>
                  <h3 className="font-bold text-base tracking-tight">Silk Lite</h3>
                  <p className="text-[10px] text-blue-100/80 font-medium uppercase tracking-wider flex items-center gap-1">
                    Truly Intelligent Companion
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 relative z-10">
                <button onClick={() => setIsMinimized(true)} className="p-2 hover:bg-white/10 rounded-xl transition-all duration-300 active:scale-95"><Minimize2 className="w-4 h-4 opacity-80" /></button>
                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-xl transition-all duration-300 active:scale-95"><X className="w-4 h-4 opacity-80" /></button>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6 scroll-smooth custom-scrollbar bg-transparent">
              {messages.map((msg) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  key={msg.id} 
                  className={cn("flex flex-col w-full", msg.role === 'user' ? "items-end" : "items-start")}
                >
                  <div className={cn(
                    "max-w-[85%] rounded-[1.5rem] px-5 py-3 text-[14px] leading-relaxed relative group",
                    msg.role === 'user' 
                      ? "bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-tr-none shadow-lg shadow-blue-600/20" 
                      : "bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-800 dark:text-gray-100 rounded-tl-none shadow-sm"
                  )}>
                    <span className="whitespace-pre-wrap">{msg.content}</span>
                    <span className={cn(
                      "text-[9px] font-medium mt-1.5 block opacity-50",
                      msg.role === 'user' ? "text-right text-blue-100" : "text-left text-gray-500"
                    )}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  
                  {/* Actions (Product/Category Cards) */}
                  <AnimatePresence>
                    {msg.action?.type === 'show_product' && (
                      <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="mt-3 ml-2 p-3 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-2xl shadow-xl w-[240px] group transition-all hover:shadow-2xl"
                      >
                         {msg.action.payload.images && (
                           <div className="w-full h-32 bg-gray-50 dark:bg-gray-900 rounded-xl mb-3 overflow-hidden relative">
                              <img 
                                src={JSON.parse(msg.action.payload.images)[0] || '/placeholder.png'} 
                                alt={msg.action.payload.name} 
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                              />
                               <div className="absolute top-2 right-2 bg-white/90 dark:bg-black/80 backdrop-blur-sm px-2 py-1 rounded-lg text-[10px] font-bold shadow-sm">
                                ৳{msg.action.payload.salePrice || msg.action.payload.basePrice}
                              </div>
                           </div>
                         )}
                         <h4 className="font-bold text-sm truncate dark:text-white px-1">{msg.action.payload.name}</h4>
                         <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 px-1 truncate">
                           Premium Collection • In Stock
                         </p>
                         <Button 
                            variant="default"
                            size="sm" 
                            className="w-full mt-3 text-[11px] h-8 rounded-xl bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/10 transition-all active:scale-95" 
                            onClick={() => addToCart(msg.action?.payload)}
                         >
                           Acquire Now
                         </Button>
                      </motion.div>
                    )}

                    {msg.action?.type === 'show_category' && (
                      <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="mt-3 ml-2 p-2 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-2xl shadow-xl w-[240px] overflow-hidden group"
                      >
                         {msg.action.payload.image && (
                           <div className="w-full h-28 bg-gray-100 dark:bg-gray-900 rounded-xl mb-1 overflow-hidden relative shadow-inner">
                              <img src={msg.action.payload.image} alt={msg.action.payload.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-3">
                                <span className="text-white font-bold text-sm drop-shadow-lg tracking-tight">{msg.action.payload.name}</span>
                              </div>
                           </div>
                         )}
                         <Button 
                            variant="ghost" 
                            size="sm" 
                            className="w-full mt-1 text-[11px] h-8 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 font-bold hover:bg-indigo-100 transition-all active:scale-95" 
                            onClick={() => window.location.href = `/shop?category=${msg.action?.payload.slug}`}
                         >
                           Explore Collection
                         </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start w-full">
                  <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-[1.5rem] rounded-tl-none px-5 py-3 shadow-sm">
                    <div className="flex gap-1.5 items-center h-4">
                      <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                      <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                      <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 bg-indigo-600 rounded-full" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} className="h-2" />
            </div>

            {/* Quick Action Chips */}
            <div className="px-4 py-3 bg-white/50 dark:bg-gray-900/50 backdrop-blur-md border-t border-gray-100/30 dark:border-gray-800/30 flex gap-2 overflow-x-auto no-scrollbar scroll-smooth">
              {[
                { label: '📦 Track Order', text: 'I want to track my order' },
                { label: '🔥 Offers', text: 'Any active coupons?' },
                { label: '👑 Best Sellers', text: 'Show me best selling products' },
                { label: '👚 New Arrivals', text: 'Show me new arrivals' }
              ].map((chip) => (
                <button
                  key={chip.label}
                  onClick={() => { setInput(chip.text); handleSend(); }} 
                  className="flex-shrink-0 text-[11px] font-semibold px-4 py-2 bg-white dark:bg-gray-800 border border-blue-100 dark:border-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white transition-all duration-300 shadow-sm whitespace-nowrap active:scale-90"
                >
                  {chip.label}
                </button>
              ))}
            </div>

            {/* Premium Input */}
            <div className="p-4 border-t border-gray-100/50 dark:border-gray-800/50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg">
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                className="flex gap-2 bg-gray-50 dark:bg-gray-800/50 p-1.5 rounded-[1.5rem] border border-gray-200/50 dark:border-gray-700/50 focus-within:border-blue-500/50 focus-within:ring-4 focus-within:ring-blue-500/5 transition-all duration-300 shadow-inner"
              >
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask Silk Lite..."
                  className="border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-sm h-10 px-4 placeholder:text-gray-400"
                />
                <Button 
                  type="submit" 
                  size="icon" 
                  className="rounded-2xl bg-blue-600 hover:bg-indigo-600 text-white shrink-0 shadow-lg shadow-blue-500/20 active:scale-90 transition-all duration-300"
                  disabled={!input.trim() || isTyping}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Button */}
      <div className="pointer-events-auto">
        <AnimatePresence mode="wait">
          {!isOpen || isMinimized ? (
            <motion.button
              initial={{ scale: 0, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0, opacity: 0, rotate: 180 }}
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => { setIsOpen(true); setIsMinimized(false); }}
              className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-indigo-600 to-blue-600 text-white rounded-[1.75rem] shadow-[0_10px_40px_rgba(37,99,235,0.4)] flex items-center justify-center relative group backdrop-blur-md ring-4 ring-white/20 dark:ring-gray-800/20 transition-all duration-500"
            >
              <Bot className="w-7 h-7 md:w-8 md:h-8" />
              <div className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-white dark:border-gray-900"></span>
              </div>
              
              {/* Tooltip */}
              <div className="absolute right-full mr-5 top-1/2 -translate-y-1/2 flex items-center group-hover:opacity-100 opacity-0 transition-all duration-300 pointer-events-auto">
                <div className="bg-gray-900/90 backdrop-blur-sm text-white text-[11px] font-bold px-4 py-2 rounded-2xl shadow-xl whitespace-nowrap border border-white/10">
                  How can Silk Lite help?
                </div>
                <div className="w-2 h-2 bg-gray-900/90 rotate-45 -ml-1 border-r border-t border-white/10" />
              </div>
            </motion.button>
          ) : null}
        </AnimatePresence>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.05); border-radius: 10px; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); }
      `}</style>
    </div>
  )
}
