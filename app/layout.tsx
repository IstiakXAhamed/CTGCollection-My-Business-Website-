import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LiveChat from "@/components/LiveChat";
import UnifiedPromoBanner from "@/components/UnifiedPromoBanner";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "@/components/Providers";
import { WhatsAppChat } from "@/components/WhatsAppChat";
import FloatingActions from "@/components/FloatingActions";
import { CompareBar } from "@/components/ProductComparison";
import { ExitIntentPopup } from "@/components/ExitIntentPopup";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import AnnouncementPopup from '@/components/AnnouncementPopup'

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CTG Collection - Premium E-Commerce Store | Bangladesh",
  description: "Shop the latest fashion and lifestyle products from CTG Collection. Quality products with fast delivery across Bangladesh. SSLCommerz & COD available.",
  keywords: ["ecommerce", "online shopping", "Bangladesh", "CTG Collection", "fashion", "lifestyle", "Chittagong"],
  authors: [{ name: "CTG Collection" }],
  openGraph: {
    title: "CTG Collection - Premium E-Commerce Store",
    description: "Shop the latest fashion and lifestyle products with free shipping on orders over ৳2000",
    type: "website",
    locale: "en_BD",
    siteName: "CTG Collection",
  },
  twitter: {
    card: "summary_large_image",
    title: "CTG Collection",
    description: "Shop the latest fashion and lifestyle products",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <Navbar />
          {/* Unified Promo Banner - After Navbar */}
          <UnifiedPromoBanner />
          <main className="min-h-screen">
            {children}
          </main>
          <Footer />
          <LiveChat />
          
          {/* Premium Global Features */}
          <WhatsAppChat phoneNumber="8801991523289" position="bottom-right" />
          <FloatingActions />
          <CompareBar />
          <ExitIntentPopup enabled={false} discountPercent={10} />
          <PWAInstallPrompt />
          <AnnouncementPopup />
          
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
