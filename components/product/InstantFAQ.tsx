'use client'

import { useState, useEffect } from 'react'
import { HelpCircle, ChevronDown, ChevronUp, Sparkles, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface InstantFAQProps {
  productName: string
  description: string
  category: string
}

interface FAQItem {
  question: string
  answer: string
}

export function InstantFAQ({ productName, description, category }: InstantFAQProps) {
  const [faqs, setFaqs] = useState<FAQItem[]>([])
  const [loading, setLoading] = useState(true)
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  useEffect(() => {
    const fetchFAQs = async () => {
      // In a real app, you might want to cache this or fetch from DB first
      // Calling our Next.js API route that wraps generateProductFAQ
      // For now, mocking the call to avoid hitting rate limits or complex setup in this demo
      
      const timer = setTimeout(() => {
        // Mock Response based on category
        const mockFAQs: FAQItem[] = [
           { 
             question: "What is the material quality?", 
             answer: `This ${productName} is crafted from premium materials suitable for ${category}, ensuring durability and comfort.` 
           },
           { 
             question: "How do I care for this item?", 
             answer: "We recommend following the care label instructions. Generally, gentle wash or dry clean is best for longevity." 
           },
           { 
             question: "Is there a warranty?", 
             answer: "Yes, we offer a standard quality guarantee on all our products. Please check our return policy for details." 
           },
           {
             question: "What is the estimated delivery time?",
             answer: "Delivery typically takes 2-5 business days within Dhaka and 3-7 days nationwide."
           }
        ]
        setFaqs(mockFAQs)
        setLoading(false)
      }, 2000)

      return () => clearTimeout(timer)
      
      /* 
      // Real API Call Implementation:
      try {
        const res = await fetch('/api/ai/faq', {
          method: 'POST',
          body: JSON.stringify({ productName, description, category })
        })
        const data = await res.json()
        if (data.faqs) setFaqs(data.faqs)
      } catch (e) { console.error(e) }
      */
    }

    fetchFAQs()
  }, [productName, category])

  if (loading) {
     return (
       <div className="border rounded-xl p-6 bg-gray-50/50 animate-pulse">
         <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
         <div className="space-y-3">
           <div className="h-10 bg-gray-200 rounded"></div>
           <div className="h-10 bg-gray-200 rounded"></div>
           <div className="h-10 bg-gray-200 rounded"></div>
         </div>
       </div>
     )
  }

  return (
    <div className="border border-gray-100 rounded-xl p-6 bg-white shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <div className="bg-blue-100 p-2 rounded-full">
          <Sparkles className="w-5 h-5 text-blue-600" />
        </div>
        <h3 className="text-lg font-bold">Frequently Asked Questions</h3>
        <span className="ml-auto text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full flex items-center gap-1">
          <Sparkles className="w-3 h-3" /> AI Generated
        </span>
      </div>

      <div className="space-y-2">
        {faqs.map((faq, idx) => (
          <div key={idx} className="border border-gray-100 rounded-lg overflow-hidden">
            <button
              onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
              className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 text-left transition-colors"
            >
              <span className="font-medium text-sm text-gray-800">{faq.question}</span>
              {openIndex === idx ? (
                <ChevronUp className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              )}
            </button>
            <AnimatePresence>
              {openIndex === idx && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="p-4 bg-white text-sm text-gray-600 border-t border-gray-100">
                    {faq.answer}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  )
}
