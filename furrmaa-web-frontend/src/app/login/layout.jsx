import { Suspense } from 'react'
import LogoLoader from '@/components/LogoLoader'

export default function LoginLayout({ children }) {
  return (
    <Suspense
      fallback={
        <section className="min-h-[100vh] flex items-center justify-center bg-gray-50 px-4">
          <LogoLoader />
        </section>
      }
    >
      {children}
    </Suspense>
  )
}
