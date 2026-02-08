'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Bot, Loader2, Copy, Check, Facebook, Instagram, Mail, MessageSquare, Megaphone, Hash } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export function AIMarketingTools() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [product, setProduct] = useState('')
  const [result, setResult] = useState<any>(null)
  const [activeTab, setActiveTab] = useState('facebook_post')

  const generateContent = async () => {
    if (!product) {
      toast({ title: "Topic missing", description: "Please enter a product or topic name.", variant: "destructive" })
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const res = await fetch('/api/ai/marketing-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: activeTab,
          topic: product,
          language: 'en', // Could make this selectable
          includeEmoji: true
        })
      })

      const data = await res.json()
      if (data.success) {
        setResult(data.content)
      } else {
        throw new Error(data.error || 'Failed to generate')
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to generate content.", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({ title: "Copied!", description: "Content copied to clipboard." })
  }

  const renderContent = () => {
    if (!result) return null

    // Handle different formats based on the API response structure for each type
    // Most return simple JSON, but let's be robust
    return (
      <div className="space-y-4 animate-in fade-in-50">
        {result.subject && (
           <div className="space-y-1">
             <Label className="text-xs text-muted-foreground">Subject Line</Label>
             <div className="p-2 bg-slate-50 border rounded text-sm font-medium flex justify-between items-center group">
               {result.subject}
               <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100" onClick={() => copyToClipboard(result.subject)}>
                 <Copy className="w-3 h-3" />
               </Button>
             </div>
           </div>
        )}
        
        {result.headline && (
           <div className="space-y-1">
             <Label className="text-xs text-muted-foreground">Headline</Label>
             <div className="p-2 bg-slate-50 border rounded text-sm font-bold flex justify-between items-center group">
               {result.headline}
               <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100" onClick={() => copyToClipboard(result.headline)}>
                 <Copy className="w-3 h-3" />
               </Button>
             </div>
           </div>
        )}

        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Content Body</Label>
          <div className="p-3 bg-slate-50 border rounded text-sm whitespace-pre-wrap relative group">
            {result.body || result.text || result.content || JSON.stringify(result)}
            <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 bg-white shadow-sm" onClick={() => copyToClipboard(result.body || result.text || result.content)}>
                 <Copy className="w-3 h-3" />
            </Button>
          </div>
        </div>
        
        {result.hashtags && (
          <div className="space-y-1">
             <Label className="text-xs text-muted-foreground">Hashtags</Label>
             <div className="p-2 bg-blue-50 text-blue-700 border border-blue-100 rounded text-sm flex justify-between items-center group">
               {Array.isArray(result.hashtags) ? result.hashtags.join(' ') : result.hashtags}
               <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100" onClick={() => copyToClipboard(Array.isArray(result.hashtags) ? result.hashtags.join(' ') : result.hashtags)}>
                 <Copy className="w-3 h-3" />
               </Button>
             </div>
           </div>
        )}
      </div>
    )
  }

  return (
    <Card className="h-full border-l-4 border-l-indigo-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Megaphone className="w-5 h-5 text-indigo-600" />
          Marketing Content Generator
        </CardTitle>
        <CardDescription>Generate posts, emails, and ad copy instantly.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-5 h-auto">
            <TabsTrigger value="facebook_post" className="flex flex-col gap-1 py-2">
              <Facebook className="w-4 h-4" /> <span className="text-[10px]">Facebook</span>
            </TabsTrigger>
            <TabsTrigger value="instagram_caption" className="flex flex-col gap-1 py-2">
              <Instagram className="w-4 h-4" /> <span className="text-[10px]">Instagram</span>
            </TabsTrigger>
             <TabsTrigger value="email_campaign" className="flex flex-col gap-1 py-2">
              <Mail className="w-4 h-4" /> <span className="text-[10px]">Email</span>
            </TabsTrigger>
             <TabsTrigger value="ad_copy" className="flex flex-col gap-1 py-2">
              <Megaphone className="w-4 h-4" /> <span className="text-[10px]">Ads</span>
            </TabsTrigger>
             <TabsTrigger value="sms" className="flex flex-col gap-1 py-2">
              <MessageSquare className="w-4 h-4" /> <span className="text-[10px]">SMS</span>
            </TabsTrigger>
          </TabsList>

          <div className="space-y-4">
             <div className="flex gap-2">
               <Input 
                 placeholder="What are you promoting? (e.g., Summer Sale, New Silk Saree)" 
                 value={product}
                 onChange={(e) => setProduct(e.target.value)}
               />
               <Button onClick={generateContent} disabled={loading} className="bg-indigo-600 hover:bg-indigo-700">
                 {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bot className="w-4 h-4 mr-2" />}
                 Generate
               </Button>
             </div>
             
             {renderContent()}
          </div>
        </Tabs>
      </CardContent>
    </Card>
  )
}
