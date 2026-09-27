const store = new Map();
const inflight = new Map();
const SS_PREFIX = 'furrmaa_api_v1:';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function readSession(key) {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(SS_PREFIX + key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || Date.now() > parsed.expiresAt) {
      sessionStorage.removeItem(SS_PREFIX + key);
      return null;
    }
    return parsed.value;
  } catch {
    return null;
  }
}

function writeSession(key, value, ttlMs) {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(
      SS_PREFIX + key,
      JSON.stringify({ value, expiresAt: Date.now() + ttlMs })
    );
  } catch {
    /* quota / private mode */
  }
}

/** Default 8s — fail fast; home shows static fallbacks instead of hanging. */
export async function fetchWithTimeout(url, options = {}, timeoutMs = 8_000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchWithRetry(
  url,
  options = {},
  { timeoutMs = 8_000, retries = 0, backoffMs = 400 } = {}
) {
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetchWithTimeout(url, options, timeoutMs);
      if ([502, 503, 504].includes(res.status) && attempt < retries) {
        await sleep(backoffMs * (attempt + 1));
        continue;
      }
      return res;
    } catch (err) {
      lastError = err;
      if (attempt < retries) {
        await sleep(backoffMs * (attempt + 1));
        continue;
      }
    }
  }
  throw lastError || new Error('Request failed');
}

export async function pingApiHealth(baseUrl) {
  const url = `${String(baseUrl || '').replace(/\/$/, '')}/health`;
  try {
    const res = await fetchWithTimeout(url, {}, 4_000);
    return res.ok;
  } catch {
    return false;
  }
}

export function getCached(key) {
  const entry = store.get(key);
  if (entry) {
    if (Date.now() > entry.expiresAt) {
      store.delete(key);
    } else {
      return entry.value;
    }
  }
  const fromSs = readSession(key);
  if (fromSs != null) {
    store.set(key, { value: fromSs, expiresAt: Date.now() + 60_000 });
    return fromSs;
  }
  return null;
}

export function setCached(key, value, ttlMs = 60_000) {
  store.set(key, { value, expiresAt: Date.now() + ttlMs });
  writeSession(key, value, ttlMs);
}

export function clearApiCache(prefix = '') {
  if (!prefix) {
    store.clear();
    inflight.clear();
    if (typeof window !== 'undefined') {
      try {
        const keys = [];
        for (let i = 0; i < sessionStorage.length; i++) {
          const k = sessionStorage.key(i);
          if (k && k.startsWith(SS_PREFIX)) keys.push(k);
        }
        keys.forEach((k) => sessionStorage.removeItem(k));
      } catch {
        /* ignore */
      }
    }
    return;
  }
  for (const key of store.keys()) {
    if (key.startsWith(prefix)) store.delete(key);
  }
  for (const key of inflight.keys()) {
    if (key.startsWith(prefix)) inflight.delete(key);
  }
}

/**
 * Memory + sessionStorage cache + in-flight dedupe.
 * Empty arrays are not cached (unless cacheEmpty).
 */
export async function withCache(key, ttlMs, fn, opts = {}) {
  const { cacheEmpty = false } = opts;
  const hit = getCached(key);
  if (hit != null) {
    if (cacheEmpty || !(Array.isArray(hit) && hit.length === 0)) {
      return hit;
    }
    store.delete(key);
  }

  const pending = inflight.get(key);
  if (pending) return pending;

  const promise = Promise.resolve()
    .then(fn)
    .then((value) => {
      const isEmptyArray = Array.isArray(value) && value.length === 0;
      if (!isEmptyArray || cacheEmpty) {
        setCached(key, value, ttlMs);
      }
      return value;
    })
    .finally(() => {
      inflight.delete(key);
    });

  inflight.set(key, promise);
  return promise;
}
