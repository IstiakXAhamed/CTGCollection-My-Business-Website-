'use client'

import { useState, useEffect } from 'react'
import { Sparkles, ThumbsUp, ThumbsDown, Minus } from 'lucide-react'
import { motion } from 'framer-motion'
import { Progress } from '@/components/ui/progress'

interface Review {
  id: string
  rating: number
  comment: string
  userName: string
  date: string
}

interface AIReviewSummaryProps {
  reviews: Review[]
  productName: string
}

export function AIReviewSummary({ reviews, productName }: AIReviewSummaryProps) {
  const [summary, setSummary] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (reviews.length === 0) {
      setLoading(false)
      return
    }

    // Simulate AI Analysis
    const timer = setTimeout(() => {
      // Mock analysis logic based on passed reviews
      const avgRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
      
      setSummary({
        verdict: avgRating > 4 ? "Highly Recommended" : avgRating > 3 ? "Good Buy" : "Mixed Data",
        pros: ["Premium fabric quality", "True to size", "Fast delivery"],
        cons: ["Color slightly different than photo", "Packaging could be better"],
        sentimentScore: Math.round((avgRating / 5) * 100),
        summaryText: `Customers generally love the ${productName}, praising its premium fabric and fit. Some noted minor color variations, but overall satisfaction is high.`
      })
      setLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [reviews, productName])

  if (reviews.length === 0) return null

  if (loading) {
    return (
       <div className="bg-gradient-to-r from-gray-50 to-white p-6 rounded-xl border border-gray-100 animate-pulse">
         <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
         <div className="h-16 bg-gray-200 rounded mb-4"></div>
         <div className="grid grid-cols-2 gap-4">
           <div className="h-20 bg-gray-200 rounded"></div>
           <div className="h-20 bg-gray-200 rounded"></div>
         </div>
       </div>
    )
  }

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gradient-to-br from-indigo-50/80 to-purple-50/80 p-6 rounded-xl border border-indigo-100 shadow-sm mb-8"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="bg-indigo-600 text-white p-1.5 rounded-lg shadow-sm">
          <Sparkles className="w-5 h-5" />
        </div>
        <h3 className="font-bold text-gray-900">AI Review Verification</h3>
        <span className="text-xs font-semibold text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded ml-auto">
          Based on {reviews.length} verified reviews
        </span>
      </div>

      <p className="text-gray-700 text-sm leading-relaxed mb-6 italic border-l-4 border-indigo-200 pl-4 py-1">
        "{summary.summaryText}"
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="flex items-center gap-2 text-sm font-bold text-green-700 mb-3">
            <ThumbsUp className="w-4 h-4" /> What People Love
          </h4>
          <ul className="space-y-2">
            {summary.pros.map((pro: string, idx: number) => (
              <motion.li 
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-start gap-2 text-sm text-gray-600"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0" />
                {pro}
              </motion.li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="flex items-center gap-2 text-sm font-bold text-red-700 mb-3">
            <ThumbsDown className="w-4 h-4" /> What To Watch For
          </h4>
           <ul className="space-y-2">
            {summary.cons.map((con: string, idx: number) => (
              <motion.li 
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-start gap-2 text-sm text-gray-600"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0" />
                {con}
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
      
      <div className="mt-6 pt-4 border-t border-indigo-100/50 flex items-center justify-between">
        <span className="text-xs text-gray-500">AI Analysis Confidence: High</span>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-indigo-900">{summary.verdict}</span>
          <Progress value={summary.sentimentScore} className="w-20 h-2" />
        </div>
      </div>
    </motion.div>
  )
}
