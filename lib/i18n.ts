// Multi-language Support - Bengali/English
// Usage: import { useLanguage, translations } from '@/lib/i18n'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Language = 'en' | 'bn'

interface LanguageStore {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

// Bengali and English translations
export const translations = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.shop': 'Shop',
    'nav.categories': 'Categories',
    'nav.about': 'About',
    'nav.contact': 'Contact',
    'nav.login': 'Login',
    'nav.register': 'Register',
    'nav.cart': 'Cart',
    'nav.wishlist': 'Wishlist',
    'nav.account': 'My Account',
    'nav.orders': 'My Orders',
    'nav.logout': 'Logout',

    // Products
    'product.addToCart': 'Add to Cart',
    'product.buyNow': 'Buy Now',
    'product.outOfStock': 'Out of Stock',
    'product.inStock': 'In Stock',
    'product.selectSize': 'Select Size',
    'product.selectColor': 'Select Color',
    'product.quantity': 'Quantity',
    'product.reviews': 'Reviews',
    'product.description': 'Description',
    'product.specifications': 'Specifications',
    'product.relatedProducts': 'Related Products',
    'product.recentlyViewed': 'Recently Viewed',

    // Cart
    'cart.title': 'Shopping Cart',
    'cart.empty': 'Your cart is empty',
    'cart.subtotal': 'Subtotal',
    'cart.shipping': 'Shipping',
    'cart.total': 'Total',
    'cart.checkout': 'Checkout',
    'cart.continueShopping': 'Continue Shopping',
    'cart.remove': 'Remove',

    // Checkout
    'checkout.title': 'Checkout',
    'checkout.shippingInfo': 'Shipping Information',
    'checkout.paymentMethod': 'Payment Method',
    'checkout.orderSummary': 'Order Summary',
    'checkout.placeOrder': 'Place Order',
    'checkout.cod': 'Cash on Delivery',
    'checkout.onlinePayment': 'Online Payment',
    'checkout.bkash': 'bKash',
    'checkout.nagad': 'Nagad',
    'checkout.rocket': 'Rocket',

    // Forms
    'form.name': 'Full Name',
    'form.email': 'Email',
    'form.phone': 'Phone Number',
    'form.address': 'Address',
    'form.city': 'City',
    'form.district': 'District',
    'form.postalCode': 'Postal Code',
    'form.required': 'This field is required',

    // Common
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.sort': 'Sort',
    'common.price': 'Price',
    'common.loading': 'Loading...',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.viewAll': 'View All',
    'common.seeMore': 'See More',

    // Messages
    'msg.addedToCart': 'Added to cart!',
    'msg.orderPlaced': 'Order placed successfully!',
    'msg.loginRequired': 'Please login to continue',
    'msg.error': 'Something went wrong',
  },
  bn: {
    // Navigation
    'nav.home': 'হোম',
    'nav.shop': 'শপ',
    'nav.categories': 'ক্যাটাগরি',
    'nav.about': 'আমাদের সম্পর্কে',
    'nav.contact': 'যোগাযোগ',
    'nav.login': 'লগইন',
    'nav.register': 'রেজিস্টার',
    'nav.cart': 'কার্ট',
    'nav.wishlist': 'উইশলিস্ট',
    'nav.account': 'আমার অ্যাকাউন্ট',
    'nav.orders': 'আমার অর্ডার',
    'nav.logout': 'লগআউট',

    // Products
    'product.addToCart': 'কার্টে যোগ করুন',
    'product.buyNow': 'এখনই কিনুন',
    'product.outOfStock': 'স্টক নেই',
    'product.inStock': 'স্টকে আছে',
    'product.selectSize': 'সাইজ নির্বাচন করুন',
    'product.selectColor': 'রং নির্বাচন করুন',
    'product.quantity': 'পরিমাণ',
    'product.reviews': 'রিভিউ',
    'product.description': 'বিবরণ',
    'product.specifications': 'স্পেসিফিকেশন',
    'product.relatedProducts': 'সম্পর্কিত পণ্য',
    'product.recentlyViewed': 'সম্প্রতি দেখা',

    // Cart
    'cart.title': 'শপিং কার্ট',
    'cart.empty': 'আপনার কার্ট খালি',
    'cart.subtotal': 'সাবটোটাল',
    'cart.shipping': 'ডেলিভারি চার্জ',
    'cart.total': 'মোট',
    'cart.checkout': 'চেকআউট',
    'cart.continueShopping': 'শপিং চালিয়ে যান',
    'cart.remove': 'সরান',

    // Checkout
    'checkout.title': 'চেকআউট',
    'checkout.shippingInfo': 'ডেলিভারি তথ্য',
    'checkout.paymentMethod': 'পেমেন্ট পদ্ধতি',
    'checkout.orderSummary': 'অর্ডার সারাংশ',
    'checkout.placeOrder': 'অর্ডার করুন',
    'checkout.cod': 'ক্যাশ অন ডেলিভারি',
    'checkout.onlinePayment': 'অনলাইন পেমেন্ট',
    'checkout.bkash': 'বিকাশ',
    'checkout.nagad': 'নগদ',
    'checkout.rocket': 'রকেট',

    // Forms
    'form.name': 'পুরো নাম',
    'form.email': 'ইমেইল',
    'form.phone': 'ফোন নম্বর',
    'form.address': 'ঠিকানা',
    'form.city': 'শহর',
    'form.district': 'জেলা',
    'form.postalCode': 'পোস্টাল কোড',
    'form.required': 'এই ফিল্ড আবশ্যক',

    // Common
    'common.search': 'সার্চ',
    'common.filter': 'ফিল্টার',
    'common.sort': 'সাজান',
    'common.price': 'মূল্য',
    'common.loading': 'লোড হচ্ছে...',
    'common.save': 'সেভ',
    'common.cancel': 'বাতিল',
    'common.delete': 'মুছুন',
    'common.edit': 'এডিট',
    'common.viewAll': 'সব দেখুন',
    'common.seeMore': 'আরো দেখুন',

    // Messages
    'msg.addedToCart': 'কার্টে যোগ হয়েছে!',
    'msg.orderPlaced': 'অর্ডার সফল হয়েছে!',
    'msg.loginRequired': 'চালিয়ে যেতে লগইন করুন',
    'msg.error': 'কিছু সমস্যা হয়েছে',
  }
}

// Language store with persistence
export const useLanguageStore = create<LanguageStore>()(
  persist(
    (set, get) => ({
      language: 'en',
      setLanguage: (lang) => set({ language: lang }),
      t: (key: string) => {
        const lang = get().language
        return (translations[lang] as any)[key] || key
      }
    }),
    {
      name: 'language-storage'
    }
  )
)

// Hook for using translations
export function useLanguage() {
  const { language, setLanguage, t } = useLanguageStore()
  return { language, setLanguage, t }
}

// Language switcher component helper
export function formatBengaliNumber(num: number): string {
  const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯']
  return num.toString().split('').map(d => bengaliDigits[parseInt(d)] || d).join('')
}

// Format price in Bengali
export function formatPriceBengali(price: number): string {
  return `৳${formatBengaliNumber(price)}`
}
