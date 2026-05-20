'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Container from '@/components/Container';

/**
 * Admin login is handled via the main app login page.
 * Role check happens after login and only admins are allowed to continue.
 */
export default function AdminLoginPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/login?redirect=%2Fadmin');
  }, [router]);

  return (
    <section className="min-h-[70vh] flex items-center justify-center py-16 px-4 bg-gray-50">
      <Container>
        <div className="max-w-md mx-auto bg-white border border-gray-100 rounded-2xl p-8 shadow-sm">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-extrabold text-gray-900">Redirecting to Login</h1>
            <p className="text-gray-600 text-sm mt-2">
              Please login with your account. Admin role users will be redirected to dashboard.
            </p>
          </div>

          <Link
            href="/login?redirect=%2Fadmin"
            className="block w-full text-center bg-[#1F2E46] text-white font-bold py-3.5 px-6 rounded-xl hover:opacity-90 transition"
          >
            Continue to Login
          </Link>

          <p className="mt-6 text-center text-gray-500 text-xs">
            Use the same phone/email OTP login. Access is granted only for admin role.
          </p>

          <div className="mt-6 text-center">
            <Link href="/" className="text-[#1F2E46] font-medium text-sm hover:underline">
              ← Back to Home
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
