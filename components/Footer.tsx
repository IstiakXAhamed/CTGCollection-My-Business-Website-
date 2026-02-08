'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Logo } from '@/components/Logo'
import { Facebook, Instagram, Twitter, Youtube, MapPin, Phone, Mail, CreditCard, Truck, ShieldCheck, Headphones, Linkedin, Download } from 'lucide-react'

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

  return (
    <footer className="bg-gray-900 text-white">
      {/* Features Bar */}
      <div className="border-b border-gray-800">
        <div className="container mx-auto px-4 py-6 sm:py-8">
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div key={index} className="flex items-center gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm sm:text-base">{feature.title}</p>
                    <p className="text-xs sm:text-sm text-gray-400 truncate">{feature.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-6 sm:gap-8">
          <div className="col-span-2 lg:col-span-2">
            <Link href="/" className="inline-flex items-center gap-2 mb-4">
              <Logo 
                width={40} 
                height={40}
                className="w-10 h-10 object-contain"
                priority
              />
              <span className="text-2xl font-bold">{settings?.storeName || 'Silk Mart'}</span>
            </Link>
            <p className="text-gray-400 mb-6 max-w-md">
              {settings?.footerAbout || 'Silk Mart is Bangladesh\'s premier destination for quality products. We offer a curated range of fashion, electronics, and lifestyle essentials with the best prices and lightning-fast delivery.'}
            </p>
            
            {/* Contact Info - Dynamic */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-gray-400">
                <MapPin className="w-5 h-5 text-blue-500" />
                <span>{settings?.storeAddress || 'Chittagong, Bangladesh'}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-400">
                <Phone className="w-5 h-5 text-blue-500" />
                <span>{settings?.storePhone || '+8801991523289'}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-400">
                <Mail className="w-5 h-5 text-blue-500" />
                <span>{settings?.storeEmail || 'support@silkmartbd.com'}</span>
              </div>
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Shop</h4>
            <ul className="space-y-3">
              {footerLinks.shop.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-gray-400 hover:text-white transition">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Links */}
          <div>
            <h4 className="font-semibold text-lg mb-4">My Account</h4>
            <ul className="space-y-3">
              {footerLinks.customer.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-gray-400 hover:text-white transition">
                    {link.label}
                  </Link>
                </li>
              ))}
              {settings?.pwaShowInstallLink && (
                <li>
                  <button 
                    onClick={() => window.dispatchEvent(new CustomEvent('pwa-install-requested'))}
                    className="text-blue-400 hover:text-blue-300 transition flex items-center gap-2 text-sm"
                  >
                    <Download className="w-4 h-4" />
                    Install Our App
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-gray-400 hover:text-white transition">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-gray-400 text-xs sm:text-sm text-center sm:text-left">
              {settings?.copyrightText || `© ${currentYear} Silk Mart. All rights reserved.`}
            </p>
            
            {/* Social Links - Dynamic */}
            <div className="flex items-center gap-4">
              {displaySocialLinks.map((social, index) => {
                const Icon = social.icon
                return (
                  <a
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="w-9 h-9 sm:w-10 sm:h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition min-h-[44px] min-w-[44px]"
                  >
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </a>
                )
              })}
            </div>

            {/* Payment Methods */}
            <div className="flex items-center gap-2 text-gray-400 text-xs sm:text-sm flex-wrap justify-center sm:justify-end">
              <span>We Accept:</span>
              <div className="flex gap-1.5 sm:gap-2 flex-wrap">
                <span className="px-2 py-1 bg-gray-800 rounded text-[10px] sm:text-xs">bKash</span>
                <span className="px-2 py-1 bg-gray-800 rounded text-[10px] sm:text-xs">Nagad</span>
                <span className="px-2 py-1 bg-gray-800 rounded text-[10px] sm:text-xs">Visa</span>
                <span className="px-2 py-1 bg-gray-800 rounded text-[10px] sm:text-xs">COD</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
