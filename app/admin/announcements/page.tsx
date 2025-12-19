'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Megaphone, Plus, Edit2, Trash2, RefreshCw, X, Save,
  AlertCircle, Info, CheckCircle, Tag, Users, Calendar
} from 'lucide-react'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface Announcement {
  id: string
  title: string
  content: string
  type: string
  priority: number
  targetAudience: string
  isActive: boolean
  startDate: string
  endDate: string | null
  createdAt: string
  _count?: { dismissals: number }
}

const typeOptions = [
  { value: 'info', label: 'Info', color: 'bg-blue-100 text-blue-800', icon: Info },
  { value: 'warning', label: 'Warning', color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle },
  { value: 'success', label: 'Success', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  { value: 'promo', label: 'Promo', color: 'bg-purple-100 text-purple-800', icon: Tag }
]

const audienceOptions = [
  { value: 'all', label: 'All Users' },
  { value: 'customers', label: 'Customers Only' },
  { value: 'admins', label: 'Admins Only' }
]

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    title: '',
    content: '',
    type: 'info',
    priority: 0,
    targetAudience: 'all',
    startDate: new Date().toISOString().slice(0, 16),
    endDate: ''
  })

  useEffect(() => {
    fetchAnnouncements()
  }, [])

  const fetchAnnouncements = async () => {
    try {
      const res = await fetch('/api/admin/announcements', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setAnnouncements(data.announcements || [])
      }
    } catch (err) {
      console.error('Failed to fetch announcements:', err)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setForm({
      title: '',
      content: '',
      type: 'info',
      priority: 0,
      targetAudience: 'all',
      startDate: new Date().toISOString().slice(0, 16),
      endDate: ''
    })
    setEditingId(null)
    setShowModal(false)
  }

  const openEdit = (ann: Announcement) => {
    setForm({
      title: ann.title,
      content: ann.content,
      type: ann.type,
      priority: ann.priority,
      targetAudience: ann.targetAudience,
      startDate: new Date(ann.startDate).toISOString().slice(0, 16),
      endDate: ann.endDate ? new Date(ann.endDate).toISOString().slice(0, 16) : ''
    })
    setEditingId(ann.id)
    setShowModal(true)
  }

  const saveAnnouncement = async () => {
    if (!form.title || !form.content) {
      alert('Title and content are required')
      return
    }
    setSaving(true)
    try {
      const url = '/api/admin/announcements'
      const method = editingId ? 'PUT' : 'POST'
      const body = editingId ? { id: editingId, ...form } : form

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body)
      })

      if (res.ok) {
        resetForm()
        await fetchAnnouncements()
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to save')
      }
    } catch (err) {
      alert('Failed to save announcement')
    } finally {
      setSaving(false)
    }
  }

  const deleteAnnouncement = async (id: string) => {
    if (!confirm('Delete this announcement?')) return
    try {
      const res = await fetch(`/api/admin/announcements?id=${id}`, {
        method: 'DELETE',
        credentials: 'include'
      })
      if (res.ok) {
        await fetchAnnouncements()
      }
    } catch (err) {
      alert('Failed to delete')
    }
  }

  const toggleActive = async (ann: Announcement) => {
    try {
      await fetch('/api/admin/announcements', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id: ann.id, isActive: !ann.isActive })
      })
      await fetchAnnouncements()
    } catch (err) {
      console.error('Failed to toggle:', err)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => resetForm()}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">{editingId ? 'Edit' : 'New'} Announcement</h2>
                <button onClick={() => resetForm()} className="p-2 hover:bg-gray-100 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Title</Label>
                  <Input
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="Important Update"
                  />
                </div>
                <div>
                  <Label>Content</Label>
                  <textarea
                    value={form.content}
                    onChange={(e) => setForm({ ...form, content: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg min-h-[100px]"
                    placeholder="Announcement details..."
                  />
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <Label>Type</Label>
                    <select
                      value={form.type}
                      onChange={(e) => setForm({ ...form, type: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      {typeOptions.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label>Priority</Label>
                    <Input
                      type="number"
                      value={form.priority}
                      onChange={(e) => setForm({ ...form, priority: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>
                <div>
                  <Label>Target Audience</Label>
                  <select
                    value={form.targetAudience}
                    onChange={(e) => setForm({ ...form, targetAudience: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    {audienceOptions.map((a) => (
                      <option key={a.value} value={a.value}>{a.label}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <Label>Start Date</Label>
                    <Input
                      type="datetime-local"
                      value={form.startDate}
                      onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>End Date (Optional)</Label>
                    <Input
                      type="datetime-local"
                      value={form.endDate}
                      onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button variant="outline" onClick={() => resetForm()} className="flex-1">Cancel</Button>
                <Button onClick={saveAnnouncement} disabled={saving} className="flex-1">
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Megaphone className="w-8 h-8 text-blue-600" />
            Announcements
          </h1>
          <p className="text-gray-600 mt-1">Create announcements that show once per user login</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          New Announcement
        </Button>
      </div>

      {/* List */}
      {announcements.length === 0 ? (
        <Card className="text-center py-12">
          <Megaphone className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-600 mb-4">No announcements yet</p>
          <Button onClick={() => setShowModal(true)}>Create First Announcement</Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {announcements.map((ann) => {
            const typeInfo = typeOptions.find(t => t.value === ann.type) || typeOptions[0]
            const TypeIcon = typeInfo.icon
            return (
              <Card key={ann.id} className={`${!ann.isActive ? 'opacity-60' : ''}`}>
                <CardContent className="p-5">
                  <div className="flex flex-col items-start gap-4 md:flex-row md:justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${typeInfo.color}`}>
                          <TypeIcon className="w-3 h-3" />
                          {typeInfo.label}
                        </span>
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {audienceOptions.find(a => a.value === ann.targetAudience)?.label}
                        </span>
                        <span className="text-xs text-gray-500">
                          Priority: {ann.priority}
                        </span>
                      </div>
                      <h3 className="font-bold text-lg">{ann.title}</h3>
                      <p className="text-gray-600 mt-1">{ann.content}</p>
                      <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(ann.startDate).toLocaleDateString()}
                          {ann.endDate && ` - ${new Date(ann.endDate).toLocaleDateString()}`}
                        </span>
                        <span>{ann._count?.dismissals || 0} dismissed</span>
                      </div>
                    </div>
                    <div className="flex w-full flex-row gap-2 md:w-auto md:flex-col">
                      <Button
                        size="sm"
                        variant={ann.isActive ? "default" : "outline"}
                        onClick={() => toggleActive(ann)}
                      >
                        {ann.isActive ? 'Active' : 'Inactive'}
                      </Button>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" onClick={() => openEdit(ann)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-600" onClick={() => deleteAnnouncement(ann.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
