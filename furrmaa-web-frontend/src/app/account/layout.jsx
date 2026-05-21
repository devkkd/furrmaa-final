'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { getToken, setToken, fetchMe } from '@/lib/api'
import AccountSideBar from '@/components/AccountSideBar'
import MobileAccountNav from '@/components/MobileAccountNav'

export default function AccountLayout({ children }) {
  const router = useRouter()
  const { isAuthenticated, user, rehydrateUser, setUser } = useAuthStore()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const token = getToken()
    if (!token) {
      setToken(null)
      useAuthStore.getState().logout()
      router.replace('/login')
      setChecking(false)
      return
    }
    if (user) {
      setChecking(false)
      return
    }
    fetchMe()
      .then((me) => {
        if (me) setUser(me)
      })
      .catch(() => {
        setToken(null)
        useAuthStore.getState().logout()
        router.replace('/login')
      })
      .finally(() => setChecking(false))
  }, [router])

  useEffect(() => {
    if (!checking && !isAuthenticated && !getToken()) router.replace('/login')
  }, [checking, isAuthenticated, router])

  if (checking) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }
  if (!isAuthenticated) return null

  return (
    <div className="mx-auto max-w-7xl">

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden md:block w-[380px]">
          <AccountSideBar />
        </aside>

        {/* Main Content */}
        <main className="flex-1 bg-white md:py-10">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
        <MobileAccountNav />
      </div>
    </div>
  )
}
