'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Loader2 } from 'lucide-react'

interface InfiniteScrollProps {
  loadMore: (page: number) => Promise<{ items: any[]; hasMore: boolean }>
  renderItem: (item: any, index: number) => React.ReactNode
  initialItems?: any[]
  threshold?: number
  className?: string
}

export function InfiniteScroll({
  loadMore,
  renderItem,
  initialItems = [],
  threshold = 200,
  className = ''
}: InfiniteScrollProps) {
  const [items, setItems] = useState<any[]>(initialItems)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const loaderRef = useRef<HTMLDivElement>(null)

  const handleLoadMore = useCallback(async () => {
    if (loading || !hasMore) return

    setLoading(true)
    try {
      const result = await loadMore(page + 1)
      setItems(prev => [...prev, ...result.items])
      setHasMore(result.hasMore)
      setPage(prev => prev + 1)
    } catch (error) {
      console.error('Load more error:', error)
    } finally {
      setLoading(false)
    }
  }, [loading, hasMore, page, loadMore])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          handleLoadMore()
        }
      },
      { rootMargin: `${threshold}px` }
    )

    if (loaderRef.current) {
      observer.observe(loaderRef.current)
    }

    return () => observer.disconnect()
  }, [handleLoadMore, hasMore, loading, threshold])

  return (
    <div className={className}>
      {items.map((item, index) => renderItem(item, index))}
      
      <div ref={loaderRef} className="py-8 flex justify-center">
        {loading && (
          <div className="flex items-center gap-2 text-gray-500">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Loading more...</span>
          </div>
        )}
        {!hasMore && items.length > 0 && (
          <p className="text-gray-400 text-sm">No more products to load</p>
        )}
      </div>
    </div>
  )
}

// Hook for infinite scroll
export function useInfiniteScroll(fetchFn: (page: number) => Promise<any>) {
  const [data, setData] = useState<any[]>([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const observerRef = useRef<IntersectionObserver | null>(null)

  const lastElementRef = useCallback((node: HTMLElement | null) => {
    if (loading) return

    if (observerRef.current) observerRef.current.disconnect()

    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prev => prev + 1)
      }
    })

    if (node) observerRef.current.observe(node)
  }, [loading, hasMore])

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const result = await fetchFn(page)
        setData(prev => page === 1 ? result.items : [...prev, ...result.items])
        setHasMore(result.hasMore)
      } catch (error) {
        console.error('Fetch error:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [page, fetchFn])

  return { data, loading, hasMore, lastElementRef, refresh: () => setPage(1) }
}
