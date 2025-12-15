'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Facebook, Instagram, Twitter, Youtube, MapPin, Phone, Mail, CreditCard, Truck, ShieldCheck, Headphones, Linkedin } from 'lucide-react'

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
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-600/10 rounded-xl flex items-center justify-center">
                    <Icon className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="font-semibold">{feature.title}</p>
                    <p className="text-sm text-gray-400">{feature.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-xl font-bold">C</span>
              </div>
              <span className="text-2xl font-bold">{settings?.storeName || 'CTG Collection'}</span>
            </Link>
            <p className="text-gray-400 mb-6 max-w-md">
              {settings?.footerAbout || 'Your premier destination for quality products in Bangladesh. We offer a wide range of fashion, electronics, and lifestyle products with the best prices and fastest delivery.'}
            </p>
            
            {/* Contact Info - Dynamic */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-gray-400">
                <MapPin className="w-5 h-5 text-blue-500" />
                <span>{settings?.storeAddress || 'Chittagong, Bangladesh'}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-400">
                <Phone className="w-5 h-5 text-blue-500" />
                <span>{settings?.storePhone || '+880 1234 567890'}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-400">
                <Mail className="w-5 h-5 text-blue-500" />
                <span>{settings?.storeEmail || 'support@ctgcollection.com'}</span>
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
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-400 text-sm">
              {settings?.copyrightText || `© ${currentYear} CTG Collection. All rights reserved.`}
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
                    className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition"
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                )
              })}
            </div>

            {/* Payment Methods */}
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <span>We Accept:</span>
              <div className="flex gap-2">
                <span className="px-2 py-1 bg-gray-800 rounded text-xs">bKash</span>
                <span className="px-2 py-1 bg-gray-800 rounded text-xs">Nagad</span>
                <span className="px-2 py-1 bg-gray-800 rounded text-xs">Visa</span>
                <span className="px-2 py-1 bg-gray-800 rounded text-xs">COD</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
