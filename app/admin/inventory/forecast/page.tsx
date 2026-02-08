
'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  TrendingUp, Package, AlertTriangle, ArrowUpRight, 
  Calendar, RefreshCw, Sparkles, Loader2, ArrowRight,
  CheckCircle2, XCircle
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { Progress } from '@/components/ui/progress'

interface Forecast {
  dailyRate: number
  daysUntilStockout: number
  restockRecommendation: number
  urgency: 'critical' | 'high' | 'medium' | 'low'
  reason: string
}

export default function InventoryForecastPage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [analyzingIds, setAnalyzingIds] = useState<string[]>([])
  const [forecasts, setForecasts] = useState<Record<string, Forecast>>({})
  const [isBulkAnalyzing, setIsBulkAnalyzing] = useState(false)
  const [bulkProgress, setBulkProgress] = useState(0)
  const { toast } = useToast()

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/products?limit=100', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setProducts(data.products || [])
      }
    } catch (error) {
      console.error('Failed to fetch products', error)
      toast({
        title: "Fetch Failed",
        description: "Could not load products. Please refresh.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const generateForecast = async (product: any) => {
    if (analyzingIds.includes(product.id)) return false

    setAnalyzingIds(prev => [...prev, product.id])
    try {
      const res = await fetch('/api/ai/inventory-forecast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productData: {
            id: product.id,
            name: product.name,
            category: product.category?.name || 'Uncategorized',
            currentStock: product.variants?.reduce((sum: number, v: any) => sum + (v.stock || 0), 0) || 0,
            price: product.basePrice
          }
        })
      })

      if (res.ok) {
        const data = await res.json()
        if (data.forecast && typeof data.forecast === 'object') {
             setForecasts(prev => ({
              ...prev,
              [product.id]: data.forecast
            }))
            return true
        }
      } else {
        const err = await res.json()
        console.error(`Forecast failed for ${product.name}:`, err)
        toast({
          title: "Forecast Failed",
          description: err.error || "AI service is currently unavailable. Please try again later.",
          variant: "destructive"
        })
      }
      return false
    } catch (error) {
      console.error('Forecast failed', error)
      return false
    } finally {
      setAnalyzingIds(prev => prev.filter(id => id !== product.id))
    }
  }

  const runBulkAnalysis = async (productList: any[]) => {
    if (productList.length === 0) return

    setIsBulkAnalyzing(true)
    setBulkProgress(0)
    let successCount = 0

    for (let i = 0; i < productList.length; i++) {
      const product = productList[i]
      const success = await generateForecast(product)
      if (success) successCount++
      setBulkProgress(Math.round(((i + 1) / productList.length) * 100))
      
      // Small delay between requests to be safe
      await new Promise(r => setTimeout(r, 500))
    }

    setIsBulkAnalyzing(false)
    toast({
      title: "Bulk Analysis Complete",
      description: `Successfully analyzed ${successCount} of ${productList.length} items.`,
    })
  }

  const analyzeLowStock = () => {
    const lowStockProducts = products.filter(p => {
      const stock = p.variants?.reduce((sum: number, v: any) => sum + (v.stock || 0), 0) || 0
      return stock < 20
    })
    
    if (lowStockProducts.length === 0) {
      toast({ title: "No Low Stock", description: "All items have sufficient stock." })
      return
    }
    
    runBulkAnalysis(lowStockProducts)
  }

  const analyzeAll = () => {
    if (products.length === 0) return
    runBulkAnalysis(products)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <TrendingUp className="w-8 h-8 text-blue-600" />
            AI Inventory Forecast
          </h1>
          <p className="text-gray-600 mt-1">Predict stockouts and restock needs using AI</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={fetchProducts} disabled={loading || isBulkAnalyzing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
          <Button 
            onClick={analyzeLowStock} 
            disabled={isBulkAnalyzing}
            className="bg-amber-600 hover:bg-amber-700 text-white"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Analyze Low Stock
          </Button>
          <Button 
            onClick={analyzeAll} 
            disabled={isBulkAnalyzing}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Analyze All Items
          </Button>
        </div>
      </div>

      {isBulkAnalyzing && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="pt-6 pb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-700 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Bulk Analysis in Progress... ({bulkProgress}%)
              </span>
              <span className="text-xs text-blue-600">Processing items sequentially to ensure accuracy</span>
            </div>
            <Progress value={bulkProgress} className="h-2 bg-blue-100" />
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(product => {
            const forecast = forecasts[product.id]
            const isAnalyzing = analyzingIds.includes(product.id)
            
            const totalStock = product.variants?.reduce((sum: number, v: any) => sum + (v.stock || 0), 0) || 0
            const isLowStock = totalStock < 10

            return (
              <Card key={product.id} className={`overflow-hidden transition-all ${isLowStock ? 'border-amber-200 bg-amber-50/30' : ''}`}>
                <CardHeader className="pb-3 border-b bg-gray-50/50">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg font-semibold truncate max-w-[200px]" title={product.name}>
                        {product.name}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className={`${isLowStock ? 'border-amber-500 text-amber-700 bg-amber-100' : 'bg-white'}`}>
                          <Package className="w-3 h-3 mr-1" />
                          Stock: {totalStock}
                        </Badge>
                        <Badge variant="secondary" className="bg-gray-100">
                          {product.category?.name || 'Uncategorized'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-4">
                  {forecast ? (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border shadow-sm">
                        <div className="text-center">
                          <p className="text-[10px] text-gray-500 uppercase font-black tracking-wider">Daily Sales</p>
                          <p className="text-lg font-bold text-gray-900">
                            ~{typeof forecast.dailyRate === 'number' ? forecast.dailyRate : 'N/A'}
                          </p>
                        </div>
                        <div className="h-8 w-px bg-gray-200" />
                        <div className="text-center">
                          <p className="text-[10px] text-gray-500 uppercase font-black tracking-wider">Stockout In</p>
                          <p className={`text-lg font-bold ${Number(forecast.daysUntilStockout) < 7 ? 'text-red-600' : 'text-gray-900'}`}>
                            {typeof forecast.daysUntilStockout === 'number' ? forecast.daysUntilStockout : '?'} Days
                          </p>
                        </div>
                        <div className="h-8 w-px bg-gray-200" />
                        <div className="text-center">
                          <p className="text-[10px] text-green-600 uppercase font-black tracking-wider">Restock</p>
                          <p className="text-lg font-bold text-green-600">
                             +{typeof forecast.restockRecommendation === 'number' ? forecast.restockRecommendation : '0'}
                          </p>
                        </div>
                      </div>

                      <div className={`p-3 rounded-lg text-sm border ${
                        forecast.urgency === 'critical' ? 'bg-red-50 border-red-100 text-red-800' :
                        forecast.urgency === 'high' ? 'bg-amber-50 border-amber-100 text-amber-800' :
                        'bg-blue-50 border-blue-100 text-blue-800'
                      }`}>
                        <div className="flex items-start gap-2">
                          {forecast.urgency === 'critical' ? <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" /> : <Sparkles className="w-4 h-4 mt-0.5 shrink-0" />}
                          <div>
                            <span className="font-bold uppercase text-[10px] tracking-widest">{forecast.urgency || 'MEDIUM'} Priority</span>
                            <p className="mt-1 leading-snug font-medium">
                                {typeof forecast.reason === 'string' ? forecast.reason : 'Analysis available'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6 bg-gray-50/50 rounded-lg border border-dashed hover:border-indigo-300 transition-colors">
                      {isAnalyzing ? (
                        <div className="flex flex-col items-center gap-2 text-indigo-600">
                          <Loader2 className="w-6 h-6 animate-spin" />
                          <span className="text-sm font-medium">Analyzing patterns...</span>
                        </div>
                      ) : (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="hover:bg-indigo-50 hover:text-indigo-600 group"
                          onClick={() => generateForecast(product)}
                        >
                          <Sparkles className="w-4 h-4 mr-2 text-gray-400 group-hover:text-indigo-500" />
                          Generate Forecast
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
