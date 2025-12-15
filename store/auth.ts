import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  name: string
  email: string
  role: string
}

interface AuthStore {
  user: User | null
  isAuthenticated: boolean
  setUser: (user: User | null) => void
  logout: () => void
  checkAuth: () => Promise<void>
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      setUser: (user) => {
        set({ user, isAuthenticated: !!user })
      },

      logout: async () => {
        try {
          await fetch('/api/auth/me', {
            method: 'POST',
            credentials: 'include',
          })
        } catch (error) {
          console.error('Logout error:', error)
        } finally {
          set({ user: null, isAuthenticated: false })
        }
      },

      checkAuth: async () => {
        try {
          const res = await fetch('/api/auth/me', {
            credentials: 'include',
          })
          
          if (res.ok) {
            const data = await res.json()
            if (data.authenticated && data.user) {
              set({ user: data.user, isAuthenticated: true })
            } else {
              set({ user: null, isAuthenticated: false })
            }
          } else {
            set({ user: null, isAuthenticated: false })
          }
        } catch (error) {
          console.error('Auth check error:', error)
          set({ user: null, isAuthenticated: false })
        }
      },
    }),
    {
      name: 'auth-storage',
    }
  )
)
