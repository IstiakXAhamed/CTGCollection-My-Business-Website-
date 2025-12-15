'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, Loader2, TrendingUp, Clock, ArrowRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'
import { useDebounce } from '@/hooks/useDebounce'

interface SearchResult {
  id: string
  name: string
  slug: string
  image?: string
  price: number
  salePrice?: number
  category?: string
}

interface SearchAutocompleteProps {
  placeholder?: string
  maxResults?: number
}

// Popular searches
const TRENDING_SEARCHES = [
  'T-Shirt', 'Perfume', 'Shoes', 'Watch', 'Sunglasses', 'Wallet'
]

export function SearchAutocomplete({
  placeholder = 'Search products...',
  maxResults = 6
}: SearchAutocompleteProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  
  const debouncedQuery = useDebounce(query, 300)

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('recent_searches')
      if (saved) {
        setRecentSearches(JSON.parse(saved).slice(0, 5))
      }
    } catch {
      // Ignore localStorage errors
    }
  }, [])

  // Search when query changes
  useEffect(() => {
    const search = async () => {
      if (debouncedQuery.length < 2) {
        setResults([])
        return
      }

      setLoading(true)
      try {
        const res = await fetch(`/api/products/search?q=${encodeURIComponent(debouncedQuery)}&limit=${maxResults}`)
        if (res.ok) {
          const data = await res.json()
          setResults(data.products || [])
        }
      } catch (error) {
        console.error('Search error:', error)
        setResults([])
      } finally {
        setLoading(false)
      }
    }

    search()
  }, [debouncedQuery, maxResults])

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const saveRecentSearch = (term: string) => {
    try {
      const updated = [term, ...recentSearches.filter(s => s !== term)].slice(0, 5)
      setRecentSearches(updated)
      localStorage.setItem('recent_searches', JSON.stringify(updated))
    } catch {
      // Ignore localStorage errors
    }
  }

  const handleSearch = (searchTerm: string) => {
    setQuery(searchTerm)
    saveRecentSearch(searchTerm)
    setIsOpen(false)
    window.location.href = `/shop?search=${encodeURIComponent(searchTerm)}`
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && query.trim()) {
      handleSearch(query)
    }
    if (e.key === 'Escape') {
      setIsOpen(false)
    }
  }

  const clearSearch = () => {
    setQuery('')
    setResults([])
    inputRef.current?.focus()
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-xl">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full pl-12 pr-10 py-3 bg-gray-100 dark:bg-gray-800 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        )}
        {loading && (
          <Loader2 className="absolute right-10 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-blue-500" />
        )}
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
          >
            {/* Search Results */}
            {results.length > 0 && (
              <div className="p-2">
                <p className="text-xs text-gray-500 px-3 py-2">Products</p>
                {results.map((product) => (
                  <Link
                    key={product.id}
                    href={`/product/${product.slug}`}
                    onClick={() => saveRecentSearch(product.name)}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                  >
                    <div className="w-12 h-12 bg-gray-100 rounded-lg relative flex-shrink-0">
                      {product.image && (
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-cover rounded-lg"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{product.name}</p>
                      <p className="text-sm text-gray-500">{product.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-blue-600">
                        {formatPrice(product.salePrice || product.price)}
                      </p>
                      {product.salePrice && (
                        <p className="text-xs text-gray-400 line-through">
                          {formatPrice(product.price)}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
                <Link
                  href={`/shop?search=${encodeURIComponent(query)}`}
                  className="flex items-center justify-center gap-2 p-3 mt-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                >
                  View all results
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}

            {/* No Results */}
            {query.length >= 2 && !loading && results.length === 0 && (
              <div className="p-6 text-center">
                <p className="text-gray-500">No products found for "{query}"</p>
                <p className="text-sm text-gray-400 mt-1">Try a different search term</p>
              </div>
            )}

            {/* Suggestions (when empty) */}
            {query.length < 2 && (
              <div className="p-4">
                {/* Recent Searches */}
                {recentSearches.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Recent Searches
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {recentSearches.map((term, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSearch(term)}
                          className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-full text-sm hover:bg-gray-200 transition"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Trending */}
                <div>
                  <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> Trending
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {TRENDING_SEARCHES.map((term, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSearch(term)}
                        className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-full text-sm hover:bg-blue-100 transition"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
