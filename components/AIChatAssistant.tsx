'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageSquare, X, Send, Sparkles, Loader2, Minimize2, ArrowLeft, Phone, Mail, User, Bot, Mic } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useCartStore } from '@/store/cart'
import { haptics } from '@/lib/haptics'
import { useAppStandalone } from '@/hooks/useAppStandalone'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
  isAction?: boolean
  actions?: {
    type: 'show_product' | 'show_category' | 'open_live_chat' | 'compare_products' | 'order_progress'
    payload: any
  }[]
}

const ActionCarousel = ({ actions }: { actions: Message['actions'] }) => {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(true)

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      setShowLeftArrow(scrollLeft > 10)
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10)
    }
  }

  useEffect(() => {
    checkScroll()
    const el = scrollRef.current
    if (el) {
      el.addEventListener('scroll', checkScroll)
      return () => el.removeEventListener('scroll', checkScroll)
    }
  }, [actions])

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const amount = 280
      scrollRef.current.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' })
    }
  }

  if (!actions) return null

  return (
    <div className="relative group/carousel w-full mt-4">
      {/* Arrows (PC only) */}
      <AnimatePresence>
        {showLeftArrow && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 bg-white/90 dark:bg-gray-800/90 shadow-xl rounded-full hidden md:flex items-center justify-center border border-gray-100 dark:border-gray-700 hover:bg-blue-600 hover:text-white transition-all -ml-3"
          >
            <ArrowLeft className="w-4 h-4" />
          </motion.button>
        )}
        {showRightArrow && actions.length > 1 && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 bg-white/90 dark:bg-gray-800/90 shadow-xl rounded-full hidden md:flex items-center justify-center border border-gray-100 dark:border-gray-700 hover:bg-blue-600 hover:text-white transition-all -mr-3"
          >
            <div className="rotate-180"><ArrowLeft className="w-4 h-4" /></div>
          </motion.button>
        )}
      </AnimatePresence>

      <div 
        ref={scrollRef}
        className="w-full overflow-x-auto no-scrollbar flex gap-4 pb-2 -mx-2 px-2 snap-x scroll-smooth"
      >
        {actions.map((act, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="snap-center shrink-0"
          >
            {act.type === 'show_product' && (
              <div className="p-4 bg-white/90 dark:bg-gray-800/90 border border-white dark:border-gray-700 rounded-[2rem] shadow-xl w-[260px] group transition-all hover:shadow-2xl">
                 {act.payload.images && (
                   <div className="w-full h-36 bg-gray-50 dark:bg-gray-900 rounded-2xl mb-4 overflow-hidden relative shadow-inner">
                      <img 
                        src={typeof act.payload.images === 'string' ? JSON.parse(act.payload.images)[0] : act.payload.images[0] || '/placeholder.png'} 
                        alt={act.payload.name} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
                      />
                       <div className="absolute top-3 right-3 bg-white/90 dark:bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-full text-[11px] font-black shadow-sm text-blue-600 dark:text-blue-400">
                        ৳{act.payload.salePrice || act.payload.basePrice}
                      </div>
                   </div>
                 )}
                 <div className="px-1">
                   <h4 className="font-bold text-sm truncate dark:text-white">{act.payload.name}</h4>
                   <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 font-bold uppercase tracking-widest">
                     Luxury Piece • In Stock
                   </p>
                   <Button 
                      variant="default"
                      size="sm" 
                      className="w-full mt-4 text-[12px] font-black h-10 rounded-2xl bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all active:scale-95" 
                      onClick={() => window.location.href = `/product/${act.payload.slug}`}
                   >
                     Experience Details
                   </Button>
                 </div>
              </div>
            )}

            {act.type === 'show_category' && (
              <div className="p-2 bg-white/90 dark:bg-gray-800/90 border border-white dark:border-gray-700 rounded-[2rem] shadow-xl w-[240px] overflow-hidden group hover:shadow-2xl transition-all">
                 {act.payload.image && (
                   <div className="w-full h-32 bg-gray-100 dark:bg-gray-900 rounded-[1.5rem] mb-2 overflow-hidden relative shadow-inner">
                      <img src={act.payload.image} alt={act.payload.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end p-4">
                        <span className="text-white font-black text-base drop-shadow-lg tracking-tight">{act.payload.name}</span>
                      </div>
                   </div>
                 )}
                 <div className="p-2">
                   <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full text-[11px] font-black h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 hover:bg-blue-100 transition-all active:scale-95" 
                      onClick={() => window.location.href = `/shop?category=${act.payload.slug}`}
                   >
                     Explore Collection
                   </Button>
                 </div>
              </div>
            )}

            {act.type === 'compare_products' && (
              <div className="p-5 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-[2.5rem] shadow-2xl w-[280px] text-white overflow-hidden relative group">
                  <Sparkles className="absolute top-4 right-4 w-12 h-12 opacity-10 group-hover:rotate-12 transition-transform duration-700" />
                  <h4 className="font-black text-sm uppercase tracking-widest opacity-80 mb-4">Smart Comparison</h4>
                  <div className="grid grid-cols-2 gap-3 items-center relative">
                    {act.payload.map((p: any, idx: number) => (
                      <div key={idx} className="flex flex-col items-center gap-2">
                        <div className="w-full aspect-square bg-white/20 rounded-2xl overflow-hidden border border-white/30 backdrop-blur-md">
                          <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                        </div>
                        <span className="text-[10px] font-black truncate w-full text-center">{p.name}</span>
                      </div>
                    ))}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-6 w-8 h-8 bg-white text-blue-600 rounded-full flex items-center justify-center font-black text-xs shadow-xl ring-2 ring-blue-400">VS</div>
                  </div>
                  <Button 
                    className="w-full mt-5 bg-white text-blue-600 hover:bg-gray-100 font-black rounded-2xl h-11"
                    onClick={() => window.location.href = `/product/${act.payload[0].slug}`}
                  >
                    Decide Now
                  </Button>
              </div>
            )}

            {act.type === 'order_progress' && (
              <div className="p-5 bg-white/95 dark:bg-gray-800/95 border border-white dark:border-gray-700 rounded-[2.5rem] shadow-xl w-[280px]">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Order Progress</span>
                  <span className="text-[10px] font-bold text-gray-400">#{act.payload.number}</span>
                </div>
                <div className="relative h-2 bg-gray-100 dark:bg-gray-900 rounded-full mb-3 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${act.payload.progress}%` }}
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-400 to-indigo-600 rounded-full"
                  />
                </div>
                <div className="flex justify-between text-[11px] font-black text-gray-800 dark:text-gray-200">
                  <span>{act.payload.status}</span>
                  <span className="text-blue-600">{act.payload.progress}%</span>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export function AIChatAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const isStandalone = useAppStandalone()
  const cart = useCartStore()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m so happy to see you. How can I help you find something wonderful today? ❤️',
      timestamp: Date.now()
    }
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isListening, setIsListening] = useState(false)
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
        body: JSON.stringify({ 
          message: currentInput,
          cartItems: cart.items.map(i => ({ name: i.name, quantity: i.quantity, price: i.price }))
        }),
        credentials: 'include'
      })

      if (res.ok) {
        const data = await res.json()
        const aiMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.response,
          timestamp: Date.now(),
          actions: data.actions 
        }

        if (data.actions?.some((a: any) => a.type === 'open_live_chat')) {
           setTimeout(() => openLiveChat(), 3000); 
        }

        // Trigger Haptic Pulse for proactive suggestions in Elite App
        if (isStandalone && data.actions && data.actions.length > 0) {
          haptics.pulse()
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

  const startVoiceRecognition = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert("Voice recognition is not supported in this browser.")
      return
    }

    const recognition = new (window as any).webkitSpeechRecognition()
    recognition.lang = 'en-US'
    recognition.continuous = false
    recognition.interimResults = false

    recognition.onstart = () => setIsListening(true)
    recognition.onend = () => setIsListening(false)
    recognition.onerror = () => setIsListening(false)
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      setInput(transcript)
      // Auto-send if context feels right, or just let user review
    }

    recognition.start()
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
            initial={{ opacity: 0, scale: 0.95, y: 20, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.95, y: 20, filter: 'blur(10px)' }}
            className="pointer-events-auto w-[calc(100vw-2rem)] sm:w-[380px] h-[min(650px,85vh)] max-h-[85vh] rounded-[2.5rem] shadow-[0_30px_70px_-15px_rgba(0,0,0,0.3)] bg-white/70 dark:bg-gray-900/70 backdrop-blur-3xl border border-white/30 dark:border-gray-800/30 overflow-hidden flex flex-col mb-4 ring-1 ring-black/5"
          >
            {/* Elite Header */}
            <div className="pt-7 px-6 pb-5 flex items-center justify-between bg-white/10 relative">
               <div className="flex items-center gap-3">
                <div className="relative group">
                  <div className="w-11 h-11 bg-gradient-to-br from-blue-600/20 to-indigo-600/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/50 shadow-sm transition-transform group-hover:scale-105 duration-500">
                    <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-[2.5px] border-white dark:border-gray-900 rounded-full shadow-sm">
                    <div className="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-50" />
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-lg tracking-tight text-gray-900 dark:text-white leading-none">Silk Lite</h3>
                  <div className="mt-1 flex items-center gap-1.5">
                    {isStandalone ? (
                      <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full uppercase tracking-widest flex items-center gap-1 shadow-sm">
                        <Sparkles className="w-2.5 h-2.5" /> Silk Elite
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-blue-600/70 dark:text-blue-400/70 uppercase tracking-[0.1em]">Online & Ready</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button onClick={() => setIsMinimized(true)} className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all active:scale-90"><Minimize2 className="w-4 h-4 text-gray-500" /></button>
                <button onClick={() => setIsOpen(false)} className="p-2.5 hover:bg-red-50 dark:hover:bg-red-900/20 group transition-all active:scale-90"><X className="w-4 h-4 text-gray-500 group-hover:text-red-500" /></button>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto px-6 py-2 space-y-7 scroll-smooth custom-scrollbar bg-transparent">
              {messages.map((msg) => (
                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={msg.id} 
                  className={cn("flex flex-col w-full", msg.role === 'user' ? "items-end" : "items-start")}
                >
                  <div className={cn(
                    "max-w-[88%] rounded-3xl px-5 py-3.5 text-[14px] leading-relaxed shadow-sm transition-all duration-300",
                    msg.role === 'user' 
                      ? "bg-gradient-to-tr from-blue-600 to-indigo-700 text-white rounded-tr-none shadow-blue-500/10" 
                      : "bg-white/80 dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700/50 text-gray-800 dark:text-gray-100 rounded-tl-none"
                  )}>
                    <span className="whitespace-pre-wrap font-medium tracking-tight inline-block">{msg.content}</span>
                    <div className={cn(
                      "text-[9px] font-bold mt-2 opacity-40 select-none",
                      msg.role === 'user' ? "text-right" : "text-left"
                    )}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  
                  {/* Actions (Carousel / Multi-Card) */}
                  {msg.actions && msg.actions.length > 0 && (
                    <ActionCarousel actions={msg.actions} />
                  )}
                </motion.div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start w-full">
                  <div className="bg-white/80 dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700 rounded-3xl rounded-tl-none px-5 py-4 shadow-sm backdrop-blur-md">
                    <div className="flex gap-2 items-center">
                      {[0, 2, 4].map((delay) => (
                        <motion.span 
                          key={delay}
                          animate={{ y: [0, -5, 0], opacity: [0.3, 1, 0.3] }} 
                          transition={{ repeat: Infinity, duration: 1.2, delay: delay * 0.1 }} 
                          className="w-1.5 h-1.5 bg-blue-500 rounded-full" 
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} className="h-4" />
            </div>

            {/* Elegant Input Area */}
            <div className="p-6 pb-8 bg-gradient-to-t from-white via-white/95 to-transparent dark:from-gray-900 dark:via-gray-900/95 dark:to-transparent">
              {/* Quick Chips - Floating Style */}
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-5 -mx-2 px-2">
                {[
                  { label: '📦 Track', text: 'Where is my order?' },
                  { label: '🔥 Deals', text: 'Show me active offers' },
                  { label: '💎 Best Sellers', text: 'What are your top products?' },
                  { label: '🌸 Fragrance', text: 'I want to see fragrances' }
                ].map((chip) => (
                  <button
                    key={chip.label}
                    onClick={() => { setInput(chip.text); handleSend(); }} 
                    className="flex-shrink-0 text-[11px] font-bold px-4 py-2 bg-white/50 dark:bg-gray-800/50 backdrop-blur-md border border-gray-100 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-2xl hover:bg-blue-600 hover:text-white hover:border-blue-600 dark:hover:bg-blue-600 transition-all shadow-sm active:scale-95 whitespace-nowrap"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>

              <form 
                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                className="relative group"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[2rem] blur opacity-10 group-focus-within:opacity-25 transition duration-500" />
                <div className="relative flex items-center gap-2 bg-gray-50 dark:bg-gray-800/80 p-1.5 rounded-[2rem] border border-gray-200 dark:border-gray-700 group-focus-within:border-blue-500/50 group-focus-within:ring-4 group-focus-within:ring-blue-500/5 transition-all duration-500 shadow-inner">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Inquire with Silk Lite..."
                    className="border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-[14px] h-11 px-4 placeholder:text-gray-400 placeholder:font-medium font-medium tracking-tight"
                  />
                  <div className="flex items-center gap-1.5 mr-1">
                    <button
                      type="button"
                      onClick={startVoiceRecognition}
                      className={cn(
                        "w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300 active:scale-90",
                        isListening 
                          ? "bg-red-500 text-white shadow-lg shadow-red-500/30 animate-pulse" 
                          : "bg-gray-100 dark:bg-gray-700 text-gray-500 hover:text-blue-600"
                      )}
                    >
                      <Mic className={cn("w-4 h-4", isListening && "animate-bounce")} />
                    </button>
                    <Button 
                      type="submit" 
                      size="icon" 
                      className="w-10 h-10 rounded-2xl bg-blue-600 hover:bg-indigo-600 text-white shrink-0 shadow-lg shadow-blue-500/30 active:scale-90 transition-all duration-300"
                      disabled={!input.trim() || isTyping}
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Premium Toggle Button */}
      <div className="pointer-events-auto">
        <AnimatePresence mode="wait">
          {!isOpen || isMinimized ? (
            <motion.button
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => { setIsOpen(true); setIsMinimized(false); }}
              className="w-14 h-14 md:w-16 md:h-16 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-gray-900 dark:text-white rounded-[1.75rem] shadow-[0_20px_50px_-10px_rgba(0,0,0,0.2)] flex items-center justify-center relative group backdrop-blur-md ring-1 ring-black/5"
            >
              <div className="absolute inset-2 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl opacity-[0.08] group-hover:opacity-20 transition-opacity duration-500" />
              <Bot className="w-7 h-7 text-blue-600 dark:text-blue-400 relative z-10 transition-transform group-hover:scale-110 duration-500" />
              
              <div className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-blue-500 border-2 border-white dark:border-gray-900 shadow-sm"></span>
              </div>
              
              {/* Tooltip */}
              <div className="absolute right-full mr-5 top-1/2 -translate-y-1/2 flex items-center group-hover:opacity-100 opacity-0 translate-x-3 group-hover:translate-x-0 transition-all duration-500 pointer-events-none">
                <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg text-gray-900 dark:text-white text-[12px] font-black px-5 py-2.5 rounded-2xl shadow-xl whitespace-nowrap border border-white dark:border-gray-800 ring-1 ring-black/5">
                  Chat with Concierge
                </div>
                <div className="w-2.5 h-2.5 bg-white/90 dark:bg-gray-900/90 rotate-45 -ml-1 border-r border-t border-white dark:border-gray-800" />
              </div>
            </motion.button>
          ) : null}
        </AnimatePresence>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.08); border-radius: 10px; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  )
}
