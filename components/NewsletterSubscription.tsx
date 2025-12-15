'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Mail, CheckCircle2, Loader2, Gift, Sparkles } from 'lucide-react'

export function NewsletterSubscription() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [subscribed, setSubscribed] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setLoading(true)
    
    // Simulate subscription
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    setLoading(false)
    setSubscribed(true)
  }

  return (
    <section className="py-16 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
      <div className="container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center text-white"
        >
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Mail className="w-12 h-12" />
              <Sparkles className="w-5 h-5 absolute -top-1 -right-1 text-yellow-300" />
            </div>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Subscribe & Get 10% Off!
          </h2>
          <p className="text-white/80 mb-8">
            Join our newsletter for exclusive deals, new arrivals, and special offers. 
            Get 10% off your first order when you subscribe!
          </p>

          {subscribed ? (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center justify-center gap-3 bg-white/10 backdrop-blur rounded-full px-8 py-4"
            >
              <CheckCircle2 className="w-6 h-6 text-green-300" />
              <span className="font-semibold">
                Thank you for subscribing! Check your email for your discount code.
              </span>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <div className="flex-1 relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="pl-12 h-12 rounded-full bg-white/10 border-white/20 text-white placeholder:text-white/50"
                />
              </div>
              <Button 
                type="submit" 
                size="lg" 
                className="h-12 rounded-full bg-white text-blue-600 hover:bg-white/90"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Gift className="w-5 h-5 mr-2" />
                    Subscribe
                  </>
                )}
              </Button>
            </form>
          )}

          <p className="mt-6 text-sm text-white/60">
            By subscribing, you agree to receive promotional emails. Unsubscribe anytime.
          </p>
        </motion.div>
      </div>
    </section>
  )
}

export default NewsletterSubscription
