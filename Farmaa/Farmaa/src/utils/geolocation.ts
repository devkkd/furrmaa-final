import { Platform, PermissionsAndroid } from 'react-native';
import Geolocation from '@react-native-community/geolocation';

const LOCATION_PERMISSION = PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION;

// Nominatim (OpenStreetMap) requires a valid User-Agent; otherwise requests can be blocked (403)
const NOMINATIM_HEADERS: Record<string, string> = {
  'Accept-Language': 'en',
  'User-Agent': 'FurrmaaPetApp/1.0 (contact@furrmaa.com)',
};

async function requestLocationPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') return true;
  try {
    const granted = await PermissionsAndroid.check(LOCATION_PERMISSION);
    if (granted) return true;
    const result = await PermissionsAndroid.request(LOCATION_PERMISSION, {
      title: 'Location permission',
      message: 'Furrmaa needs your location to show nearby vets and services.',
      buttonNeutral: 'Ask Me Later',
      buttonNegative: 'Cancel',
      buttonPositive: 'OK',
    });
    return result === PermissionsAndroid.RESULTS.GRANTED;
  } catch {
    return false;
  }
}

/**
 * Get current position via device GPS
 */
export function getCurrentPosition(): Promise<{ lat: number; lng: number }> {
  return new Promise(async (resolve, reject) => {
    const allowed = await requestLocationPermission();
    if (!allowed) {
      reject(Object.assign(new Error('Location permission denied'), { code: 1 }));
      return;
    }
    Geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => reject(err),
      { enableHighAccuracy: false, timeout: 20000, maximumAge: 300000 }
    );
  });
}

/**
 * Reverse geocode lat/lng to address using OpenStreetMap Nominatim (free)
 */
export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`;
  const res = await fetch(url, {
    headers: NOMINATIM_HEADERS,
  });
  if (!res.ok) throw new Error('Geocoding failed');
  const data = await res.json();
  const addr = data.address || {};
  const parts = [
    addr.suburb || addr.neighbourhood || addr.locality,
    addr.city || addr.town || addr.village || addr.county,
    addr.state,
  ].filter(Boolean);
  return parts.join(', ') || data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
}

/**
 * Forward geocode: address string -> lat/lng (Nominatim, 1 req/sec)
 */
export async function forwardGeocode(address: string): Promise<{ lat: number; lng: number } | null> {
  if (!address?.trim()) return null;
  const q = encodeURIComponent(address.trim());
  const url = `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1`;
  const res = await fetch(url, {
    headers: NOMINATIM_HEADERS,
  });
  if (!res.ok) return null;
  const data = await res.json();
  const first = Array.isArray(data) ? data[0] : null;
  if (!first || first.lat == null || first.lon == null) return null;
  return { lat: parseFloat(first.lat), lng: parseFloat(first.lon) };
}

export type LocationSuggestion = {
  id: string;
  displayName: string;
  lat: number;
  lng: number;
};

/**
 * Search locations by query (Nominatim). Use with debounce (e.g. 400ms). Limit 1 req/sec.
 */
export async function searchLocations(query: string): Promise<LocationSuggestion[]> {
  if (!query?.trim() || query.trim().length < 2) return [];
  const q = encodeURIComponent(query.trim());
  const url = `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=8`;
  const res = await fetch(url, {
    headers: NOMINATIM_HEADERS,
  });
  if (!res.ok) return [];
  const data = await res.json();
  const list = Array.isArray(data) ? data : [];
  return list
    .filter((item: any) => item.lat != null && item.lon != null)
    .map((item: any, index: number) => ({
      id: item.place_id?.toString() || `loc-${index}`,
      displayName: item.display_name || `${item.lat}, ${item.lon}`,
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
    }));
}

/**
 * Get current location as readable address string.
 * If reverse geocode fails (network/403), returns "lat, lng" as fallback.
 */
export async function getCurrentLocationString(): Promise<string> {
  const { lat, lng } = await getCurrentPosition();
  try {
    return await reverseGeocode(lat, lng);
  } catch {
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }
}

/**
 * Get current location as address + coordinates (for distance calc)
 */
export async function getCurrentLocationWithCoords(): Promise<{
  address: string;
  lat: number;
  lng: number;
}> {
  const { lat, lng } = await getCurrentPosition();
  const address = await reverseGeocode(lat, lng);
  return { address, lat, lng };
}

/**
 * Haversine distance in km between two points
 */
/** First segment of a location string — used to match event city from GPS/search */
export function locationSearchToken(location: string): string {
  if (!location?.trim()) return '';
  return location.split(',')[0].trim();
}

/** Short label for header pills */
export function primaryLocationLabel(location: string): string {
  if (!location?.trim()) return 'Select location';
  const parts = location.split(',').map((s) => s.trim()).filter(Boolean);
  if (parts.length <= 2) return parts.join(', ');
  return `${parts[0]}, ${parts[1]}`;
}

export function distanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
