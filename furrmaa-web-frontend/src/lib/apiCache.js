const store = new Map();
/** In-flight promises so concurrent callers share one network request */
const inflight = new Map();

/** Abort slow API calls so UI does not hang (e.g. Render cold start). */
export async function fetchWithTimeout(url, options = {}, timeoutMs = 12_000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
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
 * In-memory GET cache + in-flight dedupe for public catalog APIs.
 * Concurrent home sections share one request instead of N duplicates.
 */
export async function withCache(key, ttlMs, fn) {
  const hit = getCached(key);
  if (hit != null) return hit;

  const pending = inflight.get(key);
  if (pending) return pending;

  const promise = Promise.resolve()
    .then(fn)
    .then((value) => {
      setCached(key, value, ttlMs);
      return value;
    })
    .finally(() => {
      inflight.delete(key);
    });

  inflight.set(key, promise);
  return promise;
}
