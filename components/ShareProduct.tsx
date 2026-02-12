'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Share2, Copy, Check, MessageCircle, Facebook, Twitter, Link2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { haptics } from '@/lib/haptics'

interface ShareProductProps {
  product: {
    name: string
    slug: string
    basePrice: number
    salePrice?: number | null
    images?: string | string[]
  }
  variant?: 'icon' | 'button' | 'full'
  className?: string
}

export function ShareProduct({ product, variant = 'icon', className }: ShareProductProps) {
  const [showDialog, setShowDialog] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showCopiedAnim, setShowCopiedAnim] = useState(false)

  const getProductUrl = () => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/product/${product.slug}`
    }
    return `/product/${product.slug}`
  }

  const getProductImage = () => {
    if (!product.images) return '/logo.png'
    if (typeof product.images === 'string') {
      try {
        const parsed = JSON.parse(product.images)
        return Array.isArray(parsed) ? parsed[0] : parsed
      } catch {
        return '/logo.png'
      }
    }
    return Array.isArray(product.images) ? product.images[0] : product.images
  }

  const shareData = {
    title: product.name,
    text: `Check out ${product.name} on Silk Mart!`,
    url: getProductUrl(),
  }

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share(shareData)
        haptics.success()
        setShowDialog(false)
      } catch (error) {
        // User cancelled
      }
    } else {
      setShowDialog(true)
    }
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(getProductUrl())
      setCopied(true)
      haptics.success()
      setShowCopiedAnim(true)
      setTimeout(() => {
        setCopied(false)
        setShowCopiedAnim(false)
      }, 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const handleWhatsApp = () => {
    const text = `Check out ${product.name} on Silk Mart!\n${getProductUrl()}`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
    haptics.success()
    setShowDialog(false)
  }

  const handleFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getProductUrl())}`, '_blank')
    haptics.success()
    setShowDialog(false)
  }

  const handleTwitter = () => {
    const text = `Check out ${product.name} on Silk Mart!`
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(getProductUrl())}`, '_blank')
    haptics.success()
    setShowDialog(false)
  }

  const shareButtons = [
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      color: 'bg-green-500',
      onClick: handleWhatsApp,
    },
    {
      name: 'Facebook',
      icon: Facebook,
      color: 'bg-blue-600',
      onClick: handleFacebook,
    },
    {
      name: 'Twitter',
      icon: Twitter,
      color: 'bg-sky-500',
      onClick: handleTwitter,
    },
  ]

  if (variant === 'icon') {
    return (
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogTrigger asChild>
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              handleNativeShare()
            }}
            className={`w-10 h-10 rounded-full bg-white/90 dark:bg-gray-800/90 flex items-center justify-center shadow-lg backdrop-blur-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${className}`}
          >
            <Share2 className="w-5 h-5" />
          </motion.button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Share2 className="w-5 h-5" />
              Share Product
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            {/* Product preview */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <img
                src={getProductImage()}
                alt={product.name}
                className="w-16 h-16 object-cover rounded-lg"
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{product.name}</p>
                <p className="text-sm text-muted-foreground">
                  ৳{(product.salePrice || product.basePrice).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Share buttons */}
            <div className="grid grid-cols-3 gap-3">
              {shareButtons.map((btn) => (
                <motion.button
                  key={btn.name}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={btn.onClick}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl ${btn.color} text-white`}
                >
                  <btn.icon className="w-6 h-6" />
                  <span className="text-xs font-medium">{btn.name}</span>
                </motion.button>
              ))}
            </div>

            {/* Copy link */}
            <div className="relative">
              <input
                type="text"
                value={getProductUrl()}
                readOnly
                className="w-full px-4 py-3 pr-24 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm"
              />
              <Button
                size="sm"
                variant={copied ? 'default' : 'outline'}
                onClick={handleCopyLink}
                className="absolute right-1 top-1 bottom-1"
              >
                {copied ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>

            {/* Copied animation */}
            <AnimatePresence>
              {showCopiedAnim && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-center text-sm text-green-600 dark:text-green-400"
                >
                  Link copied to clipboard!
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (variant === 'button') {
    return (
      <Button variant="outline" onClick={handleNativeShare} className="gap-2">
        <Share2 className="w-4 h-4" />
        Share
      </Button>
    )
  }

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 w-full">
          <Share2 className="w-4 h-4" />
          Share Product
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share</DialogTitle>
        </DialogHeader>
        {/* Full variant with more options */}
        <div className="flex flex-col gap-4">
          {/* Native share button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleNativeShare}
            className="flex items-center gap-3 p-4 bg-blue-500 text-white rounded-xl"
          >
            <Share2 className="w-5 h-5" />
            <span className="font-medium">Share via...</span>
          </motion.button>

          {/* Social buttons */}
          <div className="grid grid-cols-3 gap-3">
            {shareButtons.map((btn) => (
              <motion.button
                key={btn.name}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={btn.onClick}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl ${btn.color} text-white`}
              >
                <btn.icon className="w-6 h-6" />
                <span className="text-xs">{btn.name}</span>
              </motion.button>
            ))}
          </div>

          {/* Copy link */}
          <div className="flex gap-2">
            <input
              type="text"
              value={getProductUrl()}
              readOnly
              className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm"
            />
            <Button onClick={handleCopyLink} variant="outline">
              {copied ? <Check className="w-4 h-4" /> : <Link2 className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ShareProduct
