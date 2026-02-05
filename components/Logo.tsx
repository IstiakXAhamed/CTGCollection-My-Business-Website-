'use client'

import Image from 'next/image'
import { useSiteSettings } from '@/hooks/useSiteSettings'
import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
  width?: number
  height?: number
  priority?: boolean
  fallbackSrc?: string
}

export function Logo({ 
  className, 
  width = 40, 
  height = 40, 
  priority = false,
  fallbackSrc = '/logo.png' 
}: LogoProps) {
  const { settings, loading } = useSiteSettings()

  const logoSrc = settings?.logo || fallbackSrc

  // While loading, we can show a placeholder or just the fallback
  // Using fallback immediately minimizes layout shift if cached locally
  // but if we want strictly dynamic, we might wait. 
  // For percieved performance, showing fallback (which is likely the old logo) 
  // until new one loads is usually better than a blank space.

  return (
    <Image 
      src={logoSrc} 
      alt={settings?.storeName || 'Silk Mart'} 
      width={width} 
      height={height}
      className={cn("object-contain", className)}
      priority={priority}
    />
  )
}
