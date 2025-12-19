'use client'

import { InternalChat } from '@/components/admin/InternalChat'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { MessageSquare } from 'lucide-react'

export default function ChatPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-blue-600" />
          Messages
        </h1>
        <p className="text-gray-500">Chat with Admins and Support.</p>
      </div>

      <InternalChat />
    </div>
  )
}
