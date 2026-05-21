'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getToken } from '@/lib/api';
import Link from 'next/link';

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const isLoginPage = pathname === '/admin/login' || pathname?.endsWith('/admin/login');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const token = getToken();
    let currentUser = null;

    try {
      const raw = localStorage.getItem('furrmaa_user') || localStorage.getItem('user');
      currentUser = raw ? JSON.parse(raw) : null;
    } catch (_) {
      currentUser = null;
    }

    const isAdmin = currentUser?.role === 'admin';

    if (!isLoginPage && (!token || !isAdmin)) {
      router.replace('/admin/login');
      setIsCheckingSession(false);
      return;
    }

    if (isLoginPage && token && isAdmin) {
      router.replace('/admin');
      setIsCheckingSession(false);
      return;
    }

    setIsCheckingSession(false);
  }, [isLoginPage, pathname, router]);

  if (!isLoginPage && isCheckingSession) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Checking admin session...</p>
      </div>
    );
  }

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-[#1F2E46] text-white sticky top-0 z-10 shadow">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="font-bold text-lg">Admin Panel</Link>
            <nav className="flex gap-2 text-sm">
              <Link href="/admin" className="px-3 py-1 rounded hover:bg-white/10">Dashboard</Link>
              <Link href="/admin/products" className="px-3 py-1 rounded hover:bg-white/10">Products</Link>
              <Link href="/admin/categories" className="px-3 py-1 rounded hover:bg-white/10">Categories</Link>
              <Link href="/admin/orders" className="px-3 py-1 rounded hover:bg-white/10">Orders</Link>
              <Link href="/admin/veterinarians" className="px-3 py-1 rounded hover:bg-white/10">Vets</Link>
              <Link href="/admin/vet-service-types" className="px-3 py-1 rounded hover:bg-white/10">Vet Types</Link>
              <Link href="/admin/posts" className="px-3 py-1 rounded hover:bg-white/10">Posts</Link>
              <Link href="/admin/faq" className="px-3 py-1 rounded hover:bg-white/10">FAQ</Link>
              <Link href="/admin/feedback" className="px-3 py-1 rounded hover:bg-white/10">Feedback</Link>
              <Link href="/admin/support" className="px-3 py-1 rounded hover:bg-white/10">Support</Link>
              <Link href="/admin/users" className="px-3 py-1 rounded hover:bg-white/10">Users</Link>
              <Link href="/admin/training-videos" className="px-3 py-1 rounded hover:bg-white/10">Training</Link>
              <Link href="/admin/pet-events" className="px-3 py-1 rounded hover:bg-white/10">Pet Events</Link>
              <Link href="/admin/hope-posts" className="px-3 py-1 rounded hover:bg-white/10">Hope</Link>
            </nav>
          </div>
          <Link href="/" className="text-sm text-white/80 hover:text-white">← Site</Link>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}
