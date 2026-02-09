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
    fetchPromise = fetch('/api/settings/public')
      .then(res => res.json())
      .then(data => {
        // Map public response to the internal hook format
        const settingsData = data.settings || data
        globalSettings = settingsData
        setSettings(settingsData)
        return settingsData
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
