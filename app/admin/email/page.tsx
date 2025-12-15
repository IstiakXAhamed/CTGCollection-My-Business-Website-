'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Mail, Send, Users, Check, X, Loader2, RefreshCw, Paperclip, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'

interface Subscriber {
  id: string
  email: string
  name: string | null
  subscribedAt: string
  isActive: boolean
}

interface Attachment {
  name: string
  size: number
  type: string
  data: string // base64
}

export default function AdminEmailPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [selectedEmails, setSelectedEmails] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [result, setResult] = useState<{ type: 'success' | 'error', message: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchSubscribers()
  }, [])

  const fetchSubscribers = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/email', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setSubscribers(data.subscribers || [])
      }
    } catch (error) {
      console.error('Failed to fetch subscribers:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleEmail = (email: string) => {
    if (selectedEmails.includes(email)) {
      setSelectedEmails(selectedEmails.filter(e => e !== email))
    } else {
      setSelectedEmails([...selectedEmails, email])
    }
  }

  const selectAll = () => {
    if (selectedEmails.length === subscribers.length) {
      setSelectedEmails([])
    } else {
      setSelectedEmails(subscribers.map(s => s.email))
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    Array.from(files).forEach(file => {
      // Max 10MB per file
      if (file.size > 10 * 1024 * 1024) {
        alert(`File ${file.name} is too large (max 10MB)`)
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1]
        setAttachments(prev => [...prev, {
          name: file.name,
          size: file.size,
          type: file.type,
          data: base64
        }])
      }
      reader.readAsDataURL(file)
    })

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const sendEmail = async () => {
    if (!subject.trim() || !message.trim()) {
      setResult({ type: 'error', message: 'Subject and message are required' })
      return
    }

    setSending(true)
    setResult(null)

    try {
      const res = await fetch('/api/admin/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          subject,
          message,
          recipients: selectedEmails.length > 0 ? selectedEmails : undefined,
          attachments: attachments.length > 0 ? attachments : undefined
        })
      })

      const data = await res.json()

      if (res.ok) {
        setResult({ type: 'success', message: data.message })
        setSubject('')
        setMessage('')
        setSelectedEmails([])
        setAttachments([])
      } else {
        setResult({ type: 'error', message: data.error || 'Failed to send emails' })
      }
    } catch (error: any) {
      setResult({ type: 'error', message: error.message || 'Failed to send emails' })
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Mail className="w-8 h-8 text-blue-600" />
            Email Marketing
          </h1>
          <p className="text-muted-foreground mt-1">Send emails to newsletter subscribers</p>
        </div>
        <Button variant="outline" onClick={fetchSubscribers} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Subscribers List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Subscribers ({subscribers.length})
            </CardTitle>
            <CardDescription>Select recipients or send to all</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              </div>
            ) : subscribers.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No subscribers yet</p>
            ) : (
              <>
                <div className="mb-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={selectAll}
                    className="w-full"
                  >
                    {selectedEmails.length === subscribers.length ? 'Deselect All' : 'Select All'}
                  </Button>
                </div>
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {subscribers.map(sub => (
                    <div 
                      key={sub.id} 
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedEmails.includes(sub.email) 
                          ? 'bg-blue-50 border-blue-200' 
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => toggleEmail(sub.email)}
                    >
                      <Checkbox 
                        checked={selectedEmails.includes(sub.email)}
                        onCheckedChange={() => toggleEmail(sub.email)}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{sub.email}</p>
                        {sub.name && (
                          <p className="text-xs text-muted-foreground">{sub.name}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-4 text-center">
                  {selectedEmails.length > 0 
                    ? `${selectedEmails.length} selected`
                    : 'No selection = send to all'
                  }
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Compose Email */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="w-5 h-5" />
              Compose Email
            </CardTitle>
            <CardDescription>
              Write your email content. HTML is supported in the message.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {result && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-lg flex items-center gap-2 ${
                  result.type === 'success' 
                    ? 'bg-green-50 text-green-700 border border-green-200' 
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}
              >
                {result.type === 'success' ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
                {result.message}
              </motion.div>
            )}

            <div className="space-y-2">
              <Label htmlFor="subject">Subject *</Label>
              <Input
                id="subject"
                placeholder="Enter email subject..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message *</Label>
              <textarea
                id="message"
                rows={10}
                placeholder="Write your email message here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
              <p className="text-xs text-muted-foreground">
                Tip: Use line breaks for paragraphs. Basic HTML tags are supported.
              </p>
            </div>

            {/* File Attachments */}
            <div className="space-y-2">
              <Label>Attachments</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Paperclip className="w-4 h-4 mr-2" />
                  Add File
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </div>
              
              {attachments.length > 0 && (
                <div className="space-y-2 mt-3">
                  {attachments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <Paperclip className="w-4 h-4 text-gray-500" />
                        <div>
                          <p className="text-sm font-medium truncate max-w-[200px]">{file.name}</p>
                          <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAttachment(index)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Sending to: {selectedEmails.length > 0 ? `${selectedEmails.length} recipients` : `All ${subscribers.length} subscribers`}
                {attachments.length > 0 && ` • ${attachments.length} attachment(s)`}
              </p>
              <Button 
                onClick={sendEmail} 
                disabled={sending || !subject || !message || subscribers.length === 0}
                className="min-w-[140px]"
              >
                {sending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Email
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SMTP Info */}
      <Card className="mt-6">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Mail className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">SMTP Configuration</h3>
              <p className="text-sm text-muted-foreground">
                Emails are sent using the SMTP settings in your <code className="bg-gray-100 px-1 rounded">.env</code> file.
                Make sure you have configured <code className="bg-gray-100 px-1 rounded">SMTP_HOST</code>, 
                <code className="bg-gray-100 px-1 rounded">SMTP_USER</code>, and 
                <code className="bg-gray-100 px-1 rounded">SMTP_PASS</code>.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

