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

  const refreshSettings = async () => {
    fetchPromise = fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        globalSettings = data.settings
        setSettings(data.settings)
        return data.settings
      })
      .catch(err => {
        console.error('Failed to load settings', err)
        return null
      })
    return fetchPromise
  }

  useEffect(() => {
    if (globalSettings) {
      setSettings(globalSettings)
      setLoading(false)
      return
    }

    refreshSettings().finally(() => setLoading(false))
  }, [])

  return { settings, loading, refreshSettings }
}
