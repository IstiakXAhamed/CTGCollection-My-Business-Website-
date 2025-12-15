'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Copy, Clock, AlertCircle, Smartphone, QrCode } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatPrice } from '@/lib/utils'

interface ManualPaymentProps {
  amount: number
  orderId: string
  onPaymentSubmit: (method: string, transactionId: string) => Promise<void>
}

const PAYMENT_NUMBER = '01991523289'

const PAYMENT_METHODS = [
  {
    id: 'bkash',
    name: 'bKash',
    color: '#E2136E',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-500',
    qrImage: '/payments/bkash-qr.png',
    instructions: [
      'Open bKash app on your phone',
      'Tap "Send Money"',
      `Enter number: ${PAYMENT_NUMBER}`,
      'Enter exact amount',
      'Enter your PIN to confirm',
      'Save the Transaction ID'
    ]
  },
  {
    id: 'nagad',
    name: 'Nagad',
    color: '#F6921E',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-500',
    qrImage: '/payments/nagad-qr.png',
    instructions: [
      'Open Nagad app on your phone',
      'Tap "Send Money"',
      `Enter number: ${PAYMENT_NUMBER}`,
      'Enter exact amount',
      'Confirm with PIN',
      'Note the Transaction ID'
    ]
  },
  {
    id: 'rocket',
    name: 'Rocket',
    color: '#8B5CF6',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-500',
    qrImage: '/payments/rocket-qr.png',
    instructions: [
      'Open Rocket app or dial *322#',
      'Select "Send Money"',
      `Enter number: ${PAYMENT_NUMBER}`,
      'Enter exact amount',
      'Confirm payment',
      'Save the TrxID'
    ]
  }
]

export function ManualPayment({ amount, orderId, onPaymentSubmit }: ManualPaymentProps) {
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null)
  const [transactionId, setTransactionId] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [copied, setCopied] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const selectedPayment = PAYMENT_METHODS.find(m => m.id === selectedMethod)

  const copyNumber = () => {
    navigator.clipboard.writeText(PAYMENT_NUMBER)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSubmit = async () => {
    if (!selectedMethod || !transactionId.trim()) return

    setSubmitting(true)
    try {
      await onPaymentSubmit(selectedMethod, transactionId)
      setSubmitted(true)
    } catch (error) {
      console.error('Payment submit error:', error)
      alert('Failed to submit payment. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-green-50 border-2 border-green-200 rounded-2xl p-8 text-center"
      >
        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-green-800 mb-2">Payment Submitted!</h3>
        <p className="text-green-700 mb-4">
          Your payment is being verified. We'll confirm your order within 30 minutes.
        </p>
        <div className="bg-white/50 rounded-lg p-4 inline-block">
          <p className="text-sm text-green-600">Transaction ID</p>
          <p className="font-mono font-bold text-lg">{transactionId}</p>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Payment Method Selection */}
      <div>
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-blue-600" />
          Select Payment Method
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {PAYMENT_METHODS.map((method) => (
            <button
              key={method.id}
              onClick={() => setSelectedMethod(method.id)}
              className={`p-4 rounded-xl border-2 transition-all ${
                selectedMethod === method.id
                  ? `${method.borderColor} ${method.bgColor} scale-105`
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div
                className="text-2xl font-bold mb-1"
                style={{ color: method.color }}
              >
                {method.name}
              </div>
              <div className="text-xs text-gray-500">Send Money</div>
            </button>
          ))}
        </div>
      </div>

      {/* Payment Details */}
      <AnimatePresence mode="wait">
        {selectedPayment && (
          <motion.div
            key={selectedPayment.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`${selectedPayment.bgColor} rounded-2xl p-6 border-2 ${selectedPayment.borderColor}`}
          >
            {/* Amount to Pay */}
            <div className="text-center mb-6">
              <p className="text-sm text-gray-600 mb-1">Amount to Send</p>
              <p className="text-4xl font-bold" style={{ color: selectedPayment.color }}>
                {formatPrice(amount)}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* QR Code */}
              <div className="text-center">
                <div className="bg-white rounded-xl p-4 shadow-sm inline-block">
                  <QrCode className="w-48 h-48 mx-auto text-gray-300" />
                  <p className="text-xs text-gray-500 mt-2">Scan with {selectedPayment.name} app</p>
                </div>
              </div>

              {/* Instructions */}
              <div>
                <h4 className="font-semibold mb-3">How to Pay:</h4>
                <ol className="space-y-2">
                  {selectedPayment.instructions.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <span
                        className="w-5 h-5 rounded-full flex items-center justify-center text-xs text-white flex-shrink-0 mt-0.5"
                        style={{ backgroundColor: selectedPayment.color }}
                      >
                        {idx + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            {/* Payment Number */}
            <div className="mt-6 bg-white/70 rounded-xl p-4">
              <p className="text-sm text-gray-600 mb-2">Send money to this number:</p>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-mono font-bold tracking-wider">
                  {PAYMENT_NUMBER}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyNumber}
                  className="gap-2"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-green-600" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Transaction ID Input */}
            <div className="mt-6">
              <label className="block text-sm font-medium mb-2">
                Enter Transaction ID (TrxID)
              </label>
              <div className="flex gap-3">
                <Input
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value.toUpperCase())}
                  placeholder="e.g. ABC123XYZ"
                  className="flex-1 font-mono text-lg tracking-wider"
                />
                <Button
                  onClick={handleSubmit}
                  disabled={!transactionId.trim() || submitting}
                  style={{ backgroundColor: selectedPayment.color }}
                  className="px-8"
                >
                  {submitting ? (
                    <>
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Submit Payment'
                  )}
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Your order will be confirmed after payment verification (usually within 30 minutes)
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Payment not selected hint */}
      {!selectedPayment && (
        <div className="text-center py-8 text-gray-500">
          <Smartphone className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Select a payment method above to see instructions</p>
        </div>
      )}
    </div>
  )
}
