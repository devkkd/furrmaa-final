const DEFAULT_API_BASE_URL = 'http://localhost:5000/api';
const LIVE_API_BASE_URL =
  process.env.NEXT_PUBLIC_LIVE_API_URL || 'https://furrmaa-final.onrender.com/api';

function normalizeApiUrl(url) {
  const raw = String(url || '').trim().replace(/\/$/, '');
  if (!raw) return DEFAULT_API_BASE_URL;
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

/**
 * NEXT_PUBLIC_* vars are baked in at `next build` — local .env is not uploaded to hosting.
 * On furrmaa.com we must not call localhost; use LIVE_API_BASE_URL unless env has a prod URL.
 */
export function getApiBaseUrl() {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;

  if (typeof window !== 'undefined') {
    if (!isLocalHost(window.location.hostname)) {
      if (!envPointsToLocal(envUrl)) return normalizeApiUrl(envUrl);
      return normalizeApiUrl(LIVE_API_BASE_URL);
    }
    return normalizeApiUrl(envUrl || DEFAULT_API_BASE_URL);
  }

  if (process.env.NODE_ENV === 'production' && envPointsToLocal(envUrl)) {
    return normalizeApiUrl(LIVE_API_BASE_URL);
  }

  return normalizeApiUrl(envUrl || DEFAULT_API_BASE_URL);
}

export const API_BASE_URL = getApiBaseUrl();
