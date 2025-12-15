// Recently Viewed Products Store
// Uses localStorage to persist recently viewed products across sessions

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface RecentlyViewedProduct {
  id: string
  name: string
  slug: string
  price: number
  salePrice?: number
  image: string
  viewedAt: number
}

interface RecentlyViewedStore {
  products: RecentlyViewedProduct[]
  addProduct: (product: Omit<RecentlyViewedProduct, 'viewedAt'>) => void
  clearAll: () => void
  getProducts: (limit?: number) => RecentlyViewedProduct[]
}

const MAX_RECENTLY_VIEWED = 12

export const useRecentlyViewedStore = create<RecentlyViewedStore>()(
  persist(
    (set, get) => ({
      products: [],
      
      addProduct: (product) => {
        set((state) => {
          // Remove if already exists
          const filtered = state.products.filter(p => p.id !== product.id)
          
          // Add to beginning with timestamp
          const newProducts = [
            { ...product, viewedAt: Date.now() },
            ...filtered
          ].slice(0, MAX_RECENTLY_VIEWED)
          
          return { products: newProducts }
        })
      },
      
      clearAll: () => set({ products: [] }),
      
      getProducts: (limit = MAX_RECENTLY_VIEWED) => {
        return get().products.slice(0, limit)
      }
    }),
    {
      name: 'recently-viewed-products',
    }
  )
)

// Hook to track product view
export function useTrackProductView() {
  const addProduct = useRecentlyViewedStore(state => state.addProduct)
  
  const trackView = (product: {
    id: string
    name: string
    slug: string
    price: number
    salePrice?: number
    images?: string[]
  }) => {
    addProduct({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      salePrice: product.salePrice,
      image: product.images?.[0] || '/placeholder-product.jpg'
    })
  }
  
  return trackView
}
