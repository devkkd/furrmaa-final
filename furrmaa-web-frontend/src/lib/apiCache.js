const store = new Map();
/** In-flight promises so concurrent callers share one network request */
const inflight = new Map();

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Timeouts tuned for always-on VPS (Hostinger).
 * Still retries once for brief blips — not Render cold-start waits.
 */
export async function fetchWithTimeout(url, options = {}, timeoutMs = 15_000) {
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
  { timeoutMs = 15_000, retries = 1, backoffMs = 800 } = {}
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

/** Optional wake ping — cheap on VPS; kept for compatibility */
export async function pingApiHealth(baseUrl) {
  const url = `${String(baseUrl || '').replace(/\/$/, '')}/health`;
  try {
    await fetchWithRetry(url, {}, { timeoutMs: 10_000, retries: 1, backoffMs: 500 });
    return true;
  } catch {
    return false;
  }
}

export function getCached(key) {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return null;
  }
  return entry.value;
}

export function setCached(key, value, ttlMs = 60_000) {
  store.set(key, { value, expiresAt: Date.now() + ttlMs });
}

export function clearApiCache(prefix = '') {
  if (!prefix) {
    store.clear();
    inflight.clear();
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
 * In-memory GET cache + in-flight dedupe.
 * Does not cache empty arrays by default (avoids poisoning after a blip).
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
