'use client'

import { useState, useEffect } from 'react'
import { MessageCircle, X, Send } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface WhatsAppChatProps {
  phoneNumber?: string
  defaultMessage?: string
  position?: 'bottom-right' | 'bottom-left'
}

const WHATSAPP_NUMBER = '8801991523289' // Bangladesh format

export function WhatsAppChat({ 
  phoneNumber = WHATSAPP_NUMBER,
  defaultMessage = 'Hi! I have a question about your products.',
  position = 'bottom-right'
}: WhatsAppChatProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState(defaultMessage)
  const [isVisible, setIsVisible] = useState(true)

  // Check if user is staff (admin/seller)
  useEffect(() => {
    const checkRole = async () => {
      try {
        const res = await fetch('/api/auth/me')
        if (res.ok) {
          const data = await res.json()
          if (data.authenticated && ['admin', 'superadmin', 'seller'].includes(data.user.role)) {
            setIsVisible(false)
          }
        }
      } catch (err) {
        console.error('Role check failed', err)
      }
    }
    checkRole()
  }, [])

  // Listen for global open-live-chat event (from AI Chat)
  useEffect(() => {
    const handleOpenChat = (e: any) => {
      setIsOpen(true)
      if (e.detail?.context) {
        setMessage(`Hi! I need help. Context:\n${e.detail.context}`)
      }
    }

    window.addEventListener('open-live-chat', handleOpenChat)
    return () => window.removeEventListener('open-live-chat', handleOpenChat)
  }, [])

  if (!isVisible) return null

  const handleSend = () => {
    try {
      if (!message.trim()) {
        return
      }

      const encodedMessage = encodeURIComponent(message)
      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`
      
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
      setIsOpen(false)
    } catch (error) {
      console.error('WhatsApp chat error:', error)
    }
  }

  const positionClasses = position === 'bottom-right' 
    ? 'right-4 md:right-6' // Stacked under AI Chat
    : 'left-4 md:left-6'

  return (
    <>
      {/* Chat Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-4 md:bottom-6 ${positionClasses} z-[40] w-12 h-12 md:w-14 md:h-14 rounded-full bg-green-500 text-white shadow-lg hover:bg-green-600 transition-colors flex items-center justify-center`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        aria-label="WhatsApp Chat"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
            >
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div
              key="whatsapp"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
            >
              <MessageCircle className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat Popup */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`fixed bottom-24 ${positionClasses} z-50 w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden`}
          >
            {/* Header */}
            <div className="bg-green-500 p-4 text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold">CTG Collection</h3>
                  <p className="text-sm text-green-100">Usually replies in minutes</p>
                </div>
              </div>
            </div>

            {/* Chat Area */}
            <div className="p-4 bg-gray-50 dark:bg-gray-900 min-h-[100px]">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  👋 Hi! How can we help you today? Click send to start a conversation on WhatsApp.
                </p>
              </div>
            </div>

            {/* Input */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                />
                <button
                  onClick={handleSend}
                  disabled={!message.trim()}
                  className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center hover:bg-green-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-2 text-center">
                Powered by WhatsApp
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
