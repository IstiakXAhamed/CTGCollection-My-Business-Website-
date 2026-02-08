import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import UnifiedPromoBanner from "@/components/UnifiedPromoBanner";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "@/components/Providers";
import { CompareBar } from "@/components/ProductComparison";
import { ExitIntentPopup } from "@/components/ExitIntentPopup";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import AnnouncementPopup from '@/components/AnnouncementPopup'
import Analytics from '@/components/Analytics'
import dynamic from 'next/dynamic'

// Lazy load heavy client components
const SpinWheel = dynamic(() => import('@/components/SpinWheel').then(mod => mod.SpinWheel), { ssr: false })
const AIChatAssistant = dynamic(() => import('@/components/AIChatAssistant').then(mod => mod.AIChatAssistant), { ssr: false })
const WhatsAppChat = dynamic(() => import('@/components/WhatsAppChat').then(mod => mod.WhatsAppChat), { ssr: false })
const FloatingActions = dynamic(() => import('@/components/FloatingActions'), { ssr: false })

const inter = Inter({ subsets: ["latin"], display: 'swap' });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="overflow-x-hidden">
      <body className={`${inter.className} overflow-x-hidden`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                '@context': 'https://schema.org',
                '@type': 'Organization',
                name: 'Silk Mart',
                url: 'https://silkmartbd.com',
                logo: 'https://silkmartbd.com/logo.png',
                sameAs: [
                  'https://facebook.com/silkmartbd',
                  'https://instagram.com/silkmartbd'
                ],
                contactPoint: {
                  '@type': 'ContactPoint',
                  telephone: '+8801991523289',
                  contactType: 'customer service',
                  areaServed: 'BD',
                  availableLanguage: ['en', 'bn']
                }
              },
              {
                '@context': 'https://schema.org',
                '@type': 'WebSite',
                name: 'Silk Mart',
                alternateName: ['Silk Mart BD', 'Silk Mart Bangladesh'],
                url: 'https://silkmartbd.com',
                potentialAction: {
                  '@type': 'SearchAction',
                  target: 'https://silkmartbd.com/shop?q={search_term_string}',
                  'query-input': 'required name=search_term_string'
                }
              },
              {
                '@context': 'https://schema.org',
                '@type': 'LocalBusiness',
                name: 'Silk Mart',
                image: 'https://silkmartbd.com/logo.png',
                '@id': 'https://silkmartbd.com',
                url: 'https://silkmartbd.com',
                telephone: '+8801991523289',
                address: {
                  '@type': 'PostalAddress',
                  streetAddress: 'Chittagong',
                  addressLocality: 'Chittagong',
                  addressCountry: 'BD'
                },
                geo: {
                  '@type': 'GeoCoordinates',
                  latitude: 22.3569,
                  longitude: 91.7832
                },
                openingHoursSpecification: {
                  '@type': 'OpeningHoursSpecification',
                  dayOfWeek: [
                    'Monday',
                    'Tuesday',
                    'Wednesday',
                    'Thursday',
                    'Friday',
                    'Saturday',
                    'Sunday'
                  ],
                  opens: '00:00',
                  closes: '23:59'
                }
              }
            ])
          }}
        />
        <Providers>
          <Navbar />
          {/* Unified Promo Banner - After Navbar */}
          <UnifiedPromoBanner />
          <main className="min-h-screen">
            {children}
          </main>
          <Footer />

          <AIChatAssistant />
          <SpinWheel />
          
          {/* Premium Global Features */}
          <Analytics />
          <WhatsAppChat phoneNumber="8801991523289" position="bottom-right" />
          <FloatingActions />
          <CompareBar />
          <ExitIntentPopup enabled={true} discountPercent={10} />
          <PWAInstallPrompt />
          <AnnouncementPopup />
          
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
