import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { haptics } from '@/lib/haptics'
import { nativeApi } from '@/lib/native-api'

interface WishlistItem {
  productId: string
  name: string
  slug: string
  basePrice: number
  salePrice?: number | null
  images: string | string[]
  category?: { name: string; slug: string }
  addedAt: string
}

interface WishlistStore {
  items: WishlistItem[]
  _hasHydrated: boolean
  setHasHydrated: (state: boolean) => void
  addItem: (item: Omit<WishlistItem, 'addedAt'>) => void
  removeItem: (productId: string) => void
  toggleItem: (item: Omit<WishlistItem, 'addedAt'>) => void
  isInWishlist: (productId: string) => boolean
  clearWishlist: () => void
  getItemCount: () => number
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      _hasHydrated: false,

      setHasHydrated: (state) => {
        set({ _hasHydrated: state })
      },

      addItem: (item) => {
        const items = get().items
        const exists = items.find((i) => i.productId === item.productId)

        if (!exists) {
          haptics.success()
          set({
            items: [
              ...items,
              { ...item, addedAt: new Date().toISOString() },
            ],
          })
          // Update native badge
          nativeApi.setBadge(get().items.length + 1)
        }
      },

      removeItem: (productId) => {
        haptics.light()
        set({
          items: get().items.filter((item) => item.productId !== productId),
        })
        // Update native badge
        nativeApi.setBadge(get().items.length - 1)
      },

      toggleItem: (item) => {
        const items = get().items
        const exists = items.find((i) => i.productId === item.productId)

        if (exists) {
          get().removeItem(item.productId)
        } else {
          haptics.success()
          set({
            items: [
              ...items,
              { ...item, addedAt: new Date().toISOString() },
            ],
          })
          nativeApi.setBadge(get().items.length + 1)
        }
      },

      isInWishlist: (productId) => {
        return get().items.some((item) => item.productId === productId)
      },

      clearWishlist: () => {
        haptics.light()
        set({ items: [] })
        nativeApi.setBadge(0)
      },

      getItemCount: () => {
        return get().items.length
      },
    }),
    {
      name: 'wishlist-storage',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
        if (state) {
          nativeApi.setBadge(state.getItemCount())
        }
      },
    }
  )
)

// Global sync for badge updates
useWishlistStore.subscribe((state) => {
  if (state._hasHydrated) {
    nativeApi.setBadge(state.getItemCount())
  }
})
