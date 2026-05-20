'use client';

function requireWindow() {
  if (typeof window === 'undefined') throw new Error('Window not available');
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) return resolve();
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.head.appendChild(script);
  });
}

export function isFirebaseWebConfigReady() {
  return Boolean(
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
      process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  );
}

export async function getFirebaseAuthCompat() {
  requireWindow();
  if (!isFirebaseWebConfigReady()) {
    throw new Error('Firebase web config missing in .env');
  }

  if (!window.firebase) {
    await loadScript('https://www.gstatic.com/firebasejs/10.12.4/firebase-app-compat.js');
    await loadScript('https://www.gstatic.com/firebasejs/10.12.4/firebase-auth-compat.js');
  }

  if (!window.firebase?.apps?.length) {
    window.firebase.initializeApp({
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
    });
  }

  return window.firebase.auth();
}
