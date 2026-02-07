'use client'

import { useState } from 'react'
import { Ruler, Sparkles, Check, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface AISizeRecommenderProps {
  productType: string
  category: string
  onSizeSelect?: (size: string) => void
}

export function AISizeRecommender({ productType, category, onSizeSelect }: AISizeRecommenderProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [step, setStep] = useState<'input' | 'analyzing' | 'result'>('input')
  const [measurements, setMeasurements] = useState({
    height: '',
    weight: '',
    unit: 'cm', // or 'in'
    fitPreference: 'regular' // tight, regular, loose
  })
  const [recommendation, setRecommendation] = useState<any>(null)

  const handleAnalyze = async () => {
    setStep('analyzing')
    
    // Simulate AI delay for effect (or actually call API)
    // In real implementation, we would call /api/ai/recommend-size
    setTimeout(() => {
      // Mock result for now, replace with real API call later
      // Logic: Simple mock based on height/weight
      const size = calculateMockSize(Number(measurements.height), Number(measurements.weight))
      
      setRecommendation({
        size: size,
        confidence: 'High',
        note: `Based on your height of ${measurements.height}cm and weight of ${measurements.weight}kg, size ${size} gives the best ${measurements.fitPreference} fit.`,
        matchPercentage: 94
      })
      setStep('result')
    }, 2000)
  }

  const calculateMockSize = (h: number, w: number) => {
    // Very dummy logic for demonstration
    if (h > 180 || w > 90) return 'XL'
    if (h > 170 || w > 80) return 'L'
    if (h > 160 || w > 60) return 'M'
    return 'S'
  }

  const reset = () => {
    setStep('input')
    setMeasurements({ ...measurements })
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 text-indigo-600 border-indigo-200 hover:bg-indigo-50">
          <Sparkles className="w-4 h-4" />
          AI Size Guide
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            AI Size Recommender
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <AnimatePresence mode="wait">
            {step === 'input' && (
              <motion.div
                key="input"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Height (cm)</Label>
                    <Input 
                      type="number" 
                      placeholder="175" 
                      value={measurements.height}
                      onChange={(e) => setMeasurements({...measurements, height: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Weight (kg)</Label>
                    <Input 
                      type="number" 
                      placeholder="70" 
                      value={measurements.weight}
                      onChange={(e) => setMeasurements({...measurements, weight: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Fit Preference</Label>
                  <Select 
                    value={measurements.fitPreference} 
                    onValueChange={(v) => setMeasurements({...measurements, fitPreference: v})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tight">Slim / Tight Fit</SelectItem>
                      <SelectItem value="regular">Regular Fit</SelectItem>
                      <SelectItem value="loose">Loose / Relaxed Fit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
                  onClick={handleAnalyze}
                  disabled={!measurements.height || !measurements.weight}
                >
                  <Sparkles className="w-4 h-4" />
                  Find My Size
                </Button>
              </motion.div>
            )}

            {step === 'analyzing' && (
              <motion.div
                key="analyzing"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col items-center justify-center py-8 text-center"
              >
                <div className="relative w-16 h-16 mb-4">
                  <div className="absolute inset-0 border-4 border-indigo-200 rounded-full animate-ping" />
                  <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin" />
                  <Sparkles className="absolute inset-0 m-auto w-6 h-6 text-indigo-600 animate-pulse" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Analyzing Your Fit...</h3>
                <p className="text-sm text-gray-500">Checking sizing charts and customer data</p>
              </motion.div>
            )}

            {step === 'result' && recommendation && (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-4"
              >
                <div className="bg-indigo-50 rounded-full w-20 h-20 mx-auto flex items-center justify-center border-4 border-indigo-100 shadow-inner">
                  <span className="text-3xl font-bold text-indigo-700">{recommendation.size}</span>
                </div>
                
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Best Match: {recommendation.size}</h3>
                  <div className="flex items-center justify-center gap-2 mt-1">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                      <Check className="w-3 h-3" /> {recommendation.confidence} Confidence
                    </span>
                    <span className="text-xs text-gray-500">{recommendation.matchPercentage}% Match</span>
                  </div>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-600 border">
                  {recommendation.note}
                </div>

                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={reset} className="flex-1 text-gray-500 hover:text-gray-900">
                    Check another
                  </Button>
                  {onSizeSelect && (
                    <Button 
                      size="sm" 
                      onClick={() => {
                        onSizeSelect(recommendation.size)
                        setIsOpen(false)
                      }} 
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                      Apply {recommendation.size}
                    </Button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  )
}
