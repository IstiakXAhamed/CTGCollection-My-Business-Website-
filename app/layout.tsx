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

export const metadata: Metadata = {
  title: "Silk Mart - Premium E-Commerce Store | Bangladesh",
  description: "Shop the latest fashion and lifestyle products from Silk Mart. Quality products with fast delivery across Bangladesh. SSLCommerz & COD available.",
  keywords: ["ecommerce", "online shopping", "Bangladesh", "Silk Mart", "fashion", "lifestyle", "Chittagong"],
  authors: [{ name: "Silk Mart" }],
  openGraph: {
    title: "Silk Mart - Premium E-Commerce Store",
    description: "Shop the latest fashion and lifestyle products with free shipping on orders over ৳2000",
    type: "website",
    locale: "en_BD",
    siteName: "Silk Mart",
  },
  twitter: {
    card: "summary_large_image",
    title: "Silk Mart",
    description: "Shop the latest fashion and lifestyle products",
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: "ATFkhJUh2kPUMLtxfQ24KXiN_nkaSnnsFNeZ5tasD1M",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="overflow-x-hidden">
      <body className={`${inter.className} overflow-x-hidden`}>
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
