'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Bot, Loader2, Sparkles, Megaphone, Copy, CheckCircle
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface AIAnnouncementGeneratorProps {
  onAnnouncementGenerated?: (announcement: { title: string; content: string }) => void
}

export function AIAnnouncementGenerator({ onAnnouncementGenerated }: AIAnnouncementGeneratorProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [topic, setTopic] = useState('')
  const [type, setType] = useState<string>('general')
  const [announcement, setAnnouncement] = useState<any>(null)

  const generateAnnouncement = async () => {
    if (!topic.trim()) {
      toast({ title: 'Error', description: 'Enter a topic first', variant: 'destructive' })
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'announcement_generate',
          topic,
          type
        })
      })

      const data = await res.json()
      if (data.success) {
        setAnnouncement(data.result)
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to generate announcement', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const useAnnouncement = () => {
    if (announcement) {
      onAnnouncementGenerated?.({
        title: announcement.title,
        content: announcement.content
      })
      toast({ title: 'Applied!', description: 'Announcement added' })
    }
  }

  return (
    <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg border border-amber-200 space-y-3">
      <div className="flex items-center gap-2">
        <Bot className="w-5 h-5 text-amber-600" />
        <span className="font-semibold text-amber-800">AI Announcement Writer</span>
        <Badge variant="outline" className="text-xs">Gemini</Badge>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <Input
          placeholder="Topic (e.g., New collection launch, Eid sale, Free shipping)"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="flex-1"
        />
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="w-full sm:w-32">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sale">Sale</SelectItem>
            <SelectItem value="new_arrival">New Arrival</SelectItem>
            <SelectItem value="event">Event</SelectItem>
            <SelectItem value="policy">Policy</SelectItem>
            <SelectItem value="general">General</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={generateAnnouncement} disabled={loading} className="gap-2 bg-amber-600 hover:bg-amber-700">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          Generate
        </Button>
      </div>

      {announcement && (
        <div className="p-4 bg-white rounded-lg border space-y-3">
          <div className="flex items-start gap-2">
            {announcement.emoji && <span className="text-2xl">{announcement.emoji}</span>}
            <div>
              <h4 className="font-bold text-lg text-gray-800">{announcement.title}</h4>
              <p className="text-sm text-gray-600 mt-2 whitespace-pre-wrap">{announcement.content}</p>
            </div>
          </div>
          
          {announcement.cta && (
            <Badge className="bg-amber-100 text-amber-700">
              CTA: {announcement.cta}
            </Badge>
          )}

          <div className="flex gap-2 pt-2 border-t">
            <Button size="sm" onClick={useAnnouncement} className="gap-1">
              <Megaphone className="w-3 h-3" />
              Use This
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => navigator.clipboard.writeText(`${announcement.title}\n\n${announcement.content}`)}
              className="gap-1"
            >
              <Copy className="w-3 h-3" />
              Copy
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
