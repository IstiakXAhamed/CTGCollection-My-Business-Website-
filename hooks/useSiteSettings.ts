import { useState, useEffect } from 'react'

interface SiteSettings {
  storeName: string
  logo?: string
  storeTagline?: string
  // Add other fields as needed, keep it flexible
  [key: string]: any
}

// Global cache to prevent multiple fetches
let globalSettings: SiteSettings | null = null
let fetchPromise: Promise<SiteSettings> | null = null

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings | null>(globalSettings)
  const [loading, setLoading] = useState(!globalSettings)

  useEffect(() => {
    if (globalSettings) {
      setSettings(globalSettings)
      setLoading(false)
      return
    }

    if (!fetchPromise) {
      fetchPromise = fetch('/api/settings')
        .then(res => res.json())
        .then(data => {
          // data.settings contains the actual object
          globalSettings = data.settings
          return data.settings
        })
        .catch(err => {
          console.error('Failed to load settings', err)
          return null
        })
        .finally(() => {
          fetchPromise = null
        })
    }

    fetchPromise.then(data => {
      if (data) {
        setSettings(data)
      }
      setLoading(false)
    })
  }, [])

  return { settings, loading }
}
