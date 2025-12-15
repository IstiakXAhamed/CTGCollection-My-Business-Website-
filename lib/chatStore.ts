// In-memory chat store for real-time sync (works without database)
// This persists across API calls during the server lifetime

interface ChatMessage {
  id: string
  senderType: string
  senderName: string
  message: string
  createdAt: string
}

interface ChatSession {
  id: string
  sessionId: string
  customerName: string
  status: string
  messages: ChatMessage[]
  createdAt: string
  updatedAt: string
}

// Global in-memory store
const chatStore: Map<string, ChatSession> = new Map()

export function getSession(sessionId: string): ChatSession | undefined {
  return chatStore.get(sessionId)
}

export function createSession(sessionId: string, customerName: string): ChatSession {
  const existing = chatStore.get(sessionId)
  if (existing) return existing
  
  const session: ChatSession = {
    id: sessionId,
    sessionId,
    customerName,
    status: 'active',
    messages: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  
  chatStore.set(sessionId, session)
  return session
}

export function addMessage(sessionId: string, message: Omit<ChatMessage, 'id' | 'createdAt'>): ChatMessage {
  let session = chatStore.get(sessionId)
  
  if (!session) {
    session = createSession(sessionId, message.senderName)
  }
  
  const newMessage: ChatMessage = {
    ...message,
    id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString()
  }
  
  session.messages.push(newMessage)
  session.updatedAt = new Date().toISOString()
  
  return newMessage
}

export function getMessages(sessionId: string, after?: string): ChatMessage[] {
  const session = chatStore.get(sessionId)
  if (!session) return []
  
  if (after) {
    const afterDate = new Date(after)
    return session.messages.filter(m => new Date(m.createdAt) > afterDate)
  }
  
  return session.messages
}

export function getAllSessions(): ChatSession[] {
  return Array.from(chatStore.values()).sort((a, b) => 
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  )
}

export function getUnreadCount(sessionId: string): number {
  const session = chatStore.get(sessionId)
  if (!session) return 0
  return session.messages.filter(m => m.senderType === 'customer').length
}
