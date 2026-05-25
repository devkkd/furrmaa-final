'use client';

import { initializeApp, getApps, deleteApp } from 'firebase/app';
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithPopup,
} from 'firebase/auth';

const RECAPTCHA_CONTAINER_ID = 'recaptcha-container';

function getFirebaseConfig() {
  return {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.trim(),
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN?.trim(),
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim(),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim(),
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID?.trim(),
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID?.trim(),
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID?.trim(),
  };
}

export function isFirebaseWebConfigReady() {
  const cfg = getFirebaseConfig();
  return Boolean(cfg.apiKey && cfg.authDomain && cfg.projectId);
}

export function assertPhoneAuthHost() {
  if (typeof window === 'undefined') return;
  const host = window.location.hostname;
  if (host === 'localhost') {
    const port = window.location.port || '3000';
    throw new Error(
      `Firebase Phone OTP "localhost" pe kaam nahi karta. Browser me kholo: http://127.0.0.1:${port}/login`
    );
  }
}

export async function getFirebaseAuthInstance() {
  if (typeof window === 'undefined') throw new Error('Window not available');
  if (!isFirebaseWebConfigReady()) {
    throw new Error('Firebase web config missing in .env — restart dev server after editing .env');
  }

  const firebaseConfig = getFirebaseConfig();
  let app = getApps()[0];

  if (app && app.options?.apiKey !== firebaseConfig.apiKey) {
    await deleteApp(app);
    app = undefined;
  }

  if (!app) {
    app = initializeApp(firebaseConfig);
  }

  const auth = getAuth(app);

  if (
    process.env.NODE_ENV === 'development' &&
    process.env.NEXT_PUBLIC_FIREBASE_APP_VERIFICATION_DISABLED === 'true'
  ) {
    auth.settings.appVerificationDisabledForTesting = true;
  }

  return auth;
}

function resetRecaptchaContainer(containerId = RECAPTCHA_CONTAINER_ID) {
  const el = document.getElementById(containerId);
  if (el) el.innerHTML = '';
}

/** Page load par invisible reCAPTCHA — Send OTP pe turant OTP bhej sakte ho */
export async function setupPhoneRecaptcha(
  containerId = RECAPTCHA_CONTAINER_ID,
  { onSolved, onExpired } = {}
) {
  assertPhoneAuthHost();

  const auth = await getFirebaseAuthInstance();
  resetRecaptchaContainer(containerId);

  const useVisible = process.env.NEXT_PUBLIC_FIREBASE_RECAPTCHA_VISIBLE === 'true';

  const verifier = new RecaptchaVerifier(auth, containerId, {
    size: useVisible ? 'normal' : 'invisible',
    callback: () => onSolved?.(),
    'expired-callback': () => onExpired?.(),
  });

  await verifier.render();

  return { auth, verifier, isVisible: useVisible };
}

export async function sendFirebasePhoneOtp(
  phoneNumber,
  verifier,
  auth,
  containerId = RECAPTCHA_CONTAINER_ID
) {
  assertPhoneAuthHost();

  let activeAuth = auth;
  let activeVerifier = verifier;

  if (!activeVerifier || !activeAuth) {
    const setup = await setupPhoneRecaptcha(containerId);
    activeAuth = setup.auth;
    activeVerifier = setup.verifier;
  }

  const confirmation = await signInWithPhoneNumber(
    activeAuth,
    phoneNumber,
    activeVerifier
  );

  return { confirmation, verifier: activeVerifier, auth: activeAuth };
}

export function clearPhoneRecaptcha(verifier, containerId = RECAPTCHA_CONTAINER_ID) {
  try {
    verifier?.clear?.();
  } catch (_) {
    /* ignore */
  }
  resetRecaptchaContainer(containerId);
}

export function mapFirebaseAuthError(err) {
  const code = err?.code || '';
  const host = typeof window !== 'undefined' ? window.location.hostname : '';

  if (code === 'auth/invalid-app-credential' || code === 'auth/captcha-check-failed') {
    if (host === 'localhost') {
      const port = typeof window !== 'undefined' ? window.location.port || '3000' : '3000';
      return `Phone OTP localhost pe block hai. Use: http://127.0.0.1:${port}/login`;
    }
    return 'reCAPTCHA verify fail. Page refresh (Ctrl+Shift+R) karke dubara Send OTP dabao. URL 127.0.0.1 honi chahiye.';
  }
  if (code === 'auth/invalid-api-key') {
    return 'Firebase API key invalid. Dev server restart karo (npm run dev).';
  }
  if (code === 'auth/unauthorized-domain') {
    return 'Domain authorized nahi. Firebase Console → Authentication → Authorized domains me 127.0.0.1 add karo.';
  }
  return err?.message || 'Authentication failed';
}

export async function getFirebaseAuthCompat() {
  return getFirebaseAuthInstance();
}

export {
  signInWithPhoneNumber,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithPopup,
  RECAPTCHA_CONTAINER_ID,
};
