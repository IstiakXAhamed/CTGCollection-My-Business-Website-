'use client'

import { usePathname } from 'next/navigation'
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import LiveChat from "@/components/LiveChat"
import UnifiedPromoBanner from "@/components/UnifiedPromoBanner"
import { WhatsAppChat } from "@/components/WhatsAppChat"
import FloatingActions from "@/components/FloatingActions"
import { CompareBar } from "@/components/ProductComparison"
import { ExitIntentPopup } from "@/components/ExitIntentPopup"
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt"
import AnnouncementPopup from '@/components/AnnouncementPopup'

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdminRequest = pathname?.startsWith('/admin')

  if (isAdminRequest) {
    return <main className="min-h-screen">{children}</main>
  }

  return (
    <>
      <Navbar />
      <UnifiedPromoBanner />
      <main className="min-h-screen">
        {children}
      </main>
      <Footer />
      <LiveChat />
      <WhatsAppChat />
      <FloatingActions />
      <CompareBar />
      <ExitIntentPopup />
      <PWAInstallPrompt />
      <AnnouncementPopup />
    </>
  )
}
