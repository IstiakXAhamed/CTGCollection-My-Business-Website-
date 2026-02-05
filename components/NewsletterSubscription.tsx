'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Mail, Sparkles, UserPlus, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export function NewsletterSubscription() {
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
            Join Silk Mart & Get 10% Off!
          </h2>
          <p className="text-white/80 mb-8 max-w-lg mx-auto">
            Create an account today to unlock exclusive deals, early access to new arrivals, and a 10% discount on your first order.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button 
                size="lg" 
                className="h-12 px-8 rounded-full bg-white text-blue-600 hover:bg-white/90 font-bold"
              >
                <UserPlus className="w-5 h-5 mr-2" />
                Join Now - It&apos;s Free
              </Button>
            </Link>
            <Link href="/login">
              <Button 
                variant="outline"
                size="lg" 
                className="h-12 px-8 rounded-full border-white text-white hover:bg-white/10 hover:text-white"
              >
                Login
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>

          <p className="mt-8 text-sm text-white/50">
            Already have an account? Login to view your personalized offers.
          </p>
        </motion.div>
      </div>
    </section>
  )
}

export default NewsletterSubscription
