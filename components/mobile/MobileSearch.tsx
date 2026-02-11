'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  Search, Mic, MicOff, X, Clock, TrendingUp, 
  Camera, ArrowLeft, Sparkles, Tag 
} from 'lucide-react'
import { haptics } from '@/lib/haptics'
import { cn } from '@/lib/utils'

interface SearchResult {
  id: string
  name: string
  slug: string
  image: string
  price: number
  category?: string
}

interface MobileSearchProps {
  isOpen: boolean
  onClose: () => void
}

/**
 * MobileSearch - Premium full-screen search experience
 * 
 * Features:
 * - Voice input support (Web Speech API)
 * - Recent searches (persisted in localStorage)
 * - Trending/popular searches
 * - Instant search results
 * - Visual search button (placeholder for future)
 * - Smooth animations
 */
export function MobileSearch({ isOpen, onClose }: MobileSearchProps) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  
  // State
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [isListening, setIsListening] = useState(false)
  const [voiceSupported, setVoiceSupported] = useState(false)
  
  // Speech recognition ref
  const recognitionRef = useRef<any>(null)

  // Popular/trending searches
  const trendingSearches = [
    'Sarees', 'Three Piece', 'Kurtis', 'Fragrance', 
    'New Arrivals', 'Sale', 'Designer Collection'
  ]

  // Load recent searches from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('silkmart-recent-searches')
      if (saved) {
        setRecentSearches(JSON.parse(saved))
      }
    }
  }, [])

  // Check voice support
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      setVoiceSupported(!!SpeechRecognition)
      
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition()
        recognitionRef.current.continuous = false
        recognitionRef.current.interimResults = true
        recognitionRef.current.lang = 'en-US'
        
        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript
          setQuery(transcript)
          
          if (event.results[0].isFinal) {
            setIsListening(false)
            haptics.success()
          }
        }
        
        recognitionRef.current.onerror = () => {
          setIsListening(false)
          haptics.error()
        }
        
        recognitionRef.current.onend = () => {
          setIsListening(false)
        }
      }
    }
  }, [])

  // Auto-focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }

    const timer = setTimeout(async () => {
      setIsSearching(true)
      try {
        const res = await fetch(`/api/products?search=${encodeURIComponent(query)}&limit=6`)
        if (res.ok) {
          const data = await res.json()
          setResults(data.products || [])
        }
      } catch (error) {
        console.error('Search failed:', error)
      } finally {
        setIsSearching(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  // Save search to recent
  const saveToRecent = (term: string) => {
    const updated = [term, ...recentSearches.filter(s => s !== term)].slice(0, 8)
    setRecentSearches(updated)
    localStorage.setItem('silkmart-recent-searches', JSON.stringify(updated))
  }

  // Handle search submit
  const handleSearch = (searchTerm?: string) => {
    const term = searchTerm || query.trim()
    if (!term) return
    
    saveToRecent(term)
    haptics.soft()
    router.push(`/shop?search=${encodeURIComponent(term)}`)
    onClose()
  }

  // Toggle voice input
  const toggleVoice = () => {
    if (!voiceSupported) return
    
    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
    } else {
      recognitionRef.current?.start()
      setIsListening(true)
      haptics.rigid()
    }
  }

  // Clear recent searches
  const clearRecentSearches = () => {
    setRecentSearches([])
    localStorage.removeItem('silkmart-recent-searches')
    haptics.light()
  }

  // Parse product image
  const getProductImage = (images: any) => {
    try {
      const imgs = typeof images === 'string' ? JSON.parse(images) : images
      return Array.isArray(imgs) ? imgs[0] : imgs
    } catch {
      return '/placeholder.png'
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] bg-white dark:bg-gray-950"
        >
          {/* Safe area padding */}
          <div className="pt-safe" />
          
          {/* Search Header */}
          <div className="flex items-center gap-3 p-4 border-b border-gray-100 dark:border-gray-800">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => { onClose(); haptics.light() }}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </motion.button>
            
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSearch() }}
              className="flex-1 relative"
            >
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full h-12 pl-12 pr-12 bg-gray-100 dark:bg-gray-800 rounded-2xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              
              {query && (
                <motion.button
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  type="button"
                  onClick={() => { setQuery(''); inputRef.current?.focus() }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center"
                >
                  <X className="w-3 h-3 text-gray-600 dark:text-gray-300" />
                </motion.button>
              )}
            </form>
            
            {/* Voice & Camera buttons */}
            <div className="flex gap-2">
              {voiceSupported && (
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={toggleVoice}
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                    isListening 
                      ? "bg-red-500 text-white animate-pulse" 
                      : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                  )}
                >
                  {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </motion.button>
              )}
              
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => haptics.light()}
                className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400"
              >
                <Camera className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
          
          {/* Voice listening indicator */}
          <AnimatePresence>
            {isListening && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="bg-red-50 dark:bg-red-900/20 border-b border-red-100 dark:border-red-800 overflow-hidden"
              >
                <div className="flex items-center justify-center gap-3 py-3 px-4">
                  <div className="flex gap-1">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <motion.div
                        key={i}
                        animate={{ 
                          scaleY: [1, 1.5 + Math.random(), 1],
                        }}
                        transition={{ 
                          duration: 0.5, 
                          repeat: Infinity, 
                          delay: i * 0.1 
                        }}
                        className="w-1 h-4 bg-red-500 rounded-full"
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium text-red-600 dark:text-red-400">
                    Listening...
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Content */}
          <div className="overflow-y-auto h-[calc(100vh-80px-env(safe-area-inset-top))]">
            {/* Search Results */}
            {query && results.length > 0 && (
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                    Results
                  </span>
                  <button
                    onClick={() => handleSearch()}
                    className="text-sm font-semibold text-blue-600"
                  >
                    See All
                  </button>
                </div>
                
                <div className="space-y-2">
                  {results.map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link
                        href={`/product/${product.slug}`}
                        onClick={() => { saveToRecent(product.name); onClose(); haptics.soft() }}
                        className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
                          <Image
                            src={getProductImage(product.image)}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">
                            {product.name}
                          </h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {product.category}
                          </p>
                          <p className="text-sm font-bold text-blue-600">
                            ৳{product.price?.toLocaleString()}
                          </p>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Loading state */}
            {isSearching && (
              <div className="p-4">
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex gap-3 animate-pulse">
                      <div className="w-14 h-14 rounded-lg bg-gray-200 dark:bg-gray-800" />
                      <div className="flex-1 space-y-2 py-1">
                        <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />
                        <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* No results */}
            {query && !isSearching && results.length === 0 && (
              <div className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 dark:text-gray-400">
                  No products found for "{query}"
                </p>
                <button
                  onClick={() => { setQuery(''); inputRef.current?.focus() }}
                  className="mt-3 text-sm text-blue-600 font-medium"
                >
                  Clear search
                </button>
              </div>
            )}
            
            {/* Default state - Recent & Trending */}
            {!query && (
              <>
                {/* Recent Searches */}
                {recentSearches.length > 0 && (
                  <div className="p-4 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          Recent Searches
                        </span>
                      </div>
                      <button
                        onClick={clearRecentSearches}
                        className="text-xs text-gray-400 hover:text-gray-600"
                      >
                        Clear All
                      </button>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {recentSearches.map((term, index) => (
                        <motion.button
                          key={term}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.03 }}
                          onClick={() => handleSearch(term)}
                          className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        >
                          {term}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Trending Searches */}
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-4 h-4 text-orange-500" />
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Trending Now
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {trendingSearches.map((term, index) => (
                      <motion.button
                        key={term}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => handleSearch(term)}
                        className="px-4 py-2.5 bg-gradient-to-r from-orange-50 to-pink-50 dark:from-orange-900/20 dark:to-pink-900/20 border border-orange-100 dark:border-orange-800/30 rounded-full text-sm font-medium text-gray-700 dark:text-gray-300 hover:shadow-md transition-all"
                      >
                        <span className="flex items-center gap-1.5">
                          <Sparkles className="w-3 h-3 text-orange-500" />
                          {term}
                        </span>
                      </motion.button>
                    ))}
                  </div>
                </div>
                
                {/* Categories Quick Access */}
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Tag className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Browse Categories
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {['Fashion', 'Electronics', 'Fragrance', 'Home & Living'].map((cat, index) => (
                      <motion.div
                        key={cat}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + index * 0.05 }}
                      >
                        <Link
                          href={`/shop?category=${encodeURIComponent(cat)}`}
                          onClick={() => { onClose(); haptics.soft() }}
                          className="block p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl text-center hover:shadow-md transition-all"
                        >
                          <span className="font-medium text-gray-800 dark:text-gray-200">{cat}</span>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default MobileSearch
