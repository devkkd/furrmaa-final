const DEFAULT_API_BASE_URL = 'http://localhost:5000/api';

/**
 * Production API base.
 * IMPORTANT (Hostinger): live site `https://www.furrmaa.com/api` currently returns 502
 * unless nginx proxies to Node. Until that is fixed, point NEXT_PUBLIC_API_URL at a
 * working always-on API (VPS IP/domain), NOT a sleeping Render free instance.
 */
const LIVE_API_BASE_URL =
  process.env.NEXT_PUBLIC_LIVE_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'https://furrmaa-final.onrender.com/api';

function normalizeApiUrl(url) {
  const raw = String(url || '').trim().replace(/\/$/, '');
  if (!raw) return DEFAULT_API_BASE_URL;
  if (raw === '/api') return '/api';
  if (raw.startsWith('/')) return raw.endsWith('/api') ? raw : `${raw}/api`;
  return raw.endsWith('/api') ? raw : `${raw}/api`;
}

function isLocalHost(hostname) {
  return (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname.startsWith('192.168.') ||
    hostname.endsWith('.local')
  );
}

function envPointsToLocal(url) {
  return !url || /localhost|127\.0\.0\.1/i.test(url);
}

function wantsSameOrigin() {
  return String(process.env.NEXT_PUBLIC_API_SAME_ORIGIN || '').toLowerCase() === 'true';
}

/**
 * NEXT_PUBLIC_* vars are baked in at `next build`.
 * On Hostinger VPS: prefer same-origin /api when enabled, else LIVE/API env (not localhost).
 */
export function getApiBaseUrl() {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;

  if (typeof window !== 'undefined') {
    if (!isLocalHost(window.location.hostname)) {
      // Same-machine nginx/Next proxy — no extra DNS/CORS hop
      if (wantsSameOrigin()) {
        return `${window.location.origin}/api`;
      }
      if (!envPointsToLocal(envUrl)) return normalizeApiUrl(envUrl);
      return normalizeApiUrl(LIVE_API_BASE_URL);
    }
    return normalizeApiUrl(envUrl || DEFAULT_API_BASE_URL);
  }

  // SSR
  if (wantsSameOrigin() && process.env.NODE_ENV === 'production') {
    const site = process.env.NEXT_PUBLIC_SITE_URL || process.env.FRONTEND_URL;
    if (site && !envPointsToLocal(site)) {
      return `${String(site).replace(/\/$/, '')}/api`;
    }
    return '/api';
  }

  if (process.env.NODE_ENV === 'production' && envPointsToLocal(envUrl)) {
    return normalizeApiUrl(LIVE_API_BASE_URL);
  }

  return normalizeApiUrl(envUrl || DEFAULT_API_BASE_URL);
}

export const API_BASE_URL = getApiBaseUrl();
