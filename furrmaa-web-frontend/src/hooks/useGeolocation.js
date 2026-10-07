'use client';

import { useState, useCallback } from 'react';
import {
  getCurrentLocationWithCoords,
  forwardGeocode,
  isCoordinateLocation,
} from '@/lib/geolocation';

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
  const [location, setLocationState] = useState(defaultLocation);
  const [coords, setCoords] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCurrentLocation = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { address, lat, lng } = await withTimeout(
        getCurrentLocationWithCoords(),
        LOCATION_TIMEOUT_MS,
        'Location request timed out. Use "Change" and type your city/area, then "Use this location".'
      );
      setLocationState(address);
      setCoords({ lat, lng });
      return address;
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

  const setManualLocation = useCallback(async (addr, maybeCoords) => {
    const next = addr || defaultLocation;
    setLocationState(next);
    setError(null);
    if (maybeCoords?.lat != null && maybeCoords?.lng != null) {
      setCoords({ lat: maybeCoords.lat, lng: maybeCoords.lng });
      return;
    }
    if (!next?.trim() || isCoordinateLocation(next)) {
      setCoords(null);
      return;
    }
    const m = String(next).trim().match(/^(-?\d+(\.\d+)?)\s*,\s*(-?\d+(\.\d+)?)$/);
    if (m) {
      setCoords({ lat: parseFloat(m[1]), lng: parseFloat(m[3]) });
      return;
    }
    try {
      const c = await forwardGeocode(next);
      setCoords(c);
    } catch {
      setCoords(null);
    }
  }, [defaultLocation]);

  return {
    location,
    coords,
    loading,
    error,
    fetchCurrentLocation,
    setLocation: setManualLocation,
  };
}
