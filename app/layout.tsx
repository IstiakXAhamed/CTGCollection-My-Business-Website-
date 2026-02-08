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
const LiveChat = dynamic(() => import('@/components/LiveChat').then(mod => mod.LiveChat), { ssr: false }) // Hidden by default
const FloatingActions = dynamic(() => import('@/components/FloatingActions'), { ssr: false })

const inter = Inter({ subsets: ["latin"], display: 'swap' });

export const metadata: Metadata = {
  title: {
    default: "Silk Mart | Premium E-Commerce Store in Bangladesh",
    template: "%s | Silk Mart"
  },
  description: "Silk Mart offers a wide range of fashion, electronics, and lifestyle products with the best prices and fastest delivery in Chittagong, Bangladesh. Silk Mart is your trusted destination for quality shopping.",
  keywords: ["Silk Mart", "Silk Mart BD", "Silk Mart Bangladesh", "Online Shopping Bangladesh", "Fashion BD", "Electronics BD", "Chittagong E-commerce"],
  authors: [{ name: "Silk Mart" }],
  creator: "Silk Mart",
  publisher: "Silk Mart",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/logo.png' },
      { url: '/logo.png', sizes: '32x32', type: 'image/png' },
    ],
    shortcut: '/logo.png',
    apple: [
      { url: '/logo.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  openGraph: {
    type: "website",
    locale: "en_BD",
    url: "https://silkmartbd.com",
    title: "Silk Mart | Premium E-Commerce Store",
    description: "Discover the best fashion, electronics, and lifestyle products at Silk Mart. Fast delivery and best prices nationwide.",
    siteName: "Silk Mart",
    images: [{
      url: "/logo.png",
      width: 800,
      height: 600,
      alt: "Silk Mart Logo"
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Silk Mart | Premium E-Commerce Store",
    description: "Discover the best fashion, electronics, and lifestyle products at Silk Mart.",
    images: ["/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

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
          <LiveChat />
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
