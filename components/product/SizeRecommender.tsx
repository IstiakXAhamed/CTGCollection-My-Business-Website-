
'use client'

import { useState } from 'react'
import { Ruler, Loader2, Sparkles, Check, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

interface SizeRecommenderProps {
  productType: string
  category?: string
}

export default function SizeRecommender({ productType, category }: SizeRecommenderProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [formData, setFormData] = useState({
    height: '',
    weight: '',
    fitPreference: 'regular'
  })

  // Determine needed fields based on category/type
  const isClothing = ['Saree', 'Panjabi', 'Shirt', 'T-Shirt', 'Dress', 'Kameez'].some(t => 
    productType.includes(t) || category?.includes(t)
  )

  if (!isClothing && !productType.toLowerCase().includes('wear')) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)

    try {
      const res = await fetch('/api/ai/size-recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productType: `${category || ''} ${productType}`,
          measurements: {
            height: formData.height,
            weight: formData.weight, // Asking AI to infer from weight/height + fit preference
            fit: formData.fitPreference
          }
        })
      })

      if (!res.ok) throw new Error('Recommendation failed')
      
      const data = await res.json()
      setResult(data.recommendation)
    } catch (error) {
      toast.error('Could not generate size recommendation')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 text-indigo-600 border-indigo-200 hover:bg-indigo-50">
          <Ruler className="w-4 h-4" />
          Find My Size (AI)
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            AI Size Recommender
          </DialogTitle>
        </DialogHeader>

        {!result ? (
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Height (cm)</Label>
                <Input 
                  type="number" 
                  placeholder="170" 
                  required 
                  value={formData.height}
                  onChange={e => setFormData({...formData, height: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Weight (kg)</Label>
                <Input 
                  type="number" 
                  placeholder="65" 
                  required
                  value={formData.weight}
                  onChange={e => setFormData({...formData, weight: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Fit Preference</Label>
              <Select 
                value={formData.fitPreference} 
                onValueChange={v => setFormData({...formData, fitPreference: v})}
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

            <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : 'Get Recommendation'}
            </Button>
            
            <p className="text-xs text-center text-muted-foreground mt-2">
              <Info className="w-3 h-3 inline mr-1" />
              AI analyzes typical sizing for {productType}
            </p>
          </form>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-4 space-y-4"
          >
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">Based on your measurements, your best fit is:</p>
              <div className="flex items-center justify-center gap-3">
                <span className="text-4xl font-bold text-indigo-600 border-2 border-indigo-100 rounded-xl px-6 py-2 bg-indigo-50">
                  {result.recommendedSize}
                </span>
                {result.confidence === 'high' && (
                  <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full flex items-center">
                    <Check className="w-3 h-3 mr-1" /> High Match
                  </span>
                )}
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg space-y-3 text-sm">
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Fit Expectation:</span>
                <span className="font-medium text-slate-700">{result.fitNotes}</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-muted-foreground">Alternative:</span>
                <span className="font-medium text-slate-700">{result.alternativeSize}</span>
              </div>
            </div>

            <p className="text-xs text-center text-gray-500 italic">
              "{result.tip}"
            </p>

            <Button variant="outline" className="w-full" onClick={() => setResult(null)}>
              Check Another Size
            </Button>
          </motion.div>
        )}
      </DialogContent>
    </Dialog>
  )
}
