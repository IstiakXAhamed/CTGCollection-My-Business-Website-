'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Share2, Copy, Check, Facebook, Twitter, MessageCircle, Link2, X, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface WishlistShareProps {
  wishlistId: string
  wishlistName?: string
  itemCount: number
}

export function WishlistShare({ wishlistId, wishlistName = 'My Wishlist', itemCount }: WishlistShareProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const shareUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/wishlist/shared/${wishlistId}`
    : ''

  const shareText = `Check out my wishlist on Silk Mart! ${itemCount} items I love 💕`

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Copy failed:', error)
    }
  }

  const shareToSocial = (platform: string) => {
    let url = ''
    
    switch (platform) {
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
        break
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`
        break
      case 'whatsapp':
        url = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`
        break
    }

    if (url) {
      window.open(url, '_blank', 'width=600,height=400')
    }
  }

  const nativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: wishlistName,
          text: shareText,
          url: shareUrl
        })
      } catch (error) {
        console.error('Share failed:', error)
      }
    } else {
      setIsOpen(true)
    }
  }

  return (
    <>
      <Button onClick={nativeShare} variant="outline" className="gap-2">
        <Share2 className="w-4 h-4" />
        Share Wishlist
      </Button>

      {/* Share Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Heart className="w-5 h-5 text-pink-500" />
                  Share Your Wishlist
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Share your wishlist with friends and family so they know what you love!
              </p>

              {/* Social Share Buttons */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                <button
                  onClick={() => shareToSocial('facebook')}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 transition"
                >
                  <Facebook className="w-6 h-6" />
                  <span className="text-xs font-medium">Facebook</span>
                </button>
                <button
                  onClick={() => shareToSocial('twitter')}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-600 transition"
                >
                  <Twitter className="w-6 h-6" />
                  <span className="text-xs font-medium">Twitter</span>
                </button>
                <button
                  onClick={() => shareToSocial('whatsapp')}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl bg-green-50 hover:bg-green-100 text-green-600 transition"
                >
                  <MessageCircle className="w-6 h-6" />
                  <span className="text-xs font-medium">WhatsApp</span>
                </button>
              </div>

              {/* Copy Link */}
              <div className="bg-gray-100 dark:bg-gray-700 rounded-xl p-3 flex items-center gap-2">
                <Link2 className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="flex-1 bg-transparent text-sm truncate outline-none"
                />
                <Button size="sm" onClick={copyLink} variant="ghost">
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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
