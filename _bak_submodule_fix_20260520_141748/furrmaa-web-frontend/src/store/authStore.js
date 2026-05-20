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
}))
