import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { haptics } from '@/lib/haptics'

interface CartItem {
  id: string
  productId: string
  name: string
  price: number
  quantity: number
  image: string
  variantId?: string
  size?: string
  color?: string
}

interface AppliedCoupon {
  code: string
  discountType: 'percentage' | 'fixed' | 'free_shipping'
  discountValue: number
  maxDiscount?: number
  isFreeShipping?: boolean
}

interface CartStore {
  items: CartItem[]
  appliedCoupon: AppliedCoupon | null
  _hasHydrated: boolean
  setHasHydrated: (state: boolean) => void
  addItem: (item: Omit<CartItem, 'id'>) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  applyCoupon: (coupon: AppliedCoupon) => void
  removeCoupon: () => void
  getTotalItems: () => number
  getTotalPrice: () => number
  getDiscount: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      appliedCoupon: null,
      _hasHydrated: false,
      
      setHasHydrated: (state) => {
        set({ _hasHydrated: state })
      },

      addItem: (item) => {
        const items = get().items
        const existingItem = items.find(
          (i) => i.productId === item.productId && i.variantId === item.variantId
        )

        if (existingItem) {
          haptics.medium()
          set({
            items: items.map((i) =>
              i.id === existingItem.id
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            ),
          })
        } else {
          haptics.medium()
          set({
            items: [
              ...items,
              {
                ...item,
                id: `${item.productId}-${item.variantId || 'default'}-${Date.now()}`,
              },
            ],
          })
        }
      },

      removeItem: (id) => {
        haptics.light()
        set({ items: get().items.filter((item) => item.id !== id) })
      },

      updateQuantity: (id, quantity) => {
        haptics.light()
        if (quantity <= 0) {
          get().removeItem(id)
        } else {
          set({
            items: get().items.map((item) =>
              item.id === id ? { ...item, quantity } : item
            ),
          })
        }
      },

      clearCart: () => {
        set({ items: [], appliedCoupon: null })
      },

      applyCoupon: (coupon) => {
        set({ appliedCoupon: coupon })
      },

      removeCoupon: () => {
        set({ appliedCoupon: null })
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0)
      },

      getTotalPrice: () => {
        return get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        )
      },

      getDiscount: () => {
        const coupon = get().appliedCoupon
        if (!coupon) return 0
        
        const subtotal = get().getTotalPrice()
        if (coupon.discountType === 'percentage') {
          let discount = (subtotal * coupon.discountValue) / 100
          if (coupon.maxDiscount && discount > coupon.maxDiscount) {
            discount = coupon.maxDiscount
          }
          return Math.round(discount)
        }
        return coupon.discountValue
      },
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    }
  )
)
