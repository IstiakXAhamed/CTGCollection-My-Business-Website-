'use client'

import { memo, useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Logo } from '@/components/Logo'
import { Facebook, Instagram, Twitter, Youtube, MapPin, Phone, Mail, CreditCard, Truck, ShieldCheck, Headphones, Linkedin, Download, Sparkles } from 'lucide-react'
import { useAppStandalone } from '@/hooks/useAppStandalone'

const footerLinks = {
  shop: [
    { label: 'All Products', href: '/shop' },
    { label: 'Featured', href: '/shop?featured=true' },
    { label: 'On Sale', href: '/shop?sale=true' },
    { label: 'New Arrivals', href: '/shop?new=true' },
  ],
  customer: [
    { label: 'My Account', href: '/dashboard' },
    { label: 'Order Tracking', href: '/dashboard/orders' },
    { label: 'Wishlist', href: '/dashboard/wishlist' },
    { label: 'Cart', href: '/cart' },
  ],
  company: [
    { label: 'About Us', href: '/about' },
    { label: 'Contact Us', href: '/contact' },
    { label: 'FAQ', href: '/faq' },
    { label: 'Privacy Policy', href: '/privacy' },
  ],
}

const features = [
  { icon: Truck, title: 'Free Shipping', description: 'On orders over ৳2000' },
  { icon: ShieldCheck, title: 'Secure Payment', description: 'SSL encrypted checkout' },
  { icon: CreditCard, title: 'Easy Payment', description: 'SSLCommerz & COD' },
  { icon: Headphones, title: '24/7 Support', description: 'Always here to help' },
]

export function Footer() {
  const [settings, setSettings] = useState<any>(null)
  const currentYear = new Date().getFullYear()
  const isStandalone = useAppStandalone()

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
    }
  }

  // Build social links from settings
  const socialLinks = [
    settings?.facebook && { icon: Facebook, href: settings.facebook, label: 'Facebook' },
    settings?.instagram && { icon: Instagram, href: settings.instagram, label: 'Instagram' },
    settings?.twitter && { icon: Twitter, href: settings.twitter, label: 'Twitter' },
    settings?.youtube && { icon: Youtube, href: settings.youtube, label: 'Youtube' },
    settings?.linkedin && { icon: Linkedin, href: settings.linkedin, label: 'LinkedIn' },
  ].filter(Boolean) as { icon: any; href: string; label: string }[]

  // Fallback social links if none set
  const displaySocialLinks = socialLinks.length > 0 ? socialLinks : [
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Twitter, href: '#', label: 'Twitter' },
  ]

  // Hide Footer completely in standalone PWA mode (BottomNav provides navigation)
  if (isStandalone) {
    return null
  }

  return (
    <footer className="bg-gradient-to-b from-gray-900 via-slate-900 to-black text-white relative overflow-hidden">
      {/* Animated background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ opacity: [0.1, 0.3, 0.1] }}
          transition={{ duration: 5, repeat: Infinity }}
          className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 7, repeat: Infinity, delay: 1 }}
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl"
        />
      </div>

      {/* Features Bar */}
      <div className="relative z-10 border-b border-white/10">
        <div className="container mx-auto px-4 py-6 sm:py-8">
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-3 sm:gap-4 p-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300"
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl flex items-center justify-center flex-shrink-0 border border-white/10">
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm sm:text-base">{feature.title}</p>
                    <p className="text-xs sm:text-sm text-gray-400 truncate">{feature.description}</p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="relative z-10 container mx-auto px-4 py-8 sm:py-12">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-6 sm:gap-8">
          {/* Brand Section */}
          <div className="col-span-2 lg:col-span-2">
            <Link href="/" className="inline-flex items-center gap-2 mb-4 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
                <Logo 
                  width={40} 
                  height={40}
                  className="relative w-10 h-10 object-contain bg-gray-900/50 rounded-xl"
                  priority
                />
              </div>
              <span className="text-2xl font-bold">{settings?.storeName || 'Silk Mart'}</span>
            </Link>
            <p className="text-gray-400 mb-6 max-w-md leading-relaxed">
              {settings?.footerAbout || "Bangladesh's premier destination for quality products. Curated fashion, electronics, and lifestyle essentials with the best prices."}
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <motion.div 
                whileHover={{ x: 5 }}
                className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center border border-blue-500/20">
                  <MapPin className="w-4 h-4 text-blue-400" />
                </div>
                <span>{settings?.storeAddress || 'Chittagong, Bangladesh'}</span>
              </motion.div>
              <motion.div 
                whileHover={{ x: 5 }}
                className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center border border-blue-500/20">
                  <Phone className="w-4 h-4 text-blue-400" />
                </div>
                <span>{settings?.storePhone || '+8801991523289'}</span>
              </motion.div>
              <motion.div 
                whileHover={{ x: 5 }}
                className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center border border-blue-500/20">
                  <Mail className="w-4 h-4 text-blue-400" />
                </div>
                <span>{settings?.storeEmail || 'support@silkmartbd.com'}</span>
              </motion.div>
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              Shop
            </h4>
            <ul className="space-y-2">
              {footerLinks.shop.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-gray-400 hover:text-white hover:translate-x-1 transition-all duration-300 inline-flex items-center gap-2">
                    <span className="w-1 h-1 bg-blue-500 rounded-full opacity-0 hover:opacity-100 transition-opacity" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Links */}
          <div>
            <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-400" />
              My Account
            </h4>
            <ul className="space-y-2">
              {footerLinks.customer.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-gray-400 hover:text-white hover:translate-x-1 transition-all duration-300 inline-flex items-center gap-2">
                    <span className="w-1 h-1 bg-blue-500 rounded-full opacity-0 hover:opacity-100 transition-opacity" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-pink-400" />
              Company
            </h4>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-gray-400 hover:text-white hover:translate-x-1 transition-all duration-300 inline-flex items-center gap-2">
                    <span className="w-1 h-1 bg-blue-500 rounded-full opacity-0 hover:opacity-100 transition-opacity" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="relative z-10 border-t border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-gray-400 text-xs sm:text-sm text-center sm:text-left">
              {settings?.copyrightText || `© ${currentYear} Silk Mart. All rights reserved.`}
            </p>
            
            {/* Social Links */}
            <div className="flex items-center gap-3">
              {displaySocialLinks.map((social, index) => {
                const Icon = social.icon
                return (
                  <motion.a
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-9 h-9 sm:w-10 sm:h-10 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg flex items-center justify-center hover:bg-blue-600/80 hover:border-blue-500/50 transition-all duration-300 group"
                  >
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5 group-hover:text-white transition-colors" />
                  </motion.a>
                )
              })}
            </div>

            {/* Payment Methods */}
            <div className="flex items-center gap-2 text-gray-400 text-xs sm:text-sm flex-wrap justify-center sm:justify-end">
              <span>We Accept:</span>
              <div className="flex gap-1.5 sm:gap-2 flex-wrap">
                {['bKash', 'Nagad', 'Visa', 'COD', 'Mastercard'].map((method) => (
                  <span key={method} className="px-2 py-1 bg-white/5 backdrop-blur-sm border border-white/10 rounded text-[10px] sm:text-xs hover:bg-white/10 transition-colors">
                    {method}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
