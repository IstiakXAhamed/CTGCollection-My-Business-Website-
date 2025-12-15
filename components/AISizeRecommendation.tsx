'use client'

import { useState } from 'react'
import { Ruler, Sparkles, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { motion, AnimatePresence } from 'framer-motion'

interface AISizeRecommendationProps {
  productCategory?: string
  availableSizes?: string[]
  onSizeSelect?: (size: string) => void
}

// Rule-based size recommendation logic
function recommendSize(height: number, weight: number, category: string): { size: string; confidence: number } {
  // Body Mass Index for reference
  const bmi = weight / ((height / 100) ** 2)
  
  // Height in inches for traditional sizing
  const heightInches = height * 0.393701
  
  let size = 'M'
  let confidence = 85
  
  if (category.toLowerCase().includes('shirt') || category.toLowerCase().includes('top') || category.toLowerCase().includes('t-shirt')) {
    // T-shirt / Shirt sizing
    if (height <= 160) {
      size = weight <= 55 ? 'XS' : weight <= 65 ? 'S' : weight <= 75 ? 'M' : 'L'
    } else if (height <= 170) {
      size = weight <= 60 ? 'S' : weight <= 70 ? 'M' : weight <= 82 ? 'L' : 'XL'
    } else if (height <= 180) {
      size = weight <= 65 ? 'S' : weight <= 75 ? 'M' : weight <= 88 ? 'L' : 'XL'
    } else {
      size = weight <= 70 ? 'M' : weight <= 85 ? 'L' : weight <= 100 ? 'XL' : 'XXL'
    }
  } else if (category.toLowerCase().includes('pant') || category.toLowerCase().includes('jeans') || category.toLowerCase().includes('trouser')) {
    // Pants sizing based on waist estimate
    if (bmi < 18.5) {
      size = height <= 165 ? '28' : height <= 175 ? '30' : '32'
    } else if (bmi < 25) {
      size = height <= 165 ? '30' : height <= 175 ? '32' : '34'
    } else if (bmi < 30) {
      size = height <= 165 ? '32' : height <= 175 ? '34' : '36'
    } else {
      size = height <= 170 ? '36' : '38'
    }
  } else if (category.toLowerCase().includes('shoe') || category.toLowerCase().includes('footwear')) {
    // Shoe sizing (EU size)
    if (height <= 155) size = '36-37'
    else if (height <= 165) size = '38-39'
    else if (height <= 175) size = '40-41'
    else if (height <= 185) size = '42-43'
    else size = '44-45'
    confidence = 70 // Lower confidence for shoes as foot size varies
  } else {
    // General sizing
    if (bmi < 18.5) {
      size = height <= 165 ? 'S' : 'M'
    } else if (bmi < 25) {
      size = height <= 165 ? 'M' : height <= 175 ? 'L' : 'L'
    } else if (bmi < 30) {
      size = height <= 170 ? 'L' : 'XL'
    } else {
      size = 'XL'
    }
  }
  
  // Adjust confidence based on BMI extremes
  if (bmi < 16 || bmi > 35) {
    confidence = 60
  }
  
  return { size, confidence }
}

export function AISizeRecommendation({ productCategory = 'clothing', availableSizes = [], onSizeSelect }: AISizeRecommendationProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')
  const [recommendation, setRecommendation] = useState<{ size: string; confidence: number } | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)

  const getRecommendation = () => {
    const h = parseFloat(height)
    const w = parseFloat(weight)
    
    if (isNaN(h) || isNaN(w) || h < 100 || h > 250 || w < 20 || w > 200) {
      return
    }
    
    setIsCalculating(true)
    
    // Simulate AI processing
    setTimeout(() => {
      const result = recommendSize(h, w, productCategory)
      setRecommendation(result)
      setIsCalculating(false)
    }, 800)
  }

  const handleSelectSize = () => {
    if (recommendation && onSizeSelect) {
      onSizeSelect(recommendation.size)
    }
  }

  return (
    <div className="mt-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 transition"
      >
        <Sparkles className="w-4 h-4" />
        AI Size Recommendation
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-3 p-4 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-3">
                <Ruler className="w-5 h-5 text-blue-600" />
                <span className="font-medium">Find Your Perfect Size</span>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Height (cm)</label>
                  <Input
                    type="number"
                    placeholder="165"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    min={100}
                    max={250}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Weight (kg)</label>
                  <Input
                    type="number"
                    placeholder="65"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    min={20}
                    max={200}
                  />
                </div>
              </div>

              <Button
                onClick={getRecommendation}
                className="w-full mb-3"
                disabled={!height || !weight || isCalculating}
              >
                {isCalculating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Get AI Recommendation
                  </>
                )}
              </Button>

              {recommendation && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-green-200 dark:border-green-800"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600 dark:text-gray-400">Recommended Size:</span>
                    <span className="text-2xl font-bold text-green-600">{recommendation.size}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-green-500 rounded-full h-2 transition-all"
                        style={{ width: `${recommendation.confidence}%` }}
                      />
                    </div>
                    <span>{recommendation.confidence}% confident</span>
                  </div>

                  {availableSizes.length > 0 && (
                    <Button
                      onClick={handleSelectSize}
                      variant="outline"
                      className="w-full border-green-500 text-green-600 hover:bg-green-50"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Select Size {recommendation.size}
                    </Button>
                  )}
                </motion.div>
              )}

              <p className="text-xs text-gray-400 mt-3 text-center">
                💡 Based on standard sizing charts. Actual fit may vary.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
