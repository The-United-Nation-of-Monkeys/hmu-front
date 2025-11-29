import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type UserRole = 'government' | 'university' | 'grantee'

export interface User {
  id: number
  email: string
  full_name: string
  role: UserRole
}

interface AuthState {
  token: string | null
  user: User | null
  isAuthenticated: boolean
  login: (token: string, user: User) => void
  logout: () => void
  setUser: (user: User) => void
}

export const authStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      login: (token: string, user: User) => {
        console.log(token)
        set({ token, user, isAuthenticated: true })
      },
      logout: () => {
        set({ token: null, user: null, isAuthenticated: false })
      },
      setUser: (user: User) => {
        set({ user })
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)

