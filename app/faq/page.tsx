'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { ChevronDown, HelpCircle, ShoppingCart, Truck, CreditCard, RefreshCw, Shield } from 'lucide-react'

const faqCategories = [
  {
    title: 'Shopping',
    icon: ShoppingCart,
    questions: [
      {
        q: 'How do I place an order?',
        a: 'Simply browse our products, add items to your cart, and proceed to checkout. You can pay via SSLCommerz (bKash, Nagad, Cards) or Cash on Delivery.'
      },
      {
        q: 'Can I modify my order after placing it?',
        a: 'Once an order is confirmed, modifications are limited. Please contact our support team within 30 minutes of placing your order for any changes.'
      },
      {
        q: 'How do I track my order?',
        a: 'After your order is shipped, you will receive a tracking number via SMS/email. You can also check your order status in your dashboard.'
      },
    ]
  },
  {
    title: 'Shipping & Delivery',
    icon: Truck,
    questions: [
      {
        q: 'What are the delivery charges?',
        a: 'Delivery is FREE for orders above ৳2000. For orders below ৳2000, a flat shipping fee of ৳100 applies across Bangladesh.'
      },
      {
        q: 'How long does delivery take?',
        a: 'We deliver within 2-3 days in Dhaka and Chittagong, and 3-5 days for other areas in Bangladesh.'
      },
      {
        q: 'Do you deliver outside Bangladesh?',
        a: 'Currently, we only deliver within Bangladesh. International shipping is coming soon!'
      },
    ]
  },
  {
    title: 'Payment',
    icon: CreditCard,
    questions: [
      {
        q: 'What payment methods do you accept?',
        a: 'We accept payments via SSLCommerz (bKash, Nagad, Visa, Mastercard, American Express, and bank transfers) as well as Cash on Delivery (COD).'
      },
      {
        q: 'Is online payment secure?',
        a: 'Yes! We use SSLCommerz, a trusted payment gateway with bank-level security and SSL encryption for all transactions.'
      },
      {
        q: 'When will I be charged for my order?',
        a: 'For online payments, you are charged immediately. For COD orders, you pay when the product is delivered.'
      },
    ]
  },
  {
    title: 'Returns & Refunds',
    icon: RefreshCw,
    questions: [
      {
        q: 'What is your return policy?',
        a: 'We accept returns within 7 days of delivery for unused items in original packaging. Some items like innerwear and customized products are non-returnable.'
      },
      {
        q: 'How do I initiate a return?',
        a: 'Contact our customer support with your order number and reason for return. We will arrange a pickup or provide return instructions.'
      },
      {
        q: 'How long do refunds take?',
        a: 'Refunds are processed within 5-7 business days after we receive the returned item. Bank refunds may take an additional 3-5 days.'
      },
    ]
  },
  {
    title: 'Account & Security',
    icon: Shield,
    questions: [
      {
        q: 'How do I create an account?',
        a: 'Click on "Register" in the top navigation, fill in your details, and you are ready to shop! You can also checkout as a guest.'
      },
      {
        q: 'Is my personal information safe?',
        a: 'Absolutely! We never share your personal information with third parties. All data is encrypted and stored securely.'
      },
      {
        q: 'How do I reset my password?',
        a: 'Click on "Forgot Password" on the login page, enter your email, and we will send you a password reset link.'
      },
    ]
  },
]

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<string | null>(null)
  const [settings, setSettings] = useState<any>(null)

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => setSettings(data.settings))
      .catch(err => console.error(err))
  }, [])

  const toggleQuestion = (id: string) => {
    setOpenIndex(openIndex === id ? null : id)
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center mb-6"
          >
            <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center">
              <HelpCircle className="w-10 h-10" />
            </div>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            Frequently Asked Questions
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-white/80"
          >
            Find answers to common questions about shopping with us
          </motion.p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          {faqCategories.map((category, catIndex) => {
            const Icon = category.icon
            return (
              <motion.div
                key={category.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: catIndex * 0.1 }}
                className="mb-8"
              >
                {/* Category Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <h2 className="text-2xl font-bold">{category.title}</h2>
                </div>

                {/* Questions */}
                <div className="space-y-3">
                  {category.questions.map((item, qIndex) => {
                    const id = `${catIndex}-${qIndex}`
                    const isOpen = openIndex === id

                    return (
                      <Card key={id} className="overflow-hidden">
                        <button
                          onClick={() => toggleQuestion(id)}
                          className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50 transition"
                        >
                          <span className="font-medium pr-4">{item.q}</span>
                          <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                        </button>
                        <AnimatePresence>
                          {isOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <CardContent className="pt-0 pb-4 px-4 border-t">
                                <p className="text-muted-foreground">{item.a}</p>
                              </CardContent>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </Card>
                    )
                  })}
                </div>
              </motion.div>
            )
          })}
        </div>
      </section>


      {/* Still Need Help */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">Still Have Questions?</h2>
          <p className="text-muted-foreground mb-8">
            Our customer support team is here to help you 24/7
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <a
              href={`mailto:${settings?.supportEmail || settings?.storeEmail || 'support@silkmartbd.com'}`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Email Support
            </a>
            <a
              href={`tel:${settings?.supportPhone || settings?.storePhone || '+8801991523289'}`}
              className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
            >
              Call Us
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
