import { create } from 'zustand'

const USER_STORAGE_KEY = 'furrmaa_user'

export const useAuthStore = create((set, get) => ({
  isAuthenticated: false,
  user: null,

  login: (userData) => {
    if (typeof window !== 'undefined' && userData) {
      try { localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData)) } catch (_) {}
    }
    set({ isAuthenticated: true, user: userData })
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      try { localStorage.removeItem(USER_STORAGE_KEY) } catch (_) {}
    }
    set({ isAuthenticated: false, user: null })
  },

  setUser: (userData) => set({ user: userData, isAuthenticated: !!userData }),

  rehydrateUser: (userData) => {
    if (userData) set({ user: userData, isAuthenticated: true })
  },

  /** Instant UI from localStorage — avoids blank screen while /auth/me loads */
  hydrateFromStorage: () => {
    if (typeof window === 'undefined') return null
    try {
      const raw = localStorage.getItem(USER_STORAGE_KEY)
      if (!raw) return null
      const userData = JSON.parse(raw)
      if (userData) set({ user: userData, isAuthenticated: true })
      return userData
    } catch {
      return null
    }
  },
}))
