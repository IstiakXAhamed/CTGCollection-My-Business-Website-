'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Gift, Send, Copy, Check, Loader2, CreditCard, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatPrice } from '@/lib/utils'

interface GiftCard {
  id: string
  code: string
  balance: number
  initialAmount: number
  expiresAt: string
  status: 'active' | 'used' | 'expired'
}

const GIFT_CARD_AMOUNTS = [500, 1000, 2000, 5000, 10000]

// Gift Card Purchase Component
export function GiftCardPurchase() {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null)
  const [customAmount, setCustomAmount] = useState('')
  const [recipientEmail, setRecipientEmail] = useState('')
  const [recipientName, setRecipientName] = useState('')
  const [message, setMessage] = useState('')
  const [senderName, setSenderName] = useState('')
  const [loading, setLoading] = useState(false)
  const [purchased, setPurchased] = useState<{ code: string; amount: number } | null>(null)
  const [error, setError] = useState('')

  const finalAmount = customAmount ? parseFloat(customAmount) : selectedAmount

  const validateForm = (): boolean => {
    setError('')

    if (!finalAmount || finalAmount < 100) {
      setError('Minimum gift card amount is ৳100')
      return false
    }
    if (finalAmount > 50000) {
      setError('Maximum gift card amount is ৳50,000')
      return false
    }
    if (!recipientEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail)) {
      setError('Please enter a valid recipient email')
      return false
    }
    if (!recipientName.trim()) {
      setError('Please enter recipient name')
      return false
    }
    if (!senderName.trim()) {
      setError('Please enter your name')
      return false
    }
    return true
  }

  const handlePurchase = async () => {
    if (!validateForm()) return

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/gift-cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          amount: finalAmount,
          recipientEmail,
          recipientName,
          senderName,
          message
        })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to purchase gift card')
      }

      const data = await res.json()
      setPurchased({ code: data.giftCard.code, amount: finalAmount! })
    } catch (err: any) {
      console.error('Gift card purchase error:', err)
      setError(err.message || 'Failed to purchase gift card')
    } finally {
      setLoading(false)
    }
  }

  if (purchased) {
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center py-8"
      >
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-10 h-10 text-green-600" />
        </div>
        <h3 className="text-2xl font-bold text-green-600 mb-2">Gift Card Sent!</h3>
        <p className="text-gray-600 mb-4">
          A {formatPrice(purchased.amount)} gift card has been sent to {recipientEmail}
        </p>
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 inline-block">
          <p className="text-sm text-gray-500">Gift Card Code</p>
          <p className="font-mono text-2xl font-bold text-blue-600">{purchased.code}</p>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="w-6 h-6 text-pink-500" />
            Purchase Gift Card
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-3">
              {error}
            </div>
          )}

          {/* Amount Selection */}
          <div>
            <label className="block text-sm font-medium mb-3">Select Amount</label>
            <div className="grid grid-cols-5 gap-2 mb-3">
              {GIFT_CARD_AMOUNTS.map((amount) => (
                <button
                  key={amount}
                  onClick={() => { setSelectedAmount(amount); setCustomAmount('') }}
                  className={`py-3 rounded-lg font-semibold transition ${
                    selectedAmount === amount && !customAmount
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200'
                  }`}
                >
                  ৳{amount}
                </button>
              ))}
            </div>
            <Input
              type="number"
              placeholder="Or enter custom amount (৳100 - ৳50,000)"
              value={customAmount}
              onChange={(e) => { setCustomAmount(e.target.value); setSelectedAmount(null) }}
              min={100}
              max={50000}
            />
          </div>

          {/* Recipient Info */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Recipient Name *</label>
              <Input
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="Who is this gift for?"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Recipient Email *</label>
              <Input
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="recipient@email.com"
              />
            </div>
          </div>

          {/* Sender & Message */}
          <div>
            <label className="block text-sm font-medium mb-2">Your Name *</label>
            <Input
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              placeholder="Your name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Personal Message (Optional)</label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add a personal message to your gift..."
              rows={3}
              maxLength={500}
            />
          </div>

          {/* Summary */}
          {finalAmount && finalAmount >= 100 && (
            <div className="bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Gift Card Value</span>
                <span className="text-2xl font-bold text-pink-600">{formatPrice(finalAmount)}</span>
              </div>
            </div>
          )}

          <Button
            onClick={handlePurchase}
            disabled={loading || !finalAmount}
            className="w-full h-12 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send Gift Card
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

// Gift Card Redemption Component
export function GiftCardRedeem({ onApply }: { onApply: (discount: number, code: string) => void }) {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [balance, setBalance] = useState<number | null>(null)
  const [error, setError] = useState('')

  const checkBalance = async () => {
    if (!code.trim()) {
      setError('Please enter a gift card code')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch(`/api/gift-cards/${code}`)
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Invalid gift card code')
      }

      const data = await res.json()
      if (data.giftCard.status !== 'active') {
        throw new Error('This gift card has been used or expired')
      }

      setBalance(data.giftCard.balance)
    } catch (err: any) {
      console.error('Gift card check error:', err)
      setError(err.message)
      setBalance(null)
    } finally {
      setLoading(false)
    }
  }

  const applyGiftCard = () => {
    if (balance && balance > 0) {
      onApply(balance, code)
      setCode('')
      setBalance(null)
    }
  }

  return (
    <div className="border rounded-lg p-4">
      <h4 className="font-medium mb-3 flex items-center gap-2">
        <CreditCard className="w-4 h-4" />
        Have a Gift Card?
      </h4>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm rounded p-2 mb-3">
          {error}
        </div>
      )}

      <div className="flex gap-2">
        <Input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Enter code"
          className="font-mono"
        />
        <Button onClick={checkBalance} disabled={loading} variant="outline">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Check'}
        </Button>
      </div>

      {balance !== null && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg"
        >
          <div className="flex items-center justify-between">
            <span>Available Balance: <strong className="text-green-600">{formatPrice(balance)}</strong></span>
            <Button size="sm" onClick={applyGiftCard}>Apply</Button>
          </div>
        </motion.div>
      )}
    </div>
  )
}
