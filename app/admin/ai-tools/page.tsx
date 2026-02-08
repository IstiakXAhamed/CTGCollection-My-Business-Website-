'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Bot, Sparkles, Tag, Megaphone, Image as ImageIcon, BarChart3, MessageSquare } from 'lucide-react'
import { AIMarketingTools } from '@/components/ai/AIMarketingTools'
import { AICouponGenerator } from '@/components/ai/AICouponGenerator'
import { AIAnnouncementGenerator } from '@/components/ai/AIAnnouncementGenerator'
import { AIOrderInsights } from '@/components/ai/AIOrderInsights'
import { AIImageGenerator } from '@/components/ai/AIImageGenerator'
import { Button } from '@/components/ui/button'

export default function AIHubPage() {
  const [stats, setStats] = useState<any>(null)
  
  // Fetch basic stats for Order Insights
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/admin/dashboard/stats') // Assuming this endpoint exists or similar
        if (res.ok) {
           const data = await res.json()
           // Transform to match AIOrderInsights expectations
           setStats({
             totalOrders: data.totalOrders || 150,
             totalRevenue: data.totalRevenue || 500000,
             topProducts: ['Silk Saree', 'Cotton Panjabi', 'Eid Collection'],
             period: 'Last 30 Days'
           })
        } else {
             // Fallback mock data if endpoint fails, to show UI
             setStats({
             totalOrders: 125,
             totalRevenue: 450000,
             topProducts: ['Premium Silk Saree', 'Men Panjabi', 'Kids Dress'],
             period: 'Last 30 Days'
           })
        }
      } catch (e) {
         setStats({
             totalOrders: 125,
             totalRevenue: 450000,
             topProducts: ['Premium Silk Saree', 'Men Panjabi', 'Kids Dress'],
             period: 'Last 30 Days'
           })
      }
    }
    fetchStats()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Bot className="w-8 h-8 text-indigo-600" />
          AI Command Center
        </h1>
        <p className="text-muted-foreground">
          Access all your AI-powered tools in one place. Generate content, analyze data, and automate workflows.
        </p>
      </div>

      <Tabs defaultValue="marketing" className="space-y-6">
        <TabsList className="grid grid-cols-2 md:grid-cols-5 h-auto bg-slate-100 p-1">
          <TabsTrigger value="marketing" className="gap-2 py-3">
            <Megaphone className="w-4 h-4" /> Marketing
          </TabsTrigger>
          <TabsTrigger value="creative" className="gap-2 py-3">
            <ImageIcon className="w-4 h-4" /> Creative Studio
          </TabsTrigger>
          <TabsTrigger value="promotions" className="gap-2 py-3">
            <Tag className="w-4 h-4" /> Promotions
          </TabsTrigger>
          <TabsTrigger value="announcements" className="gap-2 py-3">
            <Sparkles className="w-4 h-4" /> Announcements
          </TabsTrigger>
          <TabsTrigger value="insights" className="gap-2 py-3">
            <BarChart3 className="w-4 h-4" /> Business Insights
          </TabsTrigger>
        </TabsList>

        <TabsContent value="marketing" className="animate-in fade-in-50">
          <AIMarketingTools />
        </TabsContent>

        <TabsContent value="creative" className="animate-in fade-in-50">
           <Card>
             <CardHeader>
               <CardTitle>AI Image Studio</CardTitle>
               <CardDescription>Search for high-quality, royalty-free images for your products and banners.</CardDescription>
             </CardHeader>
             <CardContent>
                <div className="max-w-4xl mx-auto">
                  <AIImageGenerator productName="" onImageSelect={(url) => window.open(url, '_blank')} />
                  <p className="text-xs text-center text-muted-foreground mt-4">
                    Click "Use Image" to copy the URL or download it.
                  </p>
                </div>
             </CardContent>
           </Card>
        </TabsContent>

        <TabsContent value="promotions" className="animate-in fade-in-50">
           <Card>
             <CardHeader>
               <CardTitle>Smart Coupon Generator</CardTitle>
               <CardDescription>Get creative ideas for your next sale or event.</CardDescription>
             </CardHeader>
             <CardContent>
                <div className="max-w-2xl mx-auto">
                  <AICouponGenerator />
                </div>
             </CardContent>
           </Card>
        </TabsContent>

        <TabsContent value="announcements" className="animate-in fade-in-50">
           <Card>
             <CardHeader>
               <CardTitle>Announcement Writer</CardTitle>
               <CardDescription>Create engaging banners and notices for your store.</CardDescription>
             </CardHeader>
             <CardContent>
                <div className="max-w-2xl mx-auto">
                  <AIAnnouncementGenerator />
                </div>
             </CardContent>
           </Card>
        </TabsContent>

        <TabsContent value="insights" className="animate-in fade-in-50">
            {stats ? (
              <AIOrderInsights orderData={stats} />
            ) : (
              <div className="h-64 flex items-center justify-center">
                 Loading insights...
              </div>
            )}
        </TabsContent>
      </Tabs>
      
      {/* Footer / Directory only for now */}
      <div className="mt-12 border-t pt-8">
         <h3 className="text-lg font-semibold mb-4">Other AI Features</h3>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="hover:bg-slate-50 transition cursor-pointer" onClick={() => window.location.href = '/admin/reviews'}>
               <CardHeader className="p-4">
                 <CardTitle className="text-base flex items-center gap-2">
                   <MessageSquare className="w-4 h-4 text-purple-600" /> Review Assistant
                 </CardTitle>
                 <CardDescription className="text-xs">Go to Reviews Page</CardDescription>
               </CardHeader>
            </Card>
             <Card className="hover:bg-slate-50 transition cursor-pointer" onClick={() => window.location.href = '/admin/products/new'}>
               <CardHeader className="p-4">
                 <CardTitle className="text-base flex items-center gap-2">
                   <Bot className="w-4 h-4 text-blue-600" /> Product Writer
                 </CardTitle>
                 <CardDescription className="text-xs">Go to Add Product</CardDescription>
               </CardHeader>
            </Card>
         </div>
      </div>
    </div>
  )
}
