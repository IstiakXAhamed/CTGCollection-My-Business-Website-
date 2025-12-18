'use client'

import { useEffect, useRef, useCallback } from 'react'

interface AutoRefreshOptions {
  /** Polling interval in milliseconds (default: 30000 = 30 seconds) */
  interval?: number
  /** Whether to refresh when tab gains focus (default: true) */
  refreshOnFocus?: boolean
  /** Whether auto-refresh is enabled (default: true) */
  enabled?: boolean
}

/**
 * Custom hook for automatic data refresh
 * - Polls at regular intervals
 * - Refreshes when tab gains focus
 * - Automatically cleans up on unmount
 * 
 * @param fetchFunction - The function to call for refreshing data
 * @param options - Configuration options
 */
export function useAutoRefresh(
  fetchFunction: () => void | Promise<void>,
  options: AutoRefreshOptions = {}
) {
  const {
    interval = 30000, // 30 seconds default
    refreshOnFocus = true,
    enabled = true
  } = options

  const fetchRef = useRef(fetchFunction)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Keep fetchFunction ref updated
  useEffect(() => {
    fetchRef.current = fetchFunction
  }, [fetchFunction])

  // Handle visibility change (tab focus)
  const handleVisibilityChange = useCallback(() => {
    if (document.visibilityState === 'visible' && refreshOnFocus && enabled) {
      fetchRef.current()
    }
  }, [refreshOnFocus, enabled])

  useEffect(() => {
    if (!enabled) return

    // Set up polling interval
    intervalRef.current = setInterval(() => {
      fetchRef.current()
    }, interval)

    // Set up visibility change listener
    if (refreshOnFocus) {
      document.addEventListener('visibilitychange', handleVisibilityChange)
    }

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      if (refreshOnFocus) {
        document.removeEventListener('visibilitychange', handleVisibilityChange)
      }
    }
  }, [interval, refreshOnFocus, enabled, handleVisibilityChange])

  // Manual refresh function
  const refresh = useCallback(() => {
    fetchRef.current()
  }, [])

  return { refresh }
}

export default useAutoRefresh
