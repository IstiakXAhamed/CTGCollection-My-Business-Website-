'use client'

import { useState, useEffect } from 'react'
import { MessageCircle, Send, ThumbsUp, User, Clock, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { motion, AnimatePresence } from 'framer-motion'

interface QA {
  id: string
  question: string
  answer?: string
  askedBy: string
  askedAt: string
  answeredAt?: string
  helpful: number
}

interface ProductQAProps {
  productId: string
}

export function ProductQA({ productId }: ProductQAProps) {
  const [questions, setQuestions] = useState<QA[]>([])
  const [loading, setLoading] = useState(true)
  const [newQuestion, setNewQuestion] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    fetchQuestions()
  }, [productId])

  const fetchQuestions = async () => {
    try {
      const res = await fetch(`/api/products/${productId}/questions`)
      if (res.ok) {
        const data = await res.json()
        setQuestions(data.questions || [])
      }
    } catch (error) {
      console.error('Failed to fetch Q&A:', error)
    } finally {
      setLoading(false)
    }
  }

  const submitQuestion = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newQuestion.trim()) return

    setSubmitting(true)
    try {
      const res = await fetch(`/api/products/${productId}/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ question: newQuestion })
      })

      if (res.ok) {
        const data = await res.json()
        setQuestions(prev => [data.question, ...prev])
        setNewQuestion('')
        setShowForm(false)
      } else {
        alert('Please login to ask a question')
      }
    } catch (error) {
      console.error('Failed to submit question:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const markHelpful = async (questionId: string) => {
    try {
      await fetch(`/api/products/${productId}/questions/${questionId}/helpful`, {
        method: 'POST',
        credentials: 'include'
      })
      setQuestions(prev => prev.map(q => 
        q.id === questionId ? { ...q, helpful: q.helpful + 1 } : q
      ))
    } catch (error) {
      console.error('Failed to mark helpful:', error)
    }
  }

  // Demo data if no questions
  const displayQuestions = questions.length > 0 ? questions : [
    {
      id: '1',
      question: 'Is this product available for gift wrapping?',
      answer: 'Yes! We offer free gift wrapping on all orders. Just mention it in the order notes.',
      askedBy: 'Customer',
      askedAt: '2 days ago',
      answeredAt: '1 day ago',
      helpful: 5
    },
    {
      id: '2',
      question: 'What is the return policy for this item?',
      answer: 'We have a 7-day easy return policy. Product must be unused and in original packaging.',
      askedBy: 'Buyer',
      askedAt: '1 week ago',
      answeredAt: '1 week ago',
      helpful: 12
    }
  ]

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <MessageCircle className="w-6 h-6 text-blue-600" />
          Questions & Answers
        </h3>
        <Button
          variant="outline"
          onClick={() => setShowForm(!showForm)}
        >
          Ask a Question
        </Button>
      </div>

      {/* Ask Question Form */}
      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            onSubmit={submitQuestion}
            className="mb-6 overflow-hidden"
          >
            <div className="border rounded-xl p-4 bg-gray-50 dark:bg-gray-900">
              <Textarea
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="What would you like to know about this product?"
                className="mb-3 bg-white dark:bg-gray-800"
                rows={3}
              />
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting || !newQuestion.trim()}>
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Submit Question
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Questions List */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        </div>
      ) : (
        <div className="space-y-6">
          {displayQuestions.map((qa, idx) => (
            <motion.div
              key={qa.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="border-b pb-6 last:border-0"
            >
              {/* Question */}
              <div className="mb-3">
                <div className="flex items-start gap-3">
                  <span className="text-blue-600 font-bold text-lg">Q:</span>
                  <div className="flex-1">
                    <p className="font-medium">{qa.question}</p>
                    <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {qa.askedBy}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {qa.askedAt}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Answer */}
              {qa.answer ? (
                <div className="ml-6 bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-green-600 font-bold text-lg">A:</span>
                    <div className="flex-1">
                      <p>{qa.answer}</p>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-sm text-muted-foreground">
                          Answered by Seller • {qa.answeredAt}
                        </span>
                        <button
                          onClick={() => markHelpful(qa.id)}
                          className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 transition"
                        >
                          <ThumbsUp className="w-4 h-4" />
                          Helpful ({qa.helpful})
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="ml-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3 text-sm text-yellow-700 dark:text-yellow-400">
                  ⏳ Waiting for seller's response...
                </div>
              )}
            </motion.div>
          ))}

          {displayQuestions.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No questions yet. Be the first to ask!</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
