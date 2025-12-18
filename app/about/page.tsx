'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ShoppingBag, Users, Award, Truck, Shield, Heart, Star, Globe, Loader2 } from 'lucide-react'

const stats = [
  { icon: ShoppingBag, value: '10,000+', label: 'Products Sold' },
  { icon: Users, value: '5,000+', label: 'Happy Customers' },
  { icon: Award, value: '100+', label: 'Brands' },
  { icon: Star, value: '4.8', label: 'Average Rating' },
]

const values = [
  {
    icon: Shield,
    title: 'Quality First',
    description: 'We carefully select every product to ensure the highest quality standards for our customers.'
  },
  {
    icon: Truck,
    title: 'Fast Delivery',
    description: 'Nationwide delivery within 2-5 business days. Free shipping on orders over ৳2000.'
  },
  {
    icon: Heart,
    title: 'Customer Love',
    description: 'Our customers are at the heart of everything we do. Your satisfaction is our priority.'
  },
  {
    icon: Globe,
    title: 'Local Pride',
    description: 'Proudly serving Bangladesh with the best selection of local and international products.'
  },
]

export default function AboutPage() {
  const [settings, setSettings] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings')
      if (res.ok) {
        const data = await res.json()
        setSettings(data.settings)
      }
    } catch (err) {
      console.error('Failed to fetch settings:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white py-24">
        <div className="container mx-auto px-4 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold mb-6"
          >
            {settings?.aboutTitle || `About ${settings?.storeName || 'CTG Collection'}`}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-white/80 max-w-2xl mx-auto"
          >
            {settings?.storeTagline || 'Your trusted destination for quality products in Bangladesh since 2020.'}
          </motion.p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="text-center p-6">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-muted-foreground">{stat.label}</p>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Our Story - Dynamic */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Our Story</h2>
            {settings?.aboutContent ? (
              <div className="text-lg text-muted-foreground whitespace-pre-wrap">
                {settings.aboutContent}
              </div>
            ) : (
              <>
                <p className="text-lg text-muted-foreground mb-6">
                  {settings?.storeName || 'CTG Collection'} started in 2020 with a simple mission: to make quality products 
                  accessible to everyone in Bangladesh. What began as a small online store in 
                  Chittagong has grown into one of the most trusted e-commerce platforms in the country.
                </p>
                <p className="text-lg text-muted-foreground">
                  Today, we serve thousands of customers across Bangladesh, offering a wide range 
                  of products from fashion and electronics to home goods and accessories. Our 
                  commitment to quality, competitive pricing, and excellent customer service 
                  has made us a household name.
                </p>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Mission & Vision - Dynamic */}
      {(settings?.aboutMission || settings?.aboutVision) && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {settings?.aboutMission && (
                <Card className="p-6">
                  <h3 className="text-2xl font-bold mb-4 text-blue-600">Our Mission</h3>
                  <p className="text-muted-foreground">{settings.aboutMission}</p>
                </Card>
              )}
              {settings?.aboutVision && (
                <Card className="p-6">
                  <h3 className="text-2xl font-bold mb-4 text-purple-600">Our Vision</h3>
                  <p className="text-muted-foreground">{settings.aboutVision}</p>
                </Card>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Values Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Our Values</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => {
              const Icon = value.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full p-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                    <p className="text-muted-foreground">{value.description}</p>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Shop?</h2>
          <p className="text-white/80 mb-8 max-w-xl mx-auto">
            Explore our wide range of products and discover why thousands of customers trust {settings?.storeName || 'CTG Collection'}.
          </p>
          <div className="flex justify-center gap-4">
            <Button asChild size="lg" variant="secondary">
              <Link href="/shop">Browse Products</Link>
            </Button>
            <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-white/90 border-2 border-white">
              <Link href="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
