'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getToken, setToken, fetchMe } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';

const ADMIN_LOGIN = '/login?redirect=%2Fadmin';

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [access, setAccess] = useState('pending');
  const isLoginPage = pathname === '/admin/login' || pathname?.endsWith('/admin/login');

  useEffect(() => {
    let cancelled = false;

    async function verifyAdminAccess() {
      const token = getToken();

      if (isLoginPage) {
        if (!token) {
          if (!cancelled) setAccess('granted');
          return;
        }
        try {
          const me = await fetchMe();
          if (cancelled) return;
          if (me?.role === 'admin') {
            router.replace('/admin');
            return;
          }
        } catch (_) {
          /* not logged in */
        }
        if (!cancelled) setAccess('granted');
        return;
      }

      if (!token) {
        router.replace(ADMIN_LOGIN);
        if (!cancelled) setAccess('denied');
        return;
      }

      try {
        const me = await fetchMe();
        if (cancelled) return;

        if (me?.role === 'admin') {
          useAuthStore.getState().setUser(me);
          try {
            localStorage.setItem('furrmaa_user', JSON.stringify(me));
          } catch (_) {
            /* ignore */
          }
          setAccess('granted');
          return;
        }
      } catch (_) {
        /* invalid session */
      }

      setToken(null);
      useAuthStore.getState().logout();
      router.replace(ADMIN_LOGIN);
      if (!cancelled) setAccess('denied');
    }

    setAccess('pending');
    verifyAdminAccess();

    return () => {
      cancelled = true;
    };
  }, [isLoginPage, pathname, router]);

  if (access === 'pending') {
    return (
      <LoadingCenter>
        {isLoginPage ? 'Loading...' : 'Verifying admin access...'}
      </LoadingCenter>
    );
  }

  if (access === 'denied') {
    return <LoadingCenter>Redirecting to login...</LoadingCenter>;
  }

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (access !== 'granted') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-[#1F2E46] text-white sticky top-0 z-10 shadow">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <Link href="/admin" className="font-bold text-lg shrink-0">
              Admin Panel
            </Link>
            <nav className="flex flex-wrap gap-2 text-sm">
              <Link href="/admin" className="px-3 py-1 rounded hover:bg-white/10">
                Dashboard
              </Link>
              <Link href="/admin/products" className="px-3 py-1 rounded hover:bg-white/10">
                Products
              </Link>
              <Link href="/admin/categories" className="px-3 py-1 rounded hover:bg-white/10">
                Categories
              </Link>
              <Link href="/admin/orders" className="px-3 py-1 rounded hover:bg-white/10">
                Orders
              </Link>
              <Link href="/admin/veterinarians" className="px-3 py-1 rounded hover:bg-white/10">
                Vets
              </Link>
              <Link href="/admin/vet-service-types" className="px-3 py-1 rounded hover:bg-white/10">
                Vet Types
              </Link>
              <Link href="/admin/posts" className="px-3 py-1 rounded hover:bg-white/10">
                Posts
              </Link>
              <Link href="/admin/faq" className="px-3 py-1 rounded hover:bg-white/10">
                FAQ
              </Link>
              <Link href="/admin/feedback" className="px-3 py-1 rounded hover:bg-white/10">
                Feedback
              </Link>
              <Link href="/admin/support" className="px-3 py-1 rounded hover:bg-white/10">
                Support
              </Link>
              <Link href="/admin/users" className="px-3 py-1 rounded hover:bg-white/10">
                Users
              </Link>
              <Link href="/admin/training-videos" className="px-3 py-1 rounded hover:bg-white/10">
                Training
              </Link>
              <Link href="/admin/pet-events" className="px-3 py-1 rounded hover:bg-white/10">
                Pet Events
              </Link>
              <Link href="/admin/hope-posts" className="px-3 py-1 rounded hover:bg-white/10">
                Hope
              </Link>
            </nav>
          </div>
          <Link href="/" className="text-sm text-white/80 hover:text-white shrink-0">
            ← Site
          </Link>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}

function LoadingCenter({ children }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-500">{children}</p>
    </div>
  );
}
