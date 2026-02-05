
'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  TrendingUp, Package, AlertTriangle, ArrowUpRight, 
  Calendar, RefreshCw, Sparkles, Loader2, ArrowRight
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default function InventoryForecastPage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [analyzingIds, setAnalyzingIds] = useState<string[]>([])
  const [forecasts, setForecasts] = useState<Record<string, any>>({})

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/products?limit=100', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        // Filter for products that might need restocking (e.g. stock < 50 or just all)
        setProducts(data.products || [])
      }
    } catch (error) {
      console.error('Failed to fetch products', error)
    } finally {
      setLoading(false)
    }
  }

  const generateForecast = async (product: any) => {
    if (analyzingIds.includes(product.id)) return

    setAnalyzingIds(prev => [...prev, product.id])
    try {
      // Mock sales history for now as we don't have a direct API for per-product sales history yet
      // In production, this should come from real analytics
      const salesHistory = {
        last30Days: Math.floor(Math.random() * 50) + 5, // Simulated data
        last7Days: Math.floor(Math.random() * 10) + 1
      }

      const res = await fetch('/api/ai/inventory-forecast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productData: {
            name: product.name,
            category: product.category,
            currentStock: product.stock,
            price: product.price
          },
          salesHistory
        })
      })

      if (res.ok) {
        const data = await res.json()
        setForecasts(prev => ({
          ...prev,
          [product.id]: data.forecast
        }))
      }
    } catch (error) {
      console.error('Forecast failed', error)
    } finally {
      setAnalyzingIds(prev => prev.filter(id => id !== product.id))
    }
  }

  // Helper to bulk analyze low stock items
  const analyzeLowStock = async () => {
    const lowStockProducts = products.filter(p => p.stock < 20)
    for (const p of lowStockProducts) {
      await generateForecast(p)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <TrendingUp className="w-8 h-8 text-blue-600" />
            AI Inventory Forecast
          </h1>
          <p className="text-gray-600 mt-1">Predict stockouts and restock needs using AI</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchProducts}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Data
          </Button>
          <Button onClick={analyzeLowStock} className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <Sparkles className="w-4 h-4 mr-2" />
            Analyze Low Stock Items
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(product => {
            const forecast = forecasts[product.id]
            const isAnalyzing = analyzingIds.includes(product.id)
            const isLowStock = product.stock < 10

            return (
              <Card key={product.id} className={`overflow-hidden transition-all ${isLowStock ? 'border-amber-200 bg-amber-50/30' : ''}`}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg font-semibold truncate" title={product.name}>
                        {product.name}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="bg-white">
                          <Package className="w-3 h-3 mr-1" />
                          Stock: {product.stock}
                        </Badge>
                        <Badge variant="secondary" className="bg-gray-100">
                          {product.category}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  {forecast ? (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border shadow-sm">
                        <div className="text-center">
                          <p className="text-xs text-gray-500 uppercase font-bold">Daily Sales</p>
                          <p className="text-lg font-bold text-gray-900">~{forecast.dailyRate}</p>
                        </div>
                        <div className="h-8 w-px bg-gray-200" />
                        <div className="text-center">
                          <p className="text-xs text-gray-500 uppercase font-bold">Stockout In</p>
                          <p className={`text-lg font-bold ${forecast.daysUntilStockout < 7 ? 'text-red-600' : 'text-gray-900'}`}>
                            {forecast.daysUntilStockout} Days
                          </p>
                        </div>
                        <div className="h-8 w-px bg-gray-200" />
                        <div className="text-center">
                          <p className="text-xs text-green-600 uppercase font-bold">Restock</p>
                          <p className="text-lg font-bold text-green-600">+{forecast.restockRecommendation}</p>
                        </div>
                      </div>

                      <div className={`p-3 rounded-lg text-sm border ${
                        forecast.urgency === 'critical' ? 'bg-red-50 border-red-100 text-red-800' :
                        forecast.urgency === 'high' ? 'bg-amber-50 border-amber-100 text-amber-800' :
                        'bg-blue-50 border-blue-100 text-blue-800'
                      }`}>
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                          <div>
                            <span className="font-bold uppercase text-xs">{forecast.urgency} Priority</span>
                            <p className="mt-1 leading-snug">{forecast.reason}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6 bg-gray-50/50 rounded-lg border border-dashed">
                      {isAnalyzing ? (
                        <div className="flex flex-col items-center gap-2 text-indigo-600">
                          <Loader2 className="w-6 h-6 animate-spin" />
                          <span className="text-sm font-medium">Analyzing sales patterns...</span>
                        </div>
                      ) : (
                        <Button 
                          variant="ghost" 
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
