'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, AlertCircle, Info, CheckCircle, Tag, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Announcement {
  id: string
  title: string
  content: string
  type: string
}

const typeStyles: Record<string, { bg: string; border: string; icon: any }> = {
  info: { bg: 'bg-blue-50', border: 'border-blue-200', icon: Info },
  warning: { bg: 'bg-yellow-50', border: 'border-yellow-200', icon: AlertCircle },
  success: { bg: 'bg-green-50', border: 'border-green-200', icon: CheckCircle },
  promo: { bg: 'bg-purple-50', border: 'border-purple-200', icon: Tag }
}

export default function AnnouncementPopup() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [sessionId] = useState(() => {
    if (typeof window !== 'undefined') {
      let id = sessionStorage.getItem('announcement_session_id')
      if (!id) {
        id = Math.random().toString(36).substring(7)
        sessionStorage.setItem('announcement_session_id', id)
      }
      return id
    }
    return ''
  })

  useEffect(() => {
    fetchAnnouncements()
  }, [])

  const fetchAnnouncements = async () => {
    try {
      const res = await fetch(`/api/announcements?sessionId=${sessionId}`, { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setAnnouncements(data.announcements || [])
      }
    } catch (err) {
      console.error('Failed to fetch announcements:', err)
    }
  }

  const dismissCurrent = async () => {
    const current = announcements[currentIndex]
    if (!current) return

    try {
      await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ announcementId: current.id, sessionId })
      })
    } catch (err) {
      console.error('Failed to dismiss:', err)
    }

    // Move to next or close
    if (currentIndex < announcements.length - 1) {
      setCurrentIndex(currentIndex + 1)
    } else {
      setAnnouncements([])
    }
  }

  const dismissAll = async () => {
    for (const ann of announcements) {
      try {
        await fetch('/api/announcements', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ announcementId: ann.id, sessionId })
        })
      } catch (err) {
        console.error('Failed to dismiss:', err)
      }
    }
    setAnnouncements([])
  }

  if (announcements.length === 0) return null

  const current = announcements[currentIndex]
  const style = typeStyles[current.type] || typeStyles.info
  const Icon = style.icon

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className={`relative max-w-md w-full rounded-2xl p-6 shadow-xl ${style.bg} border-2 ${style.border}`}
        >
          <button 
            onClick={dismissAll}
            className="absolute top-4 right-4 p-2 hover:bg-white/50 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${style.border} border-2 bg-white`}>
              <Icon className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold">{current.title}</h2>
          </div>

          <p className="text-gray-700 mb-6 whitespace-pre-wrap">{current.content}</p>

          {/* Navigation for multiple announcements */}
          {announcements.length > 1 && (
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                disabled={currentIndex === 0}
                className="p-2 hover:bg-white/50 rounded-full disabled:opacity-50"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-sm text-gray-600">
                {currentIndex + 1} of {announcements.length}
              </span>
              <button
                onClick={() => setCurrentIndex(Math.min(announcements.length - 1, currentIndex + 1))}
                disabled={currentIndex === announcements.length - 1}
                className="p-2 hover:bg-white/50 rounded-full disabled:opacity-50"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}

          <div className="flex gap-3">
            <Button variant="outline" onClick={dismissCurrent} className="flex-1">
              {announcements.length > 1 && currentIndex < announcements.length - 1 ? 'Next' : 'Got it'}
            </Button>
            {announcements.length > 1 && (
              <Button variant="ghost" onClick={dismissAll} className="text-gray-500">
                Dismiss All
              </Button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
