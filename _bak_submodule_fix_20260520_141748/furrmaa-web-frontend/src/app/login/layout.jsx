import { Suspense } from 'react'

export default function LoginLayout({ children }) {
  return (
    <Suspense
      fallback={
        <section className="min-h-[100vh] flex items-center justify-center bg-gray-50 px-4">
          <p className="text-gray-500 text-sm">Loading…</p>
        </section>
      }
    >
      {children}
    </Suspense>
  )
}
