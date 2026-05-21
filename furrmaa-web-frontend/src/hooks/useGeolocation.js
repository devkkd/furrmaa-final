'use client';

import { useState, useCallback } from 'react';
import { getCurrentLocationString } from '@/lib/geolocation';

const LOCATION_TIMEOUT_MS = 22000;

function withTimeout(promise, ms, message) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(message)), ms)
    ),
  ]);
}

export function useGeolocation(defaultLocation = '') {
  const [location, setLocation] = useState(defaultLocation);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCurrentLocation = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const addr = await withTimeout(
        getCurrentLocationString(),
        LOCATION_TIMEOUT_MS,
        'Location request timed out. Use "Change" and type your city/area, then "Use this location".'
      );
      setLocation(addr);
      return addr;
    } catch (e) {
      const isDenied = e.code === 1 || (e.message && /denied|access|permission|secure|https/i.test(e.message));
      const isTimeout = e.message && /timed out/i.test(e.message);
      const msg = isTimeout
        ? (e.message || 'Took too long. Use "Change" to type your city/area.')
        : isDenied
          ? 'Location is off. Allow it in your browser, or type your city/area below and click "Use this location".'
          : (e.message || 'Could not get location. Type your city/area below and click "Use this location".');
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const setManualLocation = useCallback((addr) => {
    setLocation(addr || defaultLocation);
    setError(null);
  }, [defaultLocation]);

  return { location, loading, error, fetchCurrentLocation, setLocation: setManualLocation };
}
