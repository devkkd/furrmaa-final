'use client';

/**
 * Firebase Web SDK (Google / Apple / Phone). Client config only — no service account.
 * Backend still needs FIREBASE_* Admin credentials to verify ID tokens from POST /auth/login.
 */

export function isFirebaseWebConfigReady() {
  return !!(
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  );
}

export async function getFirebaseAuth() {
  if (typeof window === 'undefined') return null;
  if (!isFirebaseWebConfigReady()) return null;

  const { initializeApp, getApps } = await import('firebase/app');
  const { getAuth } = await import('firebase/auth');

  const existing = getApps()[0];
  const app =
    existing ||
    initializeApp({
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    });

  return getAuth(app);
}
